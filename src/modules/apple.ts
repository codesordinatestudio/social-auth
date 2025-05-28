import { BaseSocialAuth } from "../base";
import type { SocialAuthConfig, SocialAuthResult, AuthUrlOptions, CallbackParams, AppleAuthConfig } from "../types";
import jwt from "jsonwebtoken";
import { readFileSync } from "fs";

export class AppleAuth extends BaseSocialAuth {
  private appleConfig: AppleAuthConfig;

  constructor(config: AppleAuthConfig) {
    // Apple doesn't use traditional providerSecret, so we pass a placeholder
    const fullConfig = { ...config, provider: "apple" as const, providerSecret: "jwt-generated" };
    super(fullConfig);
    this.appleConfig = config;
    this.validateAppleConfig();
  }

  private validateAppleConfig(): void {
    if (!this.appleConfig.teamId) {
      throw new Error("Apple Team ID is required");
    }
    if (!this.appleConfig.keyId) {
      throw new Error("Apple Key ID is required");
    }
    if (!this.appleConfig.privateKey) {
      throw new Error("Apple private key is required");
    }
  }

  private getPrivateKey(): string {
    // Check if privateKey is a file path or the actual key content
    if (this.appleConfig.privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      return this.appleConfig.privateKey;
    }

    // Assume it's a file path
    try {
      return readFileSync(this.appleConfig.privateKey, "utf8");
    } catch (error) {
      throw this.createError(
        "Failed to read Apple private key file",
        "invalid_private_key",
        `Cannot read private key from: ${this.appleConfig.privateKey}`
      );
    }
  }

  private generateClientSecret(): string {
    const privateKey = this.getPrivateKey();
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: this.appleConfig.teamId,
      iat: now,
      exp: now + 86400, // 24 hours
      aud: "https://appleid.apple.com",
      sub: this.appleConfig.providerId,
    };

    try {
      return jwt.sign(payload, privateKey, {
        algorithm: "ES256",
        header: {
          kid: this.appleConfig.keyId,
          alg: "ES256",
        },
      });
    } catch (error) {
      throw this.createError(
        "Failed to generate Apple client secret",
        "jwt_generation_failed",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  getAuthUrl(options: AuthUrlOptions = {}): string {
    const scopes = options.scopes || ["name", "email"];
    const scopeString = scopes.join(" ");

    const baseUrl = "https://appleid.apple.com/auth/authorize";
    const params = new URLSearchParams({
      client_id: this.config.providerId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: scopeString,
      response_mode: "form_post", // Apple recommends form_post
      ...(options.state && { state: options.state }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    const clientSecret = this.generateClientSecret();

    const tokenUrl = "https://appleid.apple.com/auth/token";
    const params = new URLSearchParams({
      client_id: this.appleConfig.providerId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: this.appleConfig.redirectUri,
    });

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.error || "Token exchange failed");
      }

      return data;
    } catch (error) {
      throw this.createError(
        "Failed to exchange code for tokens",
        "token_exchange_failed",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private decodeIdToken(idToken: string): any {
    try {
      // Decode the JWT payload without verification (Apple's public keys would be needed for full verification)
      const decoded = jwt.decode(idToken, { complete: true });

      if (!decoded || typeof decoded === "string") {
        throw new Error("Invalid ID token format");
      }

      return decoded.payload;
    } catch (error) {
      throw this.createError(
        "Failed to decode Apple ID token",
        "id_token_decode_failed",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async handleCallback(params: CallbackParams): Promise<SocialAuthResult> {
    const { code, error, error_description, user } = params;

    // Handle OAuth errors from Apple
    if (error) {
      throw this.createError("OAuth authorization failed", error, error_description || error);
    }

    if (!code) {
      throw this.createError("Authorization code is required", "missing_code");
    }

    try {
      // Exchange code for tokens
      const tokenData = await this.exchangeCodeForTokens(code);

      let userInfo: any = {};

      // Extract user information from ID token if available
      if (tokenData.id_token) {
        const idTokenPayload = this.decodeIdToken(tokenData.id_token);
        userInfo = {
          id: idTokenPayload.sub,
          email: idTokenPayload.email,
          emailVerified: idTokenPayload.email_verified,
        };
      }

      // Apple sometimes sends user info in the initial request (first time only)
      if (user) {
        try {
          const userData = typeof user === "string" ? JSON.parse(user) : user;
          if (userData.name) {
            userInfo.name = `${userData.name.firstName || ""} ${userData.name.lastName || ""}`.trim();
          }
        } catch (error) {
          // Ignore parsing errors for user data
        }
      }

      return {
        provider: "apple",
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          emailVerified: userInfo.emailVerified,
        },
        tokens: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          idToken: tokenData.id_token,
          tokenType: tokenData.token_type || "Bearer",
          expiryDate: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined,
        },
      };
    } catch (error) {
      if (error instanceof Error && (error as any).provider === "apple") {
        throw error; // Re-throw our custom errors
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw this.createError(`Failed to authenticate with Apple: ${errorMessage}`, "auth_failed", errorMessage);
    }
  }
}
