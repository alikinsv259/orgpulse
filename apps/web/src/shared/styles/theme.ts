const SPACE_UNIT = 4

export const theme = {
  color: {
    background: '#0f1115',
    surface: '#161a21',
    surfaceHover: '#1d222c',
    border: '#272d39',
    text: '#e6e9ef',
    textMuted: '#93a0b5',
    accent: '#4c8dff',
    accentSoft: 'rgba(76, 141, 255, 0.14)',
    good: '#2fb37a',
    warn: '#e0a63c',
    bad: '#e0605f',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    pill: '999px',
  },
  fontSize: {
    xs: '12px',
    sm: '13px',
    md: '15px',
    lg: '20px',
    xl: '26px',
  },
  transition: {
    fast: '120ms ease',
    medium: '220ms ease',
  },
  space: (multiplier: number): string => `${multiplier * SPACE_UNIT}px`,
}

export type AppTheme = typeof theme
