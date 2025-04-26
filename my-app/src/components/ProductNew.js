import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

const ProductNew = () => {
  const [productNew, setProductNew] = useState([]);
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
        console.error("Error fetching brands/categories:", error);
        setError(error.response?.data?.message || "Không thể kết nối đến máy chủ để lấy danh mục và thương hiệu");
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://localhost:7213/api/public/Product", {
          headers: { Accept: "application/json" },
        });

        const allProducts = Array.isArray(response.data) ? response.data : [];
        const newProducts = allProducts.filter(
          (product) => product.category_id === 1 && (product.status === 1 || product.status === undefined)
        );
        const sortedProducts = newProducts.sort(
          (a, b) => new Date(b.create_at) - new Date(a.create_at)
        );
        const limitedProducts = sortedProducts.slice(0, 4);
        setProductNew(limitedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.response?.data?.message || "Không thể kết nối đến máy chủ để lấy sản phẩm");
      }
    };

    fetchBrandsAndCategories();
    fetchProducts();
  }, []);

  if (error) {
    return (
      <section id="product-new" style={{ backgroundColor: "#f5f5f5", padding: "2rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 className="text-center mb-4" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "#1a1a1a" }}>
            <i className="fas fa-child-reaching me-2"></i> ĐỒ NAM
          </h2>
          <div className="row">
            <div className="col-12 text-center">
              <p className="alert alert-danger">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="product-new"
      style={{
        backgroundColor: "#fafafa",
        fontFamily: "'Poppins', sans-serif",
        padding: "0rem 0",
        width: "100%",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1rem" }}>
        <h2
          className="text-center mb-4"
          style={{
            color: "#1a1a1a",
            fontWeight: 800,
            fontSize: "2.5rem",
            letterSpacing: "1.5px",
            position: "relative",
            display: "inline-block",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          <i className="fas fa-child-reaching me-2"></i> ĐỒ NAM
          <div
            style={{
              position: "absolute",
              bottom: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "4px",
              background: "linear-gradient(90deg, #1a1a1a, transparent)",
              borderRadius: "2px",
            }}
          />
        </h2>

        {productNew.length > 0 ? (
          <div className="row align-items-start">
            {/* Featured Product (Third Product) with Content on the Right */}
            <div className="col-md-6 mb-4">
              <div
                className="featured-product"
                style={{
                  background: "linear-gradient(135deg, #f7f7f7, #ffffff)",
                  borderRadius: "20px",
                  padding: "2rem",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.07)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.5s ease, box-shadow 0.5s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.07)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(45deg, rgba(255, 77, 79, 0.05), transparent)",
                    zIndex: 0,
                  }}
                />
                <div style={{ flex: "0 0 60%", zIndex: 1 }}>
                  <Link to={`/chi-tiet-san-pham/${productNew[2]?.id}`}>
                    <ProductCard
                      productItem={productNew[2]}
                      brands={brands}
                      categories={categories}
                      isFeatured={true}
                      style={{
                        width: "100%",
                        height: "300px",
                        transform: "rotate(-2deg)",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(0deg) scale(1.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(-2deg) scale(1)")}
                    />
                  </Link>
                </div>
                <div
                  className="featured-content"
                  style={{
                    flex: "1",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#1a1a1a",
                      marginBottom: "0.5rem",
                      fontFamily: "'Montserrat', sans-serif",
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                   
                  </h3>
                  <p
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "#ff4d4f",
                      marginBottom: "0.5rem",
                    }}
                  >
                   
                  </p>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      lineHeight: 1.5,
                      marginBottom: "1rem",
                    }}
                  >
                    A stylish polo shirt that blends comfort and elegance for every occasion.
                  </p>
                  <Link
                    to={`/chi-tiet-san-pham/${productNew[2]?.id}`}
                    style={{
                      color: "#ff4d4f",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      transition: "all 0.4s ease",
                      display: "inline-block",
                      padding: "0.5rem 1.2rem",
                      border: "2px solid #ff4d4f",
                      borderRadius: "25px",
                      backgroundColor: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.backgroundColor = "#ff4d4f";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#ff4d4f";
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            </div>

            {/* Smaller Product Cards with Text Content in Between */}
            <div className="col-md-6">
              <div className="row align-items-center">
                {/* First Smaller Card */}
                <div className="col-4 mb-3">
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "12px",
                      padding: "1rem",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "transform 0.4s ease, box-shadow 0.4s ease",
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
                    <div
                      style={{
                        position: "absolute",
                        top: "0.8rem",
                        left: "0.8rem",
                        backgroundColor: "#f5c518",
                        color: "#fff",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.3rem 0.7rem",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        zIndex: 1,
                      }}
                    >
                      New
                    </div>
                    <Link to={`/chi-tiet-san-pham/${productNew[0]?.id}`}>
                      <ProductCard
                        productItem={productNew[0]}
                        brands={brands}
                        categories={categories}
                        isFeatured={false}
                        style={{ width: "100%", height: "180px" }}
                      />
                    </Link>
                    <div className="text-center mt-2">
                      <p
                        style={{
                          color: "#ff4d4f",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          marginBottom: "0.4rem",
                        }}
                      >
                        
                      </p>
                    </div>
                  </div>
                </div>

                {/* Text Content Between Second and Third Cards */}
                <div className="col-4 mb-3 d-flex align-items-center justify-content-center">
                  <div
                    className="text-content"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      background: "linear-gradient(135deg, #f7f7f7, #ffffff)",
                      borderRadius: "12px",
                      padding: "1rem",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
                      transition: "transform 0.4s ease, box-shadow 0.4s ease",
                      height: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.8rem" }}>
                      <div style={{ width: "25px", height: "3px", backgroundColor: "#f5c518", marginRight: "0.6rem" }}></div>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#1a1a1a",
                          letterSpacing: "1px",
                          fontFamily: "'Montserrat', sans-serif",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4d4f")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#1a1a1a")}
                      >
                        FM Style
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: "#1a1a1a",
                        lineHeight: 1.3,
                        marginBottom: "0.8rem",
                        fontFamily: "'Montserrat', sans-serif",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      New Polo With Fm
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                        maxWidth: "90%",
                      }}
                    >
                      Elevate your style with a touch of sophistication in our men’s Polo shirts.
                    </p>
                    <Link
                      to="/collections"
                      style={{
                        color: "#ff4d4f",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "all 0.4s ease",
                        display: "inline-block",
                        padding: "0.5rem 1.2rem",
                        border: "2px solid #ff4d4f",
                        borderRadius: "25px",
                        backgroundColor: "transparent",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.backgroundColor = "#ff4d4f";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#ff4d4f";
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      Xem ngay BỘ SƯU TẬP →
                    </Link>
                  </div>
                </div>

                {/* Third Smaller Card */}
                <div className="col-4 mb-3">
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "12px",
                      padding: "1rem",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "transform 0.4s ease, box-shadow 0.4s ease",
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
                    <div
                      style={{
                        position: "absolute",
                        top: "0.8rem",
                        left: "0.8rem",
                        backgroundColor: "#f5c518",
                        color: "#fff",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.3rem 0.7rem",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        zIndex: 1,
                      }}
                    >
                      New
                    </div>
                    <Link to={`/chi-tiet-san-pham/${productNew[1]?.id}`}>
                      <ProductCard
                        productItem={productNew[1]}
                        brands={brands}
                        categories={categories}
                        isFeatured={false}
                        style={{ width: "100%", height: "180px" }}
                      />
                    </Link>
                    <div className="text-center mt-2">
                      <p
                        style={{
                          color: "#ff4d4f",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          marginBottom: "0.4rem",
                        }}
                      >
                        
                      </p>
                    </div>
                  </div>
                </div>
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
              Không có sản phẩm mới nào trong danh mục này.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductNew;