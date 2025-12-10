import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

/**
 * Generates a DiceBear avatar SVG data URI using the lorelei style
 * @param seed - Unique identifier for consistent avatar generation (e.g., username or user ID)
 * @returns SVG data URI string
 */
export function generateAvatar(seed: string): string {
    const avatar = createAvatar(lorelei, {
        seed,
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
        backgroundType: ['solid'],
    });

    return avatar.toDataUri();
}
