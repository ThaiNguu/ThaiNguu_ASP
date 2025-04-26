import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ShowUser() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`https://localhost:7213/api/public/User/${id}`, {
          headers: {
            Accept: 'application/json',
            // Nếu API yêu cầu token, bỏ comment dòng dưới
            // Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Dữ liệu API trả về:', response.data); // Debug dữ liệu
        if (response.data && response.data.id) {
          setUser(response.data);
        } else {
          setError('Người dùng không tồn tại');
        }
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu người dùng:', err);
        console.log('Phản hồi lỗi từ server:', err.response?.data); // Debug lỗi
        let errorMsg = 'Lỗi khi tải dữ liệu người dùng';
        if (err.response) {
          if (err.response.status === 404) {
            errorMsg = 'Người dùng không tồn tại';
          } else if (err.response.data?.message) {
            errorMsg = err.response.data.message;
          } else if (err.response.data?.title) {
            errorMsg = err.response.data.title;
          }
        } else {
          errorMsg = err.message;
        }
        setError(errorMsg);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

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

  if (error) return <p className="alert alert-danger text-center">{error}</p>;

  return (
    <div className="container-fluid mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow-sm p-4">
            <div className="row">
              {/* Placeholder cho ảnh người dùng */}
              <div className="col-md-6 d-flex align-items-center">
                <div
                  className="img-fluid rounded shadow-sm bg-light d-flex align-items-center justify-content-center"
                  style={{ height: '400px', width: '100%' }}
                >
                  <span className="text-muted">Không có hình ảnh</span>
                </div>
              </div>

              {/* Thông tin chi tiết người dùng */}
              <div className="col-md-6">
                <h1 className="display-6 mb-3">{user.fullName}</h1>
                <p>
                  <strong>Tên đăng nhập: </strong>{user.userName || 'N/A'}
                </p>
                <p>
                  <strong>Email: </strong>{user.email || 'N/A'}
                </p>
                <p>
                  <strong>Điện thoại: </strong>{user.phone || 'N/A'}
                </p>
                <p>
                  <strong>Địa chỉ: </strong>{user.address || 'N/A'}
                </p>
                <p>
                  <strong>Vai trò: </strong>{user.role || 'N/A'}
                </p>
                <p>
                  <strong>Ngày tạo: </strong>
                  {user.create_at
                    ? new Date(user.create_at).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
                <p>
                  <strong>Người tạo: </strong>{user.create_by || 'N/A'}
                </p>
                <p>
                  <strong>Ngày cập nhật: </strong>
                  {user.update_at
                    ? new Date(user.update_at).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
                <p>
                  <strong>Người cập nhật: </strong>{user.update_by || 'N/A'}
                </p>
                {user.delete_at && (
                  <p>
                    <strong>Ngày xóa: </strong>
                    {new Date(user.delete_at).toLocaleDateString('vi-VN')}
                  </p>
                )}
                {user.delete_by && (
                  <p>
                    <strong>Người xóa: </strong>{user.delete_by}
                  </p>
                )}

                {/* Nút quay lại */}
                <Link to="/admin/user" className="btn btn-outline-primary mt-3">
                  Quay lại danh sách
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Custom CSS cho placeholder tải dữ liệu */
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

document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);

export default ShowUser;