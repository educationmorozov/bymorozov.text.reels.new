
export enum TextFormat {
  QUOTE = 'QUOTE',
  LIST = 'LIST'
}

export type BackgroundType = 'COLOR' | 'IMAGE';

export enum FontPair {
  PROSTO_PT = 'PROSTO_PT',
  BUYAN_MANROPE = 'BUYAN_MANROPE',
  SOYUZX_NOTO = 'SOYUZX_NOTO',
  UNBOUNDED_IBM = 'UNBOUNDED_IBM',
  DAYS_OPEN = 'DAYS_OPEN',
  CUSTOM = 'CUSTOM'
}

export interface ThemeColors {
  id: string;
  bg: string;
  box: string;
  boxText: string;
  bodyText: string;
}

export interface ProjectState {
  format: TextFormat;
  idea: string;
  generatedText: string;
  backgroundType: BackgroundType;
  themeId: string;
  fontPair: FontPair;
  nickname: string;
  videoUrl: string | null;
  showTitleBox: boolean;
  showSafeZones: boolean;
  customThemeColors: ThemeColors;
  // Manual styling properties
  customTitleFont: string;
  customBodyFont: string;
  titleFontSize: number;
  bodyFontSize: number;
  titleLineHeight: number;
  bodyLineHeight: number;
  nicknameVerticalPos: number;
  // Alignment & Position
  titleAlignment: 'left' | 'center' | 'justify';
  quoteAlignment: 'left' | 'center' | 'justify';
  listAlignment: 'left' | 'center' | 'justify';
  quoteVerticalPos: number;
  quoteFont: string;
  // List specific vertical position
  listVerticalPos: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}
