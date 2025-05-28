import { OAuthApp } from "@octokit/oauth-app";
import { Octokit } from "@octokit/rest";
import { BaseSocialAuth } from "../base";
import type { SocialAuthConfig, SocialAuthResult, AuthUrlOptions, CallbackParams } from "../types";

export class GitHubAuth extends BaseSocialAuth {
  private oauthApp: OAuthApp;

  constructor(config: Omit<SocialAuthConfig, "provider">) {
    super({ ...config, provider: "github" });
    this.oauthApp = new OAuthApp({
      clientType: "oauth-app",
      clientId: config.providerId,
      clientSecret: config.providerSecret,
    });
  }

  getAuthUrl(options: AuthUrlOptions = {}): string {
    const scopes = options.scopes || ["user:email"];
    const { url } = this.oauthApp.getWebFlowAuthorizationUrl({
      redirectUrl: this.config.redirectUri,
      scopes,
      state: options.state,
    });
    return url;
  }

  async handleCallback(params: CallbackParams): Promise<SocialAuthResult> {
    const { code, error, error_description } = params;

    // Handle OAuth errors from GitHub
    if (error) {
      throw this.createError("OAuth authorization failed", error, error_description || error);
    }

    if (!code) {
      throw this.createError("Authorization code is required", "missing_code");
    }

    try {
      // Exchange code for token
      const { authentication } = await this.oauthApp.createToken({
        code: code as string,
      });

      // Create Octokit instance with the token
      const octokit = new Octokit({
        auth: authentication.token,
      });

      // Get authenticated user info
      const { data: userData } = await octokit.rest.users.getAuthenticated();

      // Get user emails
      const { data: emailData } = await octokit.rest.users.listEmailsForAuthenticatedUser();
      const primaryEmail = emailData.find((email) => email.primary)?.email || userData.email;

      return {
        provider: "github",
        user: {
          id: userData.id?.toString(),
          email: primaryEmail || undefined,
          name: userData.name || userData.login,
          picture: userData.avatar_url,
          login: userData.login,
          bio: userData.bio,
          location: userData.location,
          company: userData.company,
          blog: userData.blog,
          twitter_username: userData.twitter_username,
          public_repos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
        },
        tokens: {
          accessToken: authentication.token,
          tokenType: "bearer",
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.createError(`Failed to authenticate with GitHub: ${errorMessage}`, "auth_failed", errorMessage);
    }
  }
}
