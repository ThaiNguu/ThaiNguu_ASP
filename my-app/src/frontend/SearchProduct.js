import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import MainMenu from "../components/main-menu";
import Footer from "../components/Footer";
// Optional: Create this for custom styling

const SearchProduct = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query")?.trim() || "";

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 8;

  useEffect(() => {
    console.log("Search query:", query); // Debug query value

    const fetchData = async () => {
      setLoading(true);
      setError("");
      setProducts([]);

      if (!query) {
        setError("Vui lòng nhập từ khóa tìm kiếm.");
        setLoading(false);
        return;
      }

      try {
        // Fetch brands and categories
        const [brandsResponse, categoriesResponse, productsResponse] =
          await Promise.all([
            axios.get("https://localhost:7213/api/public/Brand", {
              headers: { Accept: "application/json" },
            }),
            axios.get("https://localhost:7213/api/public/Category", {
              headers: { Accept: "application/json" },
            }),
            axios.get("https://localhost:7213/api/public/Product", {
              headers: { Accept: "application/json" },
            }),
          ]);

        // Set brands
        if (Array.isArray(brandsResponse.data)) {
          setBrands(brandsResponse.data);
        } else {
          throw new Error("Dữ liệu thương hiệu không phải là mảng");
        }

        // Set categories
        if (Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else {
          throw new Error("Dữ liệu danh mục không phải là mảng");
        }

        // Filter products by query
        if (Array.isArray(productsResponse.data)) {
          const filteredProducts = productsResponse.data
            .filter(
              (product) =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description?.toLowerCase().includes(query.toLowerCase())
            )
            .sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
          setProducts(filteredProducts);
          setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
        } else {
          throw new Error("Dữ liệu sản phẩm không phải là mảng");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        if (error.response) {
          console.log(
            "Server responded with:",
            error.response.status,
            error.response.data
          );
          setError(
            `Lỗi server: ${error.response.status}. Vui lòng thử lại sau.`
          );
        } else if (error.request) {
          console.log("No response received:", error.request);
          setError(
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server."
          );
        } else {
          console.log("Error setting up request:", error.message);
          setError(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <MainMenu />
      <div className="mt-4 px-3">
        <h1 className="mb-4">
          Kết quả tìm kiếm: {query || "Không có từ khóa"}
        </h1>
        {loading && <p>Đang tải...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && (
          <div className="row gx-3">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <div className="col-6 col-md-4 col-lg-3 mb-4" key={product.id}>
                  <ProductCard
                    productItem={product}
                    brands={brands}
                    categories={categories}
                  />
                </div>
              ))
            ) : (
              <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}".</p>
            )}
          </div>
        )}
        {!loading && paginatedProducts.length > 0 && (
          <div className="pagination mt-4 d-flex justify-content-center">
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span className="align-self-center">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="btn btn-outline-primary ms-2"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchProduct;
