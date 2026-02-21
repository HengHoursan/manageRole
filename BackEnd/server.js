const express = require("express");
const path = require("path");
const mongoConnection = require("./src/config/mongoConnection");
const cors = require("cors");
const authenticationRoutes = require("./src/routes/authentication.routes");
const productCategoryRoutes = require("./src/routes/productCategory.routes");
const productRoutes = require("./src/routes/product.routes");
const userRoutes = require("./src/routes/user.routes");

const app = express();
// ... (rest of server.js)
app.use("/api/auth", authenticationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/productCategories", productCategoryRoutes);
app.use("/api/users", userRoutes);

// Port listening
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
