import { Hono } from "hono";
import { SocialAuth } from "../src/index";

const app = new Hono();

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

// GitHub OAuth routes
app.get("/auth/github", (c) => {
  const authUrl = githubAuth.getAuthUrl({
    scopes: ["user:email"],
    state: "random-state-string",
  });
  return c.redirect(authUrl);
});

app.get("/auth/callback/github", async (c) => {
  try {
    const query = c.req.query();
    const result = await githubAuth.handleCallback(query);

    return c.json({
      success: true,
      provider: result.provider,
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
        tokenType: result.tokens.tokenType,
        // Don't expose refresh tokens in real apps
      },
    });
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return c.json({ error: error.message }, 400);
  }
});

// Google OAuth routes
app.get("/auth/google", (c) => {
  const authUrl = googleAuth.getAuthUrl({
    scopes: ["openid", "profile", "email"],
    state: "random-state-string",
  });
  return c.redirect(authUrl);
});

app.get("/auth/callback/google", async (c) => {
  try {
    const query = c.req.query();
    const result = await googleAuth.handleCallback(query);

    return c.json({
      success: true,
      provider: result.provider,
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
        tokenType: result.tokens.tokenType,
        idToken: result.tokens.idToken,
        // Don't expose refresh tokens in real apps
      },
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return c.json({ error: error.message }, 400);
  }
});

// Root route with login options
app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hono Social Auth Example</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .auth-button { display: inline-block; padding: 10px 20px; margin: 10px; background: #007cba; color: white; text-decoration: none; border-radius: 5px; }
        .auth-button:hover { background: #005a8b; }
      </style>
    </head>
    <body>
      <h1>Hono Social Authentication Example</h1>
      <p>Choose a provider to authenticate with:</p>
      <a href="/auth/github" class="auth-button">Login with GitHub</a>
      <a href="/auth/google" class="auth-button">Login with Google</a>
    </body>
    </html>
  `);
});

// Start the server
export default app;

// If running directly with Bun
if (import.meta.main) {
  console.log("Starting Hono server on http://localhost:3000");
  console.log("Make sure to set your environment variables:");
  console.log("- GITHUB_CLIENT_ID");
  console.log("- GITHUB_CLIENT_SECRET");
  console.log("- GOOGLE_CLIENT_ID");
  console.log("- GOOGLE_CLIENT_SECRET");

  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
}
