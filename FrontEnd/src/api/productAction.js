import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;

const productFormData = (productData) => {
    const formData = new FormData();

    formData.append("productName", productData.productName);
    formData.append("price", productData.price);
    formData.append("description", productData.description);
    formData.append("category", productData.category);

    if (productData.image instanceof File) {
        formData.append("image", productData.image);
    }

    return formData;
};


export const getAllProducts = async () => {
    try {
        const {data} = await axios.get(`${API_URL}/api/products`);
        return data;
    } catch (error) {
        console.error("Error fetching products:", error.message);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const {data} = await axios.get(`${API_URL}/api/products/${id}`);
        return data;
    } catch (error) {
        console.error("Error fetching product by ID:", error.message);
        throw error;
    }
};

export const createNewProduct = async (token, productData) => {
    try {
        const formData = productFormData(productData);

        const {data} = await axios.post(`${API_URL}/api/products`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        return data;
    } catch (error) {
        console.error("Error creating product:", error.message);
        throw error;
    }
};

export const updateProduct = async (token, id, updatedData) => {
    try {
        const formData = productFormData(updatedData);

        const {data} = await axios.put(
            `${API_URL}/api/products/${id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return data;
    } catch (error) {
        console.error("Error updating product:", error.message);
        throw error;
    }
};

export const deleteProduct = async (token, id) => {
    try {
        const {data} = await axios.delete(`${API_URL}/api/products/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return data;
    } catch (error) {
        console.error("Error deleting product:", error.message);
        throw error;
    }
};
