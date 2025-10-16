export type Profile = {
    id: string | number
    username: string | null
    avatar_url: string | null
    level: number
}

export type Recipe = {
    id: string | number
    user_id: string
    recipename: string
    recipeimageurl: string | null
    cuisine: string | null
    cookingtime: number | null
    // the query in +page.server.ts requests a nested profiles object
    profiles: Profile
    recipeImage: string | null
    profileAvatar: string | null
}
