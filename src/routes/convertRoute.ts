import  express  from "express";
import { convertToPdfController } from "../controllers/convertController";
import { validateHtmlBase64 } from "../middleware/validateHtml";

const router = express.Router();

router.post("/htmlpdf", validateHtmlBase64, convertToPdfController);

export default router;