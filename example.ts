/**
 * Example usage of the Dataverse Solution Library
 *
 * This file demonstrates how to use the library.
 * It's not included in the build output.
 */

import { DataverseClient, DataverseClientConfig } from './src';

async function main() {
  // Configure the client
  // Uses integrated authentication (Windows Authentication) by default
  const config: DataverseClientConfig = {
    baseUrl: 'https://your-org.crm.dynamics.com',
    apiVersion: '9.2', // optional
    timeout: 30000, // optional
    useIntegratedAuth: true, // optional (true by default)
  };

  // Create client instance
  const client = new DataverseClient(config);

  try {
    // Example 1: Get all solutions
    console.log('Fetching all solutions...');
    const allSolutions = await client.solutions.getSolutions();
    console.log(`Found ${allSolutions.length} solutions`);

    // Example 2: Get a specific solution by ID
    // console.log('\nFetching solution by ID...');
    // const solution = await client.solutions.getSolutionById('your-solution-id');
    // console.log('Solution:', solution);

    // Example 3: Get solution by unique name
    // console.log('\nFetching solution by unique name...');
    // const solutionByName = await client.solutions.getSolutionByUniqueName('YourSolutionName');
    // console.log('Solution:', solutionByName);

    // Example 4: Query with options
    // const filteredSolutions = await client.solutions.getSolutions({
    //   $select: ['solutionid', 'uniquename', 'friendlyname'],
    //   $filter: "ismanaged eq false",
    //   $orderby: 'createdon desc',
    //   $top: 5,
    // });

    // Example 5: Get solution components by solution ID
    // const components = await client.solutions.getSolutionComponentsBySolutionId('your-solution-id');
    // console.log(`Found ${components.length} components`);

    // Example 6: Get workflows from a solution
    // const workflows = await client.workflows.getWorkflowsFromSolutionId('your-solution-id');
    // console.log(`Found ${workflows.length} workflows`);

    // Example 7: Validate workflow email actions
    // const isValid = await client.workflows.validateWorkflowEmailActions('your-solution-id');
    // console.log(`Email actions valid: ${isValid}`);

    // Example 8: Update workflow email and approval actions
    // await client.workflows.updateEmailAndApprovalWorkflowActions('your-workflow-id', 'admin@example.com');
    // console.log('Workflow updated successfully');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
