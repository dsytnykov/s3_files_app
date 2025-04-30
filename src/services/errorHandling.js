class ErrorHandlingService {
  constructor(onError) {
    this.onError = onError || console.error;
  }

  handleError(error, operation) {
    let message = "An error occurred";

    if (error.message) {
      message = error.message;
    }

    if (operation) {
      message = `Error during ${operation}: ${message}`;
    }

    this.onError(message);
    return message;
  }

  handleAWSError(error, operation) {
    let message = "An AWS error occurred";

    if (error.code) {
      switch (error.code) {
        case "NoSuchKey":
          message = "The specified file does not exist";
          break;
        case "AccessDenied":
          message = "Access denied to the S3 resource";
          break;
        case "NetworkingError":
          message = "Network error, please check your connection";
          break;
        default:
          message = `AWS Error: ${error.code}`;
      }
    }

    if (operation) {
      message = `Error during ${operation}: ${message}`;
    }

    this.onError(message);
    return message;
  }
}

export default ErrorHandlingService;
