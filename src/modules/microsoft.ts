import { BaseSocialAuth } from "../base";
import type { MicrosoftAuthConfig, SocialAuthResult, AuthUrlOptions, CallbackParams } from "../types";

export class MicrosoftAuth extends BaseSocialAuth {
  private tenantId: string;

  constructor(config: MicrosoftAuthConfig) {
    super({ ...config, provider: "microsoft" });
    this.tenantId = config.tenantId || "common";
  }

  getAuthUrl(options: AuthUrlOptions = {}): string {
    const scopes = options.scopes || ["openid", "profile", "email", "offline_access", "User.Read"];
    const state = options.state || this.generateState();
    const prompt = options.forceAccountPicker !== false ? "select_account" : options.prompt;
    const queryParams = new URLSearchParams({
      client_id: this.config.providerId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      response_mode: "query",
      scope: scopes.join(" "),
      state,
    });

    if (prompt) {
      queryParams.set("prompt", prompt);
    }

    Object.keys(options).forEach((key) => {
      if (!["scopes", "state", "forceAccountPicker", "prompt"].includes(key) && options[key] != null) {
        queryParams.set(key, String(options[key]));
      }
    });

    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${queryParams.toString()}`;
  }

  async handleCallback(params: CallbackParams): Promise<SocialAuthResult> {
    const { code, error, error_description } = params;

    if (error) {
      throw this.createError("OAuth authorization failed", error, error_description || error);
    }

    if (!code) {
      throw this.createError("Authorization code is required", "missing_code");
    }

    try {
      const tokenResponse = await this.exchangeCodeForToken(code as string);
      const userInfo = await this.getUserInfo(tokenResponse.access_token);

      return {
        provider: "microsoft",
        user: {
          id: userInfo.id,
          email: userInfo.mail || userInfo.userPrincipalName || undefined,
          name: userInfo.displayName,
          firstName: userInfo.givenName,
          lastName: userInfo.surname,
          userPrincipalName: userInfo.userPrincipalName,
          jobTitle: userInfo.jobTitle,
          mobilePhone: userInfo.mobilePhone,
          officeLocation: userInfo.officeLocation,
          preferredLanguage: userInfo.preferredLanguage,
        },
        tokens: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token || undefined,
          idToken: tokenResponse.id_token || undefined,
          tokenType: tokenResponse.token_type || "Bearer",
          expiryDate: tokenResponse.expires_in ? Date.now() + tokenResponse.expires_in * 1000 : undefined,
          scope: tokenResponse.scope,
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

      throw this.createError(`Failed to authenticate with Microsoft: ${errorMessage}`, "auth_failed", errorMessage);
    }
  }

  private generateState(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  private async exchangeCodeForToken(code: string): Promise<any> {
    const response = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: this.config.providerId,
        client_secret: this.config.providerSecret,
        code,
        redirect_uri: this.config.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.error || "Failed to exchange code for token");
    }

    return data;
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to get user information");
    }

    return data;
  }
}
