import { asyncErrorHandler } from "../middlewares/errorMiddleware.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Pyment.js";
import { instance } from "../server.js";
import crypto from "crypto";
import mongoose from "mongoose";
import errorHandler from "../utils/ErrorHandler.js";

export const placeOrder = asyncErrorHandler(async (req, res, next) => {
  const { shippingInfo, orderItems, paymentMethod, user } = req.body;

  // Calculate items price based on the order items
  const itemsPrice = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate total amount including tax and shipping charges
  const taxPrice = 0; // You can calculate tax based on your requirements
  const shippingCharges = 0; // You can calculate shipping charges based on your requirements
  const totalAmount = itemsPrice + taxPrice + shippingCharges;

  // Create order options object with the provided information
  const orderOptions = {
    shippingInfo,
    orderItems,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
    user, // Assuming req.user contains the authenticated user's information
  };

  // Create the order using the Order model and the order options
  const order = await Order.create(orderOptions);

  // Send a response with status code 201 (Created) along with a success message and the created order details
  res
    .status(201)
    .json({ message: "Order placed successfully via Cash On Delivery", order });
});

//payment verfication

export const paymentVerification = asyncErrorHandler(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    orderOptions,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthenticate = expectedSignature === razorpay_signature;
  // const isAuthenticate = true;

  if (isAuthenticate) {
    const payment = await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    await Order.create({
      ...orderOptions,
      paidAt: new Date(Date.now()),
      paymentInfo: payment._id,
    });

    res
      .status(201)
      .json({
        success: true,
        msg: `Payment successfull Payment ID: ${payment._id}`,
      });
  } else {
    return next(new errorHandler("Payment verification failed", 400));
  }
});

export const myOrders = asyncErrorHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) {
    return next(new errorHandler("User not authenticated", 401));
  }

  const orders = await Order.find({
    user: new mongoose.Types.ObjectId(req.user._id),
  }).populate({ path: "user", select: "name" });

  res.status(200).json({ success: true, orders });
});

export const getOrderDetails = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: "user",
    select: "name email",
  });

  if (!order) {
    return next(new asyncErrorHandler("No order found with this ID", 404));
  }
  res.status(200).json({ success: true, order });
});

export const AdminOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = await Order.find({});
  // .populate({
  //   path: "user",
  //   select: "name",
  // });
  res.status(200).json({ success: true, orders });
});

export const processOrder = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new asyncErrorHandler("No order found with this ID", 404));
  }

  if (order.orderStatus === "Processing") order.orderStatus = "Shipped";
  else if (order.orderStatus === "Shipped") {
    order.orderStatus = "Delivered";
    order.deliveredAt = new Date(Date.now());
  } else if (order.orderStatus === "Delivered")
    return next(new Error("Order is already delivered", 400));

  await order.save();
  res.status(200).json({ success: true, msg: "Order processed successfully" });
});
