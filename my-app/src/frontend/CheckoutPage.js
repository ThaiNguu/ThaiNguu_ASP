import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import MainMenu from "../components/main-menu";
import Footer from "../components/Footer";
import "../css/CheckoutPage.css";
import { PayPalButton } from "react-paypal-button-v2";

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    delivery_name: "",
    delivery_email: "",
    delivery_phone: "",
    delivery_address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("1"); // 1: Cash, 3: PayPal
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const exchangeRate = 24000;

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    const currentUser = JSON.parse(localStorage.getItem("user"));

    setCartItems(items);
    setUser(currentUser);

    if (currentUser) {
      setFormData({
        delivery_name: currentUser.fullName || "",
        delivery_email: currentUser.email || "",
        delivery_phone: currentUser.phone || "",
        delivery_address: "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra điều kiện
    if (!user?.id) {
      setErrorMessage("Vui lòng đăng nhập để thanh toán.");
      return;
    }

    if (!formData.delivery_address.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    if (!cartItems.length) {
      setErrorMessage("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
      return;
    }

    for (const item of cartItems) {
      if (!item.id || item.quantity <= 0 || item.price < 0) {
        setErrorMessage("Dữ liệu giỏ hàng không hợp lệ (ID, số lượng, hoặc giá).");
        return;
      }
    }

    const token = localStorage.getItem("token");
    let userId;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.sub || decodedToken.id || decodedToken.userId;
      if (!userId) throw new Error("userId không tìm thấy trong token");
    } catch (err) {
      setErrorMessage("Token không hợp lệ. Vui lòng đăng nhập lại.");
      console.error("Token error:", err);
      return;
    }

    const totalAmount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const orderData = {
      id: 0,
      payment_id: parseInt(paymentMethod),
      user_id: userId,
      orderDate: new Date().toISOString(),
      totalAmount: totalAmount,
      status: "pending",
      delivery_address: formData.delivery_address,
      create_at: new Date().toISOString(),
      create_by: "system",
      update_at: null,
      update_by: "",
      delete_at: null,
      delete_by: "",
      orderDetails: cartItems.map((item) => ({
        id: 0,
        order_id: 0,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      // Gửi đơn hàng
      const response = await axios.post(
        "https://localhost:7213/api/public/Order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
        }
      );
      console.log("Đơn hàng đã được gửi thành công:", response.data);

      // Xóa giỏ hàng trong backend
      try {
        const cartResponse = await axios.get(
          `https://localhost:7213/api/public/Cart/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const cartId = cartResponse.data.id;

        // Lấy tất cả CartItem
        const cartItemsResponse = await axios.get(
          "https://localhost:7213/api/public/CartItem",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const cartItems = cartItemsResponse.data.filter(
          (item) => item.cart_id === cartId
        );

        // Xóa từng CartItem
        await Promise.all(
          cartItems.map((item) =>
            axios.delete(
              `https://localhost:7213/api/public/CartItem/${item.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            )
          )
        );
        console.log("Đã xóa tất cả sản phẩm trong giỏ hàng trong backend");
      } catch (err) {
        console.error("Lỗi khi xóa giỏ hàng trong backend:", err);
        setErrorMessage("Không thể xóa giỏ hàng trong backend. Vui lòng thử lại.");
        return;
      }

      // Xóa giỏ hàng trong localStorage
      localStorage.removeItem("cart");
      const event = new CustomEvent("cartUpdated", { detail: [] });
      window.dispatchEvent(event);

      setIsSuccess(true);
      setErrorMessage("");
    } catch (error) {
      console.error("Lỗi khi gửi đơn hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        payload: orderData,
      });
      setErrorMessage(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại."
      );
    }
  };

  const handlePayPalSuccess = async (details, data) => {
    if (!user?.id) {
      setErrorMessage("Vui lòng đăng nhập để thanh toán.");
      return;
    }

    if (!formData.delivery_address.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    if (!cartItems.length) {
      setErrorMessage("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
      return;
    }

    for (const item of cartItems) {
      if (!item.id || item.quantity <= 0 || item.price < 0) {
        setErrorMessage("Dữ liệu giỏ hàng không hợp lệ (ID, số lượng, hoặc giá).");
        return;
      }
    }

    const token = localStorage.getItem("token");
    let userId;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.sub || decodedToken.id || decodedToken.userId;
      if (!userId) throw new Error("userId không tìm thấy trong token");
    } catch (err) {
      setErrorMessage("Token không hợp lệ. Vui lòng đăng nhập lại.");
      console.error("Token error:", err);
      return;
    }

    const totalAmount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const orderData = {
      id: 0,
      payment_id: 3, // PayPal
      user_id: userId,
      orderDate: new Date().toISOString(),
      totalAmount: totalAmount,
      status: "pending",
      delivery_address: formData.delivery_address,
      create_at: new Date().toISOString(),
      create_by: "system",
      update_at: null,
      update_by: "",
      delete_at: null,
      delete_by: "",
      orderDetails: cartItems.map((item) => ({
        id: 0,
        order_id: 0,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      // Gửi đơn hàng
      const response = await axios.post(
        "https://localhost:7213/api/public/Order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
        }
      );
      console.log("Đơn hàng đã được gửi thành công qua PayPal:", response.data);

      // Xóa giỏ hàng trong backend
      try {
        const cartResponse = await axios.get(
          `https://localhost:7213/api/public/Cart/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const cartId = cartResponse.data.id;

        // Lấy tất cả CartItem
        const cartItemsResponse = await axios.get(
          "https://localhost:7213/api/public/CartItem",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const cartItems = cartItemsResponse.data.filter(
          (item) => item.cart_id === cartId
        );

        // Xóa từng CartItem
        await Promise.all(
          cartItems.map((item) =>
            axios.delete(
              `https://localhost:7213/api/public/CartItem/${item.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            )
          )
        );
        console.log("Đã xóa tất cả sản phẩm trong giỏ hàng trong backend");
      } catch (err) {
        console.error("Lỗi khi xóa giỏ hàng trong backend:", err);
        setErrorMessage("Không thể xóa giỏ hàng trong backend. Vui lòng thử lại.");
        return;
      }

      // Phát âm thanh
      const sound = new Audio("/sound/success-sound.mp3");
      sound.play();

      // Xóa giỏ hàng trong localStorage
      localStorage.removeItem("cart");
      const event = new CustomEvent("cartUpdated", { detail: [] });
      window.dispatchEvent(event);

      setIsSuccess(true);
      setErrorMessage("");
    } catch (error) {
      console.error("Lỗi khi gửi đơn hàng qua PayPal:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        payload: orderData,
      });
      setErrorMessage(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi thanh toán qua PayPal. Vui lòng thử lại."
      );
    }
  };

  const handlePayPalError = (error) => {
    console.error("Lỗi thanh toán PayPal:", error);
    setErrorMessage(
      "Có lỗi xảy ra trong quá trình thanh toán PayPal. Vui lòng thử lại."
    );
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <>
      <MainMenu />
      <div className="checkout-container my-5">
        <h1 className="checkout-title text-center text-success">
          <i className="bi bi-cart"></i> THANH TOÁN{" "}
          <i className="fa-solid fa-money-check-dollar"></i>
        </h1>

        {isSuccess ? (
          <div className="alert alert-success text-center" role="alert">
            <h4 className="alert-heading">Thanh toán thành công!</h4>
            <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.</p>
            <button className="btn btn-danger" onClick={handleContinueShopping}>
              Tiếp tục mua hàng
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="alert alert-danger text-center">
                {errorMessage}
              </div>
            )}
            <div className="row">
              <div className="col-md-9">
                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle checkout-table">
                    <thead className="table-danger">
                      <tr>
                        <th>Mã</th>
                        <th>Hình</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{item.id}</td>
                          <td>
                            <img
                              className="img-fluid cart-img"
                              src={`https://localhost:7213/images/products/${item.image}`}
                              alt={item.name}
                              onError={(e) => (e.target.src = "/images/fallback.jpg")}
                            />
                          </td>
                          <td>{item.name}</td>
                          <td>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.price)}
                          </td>
                          <td>{item.quantity}</td>
                          <td>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-md-3">
                <div className="total-price text-red">
                  <strong>
                    Tổng tiền:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      cartItems.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {user ? (
              <>
                <h4 className="text-center mt-5">Thông tin giao hàng</h4>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Họ tên:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="delivery_name"
                          value={formData.delivery_name}
                          disabled
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email:</label>
                        <input
                          type="email"
                          className="form-control"
                          name="delivery_email"
                          value={formData.delivery_email}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Điện thoại:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="delivery_phone"
                          value={formData.delivery_phone}
                          disabled
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Địa chỉ giao hàng:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="delivery_address"
                          value={formData.delivery_address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="payment-options">
                    <h5>Phương thức thanh toán</h5>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        value="1"
                        checked={paymentMethod === "1"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        id="paymentCash"
                      />
                      <label className="form-check-label" htmlFor="paymentCash">
                        <span className="icon">💵</span>
                        Thanh toán khi nhận hàng
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        value="3"
                        checked={paymentMethod === "3"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        id="paymentPayPal"
                      />
                      <label className="form-check-label" htmlFor="paymentPayPal">
                        <span className="icon">💳</span>
                        Thanh toán qua PayPal
                      </label>
                    </div>

                    {paymentMethod === "3" && (
                      <div className="paypal-button mt-3">
                        <PayPalButton
                          amount={(
                            cartItems.reduce(
                              (total, item) =>
                                total + item.price * item.quantity,
                              0
                            ) / exchangeRate
                          ).toFixed(2)}
                          onSuccess={handlePayPalSuccess}
                          onError={handlePayPalError}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-primary mt-4"
                    type="submit"
                    disabled={paymentMethod === "3"}
                  >
                    Thanh toán
                  </button>
                </form>
              </>
            ) : (
              <div className="alert alert-danger" role="alert">
                Bạn cần đăng nhập để tiến hành thanh toán.
              </div>
            )}
          </>
        )}
        <audio id="success-audio" preload="auto">
          <source src="/sound/success-sound.mp3" type="audio/mpeg" />
          <source src="/sound/success-sound.ogg" type="audio/ogg" />
          Trình duyệt của bạn không hỗ trợ phần tử audio.
        </audio>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;