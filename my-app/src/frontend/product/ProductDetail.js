import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '../../components/Footer';
import MainMenu from '../../components/main-menu';
import ProductCard from '../../components/ProductCard';
import '../../css/productdetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    setIsLoggedIn(!!userToken);

    const fetchBrandsAndCategories = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          axios.get('https://localhost:7213/api/public/Brand', {
            headers: { Accept: 'application/json' },
          }),
          axios.get('https://localhost:7213/api/public/Category', {
            headers: { Accept: 'application/json' },
          }),
        ]);

        setBrands(Array.isArray(brandsResponse.data) ? brandsResponse.data : []);
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu brands/categories:', error);
        setError(error.response?.data?.message || 'Không thể tải danh mục và thương hiệu');
      }
    };

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`https://localhost:7213/api/public/Product/${id}`, {
          headers: { Accept: 'application/json' },
        });
        console.log('Product response:', response.data);
        if (response.data.id) {
          setProduct(response.data);
          fetchRelatedProducts(response.data.category_id);
        } else {
          setError('Sản phẩm không tồn tại');
        }
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        setError(error.response?.data?.message || `Lỗi khi tải dữ liệu sản phẩm: ${error.message}`);
      }
    };

    const fetchRelatedProducts = async (categoryId) => {
      try {
        const response = await axios.get(
          `https://localhost:7213/api/public/Product/category/${categoryId}`,
          {
            headers: { Accept: 'application/json' },
          }
        );
        console.log('Related products response:', response.data);
        const filteredProducts = response.data
          .filter((item) => item.id !== parseInt(id))
          .slice(0, 4);
        setRelatedProducts(filteredProducts);
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm liên quan:', error);
        setError(error.response?.data?.message || 'Lỗi khi tải sản phẩm liên quan');
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchBrandsAndCategories(), fetchProduct()]);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Không xác định';
  };

  const getBrandName = (brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand ? brand.name : 'Không xác định';
  };

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const userToken = localStorage.getItem('token');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (isLoggedIn && userToken) {
      try {
        // Decode token to get user_id
        let userId;
        try {
          const decodedToken = jwtDecode(userToken);
          userId = decodedToken.sub || decodedToken.id || decodedToken.userId;
          if (!userId) {
            throw new Error('Không tìm thấy user_id trong token');
          }
        } catch (err) {
          console.error('Lỗi khi giải mã token:', err);
          setError('Token không hợp lệ. Vui lòng đăng nhập lại.');
          return;
        }

        // Fetch or create cart
        let cartId;
        try {
          const cartResponse = await axios.get(
            `https://localhost:7213/api/public/Cart/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                Accept: 'application/json',
              },
            }
          );
          cartId = cartResponse.data.id;
        } catch (err) {
          if (err.response?.status === 404) {
            // Create new cart if not found
            const cartResponse = await axios.post(
              'https://localhost:7213/api/public/Cart',
              {
                userId: userId,
                totalPrice: 0,
              },
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
              }
            );
            cartId = cartResponse.data.id;
          } else {
            throw err;
          }
        }

        // Check if product already exists in cart
        const cartItemsResponse = await axios.get(
          `https://localhost:7213/api/public/CartItem`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              Accept: 'application/json',
            },
          }
        );
        const existingCartItem = cartItemsResponse.data.find(
          (item) => item.cart_id === cartId && item.product_id === product.id
        );

        if (existingCartItem) {
          // Update existing cart item
          await axios.put(
            `https://localhost:7213/api/public/CartItem/${existingCartItem.id}`,
            {
              id: existingCartItem.id,
              cart_id: cartId,
              product_id: product.id,
              quantity: existingCartItem.quantity + quantity,
              productPrice: product.price,
              discount: 0,
              totalPrice: product.price * (existingCartItem.quantity + quantity),
            },
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          );
        } else {
          // Add new cart item
          await axios.post(
            'https://localhost:7213/api/public/CartItem',
            {
              cart_id: cartId,
              product_id: product.id,
              quantity: quantity,
              productPrice: product.price,
              discount: 0,
              totalPrice: product.price * quantity,
            },
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          );
        }

        // Update localStorage to reflect backend changes
        const updatedCartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: existingCartItem
            ? existingCartItem.quantity + quantity
            : quantity,
        };
        const existingProductIndex = cart.findIndex((item) => item.id === product.id);
        if (existingProductIndex >= 0) {
          cart[existingProductIndex].quantity += quantity;
        } else {
          cart.push(updatedCartItem);
        }
      } catch (err) {
        console.error('Lỗi khi thêm vào giỏ hàng:', err);
        setError(err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        return;
      }
    } else {
      // Handle non-logged-in users (localStorage only)
      const existingProductIndex = cart.findIndex((item) => item.id === product.id);
      if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += quantity;
      } else {
        const productToAdd = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
        };
        cart.push(productToAdd);
      }
    }

    // Save to localStorage and dispatch event
    localStorage.setItem('cart', JSON.stringify(cart));
    const event = new CustomEvent('cartUpdated', { detail: cart });
    window.dispatchEvent(event);

    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    alert(`Bạn đã mua ${quantity} sản phẩm!`);
  };

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="loading-placeholder">
              <div className="loading-img" />
              <div className="loading-text" />
              <div className="loading-text short" />
              <div className="loading-text" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="alert alert-danger text-center">{error}</p>;
  }

  if (!product) {
    return <div className="text-center">Sản phẩm không tồn tại</div>;
  }

  return (
    <div className="product-detail-container">
      <MainMenu />
      <div className="container my-4">
        <h1 className="my-4 text-center">{product.name}</h1>
        <div className="row">
          <div className="col-md-6">
            <img
              src={`https://localhost:7213/images/products/${product.image}`}
              alt={product.name}
              className="img-fluid rounded shadow-lg"
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div className="col-md-6">
            <h2 className="mt-3">{product.name}</h2>
            <p className="text-muted">{product.description}</p>
            <p><strong>Giá: </strong>{product.price.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Thương hiệu: </strong>{getBrandName(product.brand_id)}</p>
            <p><strong>Ngày tạo: </strong>{new Date(product.create_at).toLocaleDateString('vi-VN')}</p>
            <p><strong>Ngày cập nhật: </strong>{new Date(product.update_at).toLocaleDateString('vi-VN')}</p>
            <div className="d-flex align-items-center mb-3 quantity-control">
              <button className="btn btn-warning" onClick={decreaseQuantity}>
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value));
                  setQuantity(value);
                }}
                className="form-control mx-2"
                style={{ width: '60px' }}
              />
              <button className="btn btn-warning" onClick={increaseQuantity}>
                +
              </button>
            </div>
            <div>
              <button className="btn btn-warning me-2" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
              <button className="btn btn-success" onClick={handleBuyNow}>
                Mua ngay
              </button>
            </div>
          </div>
        </div>
        <h3 className="mt-4">Sản phẩm liên quan</h3>
        <div className="row">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="col-md-3 mb-4">
                <Link to={`/chi-tiet-san-pham/${relatedProduct.id}`}>
                  <ProductCard
                    productItem={relatedProduct}
                    brands={brands}
                    categories={categories}
                  />
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">Không có sản phẩm liên quan.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;

/* Custom CSS for loading placeholders */
const styles = `
.loading-placeholder {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.loading-img {
  width: 100%;
  height: 400px;
  background-color: #f0f0f0;
}
.loading-text {
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 4px;
}
.loading-text.short {
  width: 50%;
}
`;

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);