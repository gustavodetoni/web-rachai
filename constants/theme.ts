/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#72e3ad'; 
const tintColorDark = '#4ade80';

export const Colors = {
  light: {
    text: '#171717', 
    background: '#fcfcfc',
    tint: tintColorLight,
    icon: '#202020', 
    tabIconDefault: '#202020',
    tabIconSelected: tintColorLight,
    success: '#10b981', 
    error: '#ca3214', 
    warning: '#f59e0b', 
    surface: '#fcfcfc',
    border: '#dfdfdf',
    card: '#fcfcfc', 
    muted: '#202020', 
  },
  dark: {
    text: '#e2e8f0', 
    background: '#000000',
    tint: tintColorDark,
    icon: '#a2a2a2', 
    tabIconDefault: '#a2a2a2',
    tabIconSelected: tintColorDark,
    success: '#4ade80',
    error: '#ef4444', 
    warning: '#fbbf24', 
    surface: '#171717', 
    border: '#292929',
    card: '#171717',
    muted: '#a2a2a2', 
  },
};

export const Fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extraBold: 'Outfit_800ExtraBold',
};
