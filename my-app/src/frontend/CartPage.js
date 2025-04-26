import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '../components/Footer';
import MainMenu from '../components/main-menu';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../css/CartPage.css';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    setIsLoggedIn(!!userToken);

    const fetchCart = async () => {
      if (userToken) {
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
            setLoading(false);
            return;
          }

          // Fetch cart
          const cartResponse = await axios.get(
            `https://localhost:7213/api/public/Cart/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                Accept: 'application/json',
              },
            }
          );

          const backendCart = cartResponse.data;
          setCartId(backendCart.id);

          // Fetch cart items
          const cartItemsResponse = await axios.get(
            'https://localhost:7213/api/public/CartItem',
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                Accept: 'application/json',
              },
            }
          );

          const cartItems = cartItemsResponse.data.filter(
            (item) => item.cart_id === backendCart.id
          );

          // Fetch product details for each cart item
          const cartWithProducts = await Promise.all(
            cartItems.map(async (item) => {
              try {
                const productResponse = await axios.get(
                  `https://localhost:7213/api/public/Product/${item.product_id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${userToken}`,
                      Accept: 'application/json',
                    },
                  }
                );
                const product = productResponse.data;
                return {
                  id: item.product_id,
                  name: product.name || 'Sản phẩm không xác định',
                  price: item.productPrice,
                  image: product.image || 'default.jpg',
                  quantity: item.quantity,
                  cartItemId: item.id,
                };
              } catch (err) {
                console.error(`Lỗi khi lấy sản phẩm ${item.product_id}:`, err);
                return {
                  id: item.product_id,
                  name: 'Sản phẩm không xác định',
                  price: item.productPrice,
                  image: 'default.jpg',
                  quantity: item.quantity,
                  cartItemId: item.id,
                };
              }
            })
          );

          setCart(cartWithProducts);
        } catch (err) {
          console.error('Lỗi khi lấy giỏ hàng:', err);
          setError(err.response?.data?.message || 'Không thể tải giỏ hàng');
          const localCart = JSON.parse(localStorage.getItem('cart')) || [];
          setCart(localCart);
        }
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(localCart);
      }
      setLoading(false);
    };

    fetchCart();
  }, []);

  const updateCart = async (updatedCart) => {
    setCart(updatedCart);
    if (isLoggedIn && cartId) {
      try {
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      } catch (err) {
        console.error('Lỗi khi đồng bộ giỏ hàng:', err);
        setError('Không thể đồng bộ giỏ hàng với server');
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }

    const cartEvent = new CustomEvent('cartUpdated', { detail: updatedCart });
    window.dispatchEvent(cartEvent);
  };

  const increaseQuantity = async (productId, cartItemId) => {
    if (isLoggedIn && cartItemId) {
      try {
        const cartItem = cart.find((item) => item.id === productId);
        await axios.put(
          `https://localhost:7213/api/public/CartItem/${cartItemId}`,
          {
            id: cartItemId,
            cart_id: cartId,
            product_id: productId,
            quantity: cartItem.quantity + 1,
            productPrice: cartItem.price,
            discount: 0,
            totalPrice: cartItem.price * (cartItem.quantity + 1),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'application/json',
            },
          }
        );
      } catch (err) {
        console.error('Lỗi khi tăng số lượng:', err);
        setError(err.response?.data?.message || 'Không thể tăng số lượng sản phẩm');
        return;
      }
    }

    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updatedCart);
  };

  const decreaseQuantity = async (productId, cartItemId) => {
    if (isLoggedIn && cartItemId) {
      const cartItem = cart.find((item) => item.id === productId);
      if (cartItem.quantity <= 1) return;

      try {
        await axios.put(
          `https://localhost:7213/api/public/CartItem/${cartItemId}`,
          {
            id: cartItemId,
            cart_id: cartId,
            product_id: productId,
            quantity: cartItem.quantity - 1,
            productPrice: cartItem.price,
            discount: 0,
            totalPrice: cartItem.price * (cartItem.quantity - 1),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'application/json',
            },
          }
        );
      } catch (err) {
        console.error('Lỗi khi giảm số lượng:', err);
        setError(err.response?.data?.message || 'Không thể giảm số lượng sản phẩm');
        return;
      }
    }

    const updatedCart = cart.map((item) =>
      item.id === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    updateCart(updatedCart);
  };

  const handleQuantityChange = async (productId, value, cartItemId) => {
    const newQuantity = Math.max(1, parseInt(value, 10) || 1);
    if (isLoggedIn && cartItemId) {
      try {
        const cartItem = cart.find((item) => item.id === productId);
        await axios.put(
          `https://localhost:7213/api/public/CartItem/${cartItemId}`,
          {
            id: cartItemId,
            cart_id: cartId,
            product_id: productId,
            quantity: newQuantity,
            productPrice: cartItem.price,
            discount: 0,
            totalPrice: cartItem.price * newQuantity,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'application/json',
            },
          }
        );
      } catch (err) {
        console.error('Lỗi khi thay đổi số lượng:', err);
        setError(err.response?.data?.message || 'Không thể cập nhật số lượng sản phẩm');
        return;
      }
    }

    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const handleRemoveFromCart = async (productId, cartItemId) => {
    if (isLoggedIn && cartItemId) {
      try {
        await axios.delete(`https://localhost:7213/api/public/CartItem/${cartItemId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        });
      } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        setError(err.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
        return;
      }
    }

    const updatedCart = cart.filter((item) => item.id !== productId);
    updateCart(updatedCart);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert('Bạn cần đăng nhập để có thể thanh toán.');
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <h2>Đang tải giỏ hàng...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-4 text-center">
        <p className="alert alert-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="custom-cart-page">
      <MainMenu />
      <div className="container my-4">
        <h1 className="text-center mb-5 text-success">
          Giỏ hàng của bạn <i className="fa-solid fa-cart-shopping"></i>
        </h1>
        <div className="row">
          {cart.length > 0 ? (
            <>
              <div className="col-md-8">
                <div>
                  {cart.map((item) => (
                    <div key={item.id} className="row mb-4 custom-cart-item">
                      <div className="col-md-4">
                        <img
                          src={`https://localhost:7213/images/products/${item.image}`}
                          alt={item.name}
                          className="img-fluid rounded shadow-lg custom-cart-image"
                        />
                      </div>
                      <div className="col-md-8">
                        <h4>{item.name}</h4>
                        <p className="text-red">
                          Giá: {item.price.toLocaleString('vi-VN')} VNĐ
                        </p>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <button
                              className="btn btn-warning custom-quantity-btn"
                              onClick={() => decreaseQuantity(item.id, item.cartItemId)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.id, e.target.value, item.cartItemId)
                              }
                              className="form-control mx-2 custom-quantity-input"
                              style={{ width: '60px' }}
                            />
                            <button
                              className="btn btn-warning custom-quantity-btn"
                              onClick={() => increaseQuantity(item.id, item.cartItemId)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="btn btn-danger custom-remove-btn"
                            onClick={() => handleRemoveFromCart(item.id, item.cartItemId)}
                          >
                            Xóa sản phẩm
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-4">
                <div className="custom-shop-info mb-4">
                  <p className="text-dark">
                    <strong>
                      Cảm ơn bạn đã chọn cửa hàng chúng tôi giữa vô vàn lựa chọn khác – bạn vừa
                      chứng minh mình có gu mua sắm đỉnh cao rồi đấy!
                    </strong>
                  </p>
                </div>
                <h3 className="text-end custom-total-price text-danger">
                  Tổng cộng: {totalPrice.toLocaleString('vi-VN')} VNĐ
                </h3>
                <div className="text-end">
                  <button className="btn btn-success custom-checkout-btn" onClick={handleCheckout}>
                    Thanh toán
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="col-12 text-center custom-empty-cart">
              <h2>Giỏ hàng trống.</h2>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;