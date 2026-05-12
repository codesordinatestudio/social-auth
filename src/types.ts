export type SocialProvider = "google" | "github" | "apple" | "facebook" | "microsoft";

export interface SocialAuthConfig {
  provider: SocialProvider;
  providerId: string;
  providerSecret: string;
  redirectUri: string;
}

export interface AppleAuthConfig {
  providerId: string;
  redirectUri: string;
  teamId: string;
  keyId: string;
  privateKey: string; // The actual private key content or path to .p8 file
}

export interface MicrosoftAuthConfig {
  providerId: string;
  providerSecret: string;
  redirectUri: string;
  tenantId?: string;
}

export interface SocialAuthResult {
  provider: SocialProvider;
  user: {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  tokens: {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    tokenType?: string;
    expiryDate?: number;
    [key: string]: any;
  };
}

export interface AuthUrlOptions {
  scopes?: string[];
  state?: string;
  // Common option for forcing account picker
  forceAccountPicker?: boolean; // Default: true (forces account selection)
  // Facebook-specific options
  display?: "popup" | "page" | "touch" | "wap"; // Display mode for Facebook
  // Google-specific options
  prompt?: "none" | "consent" | "select_account"; // Google prompt parameter
  [key: string]: any;
}

export interface CallbackParams {
  code?: string;
  error?: string;
  error_description?: string;
  state?: string;
  [key: string]: any;
}

export interface SocialAuthError extends Error {
  provider: SocialProvider;
  code?: string;
  details?: string;
}
