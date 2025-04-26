import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePagination from '../usePagination';
function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    fetch('http://localhost:8000/api/contact')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          const filteredContacts = data.data.filter(contact => contact.status !== 0);
          const sortedContacts = filteredContacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setContacts(sortedContacts);
        } else {
          setError('Dữ liệu trả về không phải là mảng');
        }
        setLoading(false);
      })
      .catch(error => {
        setError('Lỗi khi lấy dữ liệu liên hệ');
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id) => {
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
        // Cập nhật trạng thái của danh mục trong state
        setContacts(prevContacts => prevContacts.map(contact =>
          contact.id === id ? { ...contact, status: contact.status === 1 ? 2 : 1 } : contact
        ));
      } else {
        setError('Lỗi khi thay đổi trạng thái danh mục');
      }
    } catch (error) {
      console.error('Error when changing contact status:', error);
      setError('Lỗi khi thay đổi trạng thái danh mục');
    }
  };
  const handleDelete = async (id) => {
    try {
        // Gửi yêu cầu PATCH để cập nhật trạng thái của banner thành 0
        const response = await fetch(`http://localhost:8000/api/contact/delete/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (data.message === 'Contact status updated successfully') {
            // Cập nhật trạng thái của contact trong state
            setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
        } else {
            setError('Lỗi khi xóa contact');
        }
    } catch (error) {
        console.error('Error when deleting contact:', error);
        setError('Lỗi khi xóa contact');
    }
};
const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(contacts, itemsPerPage);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý liên hệ</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Quản lý liên hệ</li>
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
                <Link className="btn btn-sm btn-danger" to="/admin/contact/trash">
                  <i className="fa fa-trash text-light"></i> Thùng rác
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '30px' }}><input type="checkbox" /></th>
                  <th className="text-center" style={{ width: '30px' }}>ID</th>
                  <th className="text-center" style={{ width: '200px' }}>Họ tên</th>
                  <th className="text-center" style={{ width: '200px' }}>Số điện thoại</th>
                  <th className="text-center" style={{ width: '200px' }}>Email</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {currentData().map(contact => (
                  <tr key={contact.id}>
                    <td><input type="checkbox" /></td>
                    <td>{contact.id}</td>
                    <td>{contact.name}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.email}</td>
                    <td className="text-center">
                      <button onClick={() => handleStatusChange(contact.id)} className={`btn ${contact.status === 1 ? 'btn-success' : 'btn-danger'}`} style={{ width: '40px' }}>
                        <i className={`fas fa-toggle-${contact.status === 1 ? 'on' : 'off'}`}></i>
                      </button>
                      <Link to={`/admin/contact/edit/${contact.id}`} className="btn btn-primary" style={{ width: '40px' }}>
                        <i className="fas fa-edit"></i>
                      </Link>
                      <Link to={`/admin/contact/show/${contact.id}`} className="btn btn-info" style={{ width: '40px' }}>
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button onClick={() => handleDelete(contact.id)} className="btn btn-danger" style={{ width: '40px' }}>
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
                <button key={i + 1} onClick={() => goToPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button onClick={nextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactList;
