import { Request, Response, Router } from "express";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(requireAuth);

// Protected route
router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "You are authenticated!" });
});

export default router;