export type Profile = {
    id: string | number
    username: string | null
    avatar_url: string | null
}

export type Recipe = {
    id: string | number
    user_id: string
    recipename: string
    recipeimageurl: string | null
    // the query in +page.server.ts requests a nested profiles object
    profiles: Profile
    recipeImage: string | null
    profileAvatar: string | null
}
