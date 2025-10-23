# Solution Checker - Deployment Guide

## Overview

The Solution Checker is a full-stack application for validating Dataverse solutions. It consists of:

1. **TypeScript Library** - Core validation logic and Dataverse API client
2. **Express.js API Server** - REST API backend
3. **React Web App** - User interface for running validations

## Architecture

```
┌─────────────────────┐
│  React Web App      │
│  (Dataverse Web     │
│   Resources)        │
└──────────┬──────────┘
           │
           │ HTTP/REST
           ▼
┌─────────────────────┐
│  Express API Server │
│  (Node.js)          │
└──────────┬──────────┘
           │
           │ Dataverse Web API
           ▼
┌─────────────────────┐
│  Dataverse          │
│  Environment        │
└─────────────────────┘
```

## Prerequisites

- Node.js 18+ installed
- Access to a Dataverse environment
- Power Platform admin or system customizer role
- (Optional) PowerShell 7+ for automated deployment

## Step 1: Build the Components

All components are already built. The builds are located in:

- **Library**: `dist/` directory (TypeScript compiled to JavaScript)
- **React App**: `web-app/dist/` directory
- **Web Resources**: `web-resources/solution-checker/` directory (ready to upload)

To rebuild if needed:

```bash
# Rebuild TypeScript library
npm run build

# Rebuild React app
cd web-app
npm run build

# Copy to web-resources (if you made changes)
rm -rf ../web-resources/solution-checker
mkdir -p ../web-resources/solution-checker/assets
cp dist/index.html ../web-resources/solution-checker/
cp dist/assets/*.js ../web-resources/solution-checker/assets/app.js
cp dist/assets/*.css ../web-resources/solution-checker/assets/app.css
```

## Step 2: Deploy the API Server

### Option A: Local Development

```bash
cd api-server
DATAVERSE_URL=https://your-org.crm.dynamics.com node server.js
```

The server will start on port 3001.

### Option B: Azure App Service

1. Create a new App Service (Node.js 18 LTS)
2. Set environment variables:
   - `DATAVERSE_URL`: Your Dataverse environment URL
   - `PORT`: 80 (or as required)
3. Deploy using:

```bash
cd api-server
az webapp up --name your-app-name --resource-group your-rg --runtime "NODE:18-lts"
```

### Option C: Azure Functions

1. Convert Express app to Azure Function
2. Use Azure Function Proxies for routing
3. Set DATAVERSE_URL in Application Settings

### Option D: Docker Container

```bash
# Create Dockerfile in api-server directory
cd api-server
cat > Dockerfile <<EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
COPY ../dist ./dist
EXPOSE 3001
CMD ["node", "server.js"]
EOF

# Build and run
docker build -t solution-checker-api .
docker run -p 3001:3001 -e DATAVERSE_URL=https://your-org.crm.dynamics.com solution-checker-api
```

## Step 3: Configure CORS

The API server must allow requests from your Dataverse environment:

```javascript
// In api-server/server.js, update CORS configuration:
app.use(cors({
  origin: [
    'https://your-org.crm.dynamics.com',
    'https://your-org.crm.dynamics.com/*'
  ],
  credentials: true
}));
```

## Step 4: Upload Web Resources to Dataverse

### Manual Upload

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Select your environment
3. Navigate to **Solutions** → **New solution** (or use existing)
4. Add three web resources (see README.md for details):
   - `your_prefix_/SolutionChecker/index.html`
   - `your_prefix_/SolutionChecker/assets/app.js`
   - `your_prefix_/SolutionChecker/assets/app.css`
5. Publish all customizations

### Automated Upload

```powershell
cd web-resources
./upload-webresources.ps1 `
  -EnvironmentUrl "https://your-org.crm.dynamics.com" `
  -PublisherPrefix "new" `
  -SolutionName "YourSolution"
```

## Step 5: Update API URL in Web App

If your API server is not at `http://localhost:3001`, you need to rebuild with the correct URL:

```bash
cd web-app

# Set API URL environment variable
export VITE_API_URL=https://your-api-server.azurewebsites.net/api

# Rebuild
npm run build

# Copy new build to web-resources
cd ..
rm -rf web-resources/solution-checker
mkdir -p web-resources/solution-checker/assets
cp web-app/dist/index.html web-resources/solution-checker/
cp web-app/dist/assets/*.js web-resources/solution-checker/assets/app.js
cp web-app/dist/assets/*.css web-resources/solution-checker/assets/app.css

# Update index.html paths
cd web-resources/solution-checker
# Edit index.html to use relative paths (already done)
```

Then re-upload the web resources.

## Step 6: Access the Application

After deployment, access the application at:

```
https://your-org.crm.dynamics.com/WebResources/your_prefix_/SolutionChecker/index.html
```

Replace:
- `your-org` with your Dataverse organization name
- `your_prefix_` with your publisher prefix

## Step 7: Add to Model-Driven App (Optional)

1. Open your model-driven app in the app designer
2. Add a new page
3. Select **URL** as the page type
4. Enter the web resource URL
5. Set appropriate title and icon
6. Save and publish

## Verification

1. **Check API Health**:
   ```bash
   curl http://your-api-server:3001/api/health
   ```

2. **Test Solutions Endpoint**:
   ```bash
   curl http://your-api-server:3001/api/solutions
   ```

3. **Open Web App**: Navigate to the web resource URL

4. **Run Validation**: Select a solution and click "Run Validation"

## Troubleshooting

### Issue: API returns 503 Service Unavailable

**Cause**: Dataverse client not initialized

**Solution**:
- Verify DATAVERSE_URL environment variable is set
- Check API server logs for initialization errors
- Ensure integrated authentication is working

### Issue: CORS errors in browser console

**Cause**: API server not allowing requests from Dataverse

**Solution**:
- Update CORS configuration in server.js
- Add your Dataverse URL to allowed origins
- Restart API server

### Issue: Authentication failures

**Cause**: Integrated authentication not working

**Solution**:
- Ensure API server is in same domain or proper CORS headers
- Verify credentials are being passed (`withCredentials: true`)
- Check browser network tab for authentication headers

### Issue: Web resources not loading

**Cause**: Incorrect paths or not published

**Solution**:
- Verify web resource names match references in index.html
- Ensure all web resources are published
- Check browser console for 404 errors
- Verify relative paths use forward slashes

## Security Considerations

1. **Authentication**: Uses integrated Windows Authentication
2. **Authorization**: Users must have appropriate Dataverse permissions
3. **CORS**: Restrict origins to known Dataverse environments
4. **HTTPS**: Always use HTTPS in production
5. **Secrets**: Never commit API keys or connection strings

## Production Checklist

- [ ] API server deployed to production environment
- [ ] DATAVERSE_URL configured correctly
- [ ] CORS configured for production Dataverse URL
- [ ] HTTPS enabled on API server
- [ ] Web resources uploaded with correct prefix
- [ ] All web resources published
- [ ] Application tested with real Dataverse data
- [ ] Error handling verified
- [ ] Monitoring/logging configured
- [ ] Backup and disaster recovery plan in place

## Support

For issues or questions:
- Review the main README.md
- Check API server logs
- Review browser console for errors
- Verify Dataverse permissions
