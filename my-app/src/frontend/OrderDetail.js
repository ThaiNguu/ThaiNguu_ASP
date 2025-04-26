import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import MainMenu from "../components/main-menu";
import Footer from "../components/Footer";

const OrderDetail = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("1"); // Mặc định là Cash/COD
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const itemsPerPage = 5;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const token = localStorage.getItem("token");
          let userId;
          try {
            const decodedToken = jwtDecode(token);
            userId = decodedToken.sub || decodedToken.id || decodedToken.userId;
          } catch (err) {
            setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
          }

          const response = await axios.get(
            `https://localhost:7213/api/public/Order/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          setOrders(response.data || []);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError(
            err.response?.data?.message || "Không thể tải lịch sử đơn hàng."
          );
          setLoading(false);
        }
      };

      fetchOrders();
    } else {
      setError("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
      setLoading(false);
    }
  }, [user]);

  const toggleAccordion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      setError("Vui lòng đăng nhập để tạo đơn hàng.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    setIsCreatingOrder(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      let userId;
      try {
        const decodedToken = jwtDecode(token);
        userId = decodedToken.sub || decodedToken.id || decodedToken.userId;
      } catch (err) {
        setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
        setIsCreatingOrder(false);
        return;
      }

      // Lấy giỏ hàng
      let cartItems = [];
      if (token) {
        try {
          const cartResponse = await axios.get(
            `https://localhost:7213/api/public/Cart/user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const cartId = cartResponse.data.id;
          const cartItemsResponse = await axios.get(
            `https://localhost:7213/api/public/CartItem/cart/${cartId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          cartItems = cartItemsResponse.data || [];
        } catch (err) {
          console.error("Lỗi khi lấy giỏ hàng từ backend:", err);
          cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        }
      } else {
        cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      }

      if (!cartItems.length) {
        setError("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.");
        setIsCreatingOrder(false);
        return;
      }

      // Tạo dữ liệu đơn hàng
      const orderDetails = cartItems.map((item) => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        price: item.productPrice || item.price,
      }));

      const totalAmount = orderDetails.reduce(
        (sum, detail) => sum + detail.quantity * detail.price,
        0
      );

      const orderData = {
        user_id: userId,
        payment_id: parseInt(paymentMethod),
        orderDate: new Date().toISOString(),
        totalAmount: totalAmount,
        status: "pending", // Trạng thái ban đầu
        delivery_address: deliveryAddress,
        orderDetails: orderDetails,
      };

      // Gửi yêu cầu tạo đơn hàng
      const response = await axios.post(
        "https://localhost:7213/api/public/Order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Xóa giỏ hàng
      if (token) {
        try {
          const cartResponse = await axios.get(
            `https://localhost:7213/api/public/Cart/user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const cartId = cartResponse.data.id;
          const cartItemsResponse = await axios.get(
            `https://localhost:7213/api/public/CartItem/cart/${cartId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const cartItemsToDelete = cartItemsResponse.data || [];
          for (const item of cartItemsToDelete) {
            await axios.delete(
              `https://localhost:7213/api/public/CartItem/${item.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }
        } catch (err) {
          console.error("Lỗi khi xóa giỏ hàng backend:", err);
        }
      }
      localStorage.removeItem("cart");

      // Cập nhật sự kiện giỏ hàng
      const event = new CustomEvent("cartUpdated", { detail: [] });
      window.dispatchEvent(event);

      // Cập nhật danh sách đơn hàng
      setOrders((prev) =>
        [response.data, ...prev].sort(
          (a, b) => new Date(b.create_at) - new Date(a.create_at)
        )
      );

      setDeliveryAddress("");
      setPaymentMethod("1");
      alert("Đơn hàng đã được tạo thành công!");
    } catch (err) {
      console.error("Error creating order:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tạo đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  if (loading) {
    return (
      <div className="container">
        <MainMenu />
        <p>Đang tải lịch sử đơn hàng...</p>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <MainMenu />
        <p className="alert alert-danger">{error}</p>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <MainMenu />
      <div className="container">
        <h1>Lịch sử Đơn Hàng</h1>

       

        {/* Danh sách đơn hàng */}
        {orders.length > 0 ? (
          <div className="order-list">
            {currentOrders.map((order) => (
              <div key={order.id} className="order-item-unique">
                <div
                  className="order-summary-unique"
                  onClick={() => toggleAccordion(order.id)}
                >
                  <div className="order-summary-content-unique">
                    <p>
                      <strong>ID:</strong> {order.id}
                    </p>
                    <p>
                      <strong>Địa chỉ giao hàng:</strong> {order.delivery_address}
                    </p>
                    <p>
                      <strong>Phương thức thanh toán:</strong>{" "}
                      {order.payment?.payment_method || 
                        (order.payment_id === 1
                          ? "Thanh toán khi nhận hàng (Cash)"
                          : order.payment_id === 3
                          ? "PayPal"
                          : "Không xác định")}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      {order.status === "success" ? "Hoàn thành" : "Đã thanh toán"}
                    </p>
                    <p>
                      <strong>Thời gian đặt hàng:</strong>{" "}
                      {new Date(order.create_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                {expandedOrderId === order.id && (
                  <div className="order-details-unique">
                    {order.orderDetails && order.orderDetails.length > 0 ? (
                      order.orderDetails.map((detail) => (
                        <div
                          key={detail.id}
                          className="order-detail-item-unique"
                        >
                          <p>
                            <strong>ID Sản phẩm:</strong> {detail.product_id}
                          </p>
                          <p>
                            <strong>Giá:</strong>{" "}
                            {detail.price.toLocaleString("vi-VN")} VNĐ
                          </p>
                          <p>
                            <strong>Số lượng:</strong> {detail.quantity}
                          </p>
                          <p>
                            <strong>Tổng cộng:</strong>{" "}
                            {(detail.quantity * detail.price).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>Không có chi tiết cho đơn hàng này.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Bạn chưa có đơn hàng nào.</p>
        )}

        {/* Pagination controls */}
        <div className="pagination-unique">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trang Trước
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Trang Sau
          </button>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .create-order-form {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
          background-color: #f9f9f9;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-control {
          width: 100%;
          padding: 8px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        .btn-primary {
          background-color: #28a745;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          color: white;
          cursor: pointer;
        }
        .btn-primary:hover {
          background-color: #218838;
        }
        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .order-list {
          margin-top: 20px;
        }
        .order-item-unique {
          border: 1px solid #ccc;
          border-radius: 10px;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          transition: box-shadow 0.3s ease;
        }
        .order-item-unique:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .order-summary-unique {
          cursor: pointer;
          padding: 10px;
          background-color: #e6e6e6;
          border-radius: 10px;
          transition: background-color 0.3s ease;
        }
        .order-summary-unique:hover {
          background-color: #d9d9d9;
        }
        .order-summary-content-unique {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .order-details-unique {
          margin-top: 10px;
          padding: 15px;
          background-color: #f1f1f1;
          border-radius: 10px;
          transition: max-height 0.4s ease;
        }
        .order-detail-item-unique {
          padding: 8px 0;
          border-bottom: 1px solid #ccc;
        }
        .order-detail-item-unique:last-child {
          border-bottom: none;
        }
        .pagination-unique {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .pagination-unique button {
          margin: 0 10px;
          padding: 5px 15px;
          border: none;
          border-radius: 8px;
          background-color: #28a745;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .pagination-unique button:hover {
          background-color: #218838;
        }
        .pagination-unique button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .alert-danger {
          padding: 10px;
          background-color: #f8d7da;
          color: #721c24;
          border-radius: 5px;
          margin-top: 20px;
        }
      `}</style>
    </>
  );
};

export default OrderDetail;