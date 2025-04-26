import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

const ProductSale = () => {
  const [productSale, setProductSale] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
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

        setBrands(Array.isArray(brandsResponse.data) ? brandsResponse.data : []);
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu brands/categories:", error);
        const errorMessage =
          error.response?.data?.message ||
          `Lỗi khi lấy dữ liệu brands/categories: ${error.message}`;
        setError(errorMessage);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://localhost:7213/api/public/Product", {
          headers: { Accept: "application/json" },
        });

        const allProducts = response.data;
        const sortedProducts = allProducts.sort(
          (a, b) => new Date(b.create_at) - new Date(a.create_at)
        );
        const latestProducts = sortedProducts.slice(0, 4);
        setProductSale(latestProducts);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
        const errorMessage =
          error.response?.data?.message ||
          `Lỗi khi lấy dữ liệu sản phẩm: ${error.message}`;
        setError(errorMessage);
      }
    };

    fetchBrandsAndCategories();
    fetchProducts();
  }, []);

  if (error) {
    return (
      <section id="product-sale" style={{ backgroundColor: "#f5f5f5", padding: "2rem 0" }}>
        <h2 className="text-center text-danger mb-5" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "2.5rem" }}>
          <i className="fas fa-bolt me-2"></i> SẢN PHẨM HOT
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
    <section
      id="product-sale"
      style={{
        backgroundColor: "#fafafa",
        fontFamily: "'Poppins', sans-serif",
        padding: "2rem 0",
        width: "100%",
      }}
    >
      <h2
        className="text-center mb-5"
        style={{
          color: "#ff4d4f",
          fontWeight: 700,
          fontSize: "2.5rem",
          letterSpacing: "1px",
          position: "relative",
          display: "inline-block",
        }}
      >
        <i className="fas fa-bolt me-2"></i> SẢN PHẨM HOT
        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "50%",
            height: "4px",
            background: "linear-gradient(90deg, #ff4d4f, transparent)",
            borderRadius: "2px",
          }}
        />
      </h2>

      {productSale.length > 0 ? (
        <div className="row align-items-start m-0">
          {/* Featured Product (Left Side - Article Style) */}
          <div className="col-md-6 mb-4 px-4">
            <div className="featured-product d-flex align-items-center">
              <div style={{ flex: "0 0 50%", marginRight: "2rem" }}>
                <Link to={`/chi-tiet-san-pham/${productSale[0].id}`}>
                  <ProductCard
                    productItem={productSale[0]}
                    brands={brands}
                    categories={categories}
                    isFeatured={true}
                    style={{ width: "100%", height: "350px" }} // Consistent height
                  />
                </Link>
              </div>
              <div className="text-content" style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#333",
                    lineHeight: 1.2,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "1rem",
                  }}
                >
                  SIMPLE but CLASSY
                </h3>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#555",
                    lineHeight: 1.6,
                    marginBottom: "1.5rem",
                  }}
                >
                  Simple but Classy. Thời trang đơn giản nhưng quý phái, kết hợp giữa thiết kế tối giản và sự tinh tế hiện đại, mang lại vẻ đẹp thanh lịch và đầy phong cách...
                </p>
                <Link
                  to="/collections"
                  style={{
                    color: "#ff4d4f",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    transition: "color 0.3s ease",
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                    border: "2px solid #ff4d4f",
                    borderRadius: "25px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.backgroundColor = "#ff4d4f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#ff4d4f";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Xem thêm chi tiết →
                </Link>
              </div>
            </div>
          </div>

          {/* Smaller Product Cards (Right Side) */}
          <div className="col-md-6 px-4">
            <div className="row">
              {productSale.slice(1, 4).map((productItem) => (
                <div key={productItem.id} className="col-4 mb-4">
                  <div
                    style={{
                      background: "linear-gradient(135deg, #ffffff, #f9f9f9)",
                      borderRadius: "15px",
                      padding: "1rem",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
                    }}
                  >
                    {/* Discount Badge (if applicable) */}
                    {productItem.price > 100000 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0.8rem",
                          right: "0.8rem",
                          backgroundColor: "#ff4d4f",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.3rem 0.8rem",
                          borderRadius: "12px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        -{Math.round((100000 / productItem.price) * 100)}%
                      </div>
                    )}
                    <Link to={`/chi-tiet-san-pham/${productItem.id}`}>
                      <ProductCard
                        productItem={productItem}
                        brands={brands}
                        categories={categories}
                        isFeatured={false}
                        style={{ width: "100%", height: "200px" }} // Consistent height
                      />
                    </Link>
                    <div className="text-center mt-3">
                      <p
                        style={{
                          color: "#ff4d4f",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="col-12 text-center">
          <p
            style={{
              color: "#666",
              fontSize: "1.1rem",
              fontStyle: "italic",
            }}
          >
            Không có sản phẩm nào trong chương trình khuyến mãi.
          </p>
        </div>
      )}
    </section>
  );
};

export default ProductSale;