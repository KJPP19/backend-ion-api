import dotenv from 'dotenv'

dotenv.config();

export const CONFIG = {
    PORT: process.env.PORT || 8080,

    LAUNCHOPTIONS: {
        HEADLESS: true,
        TIMEOUT: 500000,
    },

    PDF_OPTIONS:{
        printBackground: true,
        format: 'A4' as const,
        landscape: false,
        margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
        },
        displayHeaderFooter: false,
        scale: 0.8,
        preferCSSPageSize: true,
        timeout: 500000
    },

    BROWSER_ARGS: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        
        // Memory optimization
        '--memory-pressure-off',
        '--max-old-space-size=1024',
        '--aggressive-cache-discard',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        
        // Disable unnecessary features
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--disable-web-security',
        '--disable-accelerated-2d-canvas',
        '--disable-accelerated-jpeg-decoding',
        '--disable-accelerated-mjpeg-decode',
        '--disable-accelerated-video-decode',
        
        // Performance
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--disable-extensions-http-throttling',
        
        // Resource limits
        '--max-unused-resource-memory-usage-percentage=5',
        '--disable-background-mode'
    ]
}