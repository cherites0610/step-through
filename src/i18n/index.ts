export const locales = ['zh-TW', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-TW';

const ui = {
  'zh-TW': {
    siteName: '步步看懂',
    tagline: '親手操作、逐步前進與倒退的互動視覺化',
    description: '把看課本看不懂的演算法與資料結構，變成可以親手操作、逐步前進與倒退的互動視覺化。',
    prev: '上一步',
    next: '下一步',
    play: '播放',
    pause: '暫停',
    reset: '重設',
    step: '步驟',
  },
  en: {
    siteName: 'Step Through',
    tagline: 'Interactive visualizations you can step forward and back',
    description:
      'Algorithms and data structures you can operate by hand, one step at a time — forward and backward.',
    prev: 'Previous',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',
    step: 'Step',
  },
} as const;

export const t = (lang: Locale) => ui[lang];
