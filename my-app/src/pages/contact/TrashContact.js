import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashContact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/contact');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const filteredContacts = data.data.filter(contact => contact.status === 0);
        setContacts(filteredContacts);
      } else {
        setError('Dữ liệu trả về không phải là mảng');
      }
    } catch (error) {
      setError('Lỗi khi lấy dữ liệu liên hệ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/contact/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.message === 'Contact status updated successfully') {
        setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái liên hệ: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring contact status:', error);
      setError('Lỗi khi khôi phục trạng thái liên hệ');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn liên hệ này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/contact/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          // Cập nhật trạng thái sau khi xóa
          setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn liên hệ: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting contact:', error);
        setError('Lỗi khi xóa vĩnh viễn liên hệ');
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
              <h1>Thùng rác liên hệ</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác liên hệ</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/contact">
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
                  <th className="text-center" style={{ width: '200px' }}>Họ tên</th>
                  <th className="text-center" style={{ width: '200px' }}>Số điện thoại</th>
                  <th className="text-center" style={{ width: '200px' }}>Email</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact.id}>
                    <td>{contact.id}</td>
                    <td>{contact.name}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.email}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(contact.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(contact.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default TrashContact;
