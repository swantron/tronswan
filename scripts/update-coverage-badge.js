#!/usr/bin/env node

/**
 * Coverage Badge Update Script
 * 
 * This script automatically updates the test coverage badge in the README.md file
 * based on Jest coverage reports. It reads the coverage data from 
 * coverage/coverage-summary.json and updates both the badge at the top of the README
 * and the coverage percentage in the Testing section.
 * 
 * Usage:
 *   yarn update-badge
 * 
 * Prerequisites:
 *   - Run 'yarn test:coverage' first to generate coverage reports
 *   - coverage/coverage-summary.json must exist
 * 
 * @author Tron Swan
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Read coverage summary
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const readmePath = path.join(__dirname, '..', 'README.md');

if (!fs.existsSync(coveragePath)) {
  console.error('Coverage file not found. Run tests with coverage first:');
  console.error('  yarn test:coverage');
  process.exit(1);
}

try {
  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const totalCoverage = coverageData.total.lines.pct;
  
  console.log(`Current coverage: ${totalCoverage}%`);
  
  // Read README
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Update coverage badge - look for the existing badge pattern
  const badgeRegex = /\[!\[Test Coverage\].*?\]\(.*?\)/;
  const newBadge = `[![Test Coverage](https://img.shields.io/badge/coverage-${totalCoverage}%25-brightgreen)](https://github.com/swantron/tronswan/actions)`;
  
  if (badgeRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(badgeRegex, newBadge);
    console.log('Updated existing coverage badge');
  } else {
    // Add badge after the title if it doesn't exist
    const titleRegex = /^(# Chomptron\n)/;
    if (titleRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(titleRegex, `$1\n${newBadge}\n`);
      console.log('Added new coverage badge after title');
    } else {
      console.log('Could not find title to add badge after');
    }
  }
  
  // Update coverage percentage in Testing section
  const coverageRegex = /\*\*Current Coverage\*\*: [0-9.]*%/;
  const newCoverageText = `**Current Coverage**: ${totalCoverage}%`;
  
  if (coverageRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(coverageRegex, newCoverageText);
    console.log('Updated coverage percentage in Testing section');
  } else {
    // Try to find the Testing section and add coverage info
    const testingSectionRegex = /(## Testing\n)/;
    if (testingSectionRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(testingSectionRegex, `$1\n${newCoverageText}\n`);
      console.log('Added coverage percentage to Testing section');
    } else {
      console.log('Could not find Testing section to update');
    }
  }
  
  // Write updated README
  fs.writeFileSync(readmePath, readmeContent);
  console.log('README updated successfully!');
  console.log(`Coverage badge now shows: ${totalCoverage}%`);
  
} catch (error) {
  console.error('Error updating README:', error);
  process.exit(1);
}
