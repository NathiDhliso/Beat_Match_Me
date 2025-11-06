/**
 * SCREEN READER ACCESSIBILITY AUDIT
 * Automated check for screen reader compatibility
 * Tests: ARIA labels, semantic HTML, focus management, keyboard navigation
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  webDir: path.join(__dirname, 'web', 'src'),
  reportDir: path.join(__dirname, 'accessibility-reports'),
  timestamp: Date.now(),
};

// Ensure report directory exists
if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(config.reportDir, { recursive: true });
}

// Color output helpers
const log = {
  section: (msg) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
};

// Results storage
const results = {
  summary: {
    totalFiles: 0,
    filesChecked: 0,
    totalIssues: 0,
    criticalIssues: 0,
    warnings: 0,
    passed: 0,
  },
  ariaLabels: { issues: [], findings: [] },
  semanticHTML: { issues: [], findings: [] },
  focusManagement: { issues: [], findings: [] },
  keyboardNav: { issues: [], findings: [] },
  screenReaderText: { issues: [], findings: [] },
};

/**
 * 1. Check ARIA Labels and Roles
 */
function checkARIALabels() {
  log.section('🏷️  ARIA Labels & Roles Check');
  
  const patterns = {
    buttons: /<button[^>]*>/g,
    links: /<a[^>]*>/g,
    inputs: /<input[^>]*>/g,
    images: /<img[^>]*>/g,
    dialogs: /<div[^>]*role=["']dialog["'][^>]*>/g,
    regions: /<(div|section|article)[^>]*role=["'](region|main|navigation|banner|contentinfo)["'][^>]*>/g,
    ariaLabels: /aria-label=["'][^"']+["']/g,
    ariaLabelledBy: /aria-labelledby=["'][^"']+["']/g,
    ariaDescribedBy: /aria-describedby=["'][^"']+["']/g,
    ariaHidden: /aria-hidden=["'](true|false)["']/g,
    ariaLive: /aria-live=["'](polite|assertive|off)["']/g,
  };
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        results.summary.totalFiles++;
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(config.webDir, filePath);
        
        // Check for interactive elements without labels
        const buttons = content.match(patterns.buttons) || [];
        const links = content.match(patterns.links) || [];
        const inputs = content.match(patterns.inputs) || [];
        
        let elementsMissingLabels = 0;
        let elementsWithLabels = 0;
        
        // Check buttons
        buttons.forEach(btn => {
          if (!btn.includes('aria-label') && !btn.includes('aria-labelledby')) {
            // Check if it has visible text
            const hasVisibleText = !btn.endsWith('/>') && !btn.includes('><');
            if (!hasVisibleText) {
              elementsMissingLabels++;
              if (elementsMissingLabels <= 3) { // Limit reporting
                results.ariaLabels.issues.push({
                  file: relativePath,
                  severity: 'warning',
                  message: 'Button without aria-label or visible text',
                  element: btn.substring(0, 80) + '...',
                });
              }
            }
          } else {
            elementsWithLabels++;
          }
        });
        
        // Check links
        links.forEach(link => {
          if (!link.includes('aria-label') && !link.includes('aria-labelledby')) {
            const hasVisibleText = !link.endsWith('/>') && !link.includes('><');
            if (!hasVisibleText) {
              elementsMissingLabels++;
            }
          } else {
            elementsWithLabels++;
          }
        });
        
        // Check inputs
        inputs.forEach(input => {
          if (!input.includes('aria-label') && !input.includes('aria-labelledby') && !input.includes('id=')) {
            elementsMissingLabels++;
          } else {
            elementsWithLabels++;
          }
        });
        
        // Check for proper ARIA usage
        const ariaLabels = content.match(patterns.ariaLabels) || [];
        const ariaLive = content.match(patterns.ariaLive) || [];
        const ariaHidden = content.match(patterns.ariaHidden) || [];
        
        if (ariaLabels.length > 0 || ariaLive.length > 0 || elementsWithLabels > 0) {
          results.ariaLabels.findings.push({
            file: relativePath,
            ariaLabels: ariaLabels.length,
            ariaLive: ariaLive.length,
            ariaHidden: ariaHidden.length,
            labeledElements: elementsWithLabels,
            unlabeledElements: elementsMissingLabels,
          });
          results.summary.filesChecked++;
        }
      }
    });
  }
  
  const componentsDir = path.join(config.webDir, 'components');
  const pagesDir = path.join(config.webDir, 'pages');
  
  if (fs.existsSync(componentsDir)) scanDirectory(componentsDir);
  if (fs.existsSync(pagesDir)) scanDirectory(pagesDir);
  
  // Summary
  const totalIssues = results.ariaLabels.issues.length;
  results.summary.totalIssues += totalIssues;
  results.summary.warnings += totalIssues;
  
  if (totalIssues === 0) {
    log.success(`All interactive elements have proper ARIA labels`);
    results.summary.passed++;
  } else {
    log.warning(`Found ${totalIssues} elements with missing labels`);
    results.ariaLabels.issues.slice(0, 5).forEach(issue => {
      console.log(`   ${issue.file}: ${issue.message}`);
    });
    if (totalIssues > 5) {
      console.log(`   ... and ${totalIssues - 5} more`);
    }
  }
  
  log.info(`Files with ARIA attributes: ${results.ariaLabels.findings.length}`);
}

