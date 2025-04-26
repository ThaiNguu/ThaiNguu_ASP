import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import usePagination from '../usePagination';
import '../../css/pagination.css';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem đơn hàng');
        setLoading(false);
        return;
      }

      const orderResponse = await axios.get('https://localhost:7213/api/admin/Order', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const orderData = orderResponse.data;

      if (Array.isArray(orderData)) {
        const normalizedOrders = orderData.map(order => ({
          Id: order.id || order.Id,
          User_id: order.user_id || order.User_id,
          Create_at: order.create_at || order.Create_at,
          Status: order.status || order.Status,
          User: order.user || order.User,
          OrderDetails: order.orderDetails || order.OrderDetails || [],
          Payment: order.payment || order.Payment || null,
        }));
        const sortedOrders = normalizedOrders.sort(
          (a, b) => new Date(b.Create_at) - new Date(a.Create_at)
        );
        setOrders(sortedOrders);
        console.log('Danh sách đơn hàng đã chuẩn hóa:', sortedOrders);
      } else {
        setError('Dữ liệu đơn hàng trả về không phải là mảng');
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để thay đổi trạng thái');
        return;
      }

      const nextStatus =
        currentStatus === 'pending' ? 'paid' :
        currentStatus === 'paid' ? 'cancelled' : 'pending';

      const orderToUpdate = orders.find(order => order.Id === id);
      const updatedOrder = {
        ...orderToUpdate,
        Status: nextStatus,
        Id: orderToUpdate.Id,
        User_id: orderToUpdate.User_id,
        OrderDate: orderToUpdate.OrderDate,
        TotalAmount: orderToUpdate.TotalAmount,
        Create_at: orderToUpdate.Create_at,
        Create_by: orderToUpdate.Create_by || 'system',
        Update_at: new Date().toISOString(),
        Update_by: 'system',
        Delete_at: null,
        Delete_by: '',
      };

      const response = await axios.put(
        `https://localhost:7213/api/admin/Order/${id}`,
        updatedOrder,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 204) {
        await fetchOrders(); // Làm mới danh sách
        setSuccessMessage('Cập nhật trạng thái đơn hàng thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái đơn hàng:', error);
      setError('Lỗi khi thay đổi trạng thái đơn hàng: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xóa đơn hàng');
        return;
      }

      const response = await axios.delete(`https://localhost:7213/api/admin/Order/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        await fetchOrders(); // Làm mới danh sách
        setSuccessMessage('Xóa đơn hàng thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error);
      setError('Lỗi khi xóa đơn hàng: ' + error.message);
    }
  };

  const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } =
    usePagination(orders, itemsPerPage);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý đơn hàng</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Quản lý đơn hàng</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-12 text-right">
               
              </div>
            </div>
          </div>
          <div className="card-body">
            {successMessage && <p className="alert alert-success">{successMessage}</p>}
            {orders.length === 0 ? (
              <p>Không có đơn hàng nào để hiển thị</p>
            ) : (
              <>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '30px' }}>ID</th>
                      <th className="text-center" style={{ width: '200px' }}>Tên người dùng</th>
                      <th className="text-center" style={{ width: '300px' }}>Địa chỉ</th>
                      <th className="text-center" style={{ width: '200px' }}>Số điện thoại</th>
                      <th className="text-center" style={{ width: '200px' }}>Email</th>
                      <th className="text-center" style={{ width: '150px' }}>Phương thức thanh toán</th>
                      <th className="text-center" style={{ width: '150px' }}>Trạng thái</th>
                      <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData().map(order => (
                      <tr key={order.Id}>
                        <td>{order.Id}</td>
                        <td>{order.User?.fullName || order.User?.FullName || 'N/A'}</td>
                        <td>{order.User?.address || order.User?.Address || 'N/A'}</td>
                        <td>{order.User?.phone || order.User?.Phone || 'N/A'}</td>
                        <td>{order.User?.email || order.User?.Email || 'N/A'}</td>
                        <td>{order.Payment?.payment_method || 'N/A'}</td>
                        <td>{order.Status}</td>
                        <td className="text-center">
                       
                        
                          <Link
                            to={`/admin/order/show/${order.Id}`}
                            className="btn btn-info"
                            style={{ width: '40px' }}
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(order.Id)}
                            className="btn btn-danger"
                            style={{ width: '40px' }}
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
                      className={currentPage === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={nextPage} disabled={currentPage === totalPages}>
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

export default OrderList;