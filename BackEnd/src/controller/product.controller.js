const db = require("../model");
const Product = db.product;

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category","name");
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ message: "Error retrieving products", error });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product.toJSON());
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({ message: "Error retrieving product", error });
  }
};

exports.createProduct = async (req, res) => {
  const { productName, price, description, image, category } = req.body;
  if (!productName || price == null || !image || !category) {
    return res.status(400).json({ message: "Required fields are missing" });
  }
  try {
    const newProduct = new Product({
      productName,
      price,
      description,
      image,
      category,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { productName, price, description, image, category } = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { productName, price, description, image, category },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product", error });
  }
};
