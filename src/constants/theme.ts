export const Colors = {
  // Primary warm palette
  cream: '#FDF6EC',
  wheat: '#E8D5B7',
  golden: '#D4A853',
  amber: '#C68B3E',
  brown: '#8B6914',
  darkBrown: '#5C4033',
  espresso: '#3E2723',

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#FAF8F5',
  lightGray: '#F0ECE6',
  gray: '#B8B0A4',
  darkGray: '#6B6560',
  charcoal: '#3A3632',
  black: '#1A1816',

  // Accents
  success: '#6B9E6B',
  warning: '#D4A853',
  error: '#C75C5C',
  info: '#7B9EB8',

  // Tab bar
  tabActive: '#C68B3E',
  tabInactive: '#B8B0A4',
};

export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    color: Colors.espresso,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    color: Colors.espresso,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: 0.35,
    color: Colors.espresso,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.espresso,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.charcoal,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    color: Colors.charcoal,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.darkGray,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.darkGray,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.gray,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.gray,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
