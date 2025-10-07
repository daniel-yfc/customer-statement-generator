// src/fonts.ts
import { Font } from '@react-pdf/renderer';

// --- Font Source Definitions ---
// Define font sources for both local and CDN paths
const localFontSources = {
  notoSansTC: [
    { src: '/Fonts/NotoSansTC-VF.ttf', fontWeight: 400 },
    { src: '/Fonts/NotoSansTC-VF.ttf', fontWeight: 700 },
  ],
  notoSansJP: [
    { src: '/Fonts/NotoSansJP-VF.ttf', fontWeight: 400 },
    { src: '/Fonts/NotoSansJP-VF.ttf', fontWeight: 700 },
  ],
  default: { src: '/Fonts/NotoSansTC-VF.ttf' },
};

const cdnFontSources = {
  notoSansTC: [
    { src: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Regular.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Bold.ttf', fontWeight: 700 },
  ],
  notoSansJP: [
    { src: 'https://fonts.gstatic.com/ea/notosansjp/v1/NotoSansJP-Regular.otf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/ea/notosansjp/v1/NotoSansJP-Bold.otf', fontWeight: 700 },
  ],
  default: { src: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Regular.ttf' },
};

// Type definition for font sources
type FontSources = typeof localFontSources;

/**
 * A helper function to register all required fonts from a given source.
 * @param sources - The font source object (either local or CDN).
 * @param sourceName - A string identifier for logging purposes ('local files' or 'CDN').
 */
const registerFontsFromSource = (sources: FontSources, sourceName: string) => {
  Font.register({ family: 'Noto Sans TC', fonts: sources.notoSansTC });
  Font.register({ family: 'Noto Sans JP', fonts: sources.notoSansJP });
  Font.register({ family: 'DefaultFont', src: sources.default.src });
  console.log(`PDF fonts successfully registered from ${sourceName}.`);
};

/**
 * 註冊 PDF 產生器所需的字型。
 * 優先嘗試從本地路徑 (`/public/Fonts/`) 載入，若註冊失敗則回退至 CDN。
 */
export const registerPdfFonts = () => {
    try {
        registerFontsFromSource(localFontSources, 'local files');
    } catch (localError) {
        console.warn('Could not register local fonts. Falling back to CDN.', localError);
        try {
            registerFontsFromSource(cdnFontSources, 'CDN');
        } catch (cdnError) {
            console.error('Fatal: Failed to register PDF fonts from both local and CDN sources.', cdnError);
        }
    }
};

// 在應用程式初始化時執行註冊
registerPdfFonts();

