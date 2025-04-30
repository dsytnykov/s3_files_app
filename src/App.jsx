import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import AuthContainer from "./components/auth/AuthContainer";
import S3Service from "./services/s3Service";
import ErrorHandlingService from "./services/errorHandling";
import { configureAmplify } from "./services/amplifyConfig";
import { ToastContainer } from "react-toastify";
import ConfigForm from "./components/ConfigForm";
import "react-toastify/dist/ReactToastify.css";
import "./styles/main.css";

const CONFIG_STORAGE_KEY = "S3_PHOTO_MANAGER_CONFIG";

const App = () => {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
};

const AppWithAuth = () => {
  const { user, isLoading: authLoading, authService } = useAuthContext();
  const [appConfig, setAppConfig] = useState(null);
  const [initError, setInitError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Load config from localStorage on component mount
  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        const savedConfigStr = localStorage.getItem(CONFIG_STORAGE_KEY);

        if (savedConfigStr) {
          const savedConfig = JSON.parse(savedConfigStr);
          console.log("Loaded saved config:", savedConfig);

          // Re-configure Amplify (needed on page refresh)
          configureAmplify(
            savedConfig.region,
            savedConfig.userPoolId,
            savedConfig.userPoolWebClientId,
            savedConfig.identityPoolId
          );

          // Create services
          const errorService = new ErrorHandlingService((message) =>
            toast.error(message)
          );

          // Create S3 service with Auth service
          const s3Service = new S3Service({
            region: savedConfig.region,
            bucket: savedConfig.bucket,
            authService: authService,
          });

          // Set the app config
          setAppConfig({
            ...savedConfig,
            s3Service,
            errorService,
          });
        }
      } catch (error) {
        console.error("Error loading saved config:", error);
        // If there's an error loading the saved config, we'll just start fresh
        localStorage.removeItem(CONFIG_STORAGE_KEY);
      }
    };

    loadSavedConfig();
  }, [authService]);

  // Check if configuration is set up
  const isConfigured = () => {
    return appConfig && appConfig.bucket && appConfig.identityPoolId;
  };

  // Handle configuration submission
  const handleConfigSubmit = async (config) => {
    setIsInitializing(true);
    setInitError(null);

    try {
      // Configure Amplify
      configureAmplify(
        config.region,
        config.userPoolId,
        config.userPoolWebClientId,
        config.identityPoolId
      );

      // Create Error Service
      const errorService = new ErrorHandlingService((message) =>
        toast.error(message)
      );

      // Create S3 service with Auth service
      const s3Service = new S3Service({
        region: config.region,
        bucket: config.bucket,
        authService: authService,
      });

      // Save the configuration in localStorage (without service instances)
      const configToSave = {
        region: config.region,
        bucket: config.bucket,
        userPoolId: config.userPoolId,
        userPoolWebClientId: config.userPoolWebClientId,
        identityPoolId: config.identityPoolId,
      };

      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configToSave));

      // Save the configuration in state (with service instances)
      setAppConfig({
        ...config,
        s3Service,
        errorService,
      });

      console.log("Configuration saved successfully");
    } catch (error) {
      console.error("Error initializing services:", error);
      setInitError(`Failed to initialize: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle config reset
  const handleResetConfig = () => {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    setAppConfig(null);
  };

  // Render loading state while auth is initializing
  if (authLoading) {
    return <div className="app-loading">Loading authentication...</div>;
  }

  return (
    <div className="app">
      {!isConfigured() ? (
        <ConfigForm
          onSubmit={handleConfigSubmit}
          isLoading={isInitializing}
          error={initError}
        />
      ) : !user ? (
        <AuthContainer onAuthSuccess={() => {}} />
      ) : (
        <AppProvider appConfig={appConfig}>
          <MainLayout onResetConfig={handleResetConfig} />
        </AppProvider>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};
export default App;
