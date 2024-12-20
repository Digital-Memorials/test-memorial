import { Amplify } from 'aws-amplify';

// Type-safe environment variables
const requiredEnvVars = {
  userPoolId: process.env.REACT_APP_USER_POOL_ID ?? '',
  userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID ?? '',
  bucket: process.env.REACT_APP_S3_BUCKET ?? '',
  region: process.env.REACT_APP_REGION ?? '',
  apiEndpoint: process.env.REACT_APP_API_ENDPOINT ?? ''
} as const;

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: requiredEnvVars.userPoolId,
      userPoolClientId: requiredEnvVars.userPoolClientId,
      loginWith: {
        email: true,
        phone: false,
        username: false
      }
    }
  },
  Storage: {
    S3: {
      bucket: requiredEnvVars.bucket,
      region: requiredEnvVars.region
    }
  },
  API: {
    REST: {
      memorialAPI: {
        endpoint: requiredEnvVars.apiEndpoint,
        region: requiredEnvVars.region,
      }
    }
  }
}); 