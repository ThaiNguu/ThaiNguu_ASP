import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import usePagination from "../usePagination";
import "../../css/pagination.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get(
          "https://localhost:7213/api/public/Product"
        );
        const productData = productResponse.data;

        const brandResponse = await axios.get(
          "https://localhost:7213/api/public/Brand"
        );
        const brandData = brandResponse.data;

        const categoryResponse = await axios.get(
          "https://localhost:7213/api/public/Category"
        );
        const categoryData = categoryResponse.data;

        if (Array.isArray(productData)) {
          const sortedProducts = productData.sort(
            (a, b) => new Date(b.create_at) - new Date(a.create_at)
          );
          setProducts(sortedProducts);
          setFilteredProducts(sortedProducts);
          console.log("Danh sách sản phẩm:", sortedProducts);
        } else {
          setError("Dữ liệu sản phẩm trả về không phải là mảng");
        }

        if (Array.isArray(brandData)) {
          setBrands(brandData);
          console.log("Danh sách thương hiệu:", brandData);
        } else {
          setError("Dữ liệu thương hiệu trả về không phải là mảng");
        }

        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
          console.log("Danh sách danh mục:", categoryData);
        } else {
          setError("Dữ liệu danh mục trả về không phải là mảng");
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Lỗi khi lấy dữ liệu: " + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission (Enter key or button click)
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent page reload
    const term = searchTerm.trim();
    if (term === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  // Clear search and reset product list
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredProducts(products);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để xóa sản phẩm");
        return;
      }

      await axios.delete(`https://localhost:7213/api/public/Product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );
      setFilteredProducts((prevFiltered) =>
        prevFiltered.filter((product) => product.id !== id)
      );
      setSuccessMessage("Xóa sản phẩm thành công!");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi xóa sản phẩm: " + error.message;
      setError(errorMessage);
    }
  };

  const getBrandName = (brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand ? brand.name : "Không xác định";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.category_id === categoryId);
    return category ? category.category_name : "Không xác định";
  };

  const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } =
    usePagination(filteredProducts, itemsPerPage);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý sản phẩm</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Quản lý sản phẩm</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-md-6">
                <form onSubmit={handleSearch} className="form-inline">
                  <input
                    type="text"
                    className="form-control mr-2"
                    placeholder="Tìm kiếm sản phẩm theo tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary mr-2">
                    Tìm
                  </button>
                  {searchTerm && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleClearSearch}
                    >
                      Xóa
                    </button>
                  )}
                </form>
              </div>
              <div className="col-md-6 text-right">
                <Link
                  to="/admin/product/new"
                  className="btn btn-sm btn-success"
                >
                  <i className="fas fa-plus"></i> Thêm sản phẩm
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            {successMessage && (
              <p className="alert alert-success">{successMessage}</p>
            )}
            {filteredProducts.length === 0 ? (
              <p>Không có sản phẩm nào để hiển thị</p>
            ) : (
              <>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: "30px" }}>
                        <input type="checkbox" />
                      </th>
                      <th className="text-center" style={{ width: "30px" }}>
                        ID
                      </th>
                      <th className="text-center" style={{ width: "130px" }}>
                        Hình ảnh
                      </th>
                      <th className="text-center" style={{ width: "300px" }}>
                        Tên sản phẩm
                      </th>
                      <th className="text-center" style={{ width: "150px" }}>
                        Danh mục
                      </th>
                      <th className="text-center" style={{ width: "150px" }}>
                        Thương hiệu
                      </th>
                      <th className="text-center" style={{ width: "150px" }}>
                        Giá
                      </th>
                      <th className="text-center" style={{ width: "200px" }}>
                        Chức năng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData().map((product) => (
                      <tr key={product.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>{product.id}</td>
                        <td className="text-center">
                          <img
                            src={`https://localhost:7213/images/products/${product.image}`}
                            alt={product.name}
                            style={{ width: "100px" }}
                            onError={(e) =>
                              (e.target.src = "/images/fallback.jpg")
                            }
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>{getCategoryName(product.category_id)}</td>
                        <td>{getBrandName(product.brand_id)}</td>
                        <td>{product.price}</td>
                        <td className="text-center">
                          <Link
                            to={`/admin/product/edit/${product.id}`}
                            className="btn btn-primary"
                            style={{ width: "40px" }}
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link
                            to={`/admin/product/show/${product.id}`}
                            className="btn btn-info"
                            style={{ width: "40px" }}
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn btn-danger"
                            style={{ width: "40px" }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination-controls">
                  <button onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => goToPage(i + 1)}
                      className={currentPage === i + 1 ? "active" : ""}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductList;
