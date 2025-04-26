import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/users');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const filteredUsers = data.data.filter(user => user.status === 0);
        setUsers(filteredUsers);
      } else {
        setError('Dữ liệu trả về không phải là mảng');
      }
    } catch (error) {
      setError('Lỗi khi lấy dữ liệu thành viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/user/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.message === 'User status updated successfully') {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái người dùng: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring user status:', error);
      setError('Lỗi khi khôi phục trạng thái người dùng');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/user/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          // Thay đổi trạng thái sau khi xóa
          setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn người dùng: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting user:', error);
        setError('Lỗi khi xóa vĩnh viễn người dùng');
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
              <h1>Thùng rác người dùng</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác người dùng</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/user">
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
                  <th className="text-center" style={{ width: '130px' }}>Hình ảnh</th>
                  <th className="text-center" style={{ width: '300px' }}>Tên người dùng</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="text-center">
                      <img src={`http://localhost:8000/images/users/${user.image}`} alt={user.name} style={{ width: '100px' }} />
                    </td>
                    <td>{user.name}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(user.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(user.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default TrashUser;