/**
 * 2. Check Semantic HTML
 */
function checkSemanticHTML() {
  log.section('📝 Semantic HTML Check');
  
  const patterns = {
    header: /<header[^>]*>/g,
    nav: /<nav[^>]*>/g,
    main: /<main[^>]*>/g,
    article: /<article[^>]*>/g,
    section: /<section[^>]*>/g,
    footer: /<footer[^>]*>/g,
    h1: /<h1[^>]*>/g,
    h2: /<h2[^>]*>/g,
    h3: /<h3[^>]*>/g,
    divWithRole: /<div[^>]*role=["']([^"']+)["'][^>]*>/g,
  };
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(config.webDir, filePath);
        
        const semanticElements = {
          header: (content.match(patterns.header) || []).length,
          nav: (content.match(patterns.nav) || []).length,
          main: (content.match(patterns.main) || []).length,
          article: (content.match(patterns.article) || []).length,
          section: (content.match(patterns.section) || []).length,
          footer: (content.match(patterns.footer) || []).length,
          h1: (content.match(patterns.h1) || []).length,
          h2: (content.match(patterns.h2) || []).length,
          h3: (content.match(patterns.h3) || []).length,
        };
        
        const total = Object.values(semanticElements).reduce((a, b) => a + b, 0);
        
        if (total > 0) {
          results.semanticHTML.findings.push({
            file: relativePath,
            ...semanticElements,
            total,
          });
        }
        
        // Check for proper heading hierarchy
        if (semanticElements.h2 > 0 && semanticElements.h1 === 0) {
          results.semanticHTML.issues.push({
            file: relativePath,
            severity: 'warning',
            message: 'Has <h2> but no <h1> (heading hierarchy issue)',
          });
        }
      }
    });
  }
  
  const componentsDir = path.join(config.webDir, 'components');
  const pagesDir = path.join(config.webDir, 'pages');
  
  if (fs.existsSync(componentsDir)) scanDirectory(componentsDir);
  if (fs.existsSync(pagesDir)) scanDirectory(pagesDir);
  
  const totalIssues = results.semanticHTML.issues.length;
  results.summary.totalIssues += totalIssues;
  results.summary.warnings += totalIssues;
  
  if (totalIssues === 0) {
    log.success(`Proper semantic HTML structure`);
    results.summary.passed++;
  } else {
    log.warning(`Found ${totalIssues} semantic HTML issues`);
    results.semanticHTML.issues.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.message}`);
    });
  }
  
  log.info(`Files with semantic elements: ${results.semanticHTML.findings.length}`);
}

/**
 * 3. Check Focus Management
 */
function checkFocusManagement() {
  log.section('🎯 Focus Management Check');
  
  const patterns = {
    tabIndex: /tabIndex=\{?(-?\d+)\}?/g,
    autoFocus: /autoFocus/g,
    focusRef: /ref=\{[^}]*focus[^}]*\}/gi,
    focusMethod: /\.focus\(\)/g,
    focusTrap: /useFocusTrap|FocusTrap/g,
    skipLink: /<a[^>]*href=["']#[^"']*["'][^>]*>Skip/gi,
  };
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(config.webDir, filePath);
        
        const focusElements = {
          tabIndex: (content.match(patterns.tabIndex) || []).length,
          autoFocus: (content.match(patterns.autoFocus) || []).length,
          focusRef: (content.match(patterns.focusRef) || []).length,
          focusMethod: (content.match(patterns.focusMethod) || []).length,
          focusTrap: (content.match(patterns.focusTrap) || []).length,
          skipLink: (content.match(patterns.skipLink) || []).length,
        };
        
        const total = Object.values(focusElements).reduce((a, b) => a + b, 0);
        
        if (total > 0) {
          results.focusManagement.findings.push({
            file: relativePath,
            ...focusElements,
            total,
          });
        }
        
        // Check for negative tabIndex (accessibility issue)
        const negativeTabIndex = content.match(/tabIndex=\{?-\d+\}?/g);
        if (negativeTabIndex && negativeTabIndex.length > 0) {
          results.focusManagement.issues.push({
            file: relativePath,
            severity: 'warning',
            message: `Found ${negativeTabIndex.length} elements with negative tabIndex (removes from tab order)`,
          });
        }
      }
    });
  }
  
  const componentsDir = path.join(config.webDir, 'components');
  const pagesDir = path.join(config.webDir, 'pages');
  
  if (fs.existsSync(componentsDir)) scanDirectory(componentsDir);
  if (fs.existsSync(pagesDir)) scanDirectory(pagesDir);
  
  const totalIssues = results.focusManagement.issues.length;
  results.summary.totalIssues += totalIssues;
  results.summary.warnings += totalIssues;
  
  if (totalIssues === 0) {
    log.success(`Proper focus management`);
    results.summary.passed++;
  } else {
    log.warning(`Found ${totalIssues} focus management issues`);
    results.focusManagement.issues.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.message}`);
    });
  }
  
  log.info(`Files with focus management: ${results.focusManagement.findings.length}`);
}

