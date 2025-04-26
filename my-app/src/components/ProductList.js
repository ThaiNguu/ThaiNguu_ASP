import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import MainMenu from '../components/main-menu';
import Footer from '../components/Footer';
import '../css/ListProduct.css';

const ListProduct = () => {
  const { slug } = useParams(); // Use slug to match route /danh-muc/:slug
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Slug from useParams:', slug); // Debug slug value

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Validate slug as a numeric category_id
      const parsedCategoryId = parseInt(slug);
      if (!slug || isNaN(parsedCategoryId)) {
        setError('Danh mục không hợp lệ. Vui lòng chọn một danh mục hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        // Fetch all products and filter by category_id
        const productResponse = await axios.get('https://localhost:7213/api/public/Product', {
          headers: { Accept: 'application/json' },
        });
        if (Array.isArray(productResponse.data)) {
          const filteredProducts = productResponse.data.filter(
            (product) => product.category_id === parsedCategoryId
          );
          const sortedProducts = filteredProducts.sort(
            (a, b) => new Date(b.create_at) - new Date(a.create_at)
          );
          setProducts(sortedProducts);
        } else {
          throw new Error('Dữ liệu sản phẩm không phải là mảng');
        }

        // Fetch categories
        const categoryResponse = await axios.get('https://localhost:7213/api/public/Category', {
          headers: { Accept: 'application/json' },
        });
        if (Array.isArray(categoryResponse.data)) {
          setCategories(categoryResponse.data);
          const currentCategory = categoryResponse.data.find(
            (cat) => cat.category_id === parsedCategoryId
          );
          setCategoryName(currentCategory ? currentCategory.category_name : 'Danh mục không xác định');
        } else {
          throw new Error('Dữ liệu danh mục không phải là mảng');
        }

        // Fetch brands
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
        if (error.response) {
          console.log('Server responded with:', error.response.status, error.response.data);
          if (error.response.status === 400) {
            setError('Danh mục không hợp lệ hoặc không tồn tại. Vui lòng thử lại.');
          } else {
            setError(`Lỗi server: ${error.response.status}. Vui lòng thử lại sau.`);
          }
        } else if (error.request) {
          console.log('No response received:', error.request);
          console.log('Possible causes: Server not running, incorrect port, CORS, or SSL issues');
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server.');
        } else {
          console.log('Error setting up request:', error.message);
          setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Render flat category list
  const renderCategories = () => {
    return categories.map((category) => (
      <li key={category.category_id} className="list-group-item">
        <div style={{ fontWeight: 'bold' }}>{category.category_name}</div>
        <button
          onClick={() => handleCategoryClick(category.category_id)}
          style={{ marginLeft: '10px', cursor: 'pointer' }}
          className="btn btn-link view-category-button"
        >
          Xem danh mục
        </button>
      </li>
    ));
  };

  // Navigate to category page
  const handleCategoryClick = (categoryId) => {
    navigate(`/danh-muc/${categoryId}`);
  };

  // Pagination logic
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
        <p>Đang tải...</p>
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
    <div className="list-product">
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

          <div className="col-md-9 product-column">
            <h1 className="category-title">{categoryName}</h1>
            {products.length === 0 ? (
              <p className="no-products">Không có sản phẩm nào</p>
            ) : (
              <div className="row">
                {currentProducts.map((product) => (
                  <div key={product.id} className="col-md-4 mb-4">
                    <ProductCard
                      productItem={product}
                      brands={brands}
                      categories={categories}
                    />
                  </div>
                ))}
                <div className="pagination d-flex justify-content-center mt-4">
                  <button
                    className="btn btn-primary me-2"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="align-self-center">
                    Page {currentPage} of {pageCount}
                  </span>
                  <button
                    className="btn btn-primary ms-2"
                    onClick={handleNextPage}
                    disabled={currentPage === pageCount}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ListProduct;