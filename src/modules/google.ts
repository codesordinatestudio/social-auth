import { google } from "googleapis";
import { BaseSocialAuth } from "../base";
import type { SocialAuthConfig, SocialAuthResult, AuthUrlOptions, CallbackParams } from "../types";

export class GoogleAuth extends BaseSocialAuth {
  private oauth2Client: any;

  constructor(config: Omit<SocialAuthConfig, "provider">) {
    super({ ...config, provider: "google" });
    this.oauth2Client = new google.auth.OAuth2(config.providerId, config.providerSecret, config.redirectUri);
  }

  getAuthUrl(options: AuthUrlOptions = {}): string {
    const scopes = options.scopes || ["openid", "profile", "email"];

    const authUrlOptions: any = {
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
      state: options.state,
    };

    // Force account picker and prevent caching
    if (options.forceAccountPicker !== false) {
      authUrlOptions.prompt = "select_account"; // Forces account selection
    }

    // Add any additional options passed in
    Object.keys(options).forEach(key => {
      if (!['scopes', 'state', 'forceAccountPicker'].includes(key)) {
        authUrlOptions[key] = options[key];
      }
    });

    return this.oauth2Client.generateAuthUrl(authUrlOptions);
  }

  async handleCallback(params: CallbackParams): Promise<SocialAuthResult> {
    const { code, error, error_description } = params;

    // Handle OAuth errors from Google
    if (error) {
      throw this.createError("OAuth authorization failed", error, error_description || error);
    }

    if (!code) {
      throw this.createError("Authorization code is required", "missing_code");
    }

    try {
      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code as string);
      this.oauth2Client.setCredentials(tokens);

      // Get user info using OAuth2 userinfo endpoint
      const oauth2 = google.oauth2({ version: "v2", auth: this.oauth2Client });
      const { data: userData } = await oauth2.userinfo.get();

      return {
        provider: "google",
        user: {
          id: userData.id || undefined,
          email: userData.email || undefined,
          name: userData.name || undefined,
          picture: userData.picture || undefined,
          given_name: userData.given_name,
          family_name: userData.family_name,
          locale: userData.locale,
          verified_email: userData.verified_email,
        },
        tokens: {
          accessToken: tokens.access_token || "",
          refreshToken: tokens.refresh_token || undefined,
          idToken: tokens.id_token || undefined,
          expiryDate: tokens.expiry_date || undefined,
          tokenType: tokens.token_type || "Bearer",
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("invalid_grant")) {
        throw this.createError(
          "Authorization code expired or invalid",
          "invalid_grant",
          "Please try logging in again. The authorization code may have expired."
        );
      }

      throw this.createError(`Failed to authenticate with Google: ${errorMessage}`, "auth_failed", errorMessage);
    }
  }
}
