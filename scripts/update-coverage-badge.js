#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read coverage summary
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const readmePath = path.join(__dirname, '..', 'README.md');

if (!fs.existsSync(coveragePath)) {
  console.error('Coverage file not found. Run tests with coverage first.');
  process.exit(1);
}

try {
  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const totalCoverage = coverageData.total.lines.pct;
  
  console.log(`Current coverage: ${totalCoverage}%`);
  
  // Read README
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Update coverage badge
  const badgeRegex = /\[!\[Test Coverage\].*?\]/;
  const newBadge = `[![Test Coverage](https://img.shields.io/badge/coverage-${totalCoverage}%25-brightgreen)]`;
  
  if (badgeRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(badgeRegex, newBadge);
  } else {
    // Add badge after the title if it doesn't exist
    const titleRegex = /^(# Chomptron\n)/;
    readmeContent = readmeContent.replace(titleRegex, `$1\n${newBadge}\n`);
  }
  
  // Update coverage percentage in Testing section
  const coverageRegex = /\*\*Current Coverage\*\*: [0-9.]*%/;
  const newCoverageText = `**Current Coverage**: ${totalCoverage}%`;
  
  if (coverageRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(coverageRegex, newCoverageText);
  }
  
  // Write updated README
  fs.writeFileSync(readmePath, readmeContent);
  console.log('README updated successfully!');
  
} catch (error) {
  console.error('Error updating README:', error);
  process.exit(1);
}
