const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/v1';

async function checkAphroditeData() {
  try {
    console.log('🔍 Checking Aphrodite release data...\n');

    // Get all releases
    console.log('1. Getting all releases...');
    const releasesResponse = await axios.get(`${BASE_URL}/releases`);
    const releases = releasesResponse.data;
    console.log(`Found ${releases.length} releases:`);
    releases.forEach(release => {
      console.log(`  - ${release.name} (ID: ${release.id}, Identifier: ${release.identifier})`);
    });

    // Find Aphrodite release
    const aphroditeRelease = releases.find(r => r.name.toLowerCase().includes('aphrodite'));
    if (!aphroditeRelease) {
      console.log('\n❌ No release found with "Aphrodite" in the name');
      return;
    }

    console.log(`\n📋 Aphrodite Release Details:`);
    console.log(`  ID: ${aphroditeRelease.id}`);
    console.log(`  Name: ${aphroditeRelease.name}`);
    console.log(`  Identifier: ${aphroditeRelease.identifier}`);
    console.log(`  Status: ${aphroditeRelease.status}`);

    // Check phases
    console.log('\n2. Checking phases...');
    const phasesResponse = await axios.get(`${BASE_URL}/releases/${aphroditeRelease.id}/phases`);
    const phases = phasesResponse.data;
    console.log(`Found ${phases.length} phases:`);
    phases.forEach(phase => {
      console.log(`  - ${phase.phaseType} (${phase.startDate} to ${phase.endDate})`);
    });

    // Check effort estimates
    console.log('\n3. Checking effort estimates...');
    const estimatesResponse = await axios.get(`${BASE_URL}/releases/${aphroditeRelease.id}/effort-estimates`);
    const estimates = estimatesResponse.data;
    console.log(`Found ${estimates.length} effort estimates:`);
    estimates.forEach(estimate => {
      console.log(`  - ${estimate.phase}: ${estimate.effortDays} days`);
    });

    // Check resources
    console.log('\n4. Checking active resources...');
    const resourcesResponse = await axios.get(`${BASE_URL}/resources`);
    const resources = resourcesResponse.data;
    const activeResources = resources.filter(r => r.status === 'ACTIVE');
    console.log(`Found ${activeResources.length} active resources out of ${resources.length} total:`);
    
    const skillFunctions = {};
    activeResources.forEach(resource => {
      const skill = resource.skillFunction;
      if (!skillFunctions[skill]) skillFunctions[skill] = 0;
      skillFunctions[skill]++;
    });
    
    Object.entries(skillFunctions).forEach(([skill, count]) => {
      console.log(`  - ${skill}: ${count} resources`);
    });

    // Check existing allocations
    console.log('\n5. Checking existing allocations...');
    const allocationsResponse = await axios.get(`${BASE_URL}/releases/${aphroditeRelease.id}/allocations`);
    const allocations = allocationsResponse.data;
    console.log(`Found ${allocations.length} existing allocations`);

    console.log('\n✅ Data check complete!');
    
    // Summary
    console.log('\n📊 Summary for Allocation Generation:');
    console.log(`  - Phases: ${phases.length} (${phases.length > 0 ? '✅' : '❌'})`);
    console.log(`  - Effort Estimates: ${estimates.length} (${estimates.length > 0 ? '✅' : '❌'})`);
    console.log(`  - Active Resources: ${activeResources.length} (${activeResources.length > 0 ? '✅' : '❌'})`);
    
    if (phases.length === 0) {
      console.log('\n❌ ISSUE: No phases found. Add phases to the release first.');
    }
    if (estimates.length === 0) {
      console.log('\n❌ ISSUE: No effort estimates found. Add effort estimates to the release first.');
    }
    if (activeResources.length === 0) {
      console.log('\n❌ ISSUE: No active resources found. Add active resources first.');
    }
    
    if (phases.length > 0 && estimates.length > 0 && activeResources.length > 0) {
      console.log('\n✅ All required data present. Allocation generation should work.');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkAphroditeData();
