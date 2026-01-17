import express from "express";
import { getAddresses, createAddress } from "../controllers/address.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All address routes require login
router.use(requireAuth);

router.get("/", getAddresses);
router.post("/", createAddress);

export default router;
