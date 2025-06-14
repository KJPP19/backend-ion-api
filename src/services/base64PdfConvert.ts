import {CONFIG} from '../configs/index'
import puppeteer from 'puppeteer'
import {logger} from '../utils/logger'

export const convertToBase64Pdf = async( htmlString: string ) => {
    let browser;
    let page;
    try {
        try {
            browser = await puppeteer.launch({
                headless: CONFIG.LAUNCHOPTIONS.HEADLESS,
                executablePath: '/usr/bin/google-chrome-stable',
                args: CONFIG.BROWSER_ARGS,
                timeout: CONFIG.LAUNCHOPTIONS.TIMEOUT
                
            })
        } catch (error) {
            logger.error('Unable to start puppeteer browser')
            throw error
        }

        page = await browser.newPage();

        await page.setContent(htmlString, {
            waitUntil: 'domcontentloaded',
            timeout: 500000
        });

        const pdfBuffer = await page.pdf(CONFIG.PDF_OPTIONS);
        return pdfBuffer;
       
    } catch (error) {
        logger.error('Something went wrong from convert service')
        throw error
    } finally {
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }
}