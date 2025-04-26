import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/post');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const filteredPosts = data.data.filter(post => post.status === 0);
        setPosts(filteredPosts);
      } else {
        setError('Dữ liệu trả về không phải là mảng');
      }
    } catch (error) {
      setError('Lỗi khi lấy dữ liệu bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/post/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.message === 'Post status updated successfully') {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái bài viết: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring post status:', error);
      setError('Lỗi khi khôi phục trạng thái bài viết');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/post/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn bài viết: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting post:', error);
        setError('Lỗi khi xóa vĩnh viễn bài viết');
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
              <h1>Thùng rác bài viết</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác bài viết</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/post">
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
                  <th className="text-center" style={{ width: '300px' }}>Tiêu đề bài viết</th>
                  <th className="text-center" style={{ width: '200px' }}>Tên slug</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td>{post.id}</td>
                    <td className="text-center">
                      <img src={`http://localhost:8000/images/posts/${post.image}`} alt={post.title} style={{ width: '100px' }} />
                    </td>
                    <td>{post.title}</td>
                    <td>{post.slug}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(post.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(post.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default TrashPost;
