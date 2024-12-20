import { Amplify } from 'aws-amplify';

// Type-safe environment variables
const requiredEnvVars = {
  userPoolId: process.env.REACT_APP_USER_POOL_ID ?? '',
  userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID ?? '',
  region: process.env.REACT_APP_REGION ?? '',
  bucket: process.env.REACT_APP_S3_BUCKET ?? '',
  apiEndpoint: process.env.REACT_APP_API_ENDPOINT ?? ''
} as const;

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Ensure region is valid
if (!requiredEnvVars.region.match(/^[a-z]{2}-[a-z]+-\d{1}$/)) {
  throw new Error('Invalid AWS region format');
}

// Ensure User Pool ID matches region
if (!requiredEnvVars.userPoolId.startsWith(requiredEnvVars.region)) {
  throw new Error('User Pool ID region does not match configured region');
}

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
        region: requiredEnvVars.region
      }
    }
  }
}); 