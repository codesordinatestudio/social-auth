// Main exports
export { SocialAuth } from "./social-auth";
export { BaseSocialAuth } from "./base";

// Individual provider exports
export { GitHubAuth } from "./modules/github";
export { GoogleAuth } from "./modules/google";
export { AppleAuth } from "./modules/apple";
export { FacebookAuth } from "./modules/facebook";
export { MicrosoftAuth } from "./modules/microsoft";

// Type exports
export type {
  SocialProvider,
  SocialAuthConfig,
  SocialAuthResult,
  AuthUrlOptions,
  CallbackParams,
  SocialAuthError,
  MicrosoftAuthConfig,
} from "./types";

// Re-export types for convenience
export * from "./types";
