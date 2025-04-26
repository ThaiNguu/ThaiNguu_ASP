import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashTopic() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/topic');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const filteredTopics = data.data.filter(topic => topic.status === 0);
        setTopics(filteredTopics);
      } else {
        setError('Dữ liệu trả về không phải là mảng');
      }
    } catch (error) {
      setError('Lỗi khi lấy dữ liệu chủ đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleRestore = async (id) => {
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
        setTopics(prevTopics => prevTopics.filter(topic => topic.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái chủ đề: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring topic status:', error);
      setError('Lỗi khi khôi phục trạng thái chủ đề');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn chủ đề này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/topic/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          // Thay đổi trạng thái sau khi xóa
          setTopics(prevTopics => prevTopics.filter(topic => topic.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn chủ đề: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting topic:', error);
        setError('Lỗi khi xóa vĩnh viễn chủ đề');
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
              <h1>Thùng rác chủ đề</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác chủ đề</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/topic">
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
                  <th className="text-center" style={{ width: '300px' }}>Tên chủ đề</th>
                  <th className="text-center" style={{ width: '200px' }}>Tên slug</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(topic => (
                  <tr key={topic.id}>
                    <td>{topic.id}</td>
                    <td>{topic.name}</td>
                    <td>{topic.slug}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(topic.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(topic.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default TrashTopic;