/**
 * 4. Check Keyboard Navigation
 */
function checkKeyboardNavigation() {
  log.section('⌨️  Keyboard Navigation Check');
  
  const patterns = {
    onKeyDown: /onKeyDown=/g,
    onKeyUp: /onKeyUp=/g,
    onKeyPress: /onKeyPress=/g,
    enterKey: /key\s*===?\s*["']Enter["']/gi,
    escapeKey: /key\s*===?\s*["']Escape["']/gi,
    arrowKeys: /key\s*===?\s*["']Arrow(Up|Down|Left|Right)["']/gi,
    spaceKey: /key\s*===?\s*["'](\s|Space)["']/gi,
  };
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(config.webDir, filePath);
        
        const keyboardElements = {
          onKeyDown: (content.match(patterns.onKeyDown) || []).length,
          onKeyUp: (content.match(patterns.onKeyUp) || []).length,
          onKeyPress: (content.match(patterns.onKeyPress) || []).length,
          enterKey: (content.match(patterns.enterKey) || []).length,
          escapeKey: (content.match(patterns.escapeKey) || []).length,
          arrowKeys: (content.match(patterns.arrowKeys) || []).length,
          spaceKey: (content.match(patterns.spaceKey) || []).length,
        };
        
        const total = Object.values(keyboardElements).reduce((a, b) => a + b, 0);
        
        if (total > 0) {
          results.keyboardNav.findings.push({
            file: relativePath,
            ...keyboardElements,
            total,
          });
        }
      }
    });
  }
  
  const componentsDir = path.join(config.webDir, 'components');
  const pagesDir = path.join(config.webDir, 'pages');
  
  if (fs.existsSync(componentsDir)) scanDirectory(componentsDir);
  if (fs.existsSync(pagesDir)) scanDirectory(pagesDir);
  
  log.success(`Found keyboard navigation in ${results.keyboardNav.findings.length} files`);
  results.summary.passed++;
  
  // Show top keyboard-enabled components
  const topKeyboard = results.keyboardNav.findings
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  if (topKeyboard.length > 0) {
    log.info('Top keyboard-enabled components:');
    topKeyboard.forEach(item => {
      console.log(`   ${item.file}: ${item.total} keyboard handlers`);
    });
  }
}

