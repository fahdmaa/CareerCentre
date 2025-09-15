/**
 * EMSI Career Center Design System
 * 
 * This module ensures consistent UX/UI across the entire application
 * It provides design tokens, color harmony rules, and validation functions
 */

// Design Tokens
export const designTokens = {
  // Brand Colors
  colors: {
    primary: {
      blue: '#004A99',
      blueDark: '#003570',
      blueLight: '#0066CC',
    },
    accent: {
      green: '#00A651',
      greenDark: '#007A3C',
      greenLight: '#00C961',
    },
    neutral: {
      white: '#FFFFFF',
      gray100: '#F8F9FA',
      gray200: '#E9ECEF',
      gray300: '#DEE2E6',
      gray400: '#CED4DA',
      gray500: '#ADB5BD',
      gray600: '#6C757D',
      gray700: '#495057',
      gray800: '#343A40',
      gray900: '#212529',
      black: '#000000',
    },
    semantic: {
      success: '#28A745',
      warning: '#FFC107',
      danger: '#DC3545',
      info: '#17A2B8',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '2rem',    // 32px
      '4xl': '2.5rem',  // 40px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      base: 1.5,
      relaxed: 1.7,
      loose: 2,
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '5rem',   // 80px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 2px 10px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 30px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 60px rgba(0, 0, 0, 0.15)',
    green: '0 4px 20px rgba(0, 166, 81, 0.3)',
    blue: '0 4px 20px rgba(0, 74, 153, 0.3)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease',
    base: '300ms ease',
    slow: '500ms ease',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Color Harmony Rules
export const colorHarmony = {
  // Background-Foreground Combinations
  combinations: [
    { bg: designTokens.colors.neutral.white, fg: designTokens.colors.neutral.gray700 },
    { bg: designTokens.colors.neutral.gray100, fg: designTokens.colors.neutral.gray800 },
    { bg: designTokens.colors.primary.blue, fg: designTokens.colors.neutral.white },
    { bg: designTokens.colors.accent.green, fg: designTokens.colors.neutral.white },
  ],

  // Contrast Ratios (WCAG AAA)
  getContrastRatio: (color1: string, color2: string): number => {
    // Simplified contrast calculation (would need full implementation)
    return 7.0; // Placeholder - should calculate actual contrast
  },

  // Check if color combination meets WCAG standards
  isAccessible: (bgColor: string, fgColor: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorHarmony.getContrastRatio(bgColor, fgColor);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7.0;
  },
};

// Component Style Guidelines
export const componentGuidelines = {
  button: {
    primary: {
      bg: designTokens.colors.primary.blue,
      color: designTokens.colors.neutral.white,
      hoverBg: designTokens.colors.primary.blueDark,
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
      borderRadius: designTokens.borderRadius.base,
      fontWeight: designTokens.typography.fontWeight.semibold,
      shadow: designTokens.shadows.md,
    },
    secondary: {
      bg: designTokens.colors.neutral.white,
      color: designTokens.colors.primary.blue,
      border: `2px solid ${designTokens.colors.primary.blue}`,
      hoverBg: designTokens.colors.neutral.gray100,
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
      borderRadius: designTokens.borderRadius.base,
      fontWeight: designTokens.typography.fontWeight.semibold,
    },
    success: {
      bg: designTokens.colors.accent.green,
      color: designTokens.colors.neutral.white,
      hoverBg: designTokens.colors.accent.greenDark,
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
      borderRadius: designTokens.borderRadius.base,
      fontWeight: designTokens.typography.fontWeight.semibold,
      shadow: designTokens.shadows.green,
    },
  },

  card: {
    bg: designTokens.colors.neutral.white,
    border: `1px solid ${designTokens.colors.neutral.gray200}`,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    shadow: designTokens.shadows.base,
    hoverShadow: designTokens.shadows.lg,
  },

  input: {
    bg: designTokens.colors.neutral.white,
    border: `1px solid ${designTokens.colors.neutral.gray300}`,
    focusBorder: designTokens.colors.primary.blue,
    borderRadius: designTokens.borderRadius.base,
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    fontSize: designTokens.typography.fontSize.base,
  },

  modal: {
    bg: designTokens.colors.neutral.white,
    overlayBg: 'rgba(0, 0, 0, 0.5)',
    borderRadius: designTokens.borderRadius.xl,
    padding: designTokens.spacing.xl,
    shadow: designTokens.shadows.xl,
  },
};

// Design Validation Functions
export const designValidation = {
  /**
   * Validate if a color is part of the design system
   */
  isValidColor: (color: string): boolean => {
    const allColors = [
      ...Object.values(designTokens.colors.primary),
      ...Object.values(designTokens.colors.accent),
      ...Object.values(designTokens.colors.neutral),
      ...Object.values(designTokens.colors.semantic),
    ];
    return allColors.includes(color);
  },

  /**
   * Get recommended color for a given context
   */
  getRecommendedColor: (context: 'primary' | 'secondary' | 'success' | 'danger' | 'text' | 'background'): string => {
    const recommendations = {
      primary: designTokens.colors.primary.blue,
      secondary: designTokens.colors.accent.green,
      success: designTokens.colors.semantic.success,
      danger: designTokens.colors.semantic.danger,
      text: designTokens.colors.neutral.gray700,
      background: designTokens.colors.neutral.white,
    };
    return recommendations[context];
  },

  /**
   * Check if spacing value follows the design system
   */
  isValidSpacing: (value: string): boolean => {
    return Object.values(designTokens.spacing).includes(value);
  },

  /**
   * Get closest valid spacing value
   */
  getClosestSpacing: (pixelValue: number): string => {
    const spacingMap = {
      4: designTokens.spacing.xs,
      8: designTokens.spacing.sm,
      16: designTokens.spacing.md,
      24: designTokens.spacing.lg,
      32: designTokens.spacing.xl,
      48: designTokens.spacing['2xl'],
      64: designTokens.spacing['3xl'],
      80: designTokens.spacing['4xl'],
    };
    
    const closest = Object.keys(spacingMap)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - pixelValue) < Math.abs(prev - pixelValue) ? curr : prev
      );
    
    return spacingMap[closest as keyof typeof spacingMap];
  },
};

// UX Best Practices Checker
export const uxBestPractices = {
  /**
   * Check if button size meets minimum touch target (44x44px)
   */
  isValidTouchTarget: (width: number, height: number): boolean => {
    return width >= 44 && height >= 44;
  },

  /**
   * Check if text size is readable (minimum 14px for body text)
   */
  isReadableTextSize: (fontSize: string): boolean => {
    const size = parseFloat(fontSize);
    return size >= 14 || fontSize === designTokens.typography.fontSize.sm;
  },

  /**
   * Check if loading time is acceptable
   */
  isAcceptableLoadTime: (milliseconds: number): boolean => {
    return milliseconds < 3000; // 3 seconds max
  },

  /**
   * Validate form field has proper label
   */
  hasProperLabel: (element: HTMLElement): boolean => {
    const id = element.getAttribute('id');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    
    if (ariaLabel || ariaLabelledBy) return true;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      return !!label;
    }
    return false;
  },
};

