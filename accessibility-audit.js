#!/usr/bin/env node

/**
 * BeatMatchMe Accessibility Audit Script
 * 
 * Automated accessibility checks:
 * - Color contrast verification (WCAG AA)
 * - ARIA attributes validation
 * - Semantic HTML structure
 * - Keyboard navigation support
 * - Image alt text validation
 * 
 * Usage: node accessibility-audit.js
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
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
  webDir: path.join(__dirname, 'web', 'src'),
  reportsDir: path.join(__dirname, 'accessibility-reports'),
};

// Ensure reports directory exists
if (!fs.existsSync(config.reportsDir)) {
  fs.mkdirSync(config.reportsDir, { recursive: true });
}

/**
 * WCAG AA Contrast Requirements
 */
const contrastRequirements = {
  normalText: 4.5,    // 4.5:1 for normal text
  largeText: 3.0,     // 3:1 for large text (18px+ or 14px+ bold)
  uiComponents: 3.0,  // 3:1 for UI components
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio
 */
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return null;
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast passes WCAG AA
 */
function passesWCAG(ratio, type = 'normalText') {
  const required = contrastRequirements[type];
  return ratio >= required;
}

/**
 * 1. Verify theme color contrasts
 */
function checkThemeContrasts() {
  log.section('🎨 Theme Color Contrast Analysis');
  
  const issues = [];
  const results = [];
  
  // Read tokens.ts
  const tokensPath = path.join(config.webDir, 'styles', 'tokens.ts');
  if (!fs.existsSync(tokensPath)) {
    log.error('tokens.ts not found');
    return { issues, results };
  }
  
  const tokensContent = fs.readFileSync(tokensPath, 'utf-8');
  
  // Define theme colors to check
  const themeTests = [
    // BeatByMe theme
    { theme: 'BeatByMe', fg: '#8B5CF6', bg: '#FFFFFF', label: 'Primary on White', type: 'normalText' },
    { theme: 'BeatByMe', fg: '#FFFFFF', bg: '#8B5CF6', label: 'White on Primary', type: 'normalText' },
    { theme: 'BeatByMe', fg: '#EC4899', bg: '#FFFFFF', label: 'Accent on White', type: 'normalText' },
    { theme: 'BeatByMe', fg: '#8B5CF6', bg: '#1F2937', label: 'Primary on Dark', type: 'normalText' },
    
    // Gold theme
    { theme: 'Gold', fg: '#D4AF37', bg: '#000000', label: 'Primary on Black', type: 'normalText' },
    { theme: 'Gold', fg: '#F59E0B', bg: '#000000', label: 'Accent on Black', type: 'normalText' },
    { theme: 'Gold', fg: '#D4AF37', bg: '#FFFFFF', label: 'Primary on White', type: 'normalText' },
    
    // Platinum theme
    { theme: 'Platinum', fg: '#E5E4E2', bg: '#1F2937', label: 'Primary on Dark Gray', type: 'normalText' },
    { theme: 'Platinum', fg: '#94A3B8', bg: '#FFFFFF', label: 'Accent on White', type: 'normalText' },
    { theme: 'Platinum', fg: '#E5E4E2', bg: '#000000', label: 'Primary on Black', type: 'normalText' },
  ];
  
  themeTests.forEach(test => {
    const ratio = getContrastRatio(test.fg, test.bg);
    if (ratio === null) {
      log.warning(`Could not calculate contrast for ${test.theme}: ${test.label}`);
      return;
    }
    
    const passes = passesWCAG(ratio, test.type);
    const status = passes ? colors.green : colors.red;
    const icon = passes ? '✓' : '✗';
    
    console.log(
      `  ${status}${icon}${colors.reset} ${test.theme.padEnd(10)} ${test.label.padEnd(25)} ` +
      `Ratio: ${ratio.toFixed(2)}:1 (${passes ? 'PASS' : 'FAIL'})`
    );
    
    results.push({
      theme: test.theme,
      test: test.label,
      foreground: test.fg,
      background: test.bg,
      ratio: ratio.toFixed(2),
      passes,
      required: contrastRequirements[test.type],
    });
    
    if (!passes) {
      issues.push({
        severity: 'error',
        message: `${test.theme} theme: ${test.label} has insufficient contrast (${ratio.toFixed(2)}:1, needs ${contrastRequirements[test.type]}:1)`,
        fix: `Adjust color values to meet WCAG AA requirements`,
      });
    }
  });
  
  return { issues, results };
}

/**
 * 2. Check for ARIA attributes in components
 */
function checkARIAAttributes() {
  log.section('♿ ARIA Attributes Check');
  
  const issues = [];
  const findings = { missing: [], present: [] };
  
  // Patterns to look for
  const patterns = {
    buttons: /(<button[^>]*>)|(<Button[^>]*>)/g,
    images: /<img[^>]*>/g,
    inputs: /<input[^>]*>/g,
    modals: /<div[^>]*role=["']dialog["'][^>]*>/g,
    icons: /<svg[^>]*>/g,
  };
  
  // Read all TSX files
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(config.webDir, filePath);
        
        // Check buttons without aria-label
        const buttons = content.match(patterns.buttons);
        if (buttons) {
          buttons.forEach(button => {
            if (!button.includes('aria-label') && !button.includes('aria-labelledby')) {
              const hasText = button.includes('>');
              if (!hasText || button.includes('><')) {
                issues.push({
                  file: relativePath,
                  severity: 'warning',
                  message: 'Button without aria-label or visible text',
                  element: button.substring(0, 50) + '...',
                });
              }
            }
          });
        }
        
        // Check images without alt
        const images = content.match(patterns.images);
        if (images) {
          images.forEach(img => {
            if (!img.includes('alt=')) {
              issues.push({
                file: relativePath,
                severity: 'error',
                message: 'Image missing alt attribute',
                element: img.substring(0, 50) + '...',
              });
            }
          });
        }
        
        // Check for SVG icons without aria-hidden
        const svgs = content.match(patterns.icons);
        if (svgs) {
          svgs.forEach(svg => {
            if (!svg.includes('aria-hidden') && !svg.includes('aria-label')) {
              findings.missing.push({
                file: relativePath,
                type: 'SVG icon',
                recommendation: 'Add aria-hidden="true" for decorative icons, or aria-label for meaningful icons',
              });
            }
          });
        }
        
        // Check for proper modal structure
        const modals = content.match(patterns.modals);
        if (modals) {
          modals.forEach(modal => {
            if (modal.includes('aria-modal="true"')) {
              findings.present.push({
                file: relativePath,
                type: 'Accessible modal',
              });
            } else {
              issues.push({
                file: relativePath,
                severity: 'warning',
                message: 'Modal missing aria-modal="true"',
                element: modal.substring(0, 50) + '...',
              });
            }
          });
        }
      }
    });
  }
  
  const componentsDir = path.join(config.webDir, 'components');
  if (fs.existsSync(componentsDir)) {
    scanDirectory(componentsDir);
  }
  
  // Display results
  if (issues.length === 0) {
    log.success('No ARIA attribute issues found');
  } else {
    console.log(`  Found ${issues.length} ARIA-related issues:\n`);
    issues.slice(0, 10).forEach(issue => {
      const icon = issue.severity === 'error' ? '✗' : '⚠';
      const color = issue.severity === 'error' ? colors.red : colors.yellow;
      console.log(`  ${color}${icon}${colors.reset} ${issue.file}`);
      console.log(`    ${issue.message}`);
    });
    if (issues.length > 10) {
      console.log(`\n  ... and ${issues.length - 10} more issues`);
    }
  }
  
  return { issues, findings };
}