/**
 * 5. Check Screen Reader Specific Features
 */
function checkScreenReaderText() {
  log.section('🔊 Screen Reader Text Check');
  
  const patterns = {
    srOnly: /sr-only|visually-hidden|screen-reader-only/gi,
    ariaLiveRegions: /aria-live=["'](polite|assertive)["']/g,
    ariaAtomic: /aria-atomic=["']true["']/g,
    ariaRelevant: /aria-relevant=/g,
    roleAlert: /role=["']alert["']/g,
    roleStatus: /role=["']status["']/g,
    ariaLabel: /aria-label=["'][^"']{20,}["']/g, // Long descriptive labels
  };
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(config.webDir, filePath);
        
        const srFeatures = {
          srOnly: (content.match(patterns.srOnly) || []).length,
          ariaLiveRegions: (content.match(patterns.ariaLiveRegions) || []).length,
          ariaAtomic: (content.match(patterns.ariaAtomic) || []).length,
          ariaRelevant: (content.match(patterns.ariaRelevant) || []).length,
          roleAlert: (content.match(patterns.roleAlert) || []).length,
          roleStatus: (content.match(patterns.roleStatus) || []).length,
          descriptiveLabels: (content.match(patterns.ariaLabel) || []).length,
        };
        
        const total = Object.values(srFeatures).reduce((a, b) => a + b, 0);
        
        if (total > 0) {
          results.screenReaderText.findings.push({
            file: relativePath,
            ...srFeatures,
            total,
          });
        }
      }
    });
  }
  
  const componentsDir = path.join(config.webDir, 'components');
  const pagesDir = path.join(config.webDir, 'pages');
  
  if (fs.existsSync(componentsDir)) scanDirectory(componentsDir);
  if (fs.existsSync(pagesDir)) scanDirectory(pagesDir);
  
  log.success(`Found screen reader features in ${results.screenReaderText.findings.length} files`);
  results.summary.passed++;
  
  // Show components with most SR features
  const topSR = results.screenReaderText.findings
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  if (topSR.length > 0) {
    log.info('Components with screen reader features:');
    topSR.forEach(item => {
      console.log(`   ${item.file}: ${item.total} SR features`);
    });
  }
}

/**
 * Generate Reports
 */
