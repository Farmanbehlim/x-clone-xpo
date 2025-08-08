export const protectRoute = async (req, res, next) => {
   console.log("🧾 Clerk Auth Info:", req.auth());
  if (!req.auth().isAuthenticated) {
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }
  next();
};


