# Digital Memorials

A beautiful and interactive memorial application built with React, AWS Amplify, and TypeScript. This is our development template repository for creating customized memorial websites for clients.

## Features

- **Life Story**: A beautifully designed obituary section
- **Memory Wall**: Share and view memories with optional image/video attachments
- **Book of Condolences**: Leave messages of support and condolences
- **User Authentication**: Secure user accounts with email verification
- **Media Management**: Upload and manage images and videos
- **Responsive Design**: Beautiful experience on all devices
- **Admin Controls**: Special privileges for memorial administrators

## Design Templates

This repository serves as the base template (Template A) for our memorial websites. We maintain five different design templates:
- Template A (Current): Classic and elegant design
- Template B: Modern and minimalist
- Template C: Traditional and ornate
- Template D: Contemporary and bold
- Template E: Serene and nature-inspired

For each client project, we create a new branch from their chosen template and customize it according to their needs.

## Development Workflow

1. Client selects a design template
2. Create a new branch from the chosen template
3. Customize the memorial content and styling
4. Deploy to AWS environment
5. Maintain and update as needed

## Technical Setup

### Prerequisites
- Node.js (v18 or later)
- yarn
- AWS Account
- AWS Amplify CLI (`npm install -g @aws-amplify/cli`)
- GitHub account

### Infrastructure Setup

