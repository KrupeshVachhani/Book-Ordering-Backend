import express from "express";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  myOrders,
  placeOrder,
  getOrderDetails,
  AdminOrders,
  processOrder,
  paymentVerification,
} from "../controllers/order.js";

const router = express.Router();

router.post("/createorder", placeOrder);

router.post("/paymentverification", paymentVerification);
router.get("/myorders", isAuthenticated, myOrders);
router.get("/order/:id", isAuthenticated, getOrderDetails);

router.get("/admin/orders", isAuthenticated,authorizeAdmin, AdminOrders);
router.get("/admin/orders/:id", isAuthenticated, authorizeAdmin, processOrder);
export default router;