import { NextFunction, Request, Response } from 'express'
import validator from 'validator'

declare global {
    namespace Express {
        interface Request {
            htmlBase64String?: string;
        }
    }
}

export const validateHtmlBase64 = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { htmlBase64String } = req.body;
        if (!htmlBase64String || !validator.isBase64(htmlBase64String)) {
            res.status(400).json({ success: false, error: 'Invalid base64 data' });
        }
          
        const htmlString = Buffer.from(htmlBase64String, 'base64').toString('utf-8');
        
        req.htmlBase64String = htmlString;
        next();
    } catch (error) {
        res.status(400).json({success: false, error: 'failed conversion'})
    }
}