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
    
    const pdfBuffer = await convertToBase64Pdf(req.htmlBase64String);

    logger.info('PDF converted successfully', {
        requestId: requestId,
        pdfSize: pdfBuffer.length
    })

    // Set headers for direct PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send PDF buffer directly
    res.end(pdfBuffer);

    //res.status(200).json({
    //    success: true, 
     //   message: 'conversion success'
    //});
})

