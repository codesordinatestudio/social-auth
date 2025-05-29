import { Elysia } from "elysia";
import { SocialAuth } from "../src/index";

const app = new Elysia();

// Initialize OAuth providers
const githubAuth = SocialAuth.createGitHub({
  providerId: process.env.GITHUB_CLIENT_ID!,
  providerSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/github",
});

const googleAuth = SocialAuth.createGoogle({
  providerId: process.env.GOOGLE_CLIENT_ID!,
  providerSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/google",
});

const facebookAuth = SocialAuth.createFacebook({
  providerId: process.env.FACEBOOK_CLIENT_ID!,
  providerSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/facebook",
});

app
  // Root route with login options
  .get("/", () => {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Elysia Social Auth Example</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .auth-button { display: inline-block; padding: 10px 20px; margin: 10px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; }
          .auth-button:hover { background: #7c3aed; }
        </style>
      </head>
      <body>
        <h1>Elysia Social Authentication Example</h1>
        <p>Choose a provider to authenticate with:</p>
        <a href="/auth/github" class="auth-button">Login with GitHub</a>
        <a href="/auth/google" class="auth-button">Login with Google</a>
        <a href="/auth/facebook" class="auth-button">Login with Facebook</a>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  })

  // GitHub OAuth routes
  .get("/auth/github", () => {
    const authUrl = githubAuth.getAuthUrl({
      scopes: ["user:email"],
      state: "random-state-string",
    });
    return Response.redirect(authUrl);
  })

  .get("/auth/callback/github", async ({ query }) => {
    try {
      const result = await githubAuth.handleCallback(query);

      return {
        success: true,
        provider: result.provider,
        user: result.user,
        tokens: {
          accessToken: result.tokens.accessToken,
          tokenType: result.tokens.tokenType,
          // Don't expose refresh tokens in real apps
        },
      };
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  })

  // Google OAuth routes
  .get("/auth/google", () => {
    const authUrl = googleAuth.getAuthUrl({
      scopes: ["openid", "profile", "email"],
      state: "random-state-string",
    });
    return Response.redirect(authUrl);
  })

  .get("/auth/callback/google", async ({ query }) => {
    try {
      const result = await googleAuth.handleCallback(query);

      return {
        success: true,
        provider: result.provider,
        user: result.user,
        tokens: {
          accessToken: result.tokens.accessToken,
          tokenType: result.tokens.tokenType,
          idToken: result.tokens.idToken,
          // Don't expose refresh tokens in real apps
        },
      };
    } catch (error) {
      console.error("Google OAuth error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  })

  // Facebook OAuth routes
  .get("/auth/facebook", () => {
    const authUrl = facebookAuth.getAuthUrl({
      scopes: ["email", "public_profile"],
      state: "random-state-string",
    });
    return Response.redirect(authUrl);
  })

  .get("/auth/callback/facebook", async ({ query }) => {
    try {
      const result = await facebookAuth.handleCallback(query);

      return {
        success: true,
        provider: result.provider,
        user: result.user,
        tokens: {
          accessToken: result.tokens.accessToken,
          tokenType: result.tokens.tokenType,
          // Don't expose refresh tokens in real apps
        },
      };
    } catch (error) {
      console.error("Facebook OAuth error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  })

  // Health check endpoint
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))

  // Start the server
  .listen(3000);

console.log("🚀 Elysia server is running on http://localhost:3000");
console.log("Make sure to set your environment variables:");
console.log("- GITHUB_CLIENT_ID");
console.log("- GITHUB_CLIENT_SECRET");
console.log("- GOOGLE_CLIENT_ID");
console.log("- GOOGLE_CLIENT_SECRET");
console.log("- FACEBOOK_CLIENT_ID");
console.log("- FACEBOOK_CLIENT_SECRET");
