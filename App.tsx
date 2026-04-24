
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TextFormat, ProjectState, ThemeColors, FontPair } from './types';
import { THEMES, FONT_PAIRS, QUOTE_FONTS } from './constants';

declare global {
  interface Window {
    htmlToImage: any;
  }
}

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(#.*?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('[') && part.includes('](#')) {
          const match = part.match(/\[(.*?)\]\((#.*?)\)/);
          if (match) return <span key={i} style={{ color: match[2] }}>{match[1]}</span>;
        }
        return part;
      })}
    </>
  );
};

const SafeZoneOverlay = () => (
  <div className="absolute inset-0 z-[60] pointer-events-none select-none">
    <div className="absolute top-0 left-0 right-0 h-[7.81%] bg-[#ff0066]/20 border-b border-[#ff0066]/40 flex items-center justify-center">
      <span className="text-[10px] font-bold text-[#ff0066] uppercase tracking-[0.1em] italic">Не размещайте текст</span>
    </div>
    <div className="absolute right-0 top-[7.81%] bottom-[20%] w-[18%] bg-[#ff0066]/20 border-l border-[#ff0066]/40 flex items-center justify-center">
       <span className="text-[8px] font-bold text-[#ff0066] rotate-90 uppercase tracking-widest italic opacity-60">Интерфейс</span>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-[#ff0066]/20 border-t border-[#ff0066]/40 flex items-center justify-center">
      <span className="text-[10px] font-bold text-[#ff0066] uppercase tracking-[0.1em] italic">Не размещайте текст</span>
    </div>
  </div>
);

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => {
  const pickerValue = /^#[0-9A-F]{6}$/i.test(value) ? value : '#000000';
  
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">{label}</label>
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
          <input 
            type="color" 
            value={pickerValue} 
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer"
          />
        </div>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono outline-none focus:border-blue-500 transition-all text-white h-9"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

const VideoPreview = ({ 
  state,
  theme,
  generatedImage,
  isExport = false
}: { 
  state: ProjectState;
  theme: ThemeColors;
  generatedImage?: string | null;
  isExport?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(isExport ? 1 : 1);

  useEffect(() => {
    if (isExport) {
      setScale(1);
      return;
    }

    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setScale(width / 1080);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [isExport]);

  const { 
    generatedText, format, showTitleBox, fontPair, 
    customTitleFont, customBodyFont, titleFontSize, bodyFontSize, 
    titleLineHeight, bodyLineHeight, nickname, nicknameVerticalPos,
    quoteAlignment, titleAlignment, listAlignment, quoteVerticalPos, quoteFont, listVerticalPos, showSafeZones,
    titleBodySpacing
  } = state;

  const lines = generatedText ? generatedText.split('\n').map(l => l.trim()) : [];
  const title = lines[0] || '';
  const contentLines = lines.slice(1);

  const activeFontConfig = FONT_PAIRS[fontPair as keyof typeof FONT_PAIRS] || FONT_PAIRS[FontPair.PROSTO_PT];
  const activeQuoteFont = QUOTE_FONTS.find(f => f.id === quoteFont);

  const fonts = useMemo(() => {
    if (format === TextFormat.QUOTE) {
      // Allow using FONT_PAIRS for QUOTE as well if a pair is selected
      const isPairActive = Object.values(FontPair).includes(fontPair) && fontPair !== FontPair.CUSTOM;
      return {
        fontFamily: isPairActive ? activeFontConfig.bodyFamily : (quoteFont === 'custom' ? customBodyFont : activeQuoteFont?.family),
        fontWeight: isPairActive ? 400 : (quoteFont === 'custom' ? 400 : activeQuoteFont?.weight)
      };
    } else {
      return {
        titleFamily: fontPair === FontPair.CUSTOM ? customTitleFont : activeFontConfig.titleFamily,
        bodyFamily: fontPair === FontPair.CUSTOM ? customBodyFont : activeFontConfig.bodyFamily
      };
    }
  }, [format, quoteFont, customBodyFont, activeQuoteFont, fontPair, customTitleFont, activeFontConfig]);

  const renderContent = () => {
    if (!generatedText) return null;

    const enhancementStyle = state.bodyTextShadow ? { 
      fontWeight: 600,
      filter: 'contrast(1.2)'
    } : {};

    if (format === TextFormat.LIST) {
      const listAlignCls = listAlignment === 'center' ? 'text-center' : listAlignment === 'justify' ? 'text-justify' : 'text-left';
      const titleAlignCls = titleAlignment === 'center' ? 'text-center' : titleAlignment === 'justify' ? 'text-justify' : 'text-left';

      return (
        <div 
          className={`absolute z-20 w-full ${listAlignCls}`} 
          style={{ 
            top: '7.81%', 
            bottom: '20%',
            paddingTop: `${listVerticalPos * scale}px` 
          }}
        >
          <div 
            className={`w-full ${titleAlignCls} ${showTitleBox ? 'shadow-2xl' : ''}`}
            style={{ 
              backgroundColor: showTitleBox ? theme.box : 'transparent',
              paddingTop: `${24 * scale}px`,
              paddingBottom: `${24 * scale}px`,
              paddingLeft: '10%',
              paddingRight: '18%' // Safety zone
            }}
          >
            <h2 
              className={`tracking-tight`}
              style={{ 
                color: showTitleBox ? theme.boxText : theme.bodyText, 
                fontSize: `${titleFontSize * scale}px`, 
                lineHeight: titleLineHeight,
                fontFamily: (fonts as any).titleFamily,
                fontWeight: 700,
                wordBreak: 'break-word'
              }}
            >
              <FormattedText text={title} />
            </h2>
          </div>
          
          <div style={{ 
            marginTop: `${titleBodySpacing * scale}px`, 
            paddingLeft: '10%', 
            paddingRight: '18%', // Right safety zone is 18%
          }}>
            {contentLines.map((line, idx) => (
              <div 
                key={idx} 
                style={{ 
                  color: theme.bodyText, 
                  fontSize: `${bodyFontSize * scale}px`, 
                  lineHeight: bodyLineHeight, 
                  fontFamily: (fonts as any).bodyFamily,
                  fontWeight: 400,
                  marginBottom: `${16 * scale}px`,
                  wordBreak: 'break-word',
                  minHeight: line === '' ? `${bodyLineHeight}em` : 'auto',
                  ...enhancementStyle
                }}
              >
                <FormattedText text={line} />
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      const alignmentCls = quoteAlignment === 'center' ? 'text-center' : quoteAlignment === 'justify' ? 'text-justify' : 'text-left';
      return (
        <div 
          className={`absolute z-20 flex flex-col justify-center ${alignmentCls}`}
          style={{ 
            top: '7.81%',
            bottom: '20%',
            left: '12%',
            right: '28%', 
            marginTop: `${quoteVerticalPos * scale}px`
          }}
        >
          <div 
            style={{ 
              color: theme.bodyText, 
              fontSize: `${bodyFontSize * scale}px`, 
              lineHeight: bodyLineHeight,
              fontFamily: (fonts as any).fontFamily,
              fontWeight: (fonts as any).fontWeight,
              ...enhancementStyle
            }}
          >
            {lines.map((l, i) => (
              <div 
                key={i} 
                style={{ 
                  marginBottom: `${24 * scale}px`,
                  wordBreak: 'break-word',
                  minHeight: l === '' ? `${bodyLineHeight}em` : 'auto'
                }}
              >
                <FormattedText text={l} />
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const isCustomPhoto = state.themeId === 'custom_photo' && generatedImage && state.backgroundType === 'IMAGE';
  const isCustomVideo = state.themeId === 'custom_photo' && generatedImage && state.backgroundType === 'VIDEO';
  const containerBg = (isCustomPhoto || isCustomVideo) ? '#000000' : (theme.bg || '#000000');

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden ${isExport ? 'w-[1080px] h-[1920px] relative' : 'absolute inset-0'}`} 
      style={{ backgroundColor: containerBg }}
    >
      {isCustomPhoto && (
        <div className="absolute inset-0 z-0 text-center">
          <img 
            src={generatedImage} 
            alt="" 
            className="w-full h-full object-cover"
            crossOrigin="anonymous" 
            // @ts-ignore
            decoding="sync"
            loading="eager"
          />
          <div className="absolute inset-0 z-10" style={{ backgroundColor: `rgba(0,0,0,${state.bgOpacity})` }}></div>
        </div>
      )}
      {isCustomVideo && (
        <div className="absolute inset-0 z-0">
          <video 
            src={generatedImage} 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 z-10" style={{ backgroundColor: `rgba(0,0,0,${state.bgOpacity})` }}></div>
        </div>
      )}
      {state.themeId === 'book' && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/d/17M_WJIdsv8wbvP5W_wlFjeuFFcq5obyd" 
            className="w-full h-full object-cover"
            alt="Book theme background"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        </div>
      )}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {renderContent()}
      </div>
      {!isExport && showSafeZones && <SafeZoneOverlay />}
      {nickname && (
        <div className="absolute left-0 right-0 text-center z-30" style={{ bottom: `${nicknameVerticalPos}%` }}>
          <p 
            className={`tracking-[0.4em] uppercase opacity-70`} 
            style={{ 
              fontSize: `${24 * scale}px`, 
              color: theme.bodyText,
              fontFamily: format === TextFormat.QUOTE ? (fonts as any).fontFamily : (fonts as any).bodyFamily,
              fontWeight: format === TextFormat.QUOTE ? (fonts as any).fontWeight : 400
            }}
          >
            @{nickname.replace('@', '')}
          </p>
        </div>
      )}
    </div>
  );
};

const ControlSlider = ({ label, value, min, max, step = 0.1, onChange, unit = "" }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{label}</label>
      <span className="text-[10px] font-mono text-white/50">{value}{unit}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-[2px] bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-blue-500 transition-all"
    />
  </div>
);

const AlignmentControl = ({ label = "Выравнивание текста", value, onChange }: { label?: string, value: string, onChange: (v: 'left' | 'center' | 'justify') => void }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block">{label}</label>
    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
      {(['left', 'center', 'justify'] as const).map(align => (
        <button
          key={align}
          onClick={() => onChange(align)}
          className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${value === align ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
        >
          {align === 'left' ? 'Слева' : align === 'center' ? 'Центр' : 'Ширина'}
        </button>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  const [state, setState] = useState<ProjectState>({
    format: TextFormat.LIST,
    idea: '', generatedText: '',
    backgroundType: 'COLOR', themeId: 'black', fontPair: FontPair.PROSTO_PT,
    nickname: '', videoUrl: null, showTitleBox: true, 
    showSafeZones: true, 
    customThemeColors: { id: 'custom_hex', bg: '#08080c', box: '#3b82f6', boxText: '#FFFFFF', bodyText: '#FFFFFF' },
    customTitleFont: '', customBodyFont: '',
    titleFontSize: 48, bodyFontSize: 28, titleLineHeight: 1.1, bodyLineHeight: 1.4,
    nicknameVerticalPos: 20, titleAlignment: 'left', quoteAlignment: 'center', listAlignment: 'left', quoteVerticalPos: 0, quoteFont: 'manrope-light',
    listVerticalPos: 0,
    bgOpacity: 0.6,
    titleBodySpacing: 24,
    bodyTextShadow: false
  });

  const currentTheme = useMemo(() => {
    if (state.themeId === 'custom_hex') return state.customThemeColors;
    if (state.themeId === 'custom_photo') return { ...state.customThemeColors, bg: 'transparent' };
    return THEMES.find(t => t.id === state.themeId) || THEMES[1];
  }, [state.themeId, state.customThemeColors]);

  useEffect(() => {
    if (state.themeId === 'book') {
      setState(p => ({
        ...p,
        showTitleBox: false,
        fontPair: FontPair.MERRIWEATHER_OPEN,
        bodyTextShadow: true,
        titleBodySpacing: -35
      }));
      if (state.format === TextFormat.LIST) {
        setState(p => ({
          ...p,
          listVerticalPos: 492
        }));
      }
    }
  }, [state.themeId]);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
      
      // Cleanup old URL if any to prevent memory leaks
      if (generatedImage?.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }

      const url = URL.createObjectURL(file);
      setGeneratedImage(url);
      setState(p => ({ ...p, themeId: 'custom_photo', backgroundType: type as any }));
    }
  };

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsSaving(true);
    
    try {
      // 1. Ждем немного для стабилизации UI
      await new Promise(r => setTimeout(r, 500));
      
      // 2. Ждем загрузки шрифтов
      await document.fonts.ready;
      
      // 3. Обработка видео (html-to-image не умеет снимать видео)
      const video = exportRef.current.querySelector('video');
      let tempImg: HTMLImageElement | null = null;
      
      if (video) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1080;
          canvas.height = video.videoHeight || 1920;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameUrl = canvas.toDataURL('image/png');
            
            tempImg = document.createElement('img');
            tempImg.src = frameUrl;
            tempImg.className = video.className;
            tempImg.style.cssText = video.style.cssText;
            tempImg.style.display = 'block';
            tempImg.style.objectFit = 'cover';
            
            // Временно заменяем видео на статический кадр
            video.parentElement?.insertBefore(tempImg, video);
            video.style.display = 'none';
          }
        } catch (vErr) {
          console.error('Failed to capture video frame', vErr);
        }
      }
      
      // 4. Ждем и декодируем все картинки в контейнере
      const images = Array.from(exportRef.current.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      const options = {
        width: 1080,
        height: 1920,
        pixelRatio: 1.5, // 1.5 - баланс между качеством и производительностью
        cacheBust: true,
        useCORS: true,
        backgroundColor: '#000000',
        style: {
          transform: 'none',
          opacity: '1',
          visibility: 'visible',
          display: 'block'
        }
      };

      // 5. Генерация
      const dataUrl = await window.htmlToImage.toPng(exportRef.current, options);
      
      // 6. Возвращаем видео обратно, если оно было
      if (video && tempImg) {
        video.style.display = 'block';
        tempImg.remove();
      }
      
      const link = document.createElement('a');
      link.download = `reels-ai-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
      alert('Ошибка при сохранении. Попробуйте еще раз. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsSaving(false);
    }
  };

  const StepHeader = ({ text }: { text: string }) => (
    <div className="w-full py-6 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white mb-10">
      <h2 className="text-lg font-unbounded font-black uppercase tracking-widest text-black italic">{text}</h2>
    </div>
  );

  const steps = ["Формат", "Текст", "Дизайн", "Никнейм", "Готово"];

  const isCustomFontActive = () => {
    if (state.format === TextFormat.QUOTE) {
      return state.quoteFont === 'custom';
    } else {
      return state.fontPair === FontPair.CUSTOM;
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-inter selection:bg-blue-500/30 overflow-x-hidden">
      
      <div className="opacity-0 pointer-events-none fixed -top-full left-0 select-none">
        <span className="font-prosto">warmup</span>
        <span className="font-manrope">warmup</span>
        <span className="font-manrope-light">warmup</span>
        <span className="font-inter">warmup</span>
        <span className="font-inter-light">warmup</span>
        <span className="font-oswald">warmup</span>
        <span className="font-comfortaa">warmup</span>
        <span className="font-unbounded">warmup</span>
        <span className="font-days">warmup</span>
        <span className="font-soyuzx-cyr">warmup</span>
      </div>

      {/* Экспортный контейнер: смещен далеко за пределы экрана, но имеет положительный z-index для корректного рендеринга браузером */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '0', 
          left: '-5000px', 
          width: '1080px', 
          height: '1920px', 
          zIndex: 9999,
          pointerEvents: 'none',
          overflow: 'hidden',
          background: '#000',
          opacity: 1,
          visibility: 'visible'
        }}
      >
        <div ref={exportRef} style={{ width: '1080px', height: '1920px', position: 'relative' }}>
          <VideoPreview state={state} theme={currentTheme} generatedImage={generatedImage} isExport={true} />
        </div>
      </div>

      <header className="pt-16 pb-12 flex flex-col items-center text-center px-6">
        <div className="w-14 h-14 bg-[#0a0a10] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
          <div className="w-5 h-5 bg-white rotate-45 rounded-sm"></div>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">АКСЕЛЕРАТОР</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mt-2">bymorozov</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-10 bg-white/5 p-1.5 rounded-full border border-white/5 max-w-full">
          {steps.map((stepName, i) => (
            <button
              key={i}
              onClick={() => { if (i === 0 || state.generatedText || currentStep > i) { setCurrentStep(i); window.scrollTo({top: 0, behavior: 'smooth'}); } }}
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${currentStep === i ? 'bg-white text-black shadow-lg' : 'text-white/20 hover:text-white/40'}`}
            >
              {i + 1}. {stepName}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 mb-32">
        
        {currentStep === 0 && (
          <div className="space-y-12 animate-step">
            <StepHeader text="Выбери формат:" />
            <div className="flex justify-center gap-6 w-full">
              {[
                { id: TextFormat.QUOTE, icon: '“', label: 'Цитата' },
                { id: TextFormat.LIST, icon: '☰', label: 'Пункты' }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setState(p => ({ ...p, format: f.id }))} 
                  className={`w-36 h-36 rounded-[1.5rem] border transition-all duration-500 flex flex-col items-center justify-center gap-3 shadow-xl active:scale-95 ${state.format === f.id ? 'border-white ring-4 ring-white/30 bg-white/5 shadow-[0_0_40px_rgba(255,255,255,0.2)]' : 'bg-[#0a0a10] border-white/5 text-white/30 hover:border-white/20'}`}
                >
                  <span className={`text-3xl transition-transform duration-500 ${state.format === f.id ? 'scale-110' : ''}`}>{f.icon}</span>
                  <span className="font-black text-[10px] tracking-[0.2em] uppercase">{f.label}</span>
                </button>
              ))}
            </div>
            <button onClick={handleNext} className="w-full py-7 bg-blue-600 text-white rounded-[2rem] font-black text-[14px] tracking-widest uppercase hover:bg-blue-700 transition-all duration-500 shadow-2xl active:scale-95">Продолжить</button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-8 animate-step">
            <StepHeader text="Вставь свой текст:" />
            <div className="bg-[#0a0a10] border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-6">
              <textarea 
                value={state.generatedText} 
                onChange={e => setState(p => ({ ...p, generatedText: e.target.value }))}
                placeholder={state.format === TextFormat.QUOTE ? "ЗАГОЛОВОК\nТекст цитаты здесь..." : "ЗАГОЛОВОК\nПУНКТ 1\nОписание...\nПУНКТ 2\nОписание..."}
                className="w-full h-64 bg-transparent outline-none resize-none text-lg font-medium leading-relaxed placeholder:text-white/5 text-white/90"
              />
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3 opacity-90">
                <p className="font-black text-white/40 uppercase tracking-[0.2em] text-[10px]">✨ Совет 💡</p>
                <div className="space-y-2 text-[12px] leading-relaxed">
                  <div className="flex gap-2">
                    <span className="text-blue-500 font-bold">1.</span>
                    <p>Для создания <span className="font-bold text-white">ЖИРНОГО</span> шрифта: используйте двойные звездочки вокруг текста. Например: <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-400">**Ваш текст**</code></p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-500 font-bold">2.</span>
                    <p>Для создания <span className="text-blue-400">ЦВЕТНОГО</span> шрифта: используйте квадратные и круглые скобки. Например: <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-400">[Ваш текст](#КодЦвета)</code>. Цвета указываются в HEX-формате (напр. #3b82f6).</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handlePrev} className="px-10 py-6 rounded-2xl bg-white/5 text-[11px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">Назад</button>
              <button onClick={handleNext} disabled={!state.generatedText} className="flex-1 py-6 bg-blue-600 text-white rounded-2xl font-black text-[12px] tracking-widest uppercase hover:bg-blue-700 disabled:opacity-20 transition-all duration-500 shadow-xl">Далее</button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-12 animate-step">
            <StepHeader text="Выбери свой дизайн:" />
            <div className="bg-[#0a0a10] border border-white/10 rounded-[3rem] p-10 space-y-12 shadow-2xl">
              {state.format !== TextFormat.QUOTE && (
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/50">Подложка под заголовком</span>
                  <button 
                    onClick={() => setState(p => ({ ...p, showTitleBox: !p.showTitleBox }))}
                    className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${state.showTitleBox ? 'bg-blue-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${state.showTitleBox ? 'left-8' : 'left-1'}`} />
                  </button>
                </div>
              )}

              <div className="space-y-10 pt-4 text-center">
                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 block">Цветовая гамма</label>
                
                {state.themeId === 'custom_photo' && (
                  <div className="max-w-xs mx-auto pb-4 animate-step">
                    <ControlSlider 
                      label="Затемнение фона" 
                      value={state.bgOpacity} 
                      min={0} 
                      max={1} 
                      step={0.01} 
                      onChange={(v: number) => setState(p => ({ ...p, bgOpacity: v }))} 
                    />
                  </div>
                )}

                <div className="flex justify-center flex-wrap gap-x-6 gap-y-10">
                  {THEMES.map(t => (
                    <div key={t.id} className="flex flex-col items-center gap-2">
                      <button 
                        onClick={() => setState(p => ({ ...p, themeId: t.id }))} 
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${state.themeId === t.id ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-white/10 opacity-60 hover:opacity-100'}`} 
                        style={{ backgroundColor: t.bg }} 
                      />
                      <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">{t.name}</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => setState(p => ({ ...p, themeId: 'custom_hex' }))} 
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${state.themeId === 'custom_hex' ? 'border-blue-500 scale-110' : 'border-white/10'}`}
                      style={{ background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)' }}
                    >
                      <span className="text-[7px] font-black">HEX</span>
                    </button>
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Свой цвет</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center text-[7px] font-black tracking-tighter transition-all ${state.themeId === 'custom_photo' ? 'border-blue-500 text-blue-500 scale-110' : 'border-white/10 text-white/20'}`}
                    >
                      FILE
                    </button>
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Свой фон</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                </div>

                {(state.themeId === 'custom_hex' || state.themeId === 'custom_photo') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/5 animate-step text-left">
                    {state.themeId === 'custom_hex' && <ColorInput label="Фон" value={state.customThemeColors.bg} onChange={(v) => setState(p => ({ ...p, customThemeColors: { ...p.customThemeColors, bg: v }}))} />}
                    
                    {state.format !== TextFormat.QUOTE && (
                      <>
                        <ColorInput label="Подложка" value={state.customThemeColors.box} onChange={(v) => setState(p => ({ ...p, customThemeColors: { ...p.customThemeColors, box: v } }))} />
                        <ColorInput label="Текст загол." value={state.customThemeColors.boxText} onChange={(v) => setState(p => ({ ...p, customThemeColors: { ...p.customThemeColors, boxText: v } }))} />
                      </>
                    )}
                    
                    <ColorInput label="Текст основ." value={state.customThemeColors.bodyText} onChange={(v) => setState(p => ({ ...p, customThemeColors: { ...p.customThemeColors, bodyText: v } }))} />
                  </div>
                )}
              </div>

              <div className="pt-10 border-t border-white/5 space-y-6">
                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 block text-center">Шрифт</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(FONT_PAIRS).map(([key, config]) => (
                    <button 
                      key={key} 
                      onClick={() => setState(p => ({ ...p, fontPair: key as FontPair, quoteFont: '' }))}
                      className={`p-4 rounded-xl border transition-all text-left ${state.fontPair === key ? 'border-white bg-white/10' : 'border-white/5 text-white/20'}`}
                    >
                      <div className={`text-[12px] mb-1 ${config.titleClass}`}>{config.label.split(' + ')[0]}</div>
                      <div className={`text-[9px] opacity-60 ${config.bodyClass}`}>{config.label.split(' + ')[1]}</div>
                    </button>
                  ))}
                  {state.format === TextFormat.QUOTE && QUOTE_FONTS.map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setState(p => ({ ...p, quoteFont: f.id, fontPair: FontPair.CUSTOM }))}
                      className={`p-4 rounded-xl border transition-all text-left ${state.quoteFont === f.id ? 'border-white bg-white/10' : 'border-white/5 text-white/20'}`}
                    >
                      <div className={`text-[12px] ${f.fontClass}`}>{f.label}</div>
                    </button>
                  ))}
                  <button 
                      onClick={() => setState(p => ({ ...p, fontPair: state.format === TextFormat.LIST ? FontPair.CUSTOM : p.fontPair, quoteFont: state.format === TextFormat.QUOTE ? 'custom' : p.quoteFont }))}
                      className={`p-4 rounded-xl border transition-all text-left ${isCustomFontActive() ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 text-white/20'}`}
                    >
                      <div className="text-[12px] font-black uppercase italic">Свой шрифт</div>
                      <div className="text-[9px] opacity-60">Ручной ввод</div>
                  </button>
                </div>

                {isCustomFontActive() && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-step mt-4">
                    {state.format !== TextFormat.QUOTE && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Заголовок</label>
                        <input 
                          type="text" value={state.customTitleFont} onChange={e => setState(p => ({ ...p, customTitleFont: e.target.value }))}
                          placeholder="Arial, Roboto..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Основной текст</label>
                      <input 
                        type="text" value={state.customBodyFont} onChange={e => setState(p => ({ ...p, customBodyFont: e.target.value }))}
                        placeholder="Arial, Roboto..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-10 border-t border-white/5 space-y-8">
                <div className="flex flex-col items-center">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mb-8 italic">Дополнительные настройки</h3>
                </div>
                <div className="space-y-8">
                  {/* Headers Section */}
                  {state.format !== TextFormat.QUOTE && (
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 pb-2">Настройки заголовка</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <ControlSlider label="Размер заголовка" value={state.titleFontSize} min={18} max={160} onChange={(v: number) => setState(p => ({...p, titleFontSize: v}))} unit="px" />
                        <ControlSlider label="Межстрочный инт. (Заг)" value={state.titleLineHeight} min={0.5} max={3} step={0.05} onChange={(v: number) => setState(p => ({...p, titleLineHeight: v}))} />
                        <div className="md:col-span-2">
                           <AlignmentControl 
                            label="Выравнивание заголовка"
                            value={state.titleAlignment} 
                            onChange={(v) => setState(p => ({...p, titleAlignment: v}))} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Body Section */}
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 pb-2">Настройки основного текста</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <ControlSlider label="Размер текста" value={state.bodyFontSize} min={12} max={120} onChange={(v: number) => setState(p => ({...p, bodyFontSize: v}))} unit="px" />
                      <ControlSlider label="Межстрочный инт. (Текст)" value={state.bodyLineHeight} min={0.5} max={3} step={0.05} onChange={(v: number) => setState(p => ({...p, bodyLineHeight: v}))} />
                      <div className="md:col-span-2">
                        <AlignmentControl 
                          label="Выравнивание текста"
                          value={state.format === TextFormat.LIST ? state.listAlignment : state.quoteAlignment} 
                          onChange={(v) => setState(p => ({...p, [state.format === TextFormat.LIST ? 'listAlignment' : 'quoteAlignment']: v}))} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vertical Position Section */}
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 pb-2">Позиционирование</h4>
                    <ControlSlider label="Вертикаль контента" value={state.format === TextFormat.LIST ? state.listVerticalPos : state.quoteVerticalPos} min={-800} max={800} step={1} onChange={(v: number) => setState(p => ({...p, [state.format === TextFormat.LIST ? 'listVerticalPos' : 'quoteVerticalPos']: v}))} />
                    {state.format === TextFormat.LIST && (
                      <ControlSlider label="Расстояние до текста" value={state.titleBodySpacing} min={-200} max={400} step={1} onChange={(v: number) => setState(p => ({...p, titleBodySpacing: v}))} unit="px" />
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Четкость текста</span>
                       <button 
                         onClick={() => setState(p => ({ ...p, bodyTextShadow: !p.bodyTextShadow }))}
                         className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${state.bodyTextShadow ? 'bg-blue-600' : 'bg-white/10'}`}
                       >
                         <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${state.bodyTextShadow ? 'translate-x-6' : 'translate-x-0'}`} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handlePrev} className="px-10 py-6 rounded-2xl bg-white/5 text-[11px] font-black uppercase tracking-widest border border-white/5">Назад</button>
              <button onClick={handleNext} className="flex-1 py-6 bg-blue-600 text-white rounded-2xl font-black text-[12px] tracking-widest uppercase hover:bg-blue-700 transition-all shadow-xl">Далее</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-12 animate-step">
            <StepHeader text="Введи свой ник:" />
            <div className="bg-[#0a0a10] border border-white/10 rounded-[3rem] p-8 space-y-10 shadow-2xl">
              <div className="max-w-xs mx-auto text-center space-y-4">
                <input 
                  value={state.nickname} 
                  onChange={e => setState(p => ({ ...p, nickname: e.target.value }))} 
                  placeholder="@НИК" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none text-center font-black text-2xl focus:border-blue-500 focus:bg-white/10 transition-all tracking-tight uppercase" 
                />
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-[10px] text-blue-400 font-medium tracking-wide">
                  💡 Рекомендуемая позиция — <span className="font-bold underline">20%</span> для лучшей видимости в Reels.
                </div>
              </div>
              <ControlSlider label="Позиция подписи" value={state.nicknameVerticalPos} min={5} max={95} onChange={(v: number) => setState(p => ({...p, nicknameVerticalPos: v}))} unit="%" />
            </div>
            <div className="flex gap-4">
              <button onClick={handlePrev} className="px-10 py-6 rounded-2xl bg-white/5 text-[11px] font-black uppercase tracking-widest border border-white/5">Назад</button>
              <button onClick={handleNext} className="flex-1 py-6 bg-blue-600 text-white rounded-2xl font-black text-[12px] tracking-widest uppercase hover:bg-blue-700 transition-all shadow-xl">Завершить</button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-12 animate-step text-center max-w-sm mx-auto">
            <StepHeader text="Скачай фото:" />
            <div className="bg-[#0a0a10] border border-white/10 rounded-[3.5rem] p-10 shadow-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <span className="text-2xl text-white">✓</span>
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-widest mb-10 leading-tight">Дизайн готов</h2>
              <button onClick={handleDownload} disabled={isSaving} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-[14px] tracking-[0.1em] uppercase shadow-2xl hover:bg-blue-700 transition-all duration-500 disabled:opacity-50">
                {isSaving ? 'СОХРАНЕНИЕ...' : 'СКАЧАТЬ'}
              </button>
              <button 
                onClick={() => { setCurrentStep(0); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                className="w-full mt-4 py-4 bg-white/5 border border-white/10 text-white/60 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white/10 hover:text-white transition-all"
              >
                Новый проект
              </button>
            </div>
          </div>
        )}

        {currentStep > 0 && currentStep < 4 && (
          <section className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center animate-step">
            <h2 className="text-[9px] font-black uppercase tracking-[1em] text-white/10 mb-6 italic ml-[1em]">Превью</h2>
            <div className="relative w-[340px] aspect-[9/16] rounded-[4rem] border-[14px] border-[#10101a] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden bg-black ring-1 ring-white/10 flex-shrink-0">
              <VideoPreview state={state} theme={currentTheme} generatedImage={generatedImage} isExport={false} />
            </div>
            <div className="mt-8 flex flex-col items-center gap-5 w-full max-w-sm">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 w-full shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex-1 italic">Безопасные зоны</span>
                <button 
                    onClick={() => setState(p => ({ ...p, showSafeZones: !p.showSafeZones }))}
                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-md ${state.showSafeZones ? 'bg-[#ff0066] text-white' : 'bg-white/10 text-white/40'}`}
                  >
                    {state.showSafeZones ? 'ВКЛ' : 'ВЫКЛ'}
                  </button>
              </div>
              <button onClick={handleNext} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-[12px] tracking-widest uppercase transition-all shadow-xl active:scale-95 hover:bg-blue-700">Продолжить</button>
            </div>
          </section>
        )}

      </main>

      <footer className="py-20 text-center border-t border-white/5">
        <p className="text-[10px] font-black tracking-[2em] uppercase opacity-5 ml-[2em]">accelerator ai</p>
      </footer>
    </div>
  );
};

export default App;
