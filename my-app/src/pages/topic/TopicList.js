import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePagination from '../usePagination';
function TopicList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    fetch('http://localhost:8000/api/topic')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          const filteredTopics = data.data.filter(topic => topic.status !== 0);
          const sortedTopics = filteredTopics.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setTopics(sortedTopics);
        } else {
          setError('Dữ liệu trả về không phải là mảng');
        }
        setLoading(false);
      })
      .catch(error => {
        setError('Lỗi khi lấy dữ liệu chủ đề');
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/topic/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (data.message === 'Topic status updated successfully') {
        // Cập nhật trạng thái của danh mục trong state
        setTopics(prevTopics => prevTopics.map(topic =>
          topic.id === id ? { ...topic, status: topic.status === 1 ? 2 : 1 } : topic
        ));
      } else {
        setError('Lỗi khi thay đổi trạng thái danh mục');
      }
    } catch (error) {
      console.error('Error when changing topic status:', error);
      setError('Lỗi khi thay đổi trạng thái danh mục');
    }
  };
  const handleDelete = async (id) => {
    try {
        // Gửi yêu cầu PATCH để cập nhật trạng thái của banner thành 0
        const response = await fetch(`http://localhost:8000/api/topic/delete/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (data.message === 'Topic status updated successfully') {
            // Cập nhật trạng thái của topic trong state
            setTopics(prevTopics => prevTopics.filter(topic => topic.id !== id));
        } else {
            setError('Lỗi khi xóa topic');
        }
    } catch (error) {
        console.error('Error when deleting topic:', error);
        setError('Lỗi khi xóa topic');
    }
};
const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(topics, itemsPerPage);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý chủ đề</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Quản lý chủ đề</li>
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
                <Link to="/admin/topic/new" className="btn btn-sm btn-success">
                  <i className="fas fa-plus"></i> Thêm chủ đề
                </Link>
                <Link className="btn btn-sm btn-danger" to="/admin/topic/trash">
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
         
                  <th className="text-center" style={{ width: '300px' }}>Tên chủ đề</th>
                  <th className="text-center" style={{ width: '200px' }}>Tên slug</th>
                 
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {currentData().map(topic => (
                  <tr key={topic.id}>
                    <td><input type="checkbox" /></td>
                    <td>{topic.id}</td>
                    <td>{topic.name}</td>
                    <td>{topic.slug}</td>
                    <td className="text-center">
                      <button onClick={() => handleStatusChange(topic.id)} className={`btn ${topic.status === 1 ? 'btn-success' : 'btn-danger'}`} style={{ width: '40px' }}>
                        <i className={`fas fa-toggle-${topic.status === 1 ? 'on' : 'off'}`}></i>
                      </button>
                      <Link to={`/admin/topic/edit/${topic.id}`} className="btn btn-primary" style={{ width: '40px' }}>
                        <i className="fas fa-edit"></i>
                      </Link>
                      <Link to={`/admin/topic/show/${topic.id}`} className="btn btn-info" style={{ width: '40px' }}>
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button onClick={() => handleDelete(topic.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default TopicList;
