// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

export default NextAuth({
    secret: process.env.SECRET,
    providers: [
        // OAuth authentication providers
        SpotifyProvider({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
            authorization:LOGIN_URL,
        }),
    ],
})