#!/usr/bin/env node

/**
 * BeatMatchMe Performance Benchmark Script
 * 
 * Runs automated performance checks:
 * - Bundle size analysis
 * - Lighthouse audits
 * - Build time measurement
 * - Package audit
 * 
 * Usage: node performance-benchmark.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// Configuration
const config = {
  targetBundleSize: 1024 * 1024, // 1MB
  targetGzipSize: 300 * 1024, // 300KB
  lighthouseThresholds: {
    performance: 90,
    accessibility: 95,
    bestPractices: 95,
    seo: 90,
  },
  webDir: path.join(__dirname, 'web'),
  buildDir: path.join(__dirname, 'web', 'dist'), // Vite uses 'dist' instead of 'build'
  reportsDir: path.join(__dirname, 'performance-reports'),
};

// Ensure reports directory exists
if (!fs.existsSync(config.reportsDir)) {
  fs.mkdirSync(config.reportsDir, { recursive: true });
}

/**
 * Run command and return output
 */
function run(command, options = {}) {
  try {
    return execSync(command, {
      cwd: options.cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
    });
  } catch (error) {
    if (!options.ignoreErrors) {
      log.error(`Command failed: ${command}`);
      throw error;
    }
    return null;
  }
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * Format bytes to human-readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 1. Build the application
 */
async function buildApplication() {
  log.section('📦 Building Application');
  
  const startTime = Date.now();
  
  try {
    // Clean previous build
    log.info('Cleaning previous build...');
    if (fs.existsSync(config.buildDir)) {
      fs.rmSync(config.buildDir, { recursive: true, force: true });
    }
    
    // Run build
    log.info('Running production build...');
    run('npm run build', { cwd: config.webDir });
    
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    log.success(`Build completed in ${buildTime}s`);
    
    return buildTime;
  } catch (error) {
    log.error('Build failed');
    throw error;
  }
}

/**
 * 2. Analyze bundle size
 */
async function analyzeBundleSize() {
  log.section('📊 Bundle Size Analysis');
  
  const results = {
    totalSize: 0,
    files: [],
  };
  
  try {
    // Find all JS and CSS files in build
    // Vite uses dist/assets, not build/static
    const assetsDir = path.join(config.buildDir, 'assets');
    
    if (!fs.existsSync(assetsDir)) {
      log.warning('Build directory not found. Run build first.');
      return results;
    }
    
    // Get all JS and CSS files from assets directory
    const files = fs.readdirSync(assetsDir);
    
    files.forEach(f => {
      const filePath = path.join(assetsDir, f);
      const size = getFileSize(filePath);
      
      if (f.endsWith('.js')) {
        results.totalSize += size;
        results.files.push({ name: f, size, type: 'js' });
      } else if (f.endsWith('.css')) {
        results.totalSize += size;
        results.files.push({ name: f, size, type: 'css' });
      }
    });
    
    // Sort by size (largest first)
    results.files.sort((a, b) => b.size - a.size);
    
    // Display results
    console.log('Top 10 largest files:');
    results.files.slice(0, 10).forEach((file, i) => {
      const sizeStr = formatBytes(file.size).padEnd(12);
      const status = file.size > 500 * 1024 ? colors.yellow : colors.green;
      console.log(`  ${i + 1}. ${status}${sizeStr}${colors.reset} ${file.name}`);
    });
    
    console.log(`\nTotal bundle size: ${formatBytes(results.totalSize)}`);
    
    // Check against threshold
    if (results.totalSize > config.targetBundleSize) {
      log.warning(`Bundle size exceeds target (${formatBytes(config.targetBundleSize)})`);
    } else {
      log.success(`Bundle size within target (${formatBytes(config.targetBundleSize)})`);
    }
    
    // Find main chunk
    const mainChunk = results.files.find(f => f.name.includes('main'));
    if (mainChunk) {
      console.log(`\nMain chunk: ${formatBytes(mainChunk.size)}`);
      if (mainChunk.size > config.targetGzipSize * 3) { // ~900KB uncompressed
        log.warning('Main chunk is large. Consider code splitting.');
      }
    }
    
    return results;
  } catch (error) {
    log.error('Bundle analysis failed');
    console.error(error);
    return results;
  }
}

/**
 * 3. Check for common performance issues
 */
async function checkPerformanceIssues() {
  log.section('🔍 Checking Performance Issues');
  
  const issues = [];
  
  // Check for duplicate dependencies
  log.info('Checking for duplicate dependencies...');
  try {
    const dedupe = run('npm dedupe --dry-run', { 
      cwd: config.webDir, 
      silent: true,
      ignoreErrors: true 
    });
    if (dedupe && dedupe.includes('added') || dedupe.includes('removed')) {
      issues.push('Duplicate dependencies found. Run `npm dedupe`.');
    } else {
      log.success('No duplicate dependencies');
    }
  } catch (error) {
    // Ignore
  }
  
  // Check package.json for performance packages
  log.info('Verifying performance packages...');
  const packageJson = require(path.join(config.webDir, 'package.json'));
  
  const requiredPackages = {
    'react-window': '2.2.2',
    'react-lazy-load-image-component': '1.6.0',
  };
  
  Object.entries(requiredPackages).forEach(([pkg, version]) => {
    if (!packageJson.dependencies[pkg]) {
      issues.push(`Missing performance package: ${pkg}`);
    } else {
      log.success(`${pkg} installed`);
    }
  });
  
  // Check for source maps in production
  log.info('Checking build configuration...');
  const buildFiles = fs.readdirSync(config.buildDir, { recursive: true });
  const hasSourceMaps = buildFiles.some(f => f.endsWith('.map'));
  if (hasSourceMaps) {
    log.success('Source maps generated (good for debugging)');
  }
  
  // Check for service worker
  const hasSW = fs.existsSync(path.join(config.buildDir, 'service-worker.js'));
  if (!hasSW) {
    log.warning('No service worker found. Consider adding for offline support.');
    issues.push('Consider adding service worker for offline support');
  }
  
  return issues;
}

/**
 * 4. Security audit
 */
async function securityAudit() {
  log.section('🔒 Security Audit');
  
  try {
    log.info('Running npm audit...');
    const audit = run('npm audit --json', { 
      cwd: config.webDir, 
      silent: true,
      ignoreErrors: true 
    });
    
    if (audit) {
      const auditData = JSON.parse(audit);
      const { vulnerabilities } = auditData.metadata;
      
      if (vulnerabilities) {
        const total = Object.values(vulnerabilities).reduce((a, b) => a + b, 0);
        
        if (total === 0) {
          log.success('No vulnerabilities found');
        } else {
          console.log(`  Critical: ${vulnerabilities.critical || 0}`);
          console.log(`  High: ${vulnerabilities.high || 0}`);
          console.log(`  Moderate: ${vulnerabilities.moderate || 0}`);
          console.log(`  Low: ${vulnerabilities.low || 0}`);
          
          if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
            log.error('Critical/High vulnerabilities found. Run `npm audit fix`');
          } else {
            log.warning('Some vulnerabilities found. Review with `npm audit`');
          }
        }
      }
    }
  } catch (error) {
    log.warning('Security audit failed (might be unavailable)');
  }
}

