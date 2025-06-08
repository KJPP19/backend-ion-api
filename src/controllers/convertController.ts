import {convertToBase64Pdf} from '../services/base64PdfConvert'
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler'

export const convertToPdfController = asyncHandler(async(req: Request, res: Response) => {
    if (!req.htmlBase64String) {
        return res.status(400).json({
            success: false,
            error: 'HTML string is required'
        });
    }
    
    const base64Pdf = await convertToBase64Pdf(req.htmlBase64String);
    res.status(200).json({
        success: true, 
        message: 'conversion success',
        data: { pdfBase64: base64Pdf }
    });
})

