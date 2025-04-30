import React, { useState } from "react";

const ConfigForm = ({ onSubmit, isLoading, error }) => {
  const [region, setRegion] = useState(process.env.REACT_APP_S3_REGION);
  const [bucket, setBucket] = useState(process.env.REACT_APP_S3_BUCKET);
  const [userPoolId, setUserPoolId] = useState(
    process.env.REACT_APP_COGNITO_USER_POOL_ID
  );
  const [userPoolWebClientId, setUserPoolWebClientId] = useState(
    process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID
  );
  const [identityPoolId, setIdentityPoolId] = useState(
    process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID
  );
  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userPoolId || !userPoolWebClientId || !identityPoolId || !bucket) {
      setFormError("All fields are required");
      return;
    }

    const config = {
      region,
      bucket,
      userPoolId,
      userPoolWebClientId,
      identityPoolId,
    };

    onSubmit(config);
  };

  return (
    <div className="config-form-container">
      <div className="config-form-card">
        <h2>S3 Photo Manager Configuration</h2>
        <p>Enter your AWS Cognito and S3 configuration</p>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group">
            <label htmlFor="region">AWS Region:</label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={isLoading}
            >
              <option value="us-east-1">
                US East (N. Virginia) - us-east-1
              </option>
              <option value="us-east-2">US East (Ohio) - us-east-2</option>
              <option value="us-west-1">
                US West (N. California) - us-west-1
              </option>
              <option value="us-west-2">US West (Oregon) - us-west-2</option>
              <option value="ca-central-1">
                Canada (Central) - ca-central-1
              </option>
              <option value="eu-west-1">EU (Ireland) - eu-west-1</option>
              <option value="eu-central-1">
                EU (Frankfurt) - eu-central-1
              </option>
              <option value="eu-west-2">EU (London) - eu-west-2</option>
              <option value="eu-west-3">EU (Paris) - eu-west-3</option>
              <option value="eu-north-1">EU (Stockholm) - eu-north-1</option>
              <option value="ap-northeast-1">
                Asia Pacific (Tokyo) - ap-northeast-1
              </option>
              <option value="ap-southeast-1">
                Asia Pacific (Singapore) - ap-southeast-1
              </option>
              <option value="ap-southeast-2">
                Asia Pacific (Sydney) - ap-southeast-2
              </option>
              <option value="ap-south-1">
                Asia Pacific (Mumbai) - ap-south-1
              </option>
              <option value="sa-east-1">
                South America (São Paulo) - sa-east-1
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="userPoolId">Cognito User Pool ID:</label>
            <input
              type="text"
              id="userPoolId"
              value={userPoolId}
              onChange={(e) => setUserPoolId(e.target.value)}
              placeholder="us-east-1_xxxxxxxxx"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="userPoolWebClientId">
              User Pool Web Client ID:
            </label>
            <input
              type="text"
              id="userPoolWebClientId"
              value={userPoolWebClientId}
              onChange={(e) => setUserPoolWebClientId(e.target.value)}
              placeholder="1example23456789abcdefghijk"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="identityPoolId">Identity Pool ID:</label>
            <input
              type="text"
              id="identityPoolId"
              value={identityPoolId}
              onChange={(e) => setIdentityPoolId(e.target.value)}
              placeholder="us-east-1:12345678-1234-1234-1234-123456789012"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bucket">S3 Bucket Name:</label>
            <input
              type="text"
              id="bucket"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              placeholder="my-photo-bucket"
              disabled={isLoading}
            />
          </div>

          {formError && <div className="error-message">{formError}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect to S3"}
          </button>
        </form>

        <div className="form-note">
          <p>
            <strong>Note:</strong> Using Cognito User Pools provides secure
            authentication for your application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigForm;