1. Create a new GitHub repository:
   - Go to GitHub and create a new repository
   - Name format example: `client-name-memorial`
   - Keep it private
   - Do not initialize with README (we'll push the template)

2. Create a new Amplify app:
   - Go to AWS Amplify Console
   - Click "New App" > "Host Web App"
   - Connect to the newly created GitHub repository
   - Choose "master" as the main branch
   - Follow the deployment steps
   - **Important**: Note down the Amplify app name/ID - you'll need this to ensure you're working in the right environment

### Local Development Setup

> **⚠️ Environment Isolation**: Each client project must have its own:
> - GitHub repository
> - Amplify backend environment
> - AWS resources
> 
> Always verify you're working in the correct environment before making changes!

1. Clone and set up the new repository:
   ```bash
   # Clone the template repository into a new directory for this client
   git clone https://github.com/Digital-Memorials/test-memorial.git client-name-memorial
   cd client-name-memorial
   
   # Remove the templates git history and initialize new repository
   rm -rf .git
   git init
   
   # Connect to the new client repository
   git remote add origin https://github.com/Digital-Memorials/client-name-memorial.git
   git add .
   git commit -m "Initial commit from template"
   git push -u origin master
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Initialize new Amplify environment:
   ```bash
   # Initialize Amplify with a new environment
   amplify init

   # During initialization:
   # - Choose a unique name for the environment (e.g., clientnameprod)
   # - Select "AWS profile" for authentication
   # - Choose or create an AWS profile
   ```
   
   > **🔍 Verify Environment**: 
   > - Run `amplify status` to verify you're in the right environment
   > - The displayed "Project information" should match your new client project
   > - If incorrect, use `amplify env list` and `amplify env checkout [envname]`

4. Push the Amplify configuration:
   ```bash
   amplify push
   ```
   This creates isolated AWS resources specific to this client's environment.

5. Configure S3 Bucket Access:
   - Go to AWS Console > S3
   - Find the newly created bucket 
   - Under "Block Public Access settings":
     - Click "Edit"
     - Uncheck "Block all public access"
     - Save changes
   - Under "Bucket Policy", add the following (replace `[BUCKET-NAME]`):
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::[BUCKET-NAME]/*"
           }
       ]
   }
   ```

6. Set Up Admin Access:
   - Go to AWS Console > Cognito > User Pools
   - Select the newly created user pool
   - Under "Groups":
     - Click "Create group"
     - Name it "admin"
     - Set high precedence (e.g., 1)
     - Create the group
   - To add an admin user:
     - Create a user account through the app
     - Go back to Cognito
     - Find the user in "Users"
     - Click "Add user to group"
     - Select "admin"
     - Confirm

7. Start the development server:
   ```bash
   yarn start
   ```

### Switching Between Projects

When working on different memorial sites:

1. Always change directory to the specific client project:
   ```bash
   cd path/to/client-name-memorial
   ```

2. Verify Git repository:
   ```bash
   git remote -v
   # Should show the clients GitHub repository, not the template
   ```

3. Verify Amplify environment:
   ```bash
   amplify status
   # Should show the clients environment name and resources
   ```

## Project Structure

```
amplify/                  # AWS Amplify configuration and resources
├── backend/             # Backend configuration
│   ├── api/            # API Gateway and Lambda configurations
│   ├── auth/           # Cognito user pool settings
│   ├── function/       # Lambda function code
│   └── storage/        # DynamoDB and S3 configurations
├── .config/            # Amplify project configuration
└── team-provider-info/ # Environment-specific settings

src/
├── components/         # React components
│   ├── auth/          # Authentication components (Login, Register)
│   ├── Condolences/   # Book of Condolences component and styles
│   ├── MemoryWall/    # Memory Wall component and styles
│   ├── Gallery/       # Photo gallery component
│   ├── Timeline/      # Life timeline component
│   ├── Obituary/      # Life story component
│   ├── MainLayout/    # Core layout and navigation
│   ├── Header/        # Header component
│   ├── Footer/        # Footer component
│   └── Overview/      # Overview component
├── contexts/          # React context providers
├── services/          # API and service integrations
├── types/             # TypeScript type definitions
├── utils/            # Utility functions and helpers
├── config/           # Application configuration
├── styles/           # Global CSS and styling files
│   ├── theme/        # Theme variables and settings
│   ├── shared/       # Shared styles and utilities
│   └── typography.css # Typography settings
└── images/           # Static image assets
```

## AWS Resources

The application utilizes several AWS services, each serving a specific purpose:

### Authentication (Cognito)
- User Pool: Manages user accounts and authentication
- Identity Pool: Handles AWS service access
- Configuration: `amplify/backend/auth/`

### API (API Gateway + Lambda)
- REST API endpoints for memories and condolences
- Lambda function handlers for business logic
- Configuration: `amplify/backend/api/` and `amplify/backend/function/`

### Storage
- DynamoDB Tables:
  - `memoriesTable`: Stores memory posts
  - `condolencesTable`: Stores condolence messages
- S3 Bucket:
  - `memorialmedia`: Stores uploaded images and videos
- Configuration: `amplify/backend/storage/`

## Customization Guide

### Content Updates
1. Obituary Content:
   - Edit `src/components/Obituary.tsx` for the life story content
   - Update text, dates, and biographical information

2. Memory Wall:
   - Configure `src/components/MemoryWall.tsx` for memory sharing features
   - Customize memory card layout in `src/components/MemoryWall.css`
   - Adjust media display settings and interactions

3. Book of Condolences:
   - Modify `src/components/Condolences.tsx` for condolence message features
   - Style the book layout in `src/components/Condolences.css`
   - Configure form fields and display options

4. Gallery:
   - Update `src/components/Gallery.tsx` for photo gallery layout
   - Add images to `src/images/`
   - Configure image grid and lightbox settings

5. Timeline:
   - Edit `src/components/Timeline.tsx` for life events
   - Add/modify timeline entries
   - Adjust timeline styling and layout

6. Core Layout:
   - Update header in `src/components/Header.tsx`
   - Modify main layout in `src/components/MainLayout.tsx`
   - Configure footer in `src/components/Footer.tsx`

### Styling Updates
1. Theme Colors:
   - Edit `src/styles/theme/colors.css`
   - Update component-specific colors in their respective CSS files

2. Typography:
   - Modify `src/styles/typography.css` for font settings
   - Update text styles in component CSS files

3. Layout:
   - Adjust responsive breakpoints in `src/styles/shared/breakpoints.css`
   - Modify component layouts in their respective CSS files

4. Shared Styles:
   - Update common styles in `src/styles/shared/`
   - Modify component-specific styles in `src/styles/components/`

## Contributing

This is a private repository for our development team. For each client project:

1. Select appropriate design template
2. Create new branch: `client/[client-name]`
3. Make customizations
4. Deploy to AWS

## Support

For internal development support, contact the development team lead.