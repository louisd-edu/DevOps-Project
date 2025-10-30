import type { SupabaseClient } from '@supabase/supabase-js';
import { writable, type Writable } from 'svelte/store';

export function useFavoritesAndSaved(sb: SupabaseClient) {
    // Stores exposed to components via context
    const favoriteIdsStore: Writable<Set<string>> = writable(new Set());
    const savedIdsStore: Writable<Set<string>> = writable(new Set());

    // Local snapshots to avoid stale reads during toggles
    let favSnapshot = new Set<string>();
    let savedSnapshot = new Set<string>();
    const favUnsub = favoriteIdsStore.subscribe((v) => { favSnapshot = v; });
    const savedUnsub = savedIdsStore.subscribe((v) => { savedSnapshot = v; });

    // Track current user id for mutations
    let currentUserId: string | null = null;

    function setUserId(id: string | null) { currentUserId = id; }

    async function ensureUserId(): Promise<string | null> {
        if (currentUserId) return currentUserId;
        const { data } = await sb.auth.getUser();
        currentUserId = data?.user?.id ?? null;
        return currentUserId;
    }

    async function loadFavorites() {
        const uid = (await ensureUserId());
        if (!uid) { favoriteIdsStore.set(new Set()); return; }
        const { data: favs, error } = await sb
            .from('favorites')
            .select('recipeid')
            .eq('userid', uid);
        if (error) {
            console.warn('Failed to load favorites:', error.message);
            favoriteIdsStore.set(new Set());
            return;
        }
        favoriteIdsStore.set(new Set((favs ?? []).map((r: { recipeid: string | number }) => String(r.recipeid))));
    }

    async function loadSaved() {
        const uid = (await ensureUserId());
        if (!uid) { savedIdsStore.set(new Set()); return; }
        const { data: rows, error } = await sb
            .from('saved')
            .select('recipeid')
            .eq('userid', uid);
        if (error) {
            console.warn('Failed to load saved:', error.message);
            savedIdsStore.set(new Set());
            return;
        }
        savedIdsStore.set(new Set((rows ?? []).map((r: { recipeid: string | number }) => String(r.recipeid))));
    }

    async function toggleFavorite(recipeId: string | number) {
        const uid = await ensureUserId();
        if (!uid) {
            if (typeof window !== 'undefined') alert('Please sign in to add favorites.');
            console.warn('User not logged in; cannot favorite');
            return;
        }
        const key = String(recipeId);
        const isFav = favSnapshot.has(key);
        if (isFav) {
            const { error } = await sb
                .from('favorites')
                .delete()
                .eq('userid', uid)
                .eq('recipeid', recipeId);
            if (error) {
                console.warn('Failed to remove favorite:', error.message);
                if (typeof window !== 'undefined') alert(`Could not remove favorite: ${error.message}`);
                return;
            }
            favoriteIdsStore.update((s) => { const n = new Set(s); n.delete(key); return n; });
        } else {
            const { error } = await sb
                .from('favorites')
                .insert({ userid: uid, recipeid: recipeId });
            if (error) {
                console.warn('Failed to add favorite:', error.message);
                if (typeof window !== 'undefined') alert(`Could not add favorite: ${error.message}`);
                return;
            }
            favoriteIdsStore.update((s) => { const n = new Set(s); n.add(key); return n; });
        }
    }

    async function toggleSaved(recipeId: string | number) {
        const uid = await ensureUserId();
        if (!uid) {
            if (typeof window !== 'undefined') alert('Please sign in to save recipes.');
            console.warn('User not logged in; cannot save');
            return;
        }
        const key = String(recipeId);
        const isSaved = savedSnapshot.has(key);
        if (isSaved) {
            const { error } = await sb
                .from('saved')
                .delete()
                .eq('userid', uid)
                .eq('recipeid', recipeId);
            if (error) {
                console.warn('Failed to remove saved:', error.message);
                if (typeof window !== 'undefined') alert(`Could not remove saved: ${error.message}`);
                return;
            }
            savedIdsStore.update((s) => { const n = new Set(s); n.delete(key); return n; });
        } else {
            const { error } = await sb
                .from('saved')
                .insert({ userid: uid, recipeid: recipeId });
            if (error) {
                console.warn('Failed to save recipe:', error.message);
                if (typeof window !== 'undefined') alert(`Could not save recipe: ${error.message}`);
                return;
            }
            savedIdsStore.update((s) => { const n = new Set(s); n.add(key); return n; });
        }
    }

    function syncAuth() {
        const { data: sub } = sb.auth.onAuthStateChange((_, session) => {
            const nextId = session?.user?.id ?? null;
            const changed = nextId !== currentUserId;
            currentUserId = nextId;
            if (changed) {
                if (currentUserId) {
                    void loadFavorites();
                    void loadSaved();
                } else {
                    favoriteIdsStore.set(new Set());
                    savedIdsStore.set(new Set());
                }
            }
        });
        return () => sub?.subscription?.unsubscribe?.();
    }

    function destroy() {
        favUnsub?.();
        savedUnsub?.();
    }

    // Context-shaped objects for consumers like RecipeComponent
    const favoritesCtx = { store: favoriteIdsStore, toggleFavorite } as const;
    const savedCtx = { store: savedIdsStore, toggleSaved } as const;

    return {
        favoriteIdsStore,
        savedIdsStore,
        favoritesCtx,
        savedCtx,
        toggleFavorite,
        toggleSaved,
        loadFavorites,
        loadSaved,
        syncAuth,
        setUserId,
        destroy
    } as const;
}
