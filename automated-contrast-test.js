/**
 * Automated WCAG AA Contrast Checker for BeatMatchMe Themes
 * Tests all 3 themes with actual color values
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

// Define all 3 themes with actual values from tokens.ts
const themes = {
  BeatMatchMe: {
    name: 'BeatMatchMe Original',
    colors: {
      primary: '#8B5CF6',
      primaryDark: '#7C3AED',
      primaryLight: '#A78BFA',
      secondary: '#EC4899',
      secondaryDark: '#DB2777',
      secondaryLight: '#F472B6',
      accent: '#A78BFA',
      accentMuted: '#6B7280',
    }
  },
  gold: {
    name: 'Gold Luxury',
    colors: {
      primary: '#D4AF37',
      primaryDark: '#B8860B',
      primaryLight: '#FFD700',
      secondary: '#F59E0B',
      secondaryDark: '#D97706',
      secondaryLight: '#FBBF24',
      accent: '#FBBF24',
      accentMuted: '#78350F',
    }
  },
  platinum: {
    name: 'Platinum Elite',
    colors: {
      primary: '#E5E4E2',
      primaryDark: '#C0C0C0',
      primaryLight: '#F5F5F5',
      secondary: '#94A3B8',
      secondaryDark: '#64748B',
      secondaryLight: '#CBD5E1',
      accent: '#CBD5E1',
      accentMuted: '#475569',
    }
  }
};

// Common backgrounds used in the app
const backgrounds = {
  darkBackground: '#111827',    // Gray-900 (main background)
  cardBackground: '#1F2937',    // Gray-800 (cards)
  black: '#000000',
  white: '#FFFFFF',
  inputBackground: '#374151',   // Gray-700 (inputs)
};

// Test a theme
function testTheme(themeKey, theme) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${theme.name.toUpperCase()}`);
  console.log('='.repeat(70));
  
  const results = [];
  const issues = [];
  
  // Test primary color on dark backgrounds
  console.log('\n📊 Primary Color on Dark Backgrounds:');
  ['darkBackground', 'cardBackground', 'black'].forEach(bgKey => {
    const bgColor = backgrounds[bgKey];
    const ratio = getContrastRatio(theme.colors.primary, bgColor);
    const normalPass = passesWCAG(ratio, 'normal');
    const largePass = passesWCAG(ratio, 'large');
    
    const status = normalPass ? '✅ PASS' : largePass ? '⚠️  LARGE TEXT ONLY' : '❌ FAIL';
    
    console.log(`  ${theme.colors.primary} on ${bgColor} (${bgKey}):`);
    console.log(`    Ratio: ${ratio.toFixed(2)}:1 - ${status}`);
    
    results.push({
      theme: theme.name,
      element: `Primary on ${bgKey}`,
      foreground: theme.colors.primary,
      background: bgColor,
      ratio: ratio.toFixed(2),
      normalPass,
      largePass
    });
    
    if (!normalPass) {
      issues.push({
        theme: theme.name,
        element: `Primary color on ${bgKey}`,
        foreground: theme.colors.primary,
        background: bgColor,
        ratio: ratio.toFixed(2),
        required: '4.5:1',
        actual: normalPass ? 'PASS' : (largePass ? 'LARGE TEXT ONLY' : 'FAIL')
      });
    }
  });
  
  // Test secondary color
  console.log('\n📊 Secondary Color on Dark Backgrounds:');
  ['darkBackground', 'cardBackground'].forEach(bgKey => {
    const bgColor = backgrounds[bgKey];
    const ratio = getContrastRatio(theme.colors.secondary, bgColor);
    const normalPass = passesWCAG(ratio, 'normal');
    const largePass = passesWCAG(ratio, 'large');
    
    const status = normalPass ? '✅ PASS' : largePass ? '⚠️  LARGE TEXT ONLY' : '❌ FAIL';
    
    console.log(`  ${theme.colors.secondary} on ${bgColor} (${bgKey}):`);
    console.log(`    Ratio: ${ratio.toFixed(2)}:1 - ${status}`);
    
    if (!normalPass) {
      issues.push({
        theme: theme.name,
        element: `Secondary color on ${bgKey}`,
        foreground: theme.colors.secondary,
        background: bgColor,
        ratio: ratio.toFixed(2),
        required: '4.5:1',
        actual: largePass ? 'LARGE TEXT ONLY' : 'FAIL'
      });
    }
  });
  
  // Test accent color
  console.log('\n📊 Accent Color on Dark Backgrounds:');
  ['darkBackground', 'cardBackground'].forEach(bgKey => {
    const bgColor = backgrounds[bgKey];
    const ratio = getContrastRatio(theme.colors.accent, bgColor);
    const uiPass = passesWCAG(ratio, 'ui');
    
    console.log(`  ${theme.colors.accent} on ${bgColor} (${bgKey}):`);
    console.log(`    Ratio: ${ratio.toFixed(2)}:1 - ${uiPass ? '✅ PASS (UI)' : '❌ FAIL (UI)'}`);
  });
  
  // Test primary on white (for light mode scenarios)
  console.log('\n📊 Primary Color on White (Light Mode):');
  const whiteRatio = getContrastRatio(theme.colors.primary, backgrounds.white);
  const whitePass = passesWCAG(whiteRatio, 'normal');
  console.log(`  ${theme.colors.primary} on #FFFFFF:`);
  console.log(`    Ratio: ${whiteRatio.toFixed(2)}:1 - ${whitePass ? '✅ PASS' : '❌ FAIL'}`);
  
  return { results, issues };
}

// Main execution
console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║          WCAG AA Contrast Checker - BeatMatchMe Themes           ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

const allResults = [];
const allIssues = [];

// Test all themes
Object.entries(themes).forEach(([key, theme]) => {
  const { results, issues } = testTheme(key, theme);
  allResults.push(...results);
  allIssues.push(...issues);
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`\nTotal contrast tests: ${allResults.length}`);
console.log(`Issues found: ${allIssues.length}`);

if (allIssues.length === 0) {
  console.log('\n✅ ALL THEMES PASS WCAG AA REQUIREMENTS!');
  console.log('\nAll color combinations meet the minimum contrast ratios for');
  console.log('normal text (4.5:1), large text (3:1), and UI components (3:1).');
} else {
  console.log('\n⚠️  Issues requiring attention:\n');
  allIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.theme} - ${issue.element}`);
    console.log(`   Foreground: ${issue.foreground}`);
    console.log(`   Background: ${issue.background}`);
    console.log(`   Ratio: ${issue.ratio}:1 (Required: ${issue.required})`);
    console.log(`   Status: ${issue.actual}\n`);
  });
  
  console.log('\n💡 Recommendations:');
  console.log('- Colors marked "LARGE TEXT ONLY" can be used for headings (18px+)');
  console.log('- Colors marked "FAIL" should be adjusted or used with different backgrounds');
  console.log('- Consider using primaryDark or primaryLight variants for better contrast');
}

// Generate detailed report
const reportDir = path.join(__dirname, 'contrast-reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir);
}

const timestamp = Date.now();
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests: allResults.length,
    totalIssues: allIssues.length,
    passing: allResults.length - allIssues.length,
    passRate: ((allResults.length - allIssues.length) / allResults.length * 100).toFixed(1) + '%'
  },
  wcagStandards: WCAG_AA,
  backgrounds,
  themes: Object.entries(themes).map(([key, theme]) => ({
    id: key,
    name: theme.name,
    colors: theme.colors
  })),
  results: allResults,
  issues: allIssues,
  recommendations: allIssues.length > 0 ? [
    'Use large text (18px+ or 14px+ bold) for colors that only pass at 3:1',
    'Consider using darker variants (primaryDark, secondaryDark) for better contrast',
    'Test actual implementation with browser DevTools contrast checker',
    'Ensure focus indicators have 3:1 contrast minimum'
  ] : [
    'All colors meet WCAG AA requirements',
    'Continue to test with real implementation',
    'Verify focus indicators and interactive states',
    'Test with actual user content and images'
  ]
};

// Save JSON report
const jsonPath = path.join(reportDir, `contrast-detailed-${timestamp}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Detailed JSON report: ${jsonPath}`);

// Save Markdown report
let mdReport = `# WCAG AA Contrast Test Report\n\n`;
mdReport += `**Generated:** ${new Date().toLocaleString()}\n\n`;
mdReport += `## Summary\n\n`;
mdReport += `- **Total Tests:** ${report.summary.totalTests}\n`;
mdReport += `- **Passing:** ${report.summary.passing}\n`;
mdReport += `- **Issues:** ${report.summary.totalIssues}\n`;
mdReport += `- **Pass Rate:** ${report.summary.passRate}\n\n`;

mdReport += `## WCAG AA Standards\n\n`;
mdReport += `- Normal Text: ${WCAG_AA.normalText}:1 minimum\n`;
mdReport += `- Large Text (18px+ or 14px+ bold): ${WCAG_AA.largeText}:1 minimum\n`;
mdReport += `- UI Components: ${WCAG_AA.uiComponents}:1 minimum\n\n`;

if (allIssues.length > 0) {
  mdReport += `## Issues Found\n\n`;
  allIssues.forEach((issue, index) => {
    mdReport += `### ${index + 1}. ${issue.element}\n\n`;
    mdReport += `- **Theme:** ${issue.theme}\n`;
    mdReport += `- **Foreground:** ${issue.foreground}\n`;
    mdReport += `- **Background:** ${issue.background}\n`;
    mdReport += `- **Contrast Ratio:** ${issue.ratio}:1\n`;
    mdReport += `- **Required:** ${issue.required}\n`;
    mdReport += `- **Status:** ${issue.actual}\n\n`;
  });
} else {
  mdReport += `## ✅ All Tests Passed!\n\n`;
  mdReport += `All theme colors meet WCAG AA requirements.\n\n`;
}

mdReport += `## Recommendations\n\n`;
report.recommendations.forEach(rec => {
  mdReport += `- ${rec}\n`;
});

const mdPath = path.join(reportDir, `contrast-detailed-${timestamp}.md`);
fs.writeFileSync(mdPath, mdReport);
console.log(`📄 Markdown report: ${mdPath}`);

console.log('\n✨ Contrast testing complete!\n');
console.log('📋 Next steps:');
console.log('1. Review the generated reports');
console.log('2. Test actual implementation with browser DevTools');
console.log('3. Verify focus indicators and hover states');
console.log('4. Test with real content and user scenarios\n');

process.exit(allIssues.length > 0 ? 1 : 0);
