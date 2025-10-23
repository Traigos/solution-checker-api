/**
 * Example usage of the Dataverse Solution Library
 *
 * This file demonstrates how to use the library.
 * It's not included in the build output.
 */

import { DataverseClient, DataverseClientConfig } from './src';

async function main() {
  // Configure the client
  const config: DataverseClientConfig = {
    baseUrl: 'https://your-org.crm.dynamics.com',
    accessToken: 'your-access-token-here',
    apiVersion: '9.2', // optional
    timeout: 30000, // optional
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

    // Example 4: Query with options (after defining SolutionQueryOptions)
    // const filteredSolutions = await client.solutions.getSolutions({
    //   $select: ['solutionid', 'uniquename', 'friendlyname'],
    //   $filter: "ismanaged eq false",
    //   $orderby: 'createdon desc',
    //   $top: 5,
    // });

    // Example 5: Update access token
    // client.updateAccessToken('new-access-token');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
