/**
 * Automated Theme Contrast Checker
 * Tests all 3 BeatMatchMe themes against WCAG AA standards
 */

const fs = require('fs');
const path = require('path');

// WCAG AA Requirements
const WCAG_AA = {
  normalText: 4.5,
  largeText: 3.0,
  uiComponents: 3.0
};

// Helper: Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper: Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Helper: Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Helper: Check if ratio passes WCAG AA
function passesWCAG(ratio, type = 'normal') {
  const required = type === 'large' ? WCAG_AA.largeText : 
                   type === 'ui' ? WCAG_AA.uiComponents : 
                   WCAG_AA.normalText;
  return ratio >= required;
}

// Read tokens.ts to extract theme colors
function extractThemeColors() {
  const tokensPath = path.join(__dirname, 'web', 'src', 'theme', 'tokens.ts');
  
  if (!fs.existsSync(tokensPath)) {
    console.error('❌ tokens.ts not found at:', tokensPath);
    return null;
  }
  
  const content = fs.readFileSync(tokensPath, 'utf8');
  
  // Extract theme objects
  const themes = {
    beatByMe: {},
    gold: {},
    platinum: {}
  };
  
  // Parse BeatByMe theme
  const beatByMeMatch = content.match(/export const beatByMeTheme[^{]*{([^}]+)}/s);
  if (beatByMeMatch) {
    const themeContent = beatByMeMatch[1];
    const colorMatches = themeContent.matchAll(/(\w+):\s*['"]([#\w]+)['"]/g);
    for (const match of colorMatches) {
      themes.beatByMe[match[1]] = match[2];
    }
  }
  
  // Parse Gold theme
  const goldMatch = content.match(/export const goldTheme[^{]*{([^}]+)}/s);
  if (goldMatch) {
    const themeContent = goldMatch[1];
    const colorMatches = themeContent.matchAll(/(\w+):\s*['"]([#\w]+)['"]/g);
    for (const match of colorMatches) {
      themes.gold[match[1]] = match[2];
    }
  }
  
  // Parse Platinum theme
  const platinumMatch = content.match(/export const platinumTheme[^{]*{([^}]+)}/s);
  if (platinumMatch) {
    const themeContent = platinumMatch[1];
    const colorMatches = themeContent.matchAll(/(\w+):\s*['"]([#\w]+)['"]/g);
    for (const match of colorMatches) {
      themes.platinum[match[1]] = match[2];
    }
  }
  
  return themes;
}

// Common background colors to test against
const backgrounds = {
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#1A1A1A',
  mediumGray: '#2A2A2A',
  lightGray: '#F5F5F5'
};

// Test a theme's contrast
function testThemeContrast(themeName, themeColors) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${themeName.toUpperCase()} Theme`);
  console.log('='.repeat(60));
  
  const results = [];
  const issues = [];
  
  // Test primary color against backgrounds
  if (themeColors.primary) {
    console.log('\n📊 Primary Color Tests:');
    Object.entries(backgrounds).forEach(([bgName, bgColor]) => {
      const ratio = getContrastRatio(themeColors.primary, bgColor);
      const normalPass = passesWCAG(ratio, 'normal');
      const largePass = passesWCAG(ratio, 'large');
      const uiPass = passesWCAG(ratio, 'ui');
      
      console.log(`  ${themeColors.primary} on ${bgColor} (${bgName}):`);
      console.log(`    Ratio: ${ratio.toFixed(2)}:1`);
      console.log(`    Normal text (4.5:1): ${normalPass ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    Large text (3:1): ${largePass ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    UI components (3:1): ${uiPass ? '✅ PASS' : '❌ FAIL'}`);
      
      results.push({
        theme: themeName,
        foreground: themeColors.primary,
        background: bgColor,
        backgroundName: bgName,
        ratio: ratio.toFixed(2),
        normalPass,
        largePass,
        uiPass
      });
      
      if (!normalPass) {
        issues.push({
          theme: themeName,
          element: `Primary color on ${bgName}`,
          foreground: themeColors.primary,
          background: bgColor,
          ratio: ratio.toFixed(2),
          required: '4.5:1',
          type: 'Normal text'
        });
      }
    });
  }
  
  // Test secondary color
  if (themeColors.secondary) {
    console.log('\n📊 Secondary Color Tests:');
    Object.entries(backgrounds).forEach(([bgName, bgColor]) => {
      const ratio = getContrastRatio(themeColors.secondary, bgColor);
      const normalPass = passesWCAG(ratio, 'normal');
      const uiPass = passesWCAG(ratio, 'ui');
      
      console.log(`  ${themeColors.secondary} on ${bgColor} (${bgName}):`);
      console.log(`    Ratio: ${ratio.toFixed(2)}:1`);
      console.log(`    Normal text (4.5:1): ${normalPass ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    UI components (3:1): ${uiPass ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!normalPass && bgName === 'darkGray') {
        issues.push({
          theme: themeName,
          element: `Secondary color on ${bgName}`,
          foreground: themeColors.secondary,
          background: bgColor,
          ratio: ratio.toFixed(2),
          required: '4.5:1',
          type: 'Normal text'
        });
      }
    });
  }
  
  // Test accent color
  if (themeColors.accent) {
    console.log('\n📊 Accent Color Tests:');
    Object.entries(backgrounds).forEach(([bgName, bgColor]) => {
      const ratio = getContrastRatio(themeColors.accent, bgColor);
      const uiPass = passesWCAG(ratio, 'ui');
      
      console.log(`  ${themeColors.accent} on ${bgColor} (${bgName}):`);
      console.log(`    Ratio: ${ratio.toFixed(2)}:1`);
      console.log(`    UI components (3:1): ${uiPass ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!uiPass && bgName === 'darkGray') {
        issues.push({
          theme: themeName,
          element: `Accent color on ${bgName}`,
          foreground: themeColors.accent,
          background: bgColor,
          ratio: ratio.toFixed(2),
          required: '3:1',
          type: 'UI component'
        });
      }
    });
  }
  
  // Test text color on background
  if (themeColors.text && themeColors.background) {
    console.log('\n📊 Text on Background Tests:');
    const ratio = getContrastRatio(themeColors.text, themeColors.background);
    const normalPass = passesWCAG(ratio, 'normal');
    
    console.log(`  ${themeColors.text} on ${themeColors.background}:`);
    console.log(`    Ratio: ${ratio.toFixed(2)}:1`);
    console.log(`    Normal text (4.5:1): ${normalPass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!normalPass) {
      issues.push({
        theme: themeName,
        element: 'Body text on background',
        foreground: themeColors.text,
        background: themeColors.background,
        ratio: ratio.toFixed(2),
        required: '4.5:1',
        type: 'Normal text'
      });
    }
  }
  
  return { results, issues };
}

// Main execution
console.log('\n╔════════════════════════════════════════╗');
console.log('║  WCAG AA Contrast Checker              ║');
console.log('║  BeatMatchMe Theme Testing             ║');
console.log('╚════════════════════════════════════════╝\n');

const themes = extractThemeColors();

if (!themes) {
  console.error('❌ Failed to extract theme colors');
  process.exit(1);
}

const allResults = [];
const allIssues = [];

// Test each theme
['beatByMe', 'gold', 'platinum'].forEach(themeName => {
  const { results, issues } = testThemeContrast(themeName, themes[themeName]);
  allResults.push(...results);
  allIssues.push(...issues);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`\nTotal tests run: ${allResults.length}`);
console.log(`Total issues found: ${allIssues.length}`);

if (allIssues.length === 0) {
  console.log('\n✅ ALL THEMES PASS WCAG AA REQUIREMENTS!');
} else {
  console.log('\n⚠️  Issues requiring attention:\n');
  allIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.theme} - ${issue.element}`);
    console.log(`   Foreground: ${issue.foreground}`);
    console.log(`   Background: ${issue.background}`);
    console.log(`   Ratio: ${issue.ratio}:1 (Required: ${issue.required})`);
    console.log(`   Type: ${issue.type}\n`);
  });
}

// Generate report
const reportDir = path.join(__dirname, 'contrast-reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir);
}

const timestamp = Date.now();
const jsonReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests: allResults.length,
    totalIssues: allIssues.length,
    passing: allResults.length - allIssues.length
  },
  results: allResults,
  issues: allIssues
};

const jsonPath = path.join(reportDir, `contrast-${timestamp}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
console.log(`\n📄 JSON report saved: ${jsonPath}`);

// Markdown report
let mdReport = `# WCAG AA Contrast Test Report\n\n`;
mdReport += `**Date:** ${new Date().toLocaleString()}\n\n`;
mdReport += `## Summary\n\n`;
mdReport += `- **Total Tests:** ${allResults.length}\n`;
mdReport += `- **Passing:** ${allResults.length - allIssues.length}\n`;
mdReport += `- **Issues:** ${allIssues.length}\n\n`;

if (allIssues.length > 0) {
  mdReport += `## Issues Found\n\n`;
  allIssues.forEach((issue, index) => {
    mdReport += `### ${index + 1}. ${issue.theme} - ${issue.element}\n\n`;
    mdReport += `- **Foreground:** ${issue.foreground}\n`;
    mdReport += `- **Background:** ${issue.background}\n`;
    mdReport += `- **Contrast Ratio:** ${issue.ratio}:1\n`;
    mdReport += `- **Required:** ${issue.required}\n`;
    mdReport += `- **Type:** ${issue.type}\n\n`;
  });
} else {
  mdReport += `## ✅ All Tests Passed!\n\n`;
  mdReport += `All theme colors meet WCAG AA requirements.\n`;
}

const mdPath = path.join(reportDir, `contrast-${timestamp}.md`);
fs.writeFileSync(mdPath, mdReport);
console.log(`📄 Markdown report saved: ${mdPath}`);

console.log('\n✨ Contrast testing complete!\n');

process.exit(allIssues.length > 0 ? 1 : 0);