/**
 * 3. Check semantic HTML structure
 */
function checkSemanticHTML() {
  log.section('📝 Semantic HTML Check');
  
  const issues = [];
  const findings = {
    headingStructure: [],
    landmarks: [],
  };
  
  // Read key component files
  const filesToCheck = [
    'App.tsx',
    'components/DJPortalOrbital.tsx',
    'components/UserPortalInnovative.tsx',
    'components/Login.tsx',
  ];
  
  filesToCheck.forEach(file => {
    const filePath = path.join(config.webDir, file);
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for heading structure (h1, h2, h3, etc.)
    const headings = content.match(/<h[1-6][^>]*>/g);
    if (headings) {
      findings.headingStructure.push({
        file,
        headings: headings.length,
      });
    } else {
      issues.push({
        file,
        severity: 'warning',
        message: 'No heading elements found. Consider adding headings for structure.',
      });
    }
    
    // Check for landmark regions
    const landmarks = {
      nav: content.includes('<nav') || content.includes('role="navigation"'),
      main: content.includes('<main') || content.includes('role="main"'),
      header: content.includes('<header') || content.includes('role="banner"'),
      footer: content.includes('<footer') || content.includes('role="contentinfo"'),
    };
    
    findings.landmarks.push({ file, landmarks });
    
    Object.entries(landmarks).forEach(([landmark, present]) => {
      if (!present && file.includes('Portal')) {
        issues.push({
          file,
          severity: 'info',
          message: `Missing <${landmark}> landmark region`,
        });
      }
    });
  });
  
  console.log('  Heading structure:');
  findings.headingStructure.forEach(f => {
    console.log(`    ${f.file}: ${f.headings} headings`);
  });
  
  console.log('\n  Landmark regions:');
  findings.landmarks.forEach(f => {
    const present = Object.entries(f.landmarks)
      .filter(([_, p]) => p)
      .map(([l]) => l)
      .join(', ');
    console.log(`    ${f.file}: ${present || 'none'}`);
  });
  
  return { issues, findings };
}

