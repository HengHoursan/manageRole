import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import Home from "../views/Home";
import Product from "../views/Product";
import ProductCategory from "../views/ProductCategory";
import ErrorPage from "../pages/ErrorPage";
import SidebarLayout from "../layouts/SidebarLayout";
import Protected from "@/security/Protected.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/layout",
    element: (
        <Protected>
          <SidebarLayout/>
        </Protected>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Product /> },
      { path: "productCategories", element: <ProductCategory /> },
      { path: "*", element: <ErrorPage /> },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorPage />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
