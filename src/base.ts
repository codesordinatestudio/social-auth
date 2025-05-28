import type {
  SocialAuthConfig,
  SocialAuthResult,
  AuthUrlOptions,
  CallbackParams,
  SocialAuthError,
  SocialProvider,
} from "./types";

export abstract class BaseSocialAuth {
  protected config: SocialAuthConfig;

  constructor(config: SocialAuthConfig) {
    this.config = config;
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.config.providerId) {
      throw new Error(`Provider ID is required for ${this.config.provider}`);
    }
    if (!this.config.providerSecret) {
      throw new Error(`Provider secret is required for ${this.config.provider}`);
    }
    if (!this.config.redirectUri) {
      throw new Error(`Redirect URI is required for ${this.config.provider}`);
    }
  }

  protected createError(message: string, code?: string, details?: string): SocialAuthError {
    const error = new Error(message) as SocialAuthError;
    error.provider = this.config.provider;
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Generate the authorization URL for OAuth flow
   */
  abstract getAuthUrl(options?: AuthUrlOptions): Promise<string> | string;

  /**
   * Handle the OAuth callback and exchange code for tokens
   */
  abstract handleCallback(params: CallbackParams): Promise<SocialAuthResult>;

  /**
   * Get the provider name
   */
  getProvider(): SocialProvider {
    return this.config.provider;
  }

  /**
   * Get the redirect URI
   */
  getRedirectUri(): string {
    return this.config.redirectUri;
  }
}
