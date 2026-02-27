/**
 * Script to run Solution Checker on Odin-prefixed solutions
 * and display the findings
 */

import { DataverseClient, DataverseClientConfig } from './src';

interface CheckerFinding {
  solutionName: string;
  solutionId: string;
  hasBeenRun: boolean;
  jobs: any[];
  results: any[];
  components: any[];
}

async function main() {
  // Configure the client with your Dataverse instance
  const config: DataverseClientConfig = {
    baseUrl: process.env.DATAVERSE_URL || 'http://localhost:4070',
    apiVersion: '9.2',
    timeout: 60000, // Increased timeout for analysis operations
    useIntegratedAuth: true,
  };

  const client = new DataverseClient(config);

  console.log('🔍 Searching for solutions with "Odin" prefix...\n');

  try {
    // Query for solutions with "Odin" in the uniquename or friendlyname
    const odinSolutions = await client.solutions.getSolutions({
      $filter: "(contains(uniquename, 'Odin') or contains(friendlyname, 'Odin')) and ismanaged eq false",
      $select: ['solutionid', 'uniquename', 'friendlyname', 'version', 'publisheridname', 'installedon'],
      $orderby: 'createdon desc'
    });

    if (odinSolutions.length === 0) {
      console.log('❌ No solutions found with "Odin" prefix');
      return;
    }

    console.log(`✅ Found ${odinSolutions.length} Odin solution(s):\n`);

    // Display found solutions
    odinSolutions.forEach((solution, index) => {
      console.log(`${index + 1}. ${solution.friendlyname || solution.uniquename}`);
      console.log(`   ID: ${solution.solutionid}`);
      console.log(`   Unique Name: ${solution.uniquename}`);
      console.log(`   Version: ${solution.version || 'N/A'}`);
      console.log(`   Publisher: ${solution.publisheridname || 'N/A'}`);
      console.log('');
    });

    console.log('━'.repeat(80));
    console.log('');

    // Check and analyze each solution
    const findings: CheckerFinding[] = [];

    for (const solution of odinSolutions) {
      console.log(`\n📋 Analyzing: ${solution.friendlyname || solution.uniquename}`);
      console.log('─'.repeat(80));

      const finding: CheckerFinding = {
        solutionName: solution.friendlyname || solution.uniquename || '',
        solutionId: solution.solutionid || '',
        hasBeenRun: false,
        jobs: [],
        results: [],
        components: []
      };

      // Check if Solution Checker has been run
      const hasBeenRun = await client.solutions.hasSolutionCheckerBeenRun(solution.solutionid || '');
      finding.hasBeenRun = hasBeenRun;

      if (hasBeenRun) {
        console.log('✅ Solution Checker has been run on this solution');
        console.log('📥 Retrieving results...\n');

        // Get the analysis jobs
        const jobs = await client.solutions.getSolutionCheckerJobs(solution.solutionid || '');
        finding.jobs = jobs;

        if (jobs.length > 0) {
          console.log(`   Found ${jobs.length} analysis job(s)`);
          jobs.forEach((job, idx) => {
            console.log(`   Job ${idx + 1}:`);
            console.log(`     - ID: ${job.msdyn_analysisjobid}`);
            console.log(`     - Status: ${job.statuscode || 'N/A'}`);
            console.log(`     - Created: ${job.createdon || 'N/A'}`);
          });
          console.log('');
        }

        // Get the analysis results
        const results = await client.solutions.getSolutionCheckerResults(solution.solutionid || '');
        finding.results = results;

        if (results.length > 0) {
          console.log(`   📊 Found ${results.length} result(s)`);
          results.forEach((result, idx) => {
            console.log(`   Result ${idx + 1}:`);
            console.log(`     - ID: ${result.msdyn_analysisresultid}`);
            console.log(`     - Severity: ${result.msdyn_severity || 'N/A'}`);
            console.log(`     - Category: ${result.msdyn_category || 'N/A'}`);
            console.log(`     - Message: ${result.msdyn_message || 'N/A'}`);
            console.log(`     - File: ${result.msdyn_file || 'N/A'}`);
            console.log(`     - Line: ${result.msdyn_line || 'N/A'}`);
          });
          console.log('');
        }

        // Get the analysis components
        const components = await client.solutions.getSolutionCheckerAnalysisComponents(solution.solutionid || '');
        finding.components = components;

        if (components.length > 0) {
          console.log(`   🔧 Found ${components.length} analyzed component(s)`);
          components.slice(0, 5).forEach((component, idx) => {
            console.log(`   Component ${idx + 1}:`);
            console.log(`     - Name: ${component.msdyn_name || 'N/A'}`);
            console.log(`     - Type: ${component.msdyn_componenttype || 'N/A'}`);
            console.log(`     - Issues: ${component.msdyn_analysisresultcount || 0}`);
          });
          if (components.length > 5) {
            console.log(`   ... and ${components.length - 5} more component(s)`);
          }
          console.log('');
        }

      } else {
        console.log('⚠️  Solution Checker has NOT been run on this solution');
        console.log('💡 To run the checker, uncomment the runSolutionChecker call below');

        // Uncomment to actually run the solution checker:
        // console.log('🚀 Running Solution Checker...');
        // await client.solutions.runSolutionChecker(solution.solutionid || '');
        // console.log('✅ Solution Checker initiated. Results will be available shortly.');
      }

      findings.push(finding);
    }

    // Summary
    console.log('\n');
    console.log('━'.repeat(80));
    console.log('📊 SUMMARY');
    console.log('━'.repeat(80));
    console.log(`Total Solutions Analyzed: ${findings.length}`);
    console.log(`Solutions with Checker Results: ${findings.filter(f => f.hasBeenRun).length}`);
    console.log(`Total Issues Found: ${findings.reduce((sum, f) => sum + f.results.length, 0)}`);
    console.log(`Total Components Analyzed: ${findings.reduce((sum, f) => sum + f.components.length, 0)}`);

    // Group issues by severity if available
    const allResults = findings.flatMap(f => f.results);
    if (allResults.length > 0) {
      console.log('\n📈 Issues by Severity:');
      const severityCounts = allResults.reduce((acc, result) => {
        const severity = result.msdyn_severity || 'Unknown';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(severityCounts).forEach(([severity, count]) => {
        console.log(`   ${severity}: ${count}`);
      });
    }

    console.log('\n✅ Analysis complete!\n');

  } catch (error: any) {
    console.error('\n❌ Error occurred:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
