# @codesordinatestudio/social-auth

A configurable social authentication package for GitHub, Google, Apple, and Facebook OAuth that works with both Bun and Node.js backends.

## Features

- ✅ **Framework Agnostic**: Works with any Bun or Node.js backend (Express, Fastify, Elysia, Hono, etc.)
- ✅ **Multiple Providers**: Support for GitHub, Google, Apple, and Facebook OAuth
- ✅ **TypeScript**: Full TypeScript support with comprehensive type definitions
- ✅ **Configurable**: Easy configuration for different environments
- ✅ **Modern**: Built with modern JavaScript/TypeScript standards
- ✅ **Lightweight**: Minimal dependencies, only includes what you need

## Installation

```bash
# Using bun
bun add @codesordinatestudio/social-auth

# Using npm
npm install @codesordinatestudio/social-auth

# Using yarn
yarn add @codesordinatestudio/social-auth
```

## Quick Start

### Basic Usage

```typescript
import { SocialAuth } from "@codesordinatestudio/social-auth";

// Create a GitHub OAuth instance
const githubAuth = SocialAuth.createGitHub({
  providerId: process.env.GITHUB_CLIENT_ID!,
  providerSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/github",
});

// Generate auth URL
const authUrl = githubAuth.getAuthUrl({
  scopes: ["user:email"],
  state: "random-state-string",
});

// Handle callback
const result = await githubAuth.handleCallback({
  code: "oauth-code-from-callback",
});

console.log(result.user); // User information
console.log(result.tokens); // Access tokens
```

### Using Individual Providers

```typescript
import { GitHubAuth, GoogleAuth, AppleAuth, FacebookAuth } from "@codesordinatestudio/social-auth";

// GitHub
const github = new GitHubAuth({
  providerId: "your-github-client-id",
  providerSecret: "your-github-client-secret",
  redirectUri: "http://localhost:3000/auth/callback/github",
});

// Google
const google = new GoogleAuth({
  providerId: "your-google-client-id",
  providerSecret: "your-google-client-secret",
  redirectUri: "http://localhost:3000/auth/callback/google",
});

// Apple (Requires Apple Developer setup)
const apple = new AppleAuth({
  providerId: "your-apple-service-id",
  teamId: "your-apple-team-id",
  keyId: "your-apple-key-id",
  privateKey: "your-apple-private-key-content", // or path to .p8 file
  redirectUri: "http://localhost:3000/auth/callback/apple",
});

// Facebook
const facebook = new FacebookAuth({
  providerId: "your-facebook-app-id",
  providerSecret: "your-facebook-app-secret",
  redirectUri: "http://localhost:3000/auth/callback/facebook",
});
```

## Framework Examples

### Elysia Example

```typescript
import { Elysia } from "elysia";
import { SocialAuth } from "@codesordinatestudio/social-auth";

const app = new Elysia();

const githubAuth = SocialAuth.createGitHub({
  providerId: process.env.GITHUB_CLIENT_ID!,
  providerSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/github",
});

app
  .get("/auth/github", () => {
    const authUrl = githubAuth.getAuthUrl();
    return Response.redirect(authUrl);
  })
  .get("/auth/callback/github", async ({ query }) => {
    try {
      const result = await githubAuth.handleCallback(query);
      return { success: true, user: result.user, tokens: result.tokens };
    } catch (error) {
      return { error: error.message };
    }
  });
```

### Express Example

```typescript
import express from "express";
import { SocialAuth } from "@codesordinatestudio/social-auth";

const app = express();

const googleAuth = SocialAuth.createGoogle({
  providerId: process.env.GOOGLE_CLIENT_ID!,
  providerSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/google",
});

app.get("/auth/google", (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

app.get("/auth/callback/google", async (req, res) => {
  try {
    const result = await googleAuth.handleCallback(req.query);
    res.json({ success: true, user: result.user, tokens: result.tokens });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Hono Example

```typescript
import { Hono } from "hono";
import { SocialAuth } from "@codesordinatestudio/social-auth";

const app = new Hono();

const githubAuth = SocialAuth.createGitHub({
  providerId: process.env.GITHUB_CLIENT_ID!,
  providerSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/github",
});

app.get("/auth/github", (c) => {
  const authUrl = githubAuth.getAuthUrl();
  return c.redirect(authUrl);
});

