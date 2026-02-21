const express = require("express");
const path = require("path");
const mongoConnection = require("./src/config/mongoConnection");
const cors = require("cors");
const authenticationRoutes = require("./src/routes/authentication.routes");
const productCategoryRoutes = require("./src/routes/productCategory.routes");
const productRoutes = require("./src/routes/product.routes");
const userRoutes = require("./src/routes/user.routes");

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoConnection();

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

// define routes
app.use("/api/auth", authenticationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/productCategories", productCategoryRoutes);
app.use("/api/users", userRoutes);

// Port listening
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
