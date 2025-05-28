# Social Auth Examples

This folder contains example implementations showing how to use `@codesordinatestudio/social-auth` with different web frameworks.

## Available Examples

### 1. Hono Example (`with-hono.ts`)

Demonstrates OAuth integration with the [Hono](https://hono.dev/) web framework.

### 2. Elysia Example (`with-elysia.ts`)

Demonstrates OAuth integration with the [Elysia](https://elysiajs.com/) web framework.

## Setup

Before running any examples, you need to set up OAuth applications with the providers:

### Environment Variables

Create a `.env` file in the project root with:

```env
# GitHub OAuth App
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth App
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### GitHub Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env` file

### Google Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Add `http://localhost:3000/auth/callback/google` to authorized redirect URIs
6. Copy the Client ID and Client Secret to your `.env` file

## Running the Examples

### Install Dependencies

First, install the required dependencies for the examples:

```bash
# For Hono example
bun add hono

# For Elysia example
bun add elysia
```

### Run Hono Example

```bash
bun run examples/with-hono.ts
```

Then visit http://localhost:3000 to see the authentication options.

### Run Elysia Example

```bash
bun run examples/with-elysia.ts
```

Then visit http://localhost:3000 to see the authentication options.

## Example Features

Both examples demonstrate:

- ✅ OAuth authorization flow initiation
- ✅ Callback handling and token exchange
- ✅ User information retrieval
- ✅ Error handling
- ✅ Simple HTML interface for testing
- ✅ Multiple provider support (GitHub and Google)

## API Endpoints

Each example provides the following endpoints:

- `GET /` - Home page with login options
- `GET /auth/github` - Initiate GitHub OAuth flow
- `GET /auth/callback/github` - Handle GitHub OAuth callback
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/callback/google` - Handle Google OAuth callback
- `GET /health` - Health check (Elysia only)

## Security Notes

⚠️ **Important**: These examples are for demonstration purposes only. For production use:

1. Never expose refresh tokens in API responses
2. Implement proper session management
3. Add CSRF protection
4. Validate state parameters
5. Use HTTPS in production
6. Store tokens securely (encrypted)
7. Implement proper error handling and logging

## Framework-Specific Notes

### Hono

- Uses `c.req.query()` to access query parameters
- Uses `c.redirect()` for redirects
- Uses `c.json()` and `c.html()` for responses

### Elysia

- Uses destructured `{ query }` parameter
- Uses `Response.redirect()` for redirects
- Returns objects directly for JSON responses
- Uses `new Response()` for custom responses
