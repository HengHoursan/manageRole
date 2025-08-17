const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const authenticationMiddleware = require("../middleware/authentication");
const authorizeRoles = require("../middleware/authorizeRoles");
const { upload, handleImageUpload } = require("../middleware/uploadMiddleware");

// Public: get all or one product
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected: create/update (Admin, Editor), upload image
router.post(
  "/",
  authenticationMiddleware,
  authorizeRoles("Admin", "Editor"),
  upload.single("image"),
  handleImageUpload,
  productController.createProduct
);
router.put(
  "/:id",
  authenticationMiddleware,
  authorizeRoles("Admin", "Editor"),
  upload.single("image"),
  handleImageUpload,
  productController.updateProduct
);

// Protected: delete (Admin only)
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizeRoles("Admin"),
  productController.deleteProduct
);

module.exports = router;
