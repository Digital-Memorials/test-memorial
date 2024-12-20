import { Amplify } from 'aws-amplify';
import { type ResourcesConfig } from 'aws-amplify';
import awsconfig from './aws-exports';

type AwsConfig = {
  aws_project_region: string;
  aws_cognito_region: string;
  aws_user_pools_id: string;
  aws_user_pools_web_client_id: string;
  aws_user_files_s3_bucket: string;
  aws_cloud_logic_custom: Array<{
    name: string;
    endpoint: string;
    region: string;
  }>;
  [key: string]: any;
};

const config = awsconfig as AwsConfig;

// Validate required configuration
const requiredFields = [
  'aws_project_region',
  'aws_cognito_region',
  'aws_user_pools_id',
  'aws_user_pools_web_client_id',
  'aws_user_files_s3_bucket',
  'aws_cloud_logic_custom'
] as const;

requiredFields.forEach(field => {
  if (!config[field]) {
    throw new Error(`Missing required AWS configuration field: ${field}`);
  }
});

// Ensure API endpoint exists
if (!config.aws_cloud_logic_custom?.[0]?.endpoint) {
  throw new Error('Missing API endpoint configuration');
}

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: config.aws_user_pools_id,
      userPoolClientId: config.aws_user_pools_web_client_id,
      signUpVerificationMethod: 'code',
    }
  },
  API: {
    REST: {
      memorialAPI: {
        endpoint: config.aws_cloud_logic_custom[0].endpoint,
        region: config.aws_project_region,
      }
    }
  },
  Storage: {
    S3: {
      bucket: config.aws_user_files_s3_bucket,
      region: config.aws_project_region
    }
  }
};

// Log configuration for debugging
console.log('Amplify Configuration:', {
  region: config.aws_project_region,
  userPoolId: config.aws_user_pools_id,
  bucket: config.aws_user_files_s3_bucket,
  endpoint: config.aws_cloud_logic_custom[0].endpoint
});

Amplify.configure(amplifyConfig); 