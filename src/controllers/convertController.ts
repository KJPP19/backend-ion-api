import {convertToBase64Pdf} from '../services/base64PdfConvert'
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler'
import logger from '../utils/logger';

export const convertToPdfController = asyncHandler(async(req: Request, res: Response) => {
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
    
    logger.info('PDF conversion request received', {
        method: req.method,
        url: req.url,
        ip: req.ip
    })
    
    if (!req.htmlBase64String) {
        return res.status(400).json({
            success: false,
            error: 'HTML string is required'
        });
    }
    
    const base64Pdf = await convertToBase64Pdf(req.htmlBase64String);

    logger.info('PDF converted successfully', {
        requestId: requestId,
        pdfSize: base64Pdf.length
    })

    res.status(200).json({
        success: true, 
        message: 'conversion success',
        data: { pdfBase64: base64Pdf }
    });
})

