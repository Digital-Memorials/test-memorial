import { Amplify } from 'aws-amplify';
import { type ResourcesConfig } from 'aws-amplify';

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID!,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID!,
    }
  },
  API: {
    REST: {
      memorialAPI: {
        endpoint: process.env.REACT_APP_API_ENDPOINT!,
        region: process.env.REACT_APP_REGION!,
      }
    }
  },
  Storage: {
    S3: {
      bucket: process.env.REACT_APP_S3_BUCKET!,
      region: process.env.REACT_APP_REGION!,
    }
  }
};

Amplify.configure(config); 