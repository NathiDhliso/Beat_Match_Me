# WCAG AA Contrast Test Report

**Generated:** 11/6/2025, 12:59:52 PM

## Summary

- **Total Tests:** 9
- **Passing:** 6
- **Issues:** 3
- **Pass Rate:** 66.7%

## WCAG AA Standards

- Normal Text: 4.5:1 minimum
- Large Text (18px+ or 14px+ bold): 3:1 minimum
- UI Components: 3:1 minimum

## Issues Found

### 1. Primary color on darkBackground

- **Theme:** BeatByMe Original
- **Foreground:** #8B5CF6
- **Background:** #111827
- **Contrast Ratio:** 4.19:1
- **Required:** 4.5:1
- **Status:** LARGE TEXT ONLY

### 2. Primary color on cardBackground

- **Theme:** BeatByMe Original
- **Foreground:** #8B5CF6
- **Background:** #1F2937
- **Contrast Ratio:** 3.47:1
- **Required:** 4.5:1
- **Status:** LARGE TEXT ONLY

### 3. Secondary color on cardBackground

- **Theme:** BeatByMe Original
- **Foreground:** #EC4899
- **Background:** #1F2937
- **Contrast Ratio:** 4.16:1
- **Required:** 4.5:1
- **Status:** LARGE TEXT ONLY

## Recommendations

- Use large text (18px+ or 14px+ bold) for colors that only pass at 3:1
- Consider using darker variants (primaryDark, secondaryDark) for better contrast
- Test actual implementation with browser DevTools contrast checker
- Ensure focus indicators have 3:1 contrast minimum
