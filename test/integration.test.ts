import { describe, it, expect } from "bun:test";
import { SocialAuth } from "../src/index";

describe("Social Auth Integration Tests", () => {
  describe("GitHub OAuth Flow", () => {
    it("should generate correct authorization URL", () => {
      const githubAuth = SocialAuth.createGitHub({
        providerId: "github-client-id",
        providerSecret: "github-client-secret",
        redirectUri: "http://localhost:3000/auth/callback/github",
      });

      const authUrl = githubAuth.getAuthUrl({
        scopes: ["user:email"],
        state: "secure-state",
      });

      expect(authUrl).toContain("github.com/login/oauth/authorize");
      expect(authUrl).toContain("client_id=github-client-id");
      expect(authUrl).toContain("scope=user%3Aemail");
      expect(authUrl).toContain("state=secure-state");
    });
  });

  describe("Google OAuth Flow", () => {
    it("should generate correct authorization URL", () => {
      const googleAuth = SocialAuth.createGoogle({
        providerId: "google-client-id.apps.googleusercontent.com",
        providerSecret: "google-client-secret",
        redirectUri: "http://localhost:3000/auth/callback/google",
      });

      const authUrl = googleAuth.getAuthUrl({
        scopes: ["openid", "profile", "email"],
        state: "google-state",
      });

      expect(authUrl).toContain("accounts.google.com/o/oauth2/v2/auth");
      expect(authUrl).toContain("client_id=google-client-id.apps.googleusercontent.com");
      expect(authUrl).toContain("scope=openid%20profile%20email");
    });
  });

  describe("Apple OAuth Flow", () => {
    it("should generate correct authorization URL", () => {
      const appleAuth = SocialAuth.createApple({
        providerId: "com.example.app",
        teamId: "ABC123DEFG",
        keyId: "DEF456GHIJ",
        privateKey:
          "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----",
        redirectUri: "http://localhost:3000/auth/callback/apple",
      });

      const authUrl = appleAuth.getAuthUrl({
        scopes: ["name", "email"],
        state: "apple-state",
      });

      expect(authUrl).toContain("appleid.apple.com/auth/authorize");
      expect(authUrl).toContain("client_id=com.example.app");
      expect(authUrl).toContain("response_mode=form_post");
      expect(authUrl).toContain("scope=name+email");
    });

    it("should create Apple auth instance with JWT configuration", () => {
      const appleAuth = SocialAuth.createApple({
        providerId: "com.example.app",
        teamId: "ABC123DEFG",
        keyId: "DEF456GHIJ",
        privateKey:
          "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----",
        redirectUri: "http://localhost:3000/auth/callback/apple",
      });

      expect(appleAuth).toBeDefined();
      expect(typeof appleAuth.getAuthUrl).toBe("function");
      expect(typeof appleAuth.handleCallback).toBe("function");
    });
  });

  describe("Configuration Validation", () => {
    it("should throw error for missing GitHub configuration", () => {
      expect(() => {
        SocialAuth.createGitHub({
          providerId: "",
          providerSecret: "secret",
          redirectUri: "http://localhost:3000/callback",
        });
      }).toThrow();
    });

    it("should throw error for missing Google configuration", () => {
      expect(() => {
        SocialAuth.createGoogle({
          providerId: "",
          providerSecret: "secret",
          redirectUri: "http://localhost:3000/callback",
        });
      }).toThrow();
    });

    it("should throw error for missing Apple configuration", () => {
      expect(() => {
        SocialAuth.createApple({
          providerId: "",
          teamId: "team",
          keyId: "key",
          privateKey: "key",
          redirectUri: "http://localhost:3000/callback",
        });
      }).toThrow();
    });
  });
});
