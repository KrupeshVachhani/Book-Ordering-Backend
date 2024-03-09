// import ErrorHandler from "../utils/ErrorHandler.js";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies["connect.sid"];

  if (!token) {
    return next(new Error("Login first to access this resource."));
  }
  // console.log(token);
  next();
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Call the next middleware or route handler
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};
