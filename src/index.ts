import express, {Request, Response} from "express";
import convertRoute from './routes/convertRoute';
import logger from "./utils/logger";
//main
const app = express();

app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.get("/", (req: Request, res: Response) => {
    res.json({
        success: true,
        status: 200,
        message: 'ION LTD backend'
    })
})

app.use('/api', convertRoute);

app.listen(8080, () => {
    logger.info('Server is running')
})
