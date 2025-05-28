import { GitHubAuth } from "./modules/github";
import { GoogleAuth } from "./modules/google";
import { AppleAuth } from "./modules/apple";
import type { SocialAuthConfig, SocialProvider, AppleAuthConfig } from "./types";

export class SocialAuth {
  private provider: GitHubAuth | GoogleAuth | AppleAuth;

  constructor(config: SocialAuthConfig | (AppleAuthConfig & { provider: "apple" })) {
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
