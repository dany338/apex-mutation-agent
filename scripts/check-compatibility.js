#!/usr/bin/env node

const { execSync } = require('child_process');
const semver = require('semver');

function checkVersion(tool, requiredVersionRange) {
  try {
    const versionOutput = execSync(`${tool} --version`, { encoding: 'utf-8' }).trim();
    const version = versionOutput.replace(/^v/, ''); // remove leading 'v' if present

    if (semver.satisfies(version, requiredVersionRange)) {
      console.log(`✅ ${tool} version ${version} is compatible with ${requiredVersionRange}`);
    } else {
      console.warn(`⚠️ ${tool} version ${version} is NOT compatible with ${requiredVersionRange}`);
    }
  } catch (error) {
    console.error(`❌ Failed to check ${tool} version: ${error.message}`);
  }
}

console.log('🔍 Checking environment compatibility...');

checkVersion('node', '>=18.0.0 <22.0.0');
checkVersion('npm', '>=7.0.0');
