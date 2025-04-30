import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authService] = useState(new AuthService());

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.initialize();
        setUser(currentUser);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [authService]);

  const signUp = async (email, password) => {
    return await authService.signUp(email, password);
  };

  const confirmSignUp = async (email, code) => {
    return await authService.confirmSignUp(email, code);
  };

  const signIn = async (email, password) => {
    const user = await authService.signIn(email, password);
    setUser(user);
    return user;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const forgotPasswordSubmit = async (email, code, newPassword) => {
    return await authService.forgotPasswordSubmit(email, code, newPassword);
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await authService.changePassword(oldPassword, newPassword);
  };

  const getCurrentUser = async () => {
    return await authService.getCurrentUser();
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const getIdToken = async () => {
    return await authService.getIdToken();
  };

  const getUserId = async () => {
    return await authService.getUserId();
  };

  const contextValue = {
    user,
    isLoading,
    authService,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    forgotPassword,
    forgotPasswordSubmit,
    changePassword,
    getCurrentUser,
    isAuthenticated,
    getIdToken,
    getUserId,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
