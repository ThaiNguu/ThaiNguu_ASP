import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import usePagination from '../usePagination';
import '../../css/pagination.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://localhost:7213/api/public/User', {
          headers: {
            Accept: 'application/json',
          },
        });
        const userData = response.data;

        console.log('Dữ liệu API trả về:', userData); // Debug dữ liệu API
        // Kiểm tra các trường ngày tạo có thể có
        if (Array.isArray(userData) && userData.length > 0) {
          console.log('Các trường ngày tạo mẫu:', {
            Create_at: userData[0].Create_at,
            create_at: userData[0].create_at,
            createdAt: userData[0].createdAt,
            createAt: userData[0].createAt,
          });
        }

        if (Array.isArray(userData)) {
          // Lọc người dùng chưa bị xóa mềm và sắp xếp theo create_at
          const filteredUsers = userData.filter(
            (user) => user && user.id && !user.Delete_at
          );
          const sortedUsers = filteredUsers.sort(
            (a, b) => new Date(b.create_at || b.Create_at) - new Date(a.create_at || a.Create_at)
          );
          setUsers(sortedUsers);
          console.log('Danh sách người dùng đã sắp xếp:', sortedUsers);
        } else {
          setError('Dữ liệu người dùng trả về không phải là mảng');
          console.error('Dữ liệu không đúng định dạng:', userData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
        const errorMessage =
          error.response?.data?.message || 'Lỗi khi lấy dữ liệu người dùng: ' + error.message;
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xóa người dùng');
        return;
      }

      const response = await axios.delete(`https://localhost:7213/api/public/User/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        setSuccessMessage('Xóa người dùng thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Lỗi khi xóa người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      const errorMessage =
        error.response?.data?.message || 'Lỗi khi xóa người dùng: ' + error.message;
      setError(errorMessage);
    }
  };

  const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(
    users,
    itemsPerPage
  );

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <p className="text-center">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid mt-5">
        <p className="alert alert-danger text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý thành viên</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Quản lý thành viên</li>
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
                <Link to="/admin/user/new" className="btn btn-sm btn-success">
                  <i className="fas fa-plus"></i> Thêm thành viên
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            {successMessage && <p className="alert alert-success">{successMessage}</p>}
            {users.length === 0 ? (
              <p className="text-center">Không có thành viên nào để hiển thị</p>
            ) : (
              <>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '30px' }}>
                        <input type="checkbox" />
                      </th>
                      <th className="text-center" style={{ width: '50px' }}>
                        ID
                      </th>
                      <th className="text-center" style={{ width: '200px' }}>
                        Tên
                      </th>
                      <th className="text-center" style={{ width: '150px' }}>
                        Điện thoại
                      </th>
                      <th className="text-center" style={{ width: '200px' }}>
                        Email
                      </th>
                      <th className="text-center" style={{ width: '100px' }}>
                        Vai trò
                      </th>
                      <th className="text-center" style={{ width: '150px' }}>
                        Ngày tạo
                      </th>
                      <th className="text-center" style={{ width: '150px' }}>
                        Chức năng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData().map((user) => (
                      <tr key={user.id}>
                        <td className="text-center">
                          <input type="checkbox" />
                        </td>
                        <td className="text-center">{user.id ? user.id.slice(0, 8) : 'N/A'}</td>
                        <td>{user.fullName || 'N/A'}</td>
                        <td className="text-center">{user.phone || 'N/A'}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td className="text-center">{user.role || 'N/A'}</td>
                        <td className="text-center">
                          {user.create_at || user.Create_at
                            ? new Date(user.create_at || user.Create_at).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </td>
                        <td className="text-center">
                          <Link
                            to={`/admin/user/edit/${user.id}`}
                            className="btn btn-primary btn-sm mx-1"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link
                            to={`/admin/user/show/${user.id}`}
                            className="btn btn-info btn-sm mx-1"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="btn btn-danger btn-sm mx-1"
                            disabled={!user.id}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination-controls mt-3">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="btn btn-outline-secondary btn-sm mx-1"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => goToPage(i + 1)}
                      className={`btn btn-outline-secondary btn-sm mx-1 ${
                        currentPage === i + 1 ? 'active' : ''
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline-secondary btn-sm mx-1"
                  >
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

export default UserList;