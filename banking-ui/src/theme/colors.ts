// Blue scale — 10 (lightest) → 90 (darkest)
export const blue = {
  blue10: '#E3F2FD',
  blue20: '#BBDEFB',
  blue30: '#90CAF9',
  blue40: '#64B5F6',
  blue50: '#42A5F5',
  blue60: '#1E88E5', // primary.light
  blue70: '#1565C0', // primary.main
  blue80: '#0D47A1', // primary.dark
  blue90: '#062E6F',
} as const;

// Green scale — 10 (lightest) → 90 (darkest)
export const green = {
  green10: '#E8F5E9',
  green20: '#C8E6C9',
  green30: '#A5D6A7',
  green40: '#81C784',
  green50: '#66BB6A',
  green60: '#43A047', // secondary.light
  green70: '#2E7D32', // secondary.main
  green80: '#1B5E20', // secondary.dark
  green90: '#0A3D0E',
} as const;

// Red scale — for error states
export const red = {
  red10: '#FFEBEE',
  red20: '#FFCDD2',
  red30: '#EF9A9A',
  red40: '#E57373',
  red50: '#EF5350',
  red60: '#E53935',
  red70: '#C62828', // error.main
  red80: '#B71C1C', // error.dark
  red90: '#7F0000',
} as const;

// Yellow scale — for warning states
export const yellow = {
  yellow10: '#FFFDE7',
  yellow20: '#FFF9C4',
  yellow30: '#FFF176',
  yellow40: '#FFEE58',
  yellow50: '#FFCA28', // warning.light
  yellow60: '#FFB300',
  yellow70: '#F57F17', // warning.main
  yellow80: '#E65100', // warning.dark
  yellow90: '#BF360C',
} as const;

// Neutral scale — for backgrounds, borders, and text
export const neutral = {
  neutral10: '#FAFAFA',
  neutral20: '#F5F5F5', // background.default
  neutral30: '#EEEEEE', // divider / borders
  neutral40: '#E0E0E0',
  neutral50: '#9E9E9E', // text.disabled
  neutral60: '#757575', // text.secondary
  neutral70: '#616161',
  neutral80: '#424242',
  neutral90: '#212121', // text.primary
} as const;

// Flat map — all tokens in one object for direct access
export const colors = {
  ...blue,
  ...green,
  ...red,
  ...yellow,
  ...neutral,
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;
