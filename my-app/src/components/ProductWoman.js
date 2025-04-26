import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

const ProductWoman = () => {
  const [productNew, setProductNew] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch brands and categories
    const fetchBrandsAndCategories = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          axios.get("https://localhost:7213/api/public/Brand", {
            headers: { Accept: "application/json" },
          }),
          axios.get("https://localhost:7213/api/public/Category", {
            headers: { Accept: "application/json" },
          }),
        ]);

        setBrands(
          Array.isArray(brandsResponse.data) ? brandsResponse.data : []
        );
        setCategories(
          Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []
        );
      } catch (error) {
        console.error("Error fetching brands/categories:", error);
        setError(
          error.response?.data?.message ||
            "Không thể kết nối đến máy chủ để lấy danh mục và thương hiệu"
        );
      }
    };

    // Fetch latest products
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7213/api/public/Product",
          {
            headers: { Accept: "application/json" },
          }
        );

        const allProducts = Array.isArray(response.data) ? response.data : [];
        // Filter products with category_id === 1 and (status === 1 or undefined)
        const newProducts = allProducts.filter(
          (product) =>
            product.category_id === 3 &&
            (product.status === 1 || product.status === undefined)
        );
        // Sort by create_at (newest first)
        const sortedProducts = newProducts.sort(
          (a, b) => new Date(b.create_at) - new Date(a.create_at)
        );
        // Limit to 8 products
        const limitedProducts = sortedProducts.slice(0, 4);
        setProductNew(limitedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          error.response?.data?.message ||
            "Không thể kết nối đến máy chủ để lấy sản phẩm"
        );
      }
    };

    fetchBrandsAndCategories();
    fetchProducts();
  }, []);

  if (error) {
    return (
      <section id="product-new" className="p-3">
        <h2 className="text-center text-info">
          <i className="fas fa-star"></i> ĐỒ NỮ
        </h2>
        <div className="row">
          <div className="col-12 text-center">
            <p className="alert alert-danger">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="product-new" className="p-3">
      <h2 className="text-center text-warning">
        <i className="fas fa-child-dress"></i> ĐỒ NỮ
      </h2>
      <div className="row">
        {productNew.length > 0 ? (
          productNew.map((product) => (
            <div key={product.id} className="col-sm-3 my-2">
              <Link to={`/chi-tiet-san-pham/${product.id}`}>
                <ProductCard
                  productItem={product}
                  brands={brands}
                  categories={categories}
                />
              </Link>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p>Không có sản phẩm mới nào trong danh mục này.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductWoman;
