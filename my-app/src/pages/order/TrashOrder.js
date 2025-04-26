import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/order');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const filteredOrders = data.data.filter(order => order.status === 0);
        setOrders(filteredOrders);
      } else {
        setError('Dữ liệu trả về không phải là mảng');
      }
    } catch (error) {
      setError('Lỗi khi lấy dữ liệu đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/order/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.message === 'Order status updated successfully') {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái đơn hàng: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring order status:', error);
      setError('Lỗi khi khôi phục trạng thái đơn hàng');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/order/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn đơn hàng: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting order:', error);
        setError('Lỗi khi xóa vĩnh viễn đơn hàng');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Thùng rác đơn hàng</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác đơn hàng</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/order">
                  <i className="fa fa-arrow-left"></i> Về danh sách
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '30px' }}>ID</th>
                  <th className="text-center" style={{ width: '200px' }}>Tên người nhận</th>
                  <th className="text-center" style={{ width: '300px' }}>Địa chỉ người nhận</th>
                  <th className="text-center" style={{ width: '200px' }}>Số điện thoại</th>
                  <th className="text-center" style={{ width: '200px' }}>Email</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.delivery_name}</td>
                    <td>{order.delivery_address}</td>
                    <td>{order.delivery_phone}</td>
                    <td>{order.delivery_email}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(order.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(order.id)} className="btn btn-danger" style={{ width: '40px' }}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TrashOrder;
