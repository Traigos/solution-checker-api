# Solution Checker Web App

A React-based web interface for validating Dataverse solutions.

## Features

- Browse and select Dataverse solutions
- Run comprehensive validation checks
- View detailed validation results with severity levels
- See categorized validation issues
- Review detailed check statistics

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Integration with Backend

### Current Setup

The app currently uses mock data for demonstration purposes. See `src/api.ts` for the mock implementations.

### Connecting to Real Backend

To connect to a real backend API:

1. Update the `API_BASE_URL` in `src/api.ts`
2. Replace the mock functions with real API calls
3. Ensure your backend implements these endpoints:
   - `GET /api/solutions` - Returns list of solutions
   - `POST /api/solutions/{id}/validate` - Runs validation on a solution

### Example Backend (Node.js/Express)

```javascript
const express = require('express');
const { DataverseClient } = require('@dataverse/solution-library');

const app = express();

const client = new DataverseClient({
  baseUrl: 'https://your-org.crm.dynamics.com'
});

app.get('/api/solutions', async (req, res) => {
  const solutions = await client.solutions.getSolutions();
  res.json(solutions);
});

app.post('/api/solutions/:id/validate', async (req, res) => {
  const result = await client.validation.validateSolution(req.params.id);
  res.json(result);
});

app.listen(3001);
```

## Project Structure

```
web-app/
├── src/
│   ├── components/
│   │   ├── SolutionList.tsx      # Displays list of solutions
│   │   └── ValidationResults.tsx # Shows validation results
│   ├── api.ts                    # API client and mock data
│   ├── types.ts                  # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   ├── App.css                   # Application styles
│   └── main.tsx                  # Application entry point
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS (no framework - pure CSS)

## License

MIT
