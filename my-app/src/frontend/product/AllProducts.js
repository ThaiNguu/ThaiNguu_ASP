import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import MainMenu from '../../components/main-menu';
import Footer from '../../components/Footer';
import '../../css/AllProduct.css';
import '../../css/phantrang.css';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API sản phẩm
        const productResponse = await axios.get('https://localhost:7213/api/public/Product', {
          headers: { Accept: 'application/json' },
        });
        if (Array.isArray(productResponse.data)) {
          const sortedProducts = productResponse.data.sort(
            (a, b) => new Date(b.create_at) - new Date(a.create_at)
          );
          setProducts(sortedProducts);
        } else {
          throw new Error('Dữ liệu sản phẩm không phải là mảng');
        }

        // Gọi API danh mục
        const categoryResponse = await axios.get('https://localhost:7213/api/public/Category', {
          headers: { Accept: 'application/json' },
        });
        if (Array.isArray(categoryResponse.data)) {
          setCategories(categoryResponse.data);
        } else {
          throw new Error('Dữ liệu danh mục không phải là mảng');
        }

        // Gọi API thương hiệu
        const brandResponse = await axios.get('https://localhost:7213/api/public/Brand', {
          headers: { Accept: 'application/json' },
        });
        if (Array.isArray(brandResponse.data)) {
          setBrands(brandResponse.data);
        } else {
          throw new Error('Dữ liệu thương hiệu không phải là mảng');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError(error.message || 'Không thể tải dữ liệu sản phẩm, danh mục hoặc thương hiệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Điều hướng đến trang danh mục
  const handleCategoryClick = (categoryId) => {
    navigate(`/danh-muc/${categoryId}`);
  };

  // Hiển thị danh mục như danh sách đơn giản
  const renderCategories = () => {
    return categories.map((category) => (
      <li key={category.category_id} className="list-group-item">
        <div style={{ fontWeight: 'bold' }}>{category.category_name}</div>
        <button
          onClick={() => handleCategoryClick(category.category_id)}
          style={{ marginLeft: '10px', cursor: 'pointer' }}
          className="btn btn-link"
        >
          Xem danh mục
        </button>
      </li>
    ));
  };

  // Tính toán phân trang
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const pageCount = Math.ceil(products.length / productsPerPage);

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid mt-5">
        <p className="alert alert-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="product">
      <MainMenu />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 category-column">
            <h2>Danh mục</h2>
            <ul className="list-group">
              {categories.length === 0 ? (
                <li className="list-group-item">Không có danh mục nào</li>
              ) : (
                renderCategories()
              )}
            </ul>
          </div>

          <div className="col-md-9">
            <h1>Tất cả sản phẩm</h1>
            <div className="row">
              {currentProducts.length === 0 ? (
                <p>Không có sản phẩm nào</p>
              ) : (
                currentProducts.map((product) => (
                  <div key={product.id} className="col-md-4 mb-3">
                    <ProductCard
                      productItem={product}
                      brands={brands}
                      categories={categories}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Phân trang */}
            <div className="pagination d-flex justify-content-center mt-4">
              <button
                className="btn btn-primary me-2"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="align-self-center">Page {currentPage} of {pageCount}</span>
              <button
                className="btn btn-primary ms-2"
                onClick={handleNextPage}
                disabled={currentPage === pageCount}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProducts;