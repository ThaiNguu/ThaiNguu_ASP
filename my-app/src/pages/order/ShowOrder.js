import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ShowOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vui lòng đăng nhập để xem chi tiết đơn hàng');
          setLoading(false);
          return;
        }

        // Lấy thông tin đơn hàng
        const orderResponse = await axios.get(`https://localhost:7213/api/admin/Order/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        const orderData = orderResponse.data;
        console.log('Order Response:', orderData);

        // Chuẩn hóa dữ liệu đơn hàng
        const normalizedOrder = {
          Id: orderData.id || orderData.Id,
          User_id: orderData.user_id || orderData.User_id,
          OrderDate: orderData.orderDate || orderData.OrderDate,
          TotalAmount: orderData.totalAmount || orderData.TotalAmount,
          Status: orderData.status || orderData.Status,
          Create_at: orderData.create_at || orderData.Create_at,
          User: orderData.user || orderData.User,
          Payment: orderData.payment || orderData.Payment || null,
          OrderDetails: (orderData.orderDetails || orderData.OrderDetails || []).map(detail => ({
            Id: detail.id || detail.Id,
            Product_id: detail.product_id || detail.Product_id,
            Quantity: detail.quantity || detail.Quantity,
            Price: detail.price || detail.Price,
            Product: detail.product || detail.Product || null,
          })),
        };
        setOrder(normalizedOrder);
        console.log('Normalized Order:', normalizedOrder);
        console.log('OrderDetails Product IDs:', normalizedOrder.OrderDetails.map(detail => detail.Product_id));

        // Lấy danh sách sản phẩm
        const productResponse = await axios.get('https://localhost:7213/api/public/Product');
        const productData = productResponse.data;
        console.log('Product Response:', productData);
        if (Array.isArray(productData)) {
          setProducts(productData);
          console.log('Products State:', productData);
        } else {
          setError('Dữ liệu sản phẩm trả về không phải là mảng');
        }

        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        const errorMessage =
          error.response?.data?.message || 'Lỗi khi lấy dữ liệu: ' + error.message;
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Hàm lấy thông tin sản phẩm theo Product_id
  const getProductInfo = (productId) => {
    console.log('Searching for Product_id:', productId);
    const product = products.find(p => p.id === productId || p.Id === productId);
    console.log('Found Product:', product);
    const productInfo = product
      ? { name: product.name || product.Name || 'Không xác định', image: product.image || product.Image || '/images/fallback.jpg' }
      : { name: 'Không xác định', image: '/images/fallback.jpg' };
    console.log('Product Info:', productInfo);
    return productInfo;
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

  return (
    <div className="container-fluid mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow-sm p-4">
            <div className="row">
              {/* Thông tin đơn hàng */}
              <div className="col-md-12">
                <h1 className="display-6 mb-3">Chi Tiết Đơn Hàng</h1>
                {order ? (
                  <>
                    <h2>Thông Tin Đơn Hàng</h2>
                    <p><strong>ID:</strong> {order.Id}</p>
                    <p><strong>Tên người dùng:</strong> {order.User?.fullName || order.User?.FullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {order.User?.email || order.User?.Email || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> {order.User?.phone || order.User?.Phone || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> {order.User?.address || order.User?.Address || 'N/A'}</p>
                    <p><strong>Phương thức thanh toán:</strong> {order.Payment?.payment_method || 'N/A'}</p>
                    <p><strong>Ngày đặt hàng:</strong> {new Date(order.OrderDate).toLocaleDateString()}</p>
                    <p><strong>Tổng tiền:</strong> {order.TotalAmount.toLocaleString()} VNĐ</p>
                    <p><strong>Trạng thái:</strong> {order.Status}</p>
                    <p><strong>Ngày tạo:</strong> {new Date(order.Create_at).toLocaleDateString()}</p>
                  </>
                ) : (
                  <p>Không có thông tin đơn hàng.</p>
                )}
              </div>

              {/* Chi tiết đơn hàng */}
              <div className="col-md-12 mt-4">
                <h2>Chi Tiết Đơn Hàng</h2>
                {order?.OrderDetails?.length > 0 ? (
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Tổng cộng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.OrderDetails.map(detail => {
                        const productInfo = getProductInfo(detail.Product_id);
                        console.log('Image URL:', productInfo.image.startsWith('/') ? productInfo.image : `https://localhost:7213/images/products/${productInfo.image}`);
                        return (
                          <tr key={detail.Id}>
                            <td>
                              <img
                                src={
                                  productInfo.image.startsWith('/')
                                    ? productInfo.image
                                    : `https://localhost:7213/images/products/${productInfo.image}`
                                }
                                alt={productInfo.name}
                                style={{ width: '50px' }}
                                onError={e => (e.target.src = '/images/fallback.jpg')}
                              />
                            </td>
                            <td>{productInfo.name}</td>
                            <td>{detail.Price.toLocaleString()} VNĐ</td>
                            <td>{detail.Quantity}</td>
                            <td>{(detail.Price * detail.Quantity).toLocaleString()} VNĐ</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p>Không có chi tiết nào cho đơn hàng này.</p>
                )}
              </div>
            </div>

            {/* Nút quay lại */}
            <div className="text-end mt-3">
              <Link to="/admin/order" className="btn btn-outline-primary">Quay lại danh sách</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowOrder;

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
.table img {
  object-fit: cover;
  border-radius: 4px;
}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);