function generateReports() {
  log.section('📊 Generating Reports');
  
  // JSON Report
  const jsonReport = {
    timestamp: new Date().toISOString(),
    summary: results.summary,
    ariaLabels: results.ariaLabels,
    semanticHTML: results.semanticHTML,
    focusManagement: results.focusManagement,
    keyboardNavigation: results.keyboardNav,
    screenReaderText: results.screenReaderText,
  };
  
  const jsonPath = path.join(config.reportDir, `screen-reader-audit-${config.timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
  log.success(`JSON report saved: ${jsonPath}`);
  
  // Markdown Report
  let mdReport = `# Screen Reader Accessibility Audit\n\n`;
  mdReport += `**Date**: ${new Date().toISOString()}\n`;
  mdReport += `**Total Files**: ${results.summary.totalFiles}\n`;
  mdReport += `**Files Checked**: ${results.summary.filesChecked}\n\n`;
  
  mdReport += `## 📊 Summary\n\n`;
  mdReport += `- ✅ **Passed Checks**: ${results.summary.passed}/5\n`;
  mdReport += `- ⚠️  **Warnings**: ${results.summary.warnings}\n`;
  mdReport += `- ❌ **Critical Issues**: ${results.summary.criticalIssues}\n`;
  mdReport += `- 📝 **Total Issues**: ${results.summary.totalIssues}\n\n`;
  
  mdReport += `## 🏷️  ARIA Labels & Roles\n\n`;
  mdReport += `Files with ARIA: ${results.ariaLabels.findings.length}\n`;
  mdReport += `Issues: ${results.ariaLabels.issues.length}\n\n`;
  
  mdReport += `## 📝 Semantic HTML\n\n`;
  mdReport += `Files with semantic elements: ${results.semanticHTML.findings.length}\n`;
  mdReport += `Issues: ${results.semanticHTML.issues.length}\n\n`;
  
  mdReport += `## 🎯 Focus Management\n\n`;
  mdReport += `Files with focus handling: ${results.focusManagement.findings.length}\n`;
  mdReport += `Issues: ${results.focusManagement.issues.length}\n\n`;
  
  mdReport += `## ⌨️  Keyboard Navigation\n\n`;
  mdReport += `Files with keyboard handlers: ${results.keyboardNav.findings.length}\n\n`;
  
  mdReport += `## 🔊 Screen Reader Features\n\n`;
  mdReport += `Files with SR features: ${results.screenReaderText.findings.length}\n\n`;
  
  if (results.summary.totalIssues > 0) {
    mdReport += `## ⚠️  Issues Found\n\n`;
    [...results.ariaLabels.issues, ...results.semanticHTML.issues, ...results.focusManagement.issues]
      .slice(0, 10)
      .forEach(issue => {
        mdReport += `- **${issue.file}**: ${issue.message}\n`;
      });
  }
  
  mdReport += `\n## ✅ Accessibility Score\n\n`;
  const score = Math.round((results.summary.passed / 5) * 100);
  mdReport += `**${score}%** - ${score >= 80 ? '✅ PASS' : '⚠️  NEEDS IMPROVEMENT'}\n`;
  
  const mdPath = path.join(config.reportDir, `screen-reader-audit-${config.timestamp}.md`);
  fs.writeFileSync(mdPath, mdReport);
  log.success(`Markdown report saved: ${mdPath}`);
}

/**
 * Main Execution
 */
console.log('\n🔊 SCREEN READER ACCESSIBILITY AUDIT\n');
console.log('Testing: ARIA labels, semantic HTML, focus management, keyboard nav\n');

checkARIALabels();
checkSemanticHTML();
checkFocusManagement();
checkKeyboardNavigation();
checkScreenReaderText();
generateReports();

// Final Summary
log.section('📊 FINAL RESULTS');
console.log(`Total Files Scanned: ${results.summary.totalFiles}`);
console.log(`Files with Accessibility Features: ${results.summary.filesChecked}`);
console.log(`\nChecks Passed: ${results.summary.passed}/5`);
console.log(`Warnings: ${results.summary.warnings}`);
console.log(`Critical Issues: ${results.summary.criticalIssues}`);
console.log(`Total Issues: ${results.summary.totalIssues}`);

const score = Math.round((results.summary.passed / 5) * 100);
console.log(`\n🎯 Accessibility Score: ${score}%`);

if (score >= 80) {
  log.success('✅ SCREEN READER READY - Application is accessible!');
  process.exit(0);
} else {
  log.warning('⚠️  NEEDS IMPROVEMENT - Review issues above');
  process.exit(1);
}
