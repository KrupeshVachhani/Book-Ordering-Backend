import { asyncErrorHandler } from "../middlewares/errorMiddleware.js";
import User from "../models/User.js";
import { Order } from "../models/Order.js";

export const myProfile = (req, res) => {
  res.status(200).json({
    message: "Profile",
    user: {
      ...req.user._doc, // Spread the user object properties
      role: req.user.role, // Add the role property explicitly
    },
  });
};

export const logout = asyncErrorHandler(async (req, res,next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid", {
      secure: process.env.NODE_ENV === "development" ? false : true,
      httpOnly: process.env.NODE_ENV === "development" ? false : true,
      sameSite: process.env.NODE_ENV === "development" ? false : "none",
    });
    res.status(200).json({
      message: "Logged Out",
    });
  });
});

export const getAdminUsers = asyncErrorHandler(async (req, res) => {
  const users = await User.find({}).select();
  res.status(200).json({ message: "sucess", users });
});

export const getAdminStats = asyncErrorHandler(async (req, res) => {
  const usersCount = await User.countDocuments();

  const orders = await Order.find({});

  const preparingOrders = orders.filter(
    (order) => order.orderStatus === "Processing"
  );
  const shippedOrders = orders.filter(
    (order) => order.orderStatus === "Shipped"
  );
  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "Delivered"
  );

  let totalIncome = 0;
  orders.forEach((order) => {
    totalIncome += order.totalAmount;
  });

  res.status(200).json({
    message: "sucess",
    usersCount,
    ordersCount: {
      total: orders.length,
      preparing: preparingOrders.length,
      shipped: shippedOrders.length,
      delivered: deliveredOrders.length,
    },
    totalIncome,
  });
});
