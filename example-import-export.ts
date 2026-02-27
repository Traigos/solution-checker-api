import { DataverseClient } from './src/dataverse-client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: Import, Export, and Delete Solutions using the Dataverse Web API
 */
async function solutionManagementExamples() {
  // Initialize the client
  const client = new DataverseClient({
    baseUrl: 'https://your-org.crm.dynamics.com',
    useIntegratedAuth: true
  });

  try {
    // ============================================
    // EXAMPLE 1: Import a Solution
    // ============================================
    console.log('\n=== Importing Solution ===');

    // Read solution file from disk
    const solutionFilePath = path.join(__dirname, 'MySolution_1_0_0_0.zip');
    const solutionFileBuffer = fs.readFileSync(solutionFilePath);

    // Import synchronously
    const importResult = await client.solutions.importSolution(
      solutionFileBuffer,
      {
        OverwriteUnmanagedCustomizations: true,
        PublishWorkflows: true,
        ConvertToManaged: false
      }
    );

    console.log('Import completed!', importResult);

    // ============================================
    // EXAMPLE 2: Import Solution Asynchronously
    // ============================================
    console.log('\n=== Importing Solution Async ===');

    // Start async import
    const importJobId = await client.solutions.importSolutionAsync(
      solutionFileBuffer,
      {
        OverwriteUnmanagedCustomizations: false,
        PublishWorkflows: true
      }
    );

    console.log('Import job started:', importJobId);

    // Option A: Poll manually
    let job = await client.solutions.getImportJobStatus(importJobId);
    console.log('Import status:', job);

    // Option B: Wait for completion (with timeout)
    const completedJob = await client.solutions.waitForImportCompletion(
      importJobId,
      5000,  // Poll every 5 seconds
      300000 // Timeout after 5 minutes
    );

    console.log('Import completed!', completedJob);

    // ============================================
    // EXAMPLE 3: Export a Solution
    // ============================================
    console.log('\n=== Exporting Solution ===');

    // Export as unmanaged
    const unmanagedZipBase64 = await client.solutions.exportSolution(
      'MySolution',
      false  // managed = false
    );

    // Save to file
    const unmanagedBuffer = Buffer.from(unmanagedZipBase64, 'base64');
    fs.writeFileSync('MySolution_unmanaged.zip', unmanagedBuffer);
    console.log('Unmanaged solution exported!');

    // Export as managed with additional settings
    const managedZipBase64 = await client.solutions.exportSolution(
      'MySolution',
      true,  // managed = true
      {
        ExportAutoNumberingSettings: true,
        ExportCalendarSettings: true,
        ExportCustomizationSettings: true,
        ExportEmailTrackingSettings: true
      }
    );

    // Save to file
    const managedBuffer = Buffer.from(managedZipBase64, 'base64');
    fs.writeFileSync('MySolution_managed.zip', managedBuffer);
    console.log('Managed solution exported!');

    // ============================================
    // EXAMPLE 4: Clone/Patch a Solution
    // ============================================
    console.log('\n=== Cloning Solution ===');

    const patchSolution = await client.solutions.cloneSolution(
      'MySolution',           // Parent solution unique name
      'MySolution_Patch_1',   // New unique name
      'My Solution Patch 1',  // Display name
      '1.0.0.1'              // Version number (optional)
    );

    console.log('Patch solution created:', patchSolution);

    // ============================================
    // EXAMPLE 5: Delete a Solution
    // ============================================
    console.log('\n=== Deleting Solution ===');

    // Delete by ID
    await client.solutions.deleteSolution('12345678-1234-1234-1234-123456789012');
    console.log('Solution deleted by ID');

    // Delete by unique name
    await client.solutions.deleteSolutionByUniqueName('MySolution_Patch_1');
    console.log('Solution deleted by unique name');

    // ============================================
    // EXAMPLE 6: Full Import/Export Workflow
    // ============================================
    console.log('\n=== Full Import/Export Workflow ===');

    // 1. Export solution from source environment
    const sourceClient = new DataverseClient({
      baseUrl: 'https://source-org.crm.dynamics.com',
      useIntegratedAuth: true
    });

    const exportedSolution = await sourceClient.solutions.exportSolution(
      'MySolution',
      false
    );

    console.log('Exported from source environment');

    // 2. Import to target environment
    const targetClient = new DataverseClient({
      baseUrl: 'https://target-org.crm.dynamics.com',
      useIntegratedAuth: true
    });

    const targetImportJobId = await targetClient.solutions.importSolutionAsync(
      exportedSolution,
      {
        OverwriteUnmanagedCustomizations: true,
        PublishWorkflows: true
      }
    );

    // 3. Wait for import to complete
    await targetClient.solutions.waitForImportCompletion(targetImportJobId);
    console.log('Imported to target environment');

    // ============================================
    // EXAMPLE 7: Backup All Solutions
    // ============================================
    console.log('\n=== Backing Up All Solutions ===');

    // Get all non-system solutions
    const solutions = await client.solutions.getSolutions({
      $filter: 'isvisible eq true and ismanaged eq false',
      $select: ['solutionid', 'uniquename', 'version', 'friendlyname']
    });

    // Create backup directory
    const backupDir = path.join(__dirname, 'solution-backups', new Date().toISOString().split('T')[0]);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Export each solution
    for (const solution of solutions) {
      console.log(`Backing up ${solution.uniquename}...`);

      const zipBase64 = await client.solutions.exportSolution(
        solution.uniquename!,
        false
      );

      const filename = `${solution.uniquename}_${solution.version?.replace(/\./g, '_')}.zip`;
      const filepath = path.join(backupDir, filename);

      const buffer = Buffer.from(zipBase64, 'base64');
      fs.writeFileSync(filepath, buffer);

      console.log(`✓ Backed up to ${filepath}`);
    }

    console.log(`\nAll solutions backed up to: ${backupDir}`);

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Run examples
if (require.main === module) {
  solutionManagementExamples()
    .then(() => {
      console.log('\n✅ All examples completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error running examples:', error);
      process.exit(1);
    });
}

export { solutionManagementExamples };