/**
 * 4. Check for keyboard navigation support
 */
function checkKeyboardNavigation() {
  log.section('⌨️ Keyboard Navigation Check');
  
  const issues = [];
  const findings = [];
  
  // Read key component files
  const componentsDir = path.join(config.webDir, 'components');
  const files = fs.readdirSync(componentsDir)
    .filter(f => f.endsWith('.tsx'))
    .slice(0, 20); // Check first 20 components
  
  files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for keyboard event handlers
    const hasKeyboardHandlers = 
      content.includes('onKeyDown') || 
      content.includes('onKeyUp') || 
      content.includes('onKeyPress');
    
    // Check for interactive elements
    const hasInteractive = 
      content.includes('<button') ||
      content.includes('<input') ||
      content.includes('<select') ||
      content.includes('onClick');
    
    if (hasInteractive) {
      findings.push({
        file,
        hasKeyboardHandlers,
        hasInteractive,
      });
      
      if (!hasKeyboardHandlers && content.includes('onClick') && !content.includes('<button')) {
        issues.push({
          file,
          severity: 'warning',
          message: 'Component has onClick handlers but might not be keyboard accessible',
          recommendation: 'Use <button> elements or add keyboard event handlers',
        });
      }
    }
  });
  
  const withKeyboard = findings.filter(f => f.hasKeyboardHandlers).length;
  const withInteractive = findings.filter(f => f.hasInteractive).length;
  
  console.log(`  Components with interactive elements: ${withInteractive}`);
  console.log(`  Components with keyboard handlers: ${withKeyboard}`);
  
  if (issues.length > 0) {
    console.log(`\n  ${colors.yellow}⚠${colors.reset} ${issues.length} potential keyboard navigation issues`);
  } else {
    log.success('No keyboard navigation issues detected');
  }
  
  return { issues, findings };
}

/**
 * 5. Generate accessibility report
 */