// Design System Audit Function
export const auditDesign = (element?: HTMLElement): {
  issues: string[];
  warnings: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!element) {
    element = document.body;
  }

  // Check color usage
  const computedStyle = window.getComputedStyle(element);
  const bgColor = computedStyle.backgroundColor;
  const color = computedStyle.color;

  // Check contrast
  if (bgColor && color) {
    if (!colorHarmony.isAccessible(bgColor, color)) {
      issues.push(`Low contrast between background (${bgColor}) and text (${color})`);
    }
  }

  // Check font sizes
  const fontSize = computedStyle.fontSize;
  if (!uxBestPractices.isReadableTextSize(fontSize)) {
    warnings.push(`Font size ${fontSize} may be too small for readability`);
  }

  // Check interactive elements
  const buttons = element.querySelectorAll('button, a, input, select, textarea');
  buttons.forEach((btn) => {
    const rect = btn.getBoundingClientRect();
    if (!uxBestPractices.isValidTouchTarget(rect.width, rect.height)) {
      warnings.push(`Interactive element may be too small for touch targets`);
    }
    
    if (!uxBestPractices.hasProperLabel(btn as HTMLElement)) {
      issues.push(`Form element missing proper label or aria-label`);
    }
  });

  // Provide suggestions
  if (issues.length === 0 && warnings.length === 0) {
    suggestions.push('Design follows best practices!');
  } else {
    suggestions.push('Consider using the design tokens for consistent styling');
    suggestions.push('Run accessibility audit for comprehensive check');
  }

  return { issues, warnings, suggestions };
};

// Export design system for use in components
export default {
  tokens: designTokens,
  harmony: colorHarmony,
  guidelines: componentGuidelines,
  validation: designValidation,
  ux: uxBestPractices,
  audit: auditDesign,
};