app.get("/auth/callback/github", async (c) => {
  try {
    const query = c.req.query();
    const result = await githubAuth.handleCallback(query);
    return c.json({ success: true, user: result.user, tokens: result.tokens });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});
```

### Apple Example

```typescript
import { SocialAuth } from "@codesordinatestudio/social-auth";

const appleAuth = SocialAuth.createApple({
  providerId: process.env.APPLE_CLIENT_ID!,
  teamId: process.env.APPLE_TEAM_ID!,
  keyId: process.env.APPLE_KEY_ID!,
  privateKey: process.env.APPLE_PRIVATE_KEY!, // or file path to .p8 file
  redirectUri: "http://localhost:3000/auth/callback/apple",
});

// Generate auth URL
const authUrl = appleAuth.getAuthUrl();

// Handle callback (Apple uses form_post)
app.post("/auth/callback/apple", async (req, res) => {
  try {
    const result = await appleAuth.handleCallback(req.body);
    res.json({ success: true, user: result.user, tokens: result.tokens });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Facebook Example

```typescript
import express from "express";
import { SocialAuth } from "@codesordinatestudio/social-auth";

const app = express();

const facebookAuth = SocialAuth.createFacebook({
  providerId: process.env.FACEBOOK_APP_ID!,
  providerSecret: process.env.FACEBOOK_APP_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/facebook",
});

app.get("/auth/facebook", (req, res) => {
  const authUrl = facebookAuth.getAuthUrl({
    scopes: ["email", "public_profile"],
    state: "random-state-string",
  });
  res.redirect(authUrl);
});

app.get("/auth/callback/facebook", async (req, res) => {
  try {
    const result = await facebookAuth.handleCallback(req.query);
    res.json({
      success: true,
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## API Reference

### SocialAuth Class

#### Static Methods

- `SocialAuth.createGitHub(config)` - Create GitHub OAuth instance
- `SocialAuth.createGoogle(config)` - Create Google OAuth instance
- `SocialAuth.createApple(config)` - Create Apple OAuth instance
- `SocialAuth.createFacebook(config)` - Create Facebook OAuth instance

#### Instance Methods

- `getAuthUrl(options?)` - Generate authorization URL
- `handleCallback(params)` - Handle OAuth callback and exchange code for tokens
- `getProvider()` - Get provider name
- `getRedirectUri()` - Get configured redirect URI

### Configuration

```typescript
interface SocialAuthConfig {
  provider: "google" | "github" | "apple" | "facebook";
  providerId: string; // Client ID from OAuth provider
  providerSecret: string; // Client Secret from OAuth provider
  redirectUri: string; // Your callback URL
}
```

### Response Format

```typescript
interface SocialAuthResult {
  provider: "google" | "github" | "apple" | "facebook";
  user: {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any; // Provider-specific fields
  };
  tokens: {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    tokenType?: string;
    expiryDate?: number;
    [key: string]: any; // Provider-specific tokens
  };
}
```

## Provider Setup

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to your redirect URI
4. Copy Client ID and Client Secret

### Google OAuth Setup

1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your redirect URI to authorized redirect URIs
6. Copy Client ID and Client Secret

### Apple Sign In Setup

1. Go to Apple Developer Console
2. Create a new App ID with Sign In with Apple capability
3. Create a Services ID for your web authentication
4. Configure your domain and redirect URLs
5. Create a private key for Sign In with Apple
6. Download the .p8 private key file
7. Note your Team ID, Key ID, and Service ID

**Required Configuration:**

- `providerId`: Your Apple Service ID
- `teamId`: Your Apple Team ID (found in Apple Developer Console)
- `keyId`: Your Apple Key ID (from the private key you created)
- `privateKey`: The content of your .p8 private key file or the file path to it
- `redirectUri`: Your app's callback URL

**Important Notes:**

- Apple uses JWT-based authentication instead of a traditional client secret
- The private key is used to generate JWT tokens for secure communication with Apple
- Apple only provides user information (name, email) on the first authorization
- Subsequent authorizations only return the user ID

### Facebook Login Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new App or select an existing one
3. Add the Facebook Login product to your app
4. Configure your OAuth settings in App Settings > Basic
5. Add your domains to App Domains
6. Add your redirect URI to Valid OAuth Redirect URIs under Facebook Login settings
7. Copy the App ID and App Secret for configuration

## Environment Variables

```env
# GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple
APPLE_CLIENT_ID=your_apple_service_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=/path/to/your/apple/private/key.p8

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## Error Handling

All methods throw descriptive errors with additional context:

```typescript
try {
  const result = await socialAuth.handleCallback(params);
} catch (error) {
  console.error("Provider:", error.provider);
  console.error("Code:", error.code);
  console.error("Details:", error.details);
  console.error("Message:", error.message);
}
```

## TypeScript Support

This package is written in TypeScript and includes comprehensive type definitions. No need to install additional `@types` packages.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
