# S3 File Manager

A secure React application for managing photos and files stored in AWS S3 buckets with user authentication through Amazon Cognito. This app provides a user-friendly interface for performing common file operations such as uploading, downloading, moving, renaming, and deleting files and folders.

## Features

- **Secure Authentication**: User registration, verification, and login via Amazon Cognito
- **User-specific Storage**: Each user gets their own isolated storage within the S3 bucket
- **File Management**: Add, remove, move, and rename files and folders
- **Folder Navigation**: Browse through folders and subfolders
- **File Upload**: Drag and drop files or use the file browser
- **File Preview**: Preview images and other supported file types
- **Bulk Operations**: Select multiple files for batch operations
- **Download**: Download individual files or multiple files as a ZIP archive
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Visual indicators for ongoing operations

## Prerequisites

- Node.js and npm installed
- AWS account with access to S3 and Cognito services
- AWS Cognito User Pool and Identity Pool set up
- S3 bucket configured with appropriate CORS settings

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## AWS Configuration

### S3 Bucket Setup

1. Go to the [S3 service in AWS Console](https://console.aws.amazon.com/s3/)
2. Create a new bucket or use an existing one
3. Configure CORS settings for your bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"], // Restrict to your domain in production
    "ExposeHeaders": ["ETag"]
  }
]
```

### Cognito User Pool Setup

1. Go to the [Amazon Cognito console](https://console.aws.amazon.com/cognito/)
2. Create a new User Pool:
   - Select "Email" as the sign-in option
   - Configure password policy and MFA as needed
   - Enable self-service account recovery
   - Add "email" as a required attribute
   - Use Cognito's built-in email service for verification
   - Create an app client (without client secret)
   - Note down the **User Pool ID** and **App Client ID**

### Cognito Identity Pool Setup

1. In Cognito console, create a new Identity Pool
2. Enable access to unauthenticated identities if needed
3. Configure Authentication Providers:
   - Select "Cognito" tab
   - Enter your User Pool ID and App Client ID
4. Create IAM roles
5. Configure IAM role for authenticated users with S3 access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::your-bucket-name"],
      "Condition": {
        "StringLike": {
          "s3:prefix": ["${cognito-identity.amazonaws.com:sub}/*"]
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/${cognito-identity.amazonaws.com:sub}/*"
      ]
    }
  ]
}
```

6. Note down the **Identity Pool ID**

## Application Configuration

When you first launch the application, you'll need to provide:

1. **AWS Region**: The region where your S3 and Cognito resources are located
2. **User Pool ID**: Your Cognito User Pool ID (e.g., `us-east-1_abc123`)
3. **App Client ID**: Your User Pool App Client ID
4. **Identity Pool ID**: Your Cognito Identity Pool ID (e.g., `us-east-1:12345-abcde-67890-fghij`)
5. **S3 Bucket Name**: The name of your S3 bucket

This configuration is stored in your browser's localStorage and persists between sessions.

## User Authentication Flow

1. **Sign Up**: New users register with their email address
2. **Verification**: Users verify their email with a code sent by Cognito
3. **Sign In**: Users sign in with their verified credentials
4. **Account Recovery**: Users can reset their password if forgotten

After successful authentication, users can access their own private section of the S3 bucket, isolated from other users.

## Project Structure

```
src/
├── components/         # React components
│   ├── UI/             # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dialogs/        # Modal dialog components
│   └── layout/         # Layout components
├── context/            # React context providers
│   ├── AppContext.jsx  # Main application context
│   └── AuthContext.jsx # Authentication context
├── services/           # Service classes
│   ├── amplifyConfig.js # AWS Amplify configuration
│   ├── authService.js   # Authentication service
│   ├── s3Service.js     # S3 operations service
│   └── errorHandling.js # Error handling service
├── styles/             # CSS styles
└── utils/              # Utility functions
```

## Security Considerations

- User data is isolated using Cognito user IDs as path prefixes in S3
- AWS credentials are never stored directly in the application
- Authentication uses secure, temporary credentials via Cognito Identity Pool
- User verification is required through email confirmation
- IAM roles restrict users to their own files only

## Troubleshooting Common Issues

### S3 Upload Issues

If you encounter the "readableStream.getReader is not a function" error:

1. Try refreshing the page and ensuring you're properly signed in
2. Check your browser console for more specific error messages
3. Verify your IAM role permissions are correct for the authenticated user
4. Ensure your S3 bucket CORS configuration is properly set

### Authentication Issues

1. Ensure your Cognito User Pool and Identity Pool IDs are correct
2. Verify that your Identity Pool is properly linked to your User Pool
3. Check that your browser hasn't disabled cookies or localStorage
4. Try signing out and back in if you experience token expiration issues

### Configuration Persistence

1. If your configuration is lost after refresh, verify that:
   - localStorage is enabled in your browser
   - Your browser privacy settings allow local storage
   - You don't have extensions that clear localStorage automatically

## Technologies Used

- React
- AWS SDK v3 for JavaScript
- AWS Amplify for authentication
- JSZip (for downloading multiple files)
- React Toastify (for notifications)
- Font Awesome (for icons)

## License

MIT License
