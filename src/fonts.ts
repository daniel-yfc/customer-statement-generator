// src/fonts.ts
import { Font } from '@react-pdf/renderer';

/**
 * 註冊 PDF 產生器所需的字型。
 * 規格要求：內嵌 Noto Sans TC 與 Noto Sans JP
 * 提示：在實際專案中，您可能需要將這些 CDN 連結替換為本地字型文件路徑。
 */
export const registerPdfFonts = () => {
    try {
        // Noto Sans TC (正體中文)
        Font.register({ 
            family: 'Noto Sans TC', 
            fonts: [
                // 使用 CDN 連結作為範例，確保 PDF 能夠渲染中文
                { src: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Regular.ttf', fontWeight: 400 },
                { src: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Bold.ttf', fontWeight: 700 },
            ] 
        });

        // Noto Sans JP (日文)
        Font.register({ 
            family: 'Noto Sans JP', 
            fonts: [
                { src: 'https://fonts.gstatic.com/ea/notosansjp/v1/NotoSansJP-Regular.otf', fontWeight: 400 },
                { src: 'https://fonts.gstatic.com/ea/notosansjp/v1/NotoSansJP-Bold.otf', fontWeight: 700 },
            ] 
        });

        // 設置預設字型
        Font.register({ family: 'DefaultFont', src: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Regular.ttf' });

        console.log('PDF fonts successfully registered.');
    } catch (e) {
        console.error('Failed to register PDF fonts:', e);
    }
};

// 在應用程式初始化時執行註冊
registerPdfFonts();