/**
 * 5. Generate performance report
 */
async function generateReport(results) {
  log.section('📄 Generating Report');
  
  const timestamp = new Date().toISOString();
  const reportPath = path.join(
    config.reportsDir, 
    `performance-${Date.now()}.json`
  );
  
  const report = {
    timestamp,
    buildTime: results.buildTime,
    bundleSize: {
      total: results.bundleSize.totalSize,
      formatted: formatBytes(results.bundleSize.totalSize),
      files: results.bundleSize.files,
      withinTarget: results.bundleSize.totalSize <= config.targetBundleSize,
    },
    issues: results.issues,
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.success(`Report saved to: ${reportPath}`);
  
  // Also create markdown report
  const mdReportPath = path.join(
    config.reportsDir,
    `performance-${Date.now()}.md`
  );
  
  const mdReport = `# Performance Benchmark Report

**Date:** ${new Date(timestamp).toLocaleString()}

## Build Performance

- **Build Time:** ${results.buildTime}s
- **Total Bundle Size:** ${formatBytes(results.bundleSize.totalSize)}
- **Within Target:** ${results.bundleSize.totalSize <= config.targetBundleSize ? '✅ Yes' : '❌ No'}
- **Target Size:** ${formatBytes(config.targetBundleSize)}

## Bundle Analysis

### Top 10 Largest Files

| File | Size |
|------|------|
${results.bundleSize.files.slice(0, 10).map(f => 
  `| ${f.name} | ${formatBytes(f.size)} |`
).join('\n')}

### Total Files

- **JavaScript:** ${results.bundleSize.files.filter(f => f.type === 'js').length} files
- **CSS:** ${results.bundleSize.files.filter(f => f.type === 'css').length} files

## Issues Found

${results.issues.length > 0 ? results.issues.map(i => `- ${i}`).join('\n') : '_No issues found_'}

## Recommendations

${results.bundleSize.totalSize > config.targetBundleSize ? 
  '- ⚠️ Bundle size exceeds target. Consider additional code splitting.\n' : ''}
${results.issues.length > 0 ? 
  '- ⚠️ Address the issues listed above.\n' : ''}
${results.bundleSize.files.some(f => f.size > 500 * 1024) ?
  '- ⚠️ Some chunks are >500KB. Review for optimization opportunities.\n' : ''}

## Next Steps

1. Run Lighthouse audit: \`npm run lighthouse\`
2. Test on real devices
3. Monitor production metrics
4. Review bundle analyzer: \`npm run analyze\`

---
*Generated by BeatMatchMe Performance Benchmark*
`;
  
  fs.writeFileSync(mdReportPath, mdReport);
  log.success(`Markdown report saved to: ${mdReportPath}`);
  
  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════╗
║  BeatMatchMe Performance Benchmark     ║
╚════════════════════════════════════════╝${colors.reset}
  `);
  
  const results = {};
  
  try {
    // 1. Build
    results.buildTime = await buildApplication();
    
    // 2. Analyze bundle
    results.bundleSize = await analyzeBundleSize();
    
    // 3. Check for issues
    results.issues = await checkPerformanceIssues();
    
    // 4. Security audit
    await securityAudit();
    
    // 5. Generate report
    await generateReport(results);
    
    log.section('✨ Benchmark Complete!');
    
    // Summary
    console.log(`Build Time: ${results.buildTime}s`);
    console.log(`Bundle Size: ${formatBytes(results.bundleSize.totalSize)}`);
    console.log(`Issues: ${results.issues.length}`);
    
    if (results.issues.length === 0 && 
        results.bundleSize.totalSize <= config.targetBundleSize) {
      log.success('All checks passed! 🎉');
      process.exit(0);
    } else {
      log.warning('Some issues need attention.');
      process.exit(1);
    }
    
  } catch (error) {
    log.error('Benchmark failed');
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, analyzeBundleSize, checkPerformanceIssues };
