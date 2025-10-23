import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Import the solution-checker-api library
// In production, this would be: import { DataverseClient } from '@dataverse/solution-library'
const { DataverseClient } = require('../dist/index.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration - UPDATE THESE VALUES FOR YOUR ENVIRONMENT
const DATAVERSE_CONFIG = {
  baseUrl: process.env.DATAVERSE_URL || 'https://your-org.crm.dynamics.com',
  apiVersion: '9.2',
  useIntegratedAuth: true
};

// Initialize Dataverse client
let dataverseClient;

try {
  dataverseClient = new DataverseClient(DATAVERSE_CONFIG);
  console.log('✓ Dataverse client initialized');
} catch (error) {
  console.error('✗ Failed to initialize Dataverse client:', error.message);
  console.log('  Please set DATAVERSE_URL environment variable or update DATAVERSE_CONFIG in server.js');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Solution Checker API is running',
    dataverseConfigured: !!dataverseClient,
    dataverseUrl: DATAVERSE_CONFIG.baseUrl
  });
});

// Get all solutions
app.get('/api/solutions', async (req, res) => {
  try {
    if (!dataverseClient) {
      return res.status(503).json({
        error: 'Dataverse client not initialized. Please configure DATAVERSE_URL.'
      });
    }

    const solutions = await dataverseClient.solutions.getSolutions({
      $select: ['solutionid', 'uniquename', 'friendlyname', 'version', 'ismanaged', 'installedon', 'publisheridname'],
      $filter: 'isvisible eq true',
      $orderby: 'friendlyname asc'
    });

    res.json(solutions);
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({
      error: 'Failed to fetch solutions',
      message: error.message
    });
  }
});

// Get a single solution
app.get('/api/solutions/:id', async (req, res) => {
  try {
    if (!dataverseClient) {
      return res.status(503).json({
        error: 'Dataverse client not initialized. Please configure DATAVERSE_URL.'
      });
    }

    const solution = await dataverseClient.solutions.getSolutionById(req.params.id, {
      $select: ['solutionid', 'uniquename', 'friendlyname', 'version', 'ismanaged', 'description', 'installedon', 'publisheridname']
    });

    res.json(solution);
  } catch (error) {
    console.error('Error fetching solution:', error);
    res.status(500).json({
      error: 'Failed to fetch solution',
      message: error.message
    });
  }
});

// Validate a solution (run all checks)
app.post('/api/solutions/:id/validate', async (req, res) => {
  try {
    if (!dataverseClient) {
      return res.status(503).json({
        error: 'Dataverse client not initialized. Please configure DATAVERSE_URL.'
      });
    }

    console.log(`Starting validation for solution: ${req.params.id}`);

    const validationResult = await dataverseClient.validation.validateSolution(req.params.id);

    console.log(`Validation completed. Status: ${validationResult.overallStatus}, Issues: ${validationResult.totalIssues}`);

    res.json(validationResult);
  } catch (error) {
    console.error('Error validating solution:', error);
    res.status(500).json({
      error: 'Failed to validate solution',
      message: error.message
    });
  }
});

// Run Solution Checker on a solution
app.post('/api/solutions/:id/run-checker', async (req, res) => {
  try {
    if (!dataverseClient) {
      return res.status(503).json({
        error: 'Dataverse client not initialized. Please configure DATAVERSE_URL.'
      });
    }

    await dataverseClient.solutions.runSolutionChecker(req.params.id);

    res.json({
      message: 'Solution Checker started successfully',
      solutionId: req.params.id
    });
  } catch (error) {
    console.error('Error running Solution Checker:', error);
    res.status(500).json({
      error: 'Failed to run Solution Checker',
      message: error.message
    });
  }
});

// Get solution components
app.get('/api/solutions/:id/components', async (req, res) => {
  try {
    if (!dataverseClient) {
      return res.status(503).json({
        error: 'Dataverse client not initialized. Please configure DATAVERSE_URL.'
      });
    }

    const components = await dataverseClient.solutions.getSolutionComponentsBySolutionId(req.params.id);

    res.json(components);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({
      error: 'Failed to fetch components',
      message: error.message
    });
  }
});

// Get workflows for a solution
app.get('/api/solutions/:id/workflows', async (req, res) => {
  try {
    if (!dataverseClient) {
      return res.status(503).json({
        error: 'Dataverse client not initialized. Please configure DATAVERSE_URL.'
      });
    }

    const workflows = await dataverseClient.workflows.getWorkflowsFromSolutionId(req.params.id);

    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      error: 'Failed to fetch workflows',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Solution Checker API Server                              ║
╠════════════════════════════════════════════════════════════╣
║  Status: Running                                           ║
║  Port: ${PORT}                                                ║
║  Dataverse: ${DATAVERSE_CONFIG.baseUrl.padEnd(42)} ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║  GET  /api/health                                          ║
║  GET  /api/solutions                                       ║
║  GET  /api/solutions/:id                                   ║
║  POST /api/solutions/:id/validate                          ║
║  POST /api/solutions/:id/run-checker                       ║
║  GET  /api/solutions/:id/components                        ║
║  GET  /api/solutions/:id/workflows                         ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
