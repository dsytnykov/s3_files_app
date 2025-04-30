import React, { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ConfirmSignUp from "./ConfirmSignUp";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import { useAuthContext } from "../../context/AuthContext";

const AUTH_MODES = {
  SIGN_IN: "SIGN_IN",
  SIGN_UP: "SIGN_UP",
  CONFIRM_SIGN_UP: "CONFIRM_SIGN_UP",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  RESET_PASSWORD: "RESET_PASSWORD",
};

const AuthContainer = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState(AUTH_MODES.SIGN_IN);
  const [email, setEmail] = useState("");
  const { isLoading } = useAuthContext();

  const handleSignUpSuccess = (email) => {
    setEmail(email);
    setMode(AUTH_MODES.CONFIRM_SIGN_UP);
  };

  const handleForgotPasswordSuccess = (email) => {
    setEmail(email);
    setMode(AUTH_MODES.RESET_PASSWORD);
  };

  const renderAuthComponent = () => {
    if (isLoading) {
      return <div className="auth-loading">Loading...</div>;
    }

    switch (mode) {
      case AUTH_MODES.SIGN_UP:
        return <SignUp onSuccess={handleSignUpSuccess} />;

      case AUTH_MODES.CONFIRM_SIGN_UP:
        return (
          <ConfirmSignUp
            email={email}
            onSuccess={() => setMode(AUTH_MODES.SIGN_IN)}
          />
        );

      case AUTH_MODES.FORGOT_PASSWORD:
        return <ForgotPassword onSuccess={handleForgotPasswordSuccess} />;

      case AUTH_MODES.RESET_PASSWORD:
        return (
          <ResetPassword
            email={email}
            onSuccess={() => setMode(AUTH_MODES.SIGN_IN)}
          />
        );

      case AUTH_MODES.SIGN_IN:
      default:
        return <SignIn onSuccess={onAuthSuccess} />;
    }
  };

  return (
    <div className="auth-container">
      {renderAuthComponent()}

      {/* Auth mode selection links */}
      <div className="auth-links">
        {mode === AUTH_MODES.SIGN_IN && (
          <>
            <button
              className="auth-link-button"
              onClick={() => setMode(AUTH_MODES.SIGN_UP)}
            >
              Need an account? Sign Up
            </button>
            <button
              className="auth-link-button"
              onClick={() => setMode(AUTH_MODES.FORGOT_PASSWORD)}
            >
              Forgot Password?
            </button>
          </>
        )}

        {mode !== AUTH_MODES.SIGN_IN && (
          <button
            className="auth-link-button"
            onClick={() => setMode(AUTH_MODES.SIGN_IN)}
          >
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthContainer;
