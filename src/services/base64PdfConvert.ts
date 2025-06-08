import {CONFIG} from '../configs/index'
import puppeteer from 'puppeteer'

export const convertToBase64Pdf = async( htmlString: string ) => {
    let browser;
    try {
        try {
            browser = await puppeteer.launch({
                headless: CONFIG.LAUNCHOPTIONS.HEADLESS,
                executablePath: '/usr/bin/google-chrome-stable',
                args: CONFIG.BROWSER_ARGS,
                timeout: CONFIG.LAUNCHOPTIONS.TIMEOUT
                
            })
        } catch (error) {
            throw error
        }

        const page = await browser.newPage();

        await page.setContent(htmlString, {
            waitUntil: 'domcontentloaded',
            timeout: 200000
        });

        const pdfBuffer = await page.pdf(CONFIG.PDF_OPTIONS);
        const pdfBase64String = Buffer.from(pdfBuffer).toString('base64');
        return pdfBase64String
       
    } catch (error) {
        throw error
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}