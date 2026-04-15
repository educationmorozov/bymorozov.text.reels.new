
import { TextFormat, ThemeColors, FontPair } from './types';

export const THEMES: ThemeColors[] = [
  { id: 'white', bg: '#FFFFFF', box: '#000000', boxText: '#FFFFFF', bodyText: '#000000' },
  { id: 'black', bg: '#000000', box: '#FFFFFF', boxText: '#000000', bodyText: '#FFFFFF' },
  { id: 'cream', bg: '#FFECD1', box: '#3E000C', boxText: '#FFECD1', bodyText: '#3E000C' },
  { id: 'manual', bg: '#374039', box: '#f0f2f1', boxText: '#374039', bodyText: '#f0f2f1' },
];

export const FONT_PAIRS = {
  [FontPair.PROSTO_PT]: {
    label: 'PROSTO + MANROPE',
    titleClass: 'font-prosto',
    bodyClass: 'font-manrope',
    titleFamily: "'Prosto One', cursive",
    bodyFamily: "'Manrope', sans-serif"
  },
  [FontPair.SOYUZX_NOTO]: {
    label: 'SOYUZX + INTER LIGHT',
    titleClass: 'font-soyuzx-cyr',
    bodyClass: 'font-inter-light',
    titleFamily: "'Montserrat', sans-serif",
    bodyFamily: "'Inter', sans-serif"
  },
  [FontPair.UNBOUNDED_IBM]: {
    label: 'UNBOUNDED + MANROPE LIGHT',
    titleClass: 'font-unbounded',
    bodyClass: 'font-manrope-light',
    titleFamily: "'Unbounded', sans-serif",
    bodyFamily: "'Manrope', sans-serif"
  },
  [FontPair.DAYS_OPEN]: {
    label: 'DAYS ONE + INTER LIGHT',
    titleClass: 'font-days',
    bodyClass: 'font-inter-light',
    titleFamily: "'Days One', sans-serif",
    bodyFamily: "'Inter', sans-serif"
  },
  [FontPair.BUYAN_MANROPE]: {
    label: 'OSWALD + COMFORTAA',
    titleClass: 'font-oswald',
    bodyClass: 'font-comfortaa',
    titleFamily: "'Oswald', sans-serif",
    bodyFamily: "'Comfortaa', cursive"
  }
};

export const QUOTE_FONTS = [
  { id: 'manrope-light', label: 'MANROPE LIGHT', fontClass: 'font-manrope-light', family: "'Manrope', sans-serif", weight: 300 },
  { id: 'inter-light', label: 'INTER LIGHT', fontClass: 'font-inter-light', family: "'Inter', sans-serif", weight: 300 },
  { id: 'oswald', label: 'OSWALD', fontClass: 'font-oswald', family: "'Oswald', sans-serif", weight: 400 },
  { id: 'comfortaa', label: 'COMFORTAA', fontClass: 'font-comfortaa', family: "'Comfortaa', cursive", weight: 400 },
  { id: 'prosto', label: 'PROSTO', fontClass: 'font-prosto', family: "'Prosto One', cursive", weight: 400 },
];

export const FORMAT_DETAILS = {
  [TextFormat.QUOTE]: {
    label: 'Цитата',
    description: 'Мотивация',
    systemInstruction: `Сгенерируй мощную цитату.
      Первая строка — заголовок/тема.
      Вторая строка — сама цитата.`
  },
  [TextFormat.LIST]: {
    label: 'Текст с пунктами',
    description: 'Заголовок + пары (Пункт и Описание)',
    systemInstruction: `Сгенерируй список из 5 пунктов. 
      ФОРМАТ СТРОГО:
      Строка 1: Главный заголовок
      Строка 2: Название пункта 1
      Строка 3: Описание пункта 1
      Строка 4: Название пункта 2
      Строка 5: Описание пункта 2
      ... и так далее до 5 пунктов.
      
      Названия пунктов делай капсом. Описания — обычным текстом.`
  }
};

export const LOADING_MESSAGES = [
  "Магия начинается...",
  "Оживляем ваши идеи...",
  "Генерация визуальных эффектов...",
  "Текст превращается в золото...",
  "Почти готово...",
];
