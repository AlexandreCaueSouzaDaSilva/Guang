import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import notebooksRouter from "./notebooks.js";
import notesRouter from "./notes.js";
import ocrRouter from "./ocr.js";
import translateRouter from "./translate.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(userRouter);
router.use(notebooksRouter);
router.use(notesRouter);
router.use(ocrRouter);
router.use(translateRouter);

export default router;
