import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import spotifyApi, {LOGIN_URL} from "../../../lib/spotify";

async function refreshAccessToken(token){
    try{
        spotifyApi.setAccessToken(token.accessToken);
        spotifyApi.setRefreshToken(token.refreshToken);

        // rename body into refreshedToken
        const { body:refreshedToken } = await spotifyApi.resetAccessToken();
        console.log("REFRESHED_TOKEN",refreshedToken);

        return{
            ...token,
            accessToken:refreshedToken,
            accessTokenExpires: Date.now()+ refreshedToken.expires_in * 1000, // equal to 1hour
            refreshToken:refreshedToken.refreshToken ?? token.refreshToken,
        }
    }catch (e) {
        console.error(e)
        return {
            ...token,
            error:"refreshAccessTokenError"
        }
    }
}

export default NextAuth({
    providers: [
        // OAuth authentication providers
        SpotifyProvider({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
            authorization:LOGIN_URL,
        }),
    ],
    secret: process.env.JWT_SECRET,
    pages:{
        signIn:'/login',
    },
    callbacks:{
        async jwt({token,account,user}){
            // Init sign in
            if(user && token ){
                return{
                    token,
                    accessToken : account.access_token,
                    refreshToken : account.refresh_token,
                    username:account.providerAccountId,
                    accessTokenExpires:account.expires_at * 1000 // we are handlng expiry times in miliseconds so * 1000 to get seconds
                }
            }
            // Return previous token if the access token has not expired yet
            if (Date.now() < token.accessTokenExpires){
                return token;
            }
            // Refresh the token
            return await refreshAccessToken(token)
        },
        async session({ session,token }){
            session.user.accessToken = token.accessToken;
            session.user.refreshToken = token.refreshToken;
            session.user.username = token.username;

            return session;
        }
    }
})