function generateReport(results) {
  log.section('📄 Generating Accessibility Report');
  
  const timestamp = new Date().toISOString();
  const reportPath = path.join(
    config.reportsDir,
    `accessibility-${Date.now()}.json`
  );
  
  const report = {
    timestamp,
    summary: {
      totalIssues: 
        results.contrast.issues.length +
        results.aria.issues.length +
        results.semantic.issues.length +
        results.keyboard.issues.length,
      contrastIssues: results.contrast.issues.length,
      ariaIssues: results.aria.issues.length,
      semanticIssues: results.semantic.issues.length,
      keyboardIssues: results.keyboard.issues.length,
    },
    contrast: results.contrast,
    aria: results.aria,
    semantic: results.semantic,
    keyboard: results.keyboard,
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.success(`JSON report saved to: ${reportPath}`);
  
  // Generate markdown report
  const mdReportPath = path.join(
    config.reportsDir,
    `accessibility-${Date.now()}.md`
  );
  
  const mdReport = `# Accessibility Audit Report

**Date:** ${new Date(timestamp).toLocaleString()}

## Summary

- **Total Issues:** ${report.summary.totalIssues}
- **Color Contrast Issues:** ${report.summary.contrastIssues}
- **ARIA Issues:** ${report.summary.ariaIssues}
- **Semantic HTML Issues:** ${report.summary.semanticIssues}
- **Keyboard Navigation Issues:** ${report.summary.keyboardIssues}

## Color Contrast (WCAG AA)

### Results

${results.contrast.results.map(r => 
  `- ${r.passes ? '✅' : '❌'} **${r.theme}** - ${r.test}: ${r.ratio}:1 (required: ${r.required}:1)`
).join('\n')}

${report.summary.contrastIssues > 0 ? `
### Issues Found

${results.contrast.issues.map(i => 
  `- ⚠️ ${i.message}\n  - Fix: ${i.fix}`
).join('\n')}
` : '✅ All color contrasts meet WCAG AA requirements!'}

## ARIA Attributes

${report.summary.ariaIssues === 0 ? 
  '✅ No ARIA attribute issues found!' : 
  `Found ${report.summary.ariaIssues} ARIA-related issues. See JSON report for details.`}

## Semantic HTML

${report.summary.semanticIssues === 0 ? 
  '✅ Semantic HTML structure looks good!' : 
  `Found ${report.summary.semanticIssues} semantic HTML issues. See JSON report for details.`}

## Keyboard Navigation

${report.summary.keyboardIssues === 0 ? 
  '✅ No keyboard navigation issues detected!' : 
  `Found ${report.summary.keyboardIssues} potential keyboard navigation issues. See JSON report for details.`}

## Recommendations

${report.summary.totalIssues === 0 ? `
✅ **Excellent!** No automated accessibility issues found.

**Next Steps:**
1. Manual screen reader testing (NVDA, VoiceOver)
2. Keyboard-only navigation testing
3. Mobile accessibility testing
4. User testing with assistive technologies
` : `
⚠️ **Action Required:** ${report.summary.totalIssues} issues need attention.

**Priority:**
1. Fix color contrast issues (WCAG AA requirement)
2. Add missing ARIA attributes
3. Improve semantic HTML structure
4. Ensure keyboard accessibility

**Manual Testing Still Required:**
- Screen reader testing
- Keyboard-only navigation
- Mobile accessibility
- Real user testing
`}

---
*Generated by BeatMatchMe Accessibility Audit*
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
║  BeatMatchMe Accessibility Audit       ║
╚════════════════════════════════════════╝${colors.reset}
  `);
  
  const results = {};
  
  try {
    // 1. Color contrast
    results.contrast = checkThemeContrasts();
    
    // 2. ARIA attributes
    results.aria = checkARIAAttributes();
    
    // 3. Semantic HTML
    results.semantic = checkSemanticHTML();
    
    // 4. Keyboard navigation
    results.keyboard = checkKeyboardNavigation();
    
    // 5. Generate report
    const report = generateReport(results);
    
    log.section('✨ Audit Complete!');
    
    // Summary
    const totalIssues = report.summary.totalIssues;
    console.log(`Total Issues: ${totalIssues}`);
    console.log(`  Contrast: ${report.summary.contrastIssues}`);
    console.log(`  ARIA: ${report.summary.ariaIssues}`);
    console.log(`  Semantic: ${report.summary.semanticIssues}`);
    console.log(`  Keyboard: ${report.summary.keyboardIssues}`);
    
    if (totalIssues === 0) {
      log.success('All automated checks passed! 🎉');
      console.log('\nNext: Manual testing with screen readers and keyboard navigation');
      process.exit(0);
    } else {
      log.warning(`${totalIssues} issues need attention`);
      console.log('\nReview the generated reports for details.');
      process.exit(1);
    }
    
  } catch (error) {
    log.error('Audit failed');
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, checkThemeContrasts, checkARIAAttributes };
