import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;
console.log("This server url:", API_URL);

// Get all categories
export const getAllProductCategories = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/productCategories`);
    return data;
  } catch (error) {
    console.error("Error fetching product categories:", error.message);
    throw error;
  }
};

// Get category by ID
export const getProductCategoryById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/api/productCategories/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching product category by ID:", error.message);
    throw error;
  }
};

export const createNewProductCategory = async (token, categoryData) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/productCategories`,
      categoryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error creating product category:", error.message);
    throw error;
  }
};

export const updateProductCategory = async (token, id, updatedData) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/api/productCategories/${id}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error updating product category:", error.message);
    throw error;
  }
};

export const deleteProductCategory = async (token, id) => {
  try {
    const { data } = await axios.delete(
      `${API_URL}/api/productCategories/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error deleting product category:", error.message);
    throw error;
  }
};
