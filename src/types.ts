export type SocialProvider = "google" | "github" | "apple";

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

export interface SocialAuthResult {
  provider: SocialProvider;
  user: {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
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
