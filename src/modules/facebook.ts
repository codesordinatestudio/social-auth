import { BaseSocialAuth } from "../base";
import type { SocialAuthConfig, SocialAuthResult, AuthUrlOptions, CallbackParams } from "../types";

export class FacebookAuth extends BaseSocialAuth {
  constructor(config: Omit<SocialAuthConfig, "provider">) {
    super({ ...config, provider: "facebook" });
  }

  getAuthUrl(options: AuthUrlOptions = {}): string {
    const scopes = options.scopes || ["email", "public_profile"];
    const state = options.state || this._generateState();

    const queryParams = new URLSearchParams({
      client_id: this.config.providerId,
      redirect_uri: this.config.redirectUri,
      state: state,
      scope: scopes.join(","),
      response_type: "code",
    });

    return `https://www.facebook.com/v17.0/dialog/oauth?${queryParams.toString()}`;
  }

  async handleCallback(params: CallbackParams): Promise<SocialAuthResult> {
    const { code, error, error_description, error_reason } = params;

    // Handle OAuth errors from Facebook
    if (error) {
      throw this.createError("OAuth authorization failed", error, error_description || error_reason || error);
    }

    if (!code) {
      throw this.createError("Authorization code is required", "missing_code");
    }

    try {
      // Exchange code for token
      const tokenResponse = await this._exchangeCodeForToken(code as string);

      // Get user information
      const userInfo = await this._getUserInfo(tokenResponse.access_token);

      return {
        provider: "facebook",
        user: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture?.data?.url,
          firstName: userInfo.first_name,
          lastName: userInfo.last_name,
        },
        tokens: {
          accessToken: tokenResponse.access_token,
          tokenType: "bearer",
          expiryDate: Date.now() + tokenResponse.expires_in * 1000,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.createError(`Failed to authenticate with Facebook: ${errorMessage}`, "auth_failed", errorMessage);
    }
  }

  private _generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async _exchangeCodeForToken(code: string): Promise<any> {
    const params = new URLSearchParams({
      client_id: this.config.providerId,
      redirect_uri: this.config.redirectUri,
      client_secret: this.config.providerSecret,
      code: code,
    });

    const response = await fetch(`https://graph.facebook.com/v17.0/oauth/access_token?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to exchange code for token");
    }

    return response.json();
  }

  private async _getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/me?fields=id,name,email,first_name,last_name,picture&access_token=${accessToken}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get user information");
    }

    return response.json();
  }
}
