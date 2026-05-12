import { GitHubAuth } from "./modules/github";
import { GoogleAuth } from "./modules/google";
import { AppleAuth } from "./modules/apple";
import { FacebookAuth } from "./modules/facebook";
import { MicrosoftAuth } from "./modules/microsoft";
import type { SocialAuthConfig, SocialProvider, AppleAuthConfig, MicrosoftAuthConfig } from "./types";

export class SocialAuth {
  private provider: GitHubAuth | GoogleAuth | AppleAuth | FacebookAuth | MicrosoftAuth;

  constructor(
    config:
      | SocialAuthConfig
      | (AppleAuthConfig & { provider: "apple" })
      | (MicrosoftAuthConfig & { provider: "microsoft" })
  ) {
    switch (config.provider) {
      case "github":
        this.provider = new GitHubAuth(config as SocialAuthConfig);
        break;
      case "google":
        this.provider = new GoogleAuth(config as SocialAuthConfig);
        break;
      case "apple":
        this.provider = new AppleAuth(config as AppleAuthConfig);
        break;
      case "facebook":
        this.provider = new FacebookAuth(config as SocialAuthConfig);
        break;
      case "microsoft":
        this.provider = new MicrosoftAuth(config as MicrosoftAuthConfig);
        break;
      default:
        throw new Error(`Unsupported provider: ${(config as any).provider}`);
    }
  }

  /**
   * Create a SocialAuth instance for GitHub
   */
  static createGitHub(config: { providerId: string; providerSecret: string; redirectUri: string }) {
    return new SocialAuth({
      provider: "github",
      ...config,
    });
  }

  /**
   * Create a SocialAuth instance for Google
   */
  static createGoogle(config: { providerId: string; providerSecret: string; redirectUri: string }) {
    return new SocialAuth({
      provider: "google",
      ...config,
    });
  }

  /**
   * Create a SocialAuth instance for Apple
   */
  static createApple(config: {
    providerId: string;
    teamId: string;
    keyId: string;
    privateKey: string;
    redirectUri: string;
  }) {
    return new AppleAuth(config);
  }

  /**
   * Create a SocialAuth instance for Facebook
   */
  static createFacebook(config: { providerId: string; providerSecret: string; redirectUri: string }) {
    return new SocialAuth({
      provider: "facebook",
      ...config,
    });
  }

  /**
   * Create a SocialAuth instance for Microsoft
   */
  static createMicrosoft(config: {
    providerId: string;
    providerSecret: string;
    redirectUri: string;
    tenantId?: string;
  }) {
    return new SocialAuth({
      provider: "microsoft",
      ...config,
    });
  }

  /**
   * Get the authorization URL
   */
  getAuthUrl(options?: any) {
    return this.provider.getAuthUrl(options);
  }

  /**
   * Handle the OAuth callback
   */
  async handleCallback(params: any) {
    return this.provider.handleCallback(params);
  }

  /**
   * Get the provider name
   */
  getProvider(): SocialProvider {
    return this.provider.getProvider();
  }

  /**
   * Get the redirect URI
   */
  getRedirectUri(): string {
    return this.provider.getRedirectUri();
  }
}
