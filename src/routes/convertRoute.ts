import  express  from "express";
import { convertToPdfController, convertToExcelController } from "../controllers/convertController";
import { validateHtmlBase64 } from "../middleware/validateHtml";

const router = express.Router();

router.post("/htmlpdf", validateHtmlBase64, convertToPdfController);
router.post("/htmlexcel", validateHtmlBase64, convertToExcelController);

export default router;