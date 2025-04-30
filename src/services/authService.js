import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  updatePassword,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";

class AuthService {
  constructor() {
    this.user = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.user = await getCurrentUser();
      this.isInitialized = true;
      return this.user;
    } catch (error) {
      this.user = null;
      this.isInitialized = true;
      return null;
    }
  }

  async signUp(email, password) {
    try {
      const { user } = await signUp({
        username: email,
        password: password,
        attributes: {
          email,
        },
      });
      return user;
    } catch (error) {
      throw new Error(`Error signing up: ${error.message}`);
    }
  }

  async confirmSignUp(email, code) {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return true;
    } catch (error) {
      throw new Error(`Error confirming sign up: ${error.message}`);
    }
  }

  async signIn(email, password) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password: password,
      });

      if (isSignedIn) {
        this.user = await getCurrentUser();
      }

      return this.user;
    } catch (error) {
      throw new Error(`Error signing in: ${error.message}`);
    }
  }

  async signOut() {
    try {
      await signOut();
      this.user = null;
      return true;
    } catch (error) {
      throw new Error(`Error signing out: ${error.message}`);
    }
  }

  async forgotPassword(email) {
    try {
      await resetPassword({ username: email });
      return true;
    } catch (error) {
      throw new Error(`Error initiating password reset: ${error.message}`);
    }
  }

  async forgotPasswordSubmit(email, code, newPassword) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      return true;
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      await updatePassword({
        oldPassword,
        newPassword,
      });
      return true;
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  async getCurrentUser() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.user;
  }

  async getCurrentSession() {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      return null;
    }
  }

  async getIdToken() {
    try {
      const session = await fetchAuthSession();
      return session.tokens.idToken.toString();
    } catch (error) {
      return null;
    }
  }

  async getUserId() {
    try {
      const user = await getCurrentUser();
      return user.userId;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.user;
  }

  async getCredentials() {
    try {
      console.log("Getting credentials from Amplify Auth...");
      const session = await fetchAuthSession();
      console.log("Auth session:", session ? "Available" : "Missing");

      if (!session || !session.credentials) {
        console.error("No credentials in auth session");
        return null;
      }

      console.log(
        "Credentials obtained:",
        session.credentials.accessKeyId
          ? "Has accessKeyId"
          : "Missing accessKeyId",
        session.credentials.secretAccessKey
          ? "Has secretAccessKey"
          : "Missing secretAccessKey",
        session.credentials.sessionToken
          ? "Has sessionToken"
          : "Missing sessionToken"
      );

      return {
        accessKeyId: session.credentials.accessKeyId,
        secretAccessKey: session.credentials.secretAccessKey,
        sessionToken: session.credentials.sessionToken,
        expiration: session.credentials.expiration,
      };
    } catch (error) {
      console.error("Error getting credentials:", error);
      return null;
    }
  }
}

export default AuthService;
