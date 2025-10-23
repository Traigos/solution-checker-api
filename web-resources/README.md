# Dataverse Web Resources - Solution Checker

This folder contains the built web application files ready to be uploaded to Dataverse as web resources.

## Files Structure

```
solution-checker/
├── index.html          # Main HTML page
└── assets/
    ├── app.js          # React application bundle (151KB)
    └── app.css         # Application styles (5KB)
```

## Upload Instructions

### Option 1: Manual Upload via Power Apps

1. Navigate to [make.powerapps.com](https://make.powerapps.com)
2. Select your environment
3. Go to **Solutions** and open your solution (or create a new one)
4. Click **New** → **More** → **Web resource**
5. Upload each file with the following settings:

   **For index.html:**
   - Display name: `Solution Checker - Main Page`
   - Name: `your_prefix_/SolutionChecker/index.html`
   - Type: `Webpage (HTML)`
   - Upload file: `solution-checker/index.html`

   **For app.js:**
   - Display name: `Solution Checker - App Script`
   - Name: `your_prefix_/SolutionChecker/assets/app.js`
   - Type: `Script (JScript)`
   - Upload file: `solution-checker/assets/app.js`

   **For app.css:**
   - Display name: `Solution Checker - App Styles`
   - Name: `your_prefix_/SolutionChecker/assets/app.css`
   - Type: `Style Sheet (CSS)`
   - Upload file: `solution-checker/assets/app.css`

6. Click **Save** for each web resource
7. **Publish All Customizations**

### Option 2: Upload via PowerShell

Use the provided PowerShell script to automate the upload process:

```powershell
# See upload-webresources.ps1 in this directory
./upload-webresources.ps1 -EnvironmentUrl "https://your-org.crm.dynamics.com" -PublisherPrefix "new"
```

### Option 3: Upload via PAC CLI

```bash
# Install PAC CLI if you haven't already
# https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction

# Authenticate
pac auth create --url https://your-org.crm.dynamics.com

# Upload web resources
pac solution add-reference --path "solution-checker"
```

## Accessing the Application

After uploading and publishing:

1. Navigate to: `https://your-org.crm.dynamics.com/WebResources/your_prefix_/SolutionChecker/index.html`
2. Or create a Model-driven App and add it as a custom page

## Configuration

The application expects the API server to be running at `http://localhost:3001/api` by default.

To change the API URL, set the `VITE_API_URL` environment variable before building:

```bash
# Rebuild with custom API URL
cd web-app
VITE_API_URL=https://your-api-server.com/api npm run build

# Then copy the new build to web-resources
```

## API Server

Make sure the API server is running and accessible:

```bash
cd api-server
node server.js
```

The API server should be configured with your Dataverse environment URL via the `DATAVERSE_URL` environment variable.

## Notes

- The web resources are static files and require the API server to be running separately
- Ensure CORS is properly configured on your API server to allow requests from your Dataverse environment
- The application uses integrated authentication, so users must be authenticated to your Dataverse environment
- Consider deploying the API server to Azure App Service or Azure Functions for production use

## Troubleshooting

**Issue**: Application doesn't load or shows blank page
- Check browser console for errors
- Verify all web resources were uploaded correctly
- Ensure relative paths in index.html match the web resource names

**Issue**: API calls fail
- Verify API server is running and accessible
- Check CORS configuration on API server
- Verify DATAVERSE_URL is set correctly in API server

**Issue**: Authentication errors
- Ensure integrated authentication is enabled
- Verify users have appropriate permissions in Dataverse
- Check that the API server is configured for integrated authentication
