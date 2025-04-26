import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePagination from '../usePagination';
function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    fetch('http://localhost:8000/api/post')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          const filteredPosts = data.data.filter(post => post.status !== 0);
          const sortedPosts = filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setPosts(sortedPosts);
        } else {
          setError('Dữ liệu trả về không phải là mảng');
        }
        setLoading(false);
      })
      .catch(error => {
        setError('Lỗi khi lấy dữ liệu bài viết');
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id) => {
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
        // Cập nhật trạng thái của danh mục trong state
        setPosts(prevPosts => prevPosts.map(post =>
          post.id === id ? { ...post, status: post.status === 1 ? 2 : 1 } : post
        ));
      } else {
        setError('Lỗi khi thay đổi trạng thái danh mục');
      }
    } catch (error) {
      console.error('Error when changing post status:', error);
      setError('Lỗi khi thay đổi trạng thái danh mục');
    }
  };
  const handleDelete = async (id) => {
    try {
        // Gửi yêu cầu PATCH để cập nhật trạng thái của banner thành 0
        const response = await fetch(`http://localhost:8000/api/post/delete/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (data.message === 'Post status updated successfully') {
            // Cập nhật trạng thái của post trong state
            setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
        } else {
            setError('Lỗi khi xóa post');
        }
    } catch (error) {
        console.error('Error when deleting post:', error);
        setError('Lỗi khi xóa post');
    }
};
const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(posts, itemsPerPage);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý bài viết</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Quản lý bài viết</li>
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
                <Link to="/admin/post/new" className="btn btn-sm btn-success">
                  <i className="fas fa-plus"></i> Thêm bài viết
                </Link>
                <Link className="btn btn-sm btn-danger" to="/admin/post/trash">
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
                  <th className="text-center" style={{ width: '130px' }}>Hình ảnh</th>
                  <th className="text-center" style={{ width: '300px' }}>Tiêu đề bài viết</th>
                  <th className="text-center" style={{ width: '200px' }}>Tên slug</th>
                  <th className="text-center" style={{ width: '300px' }}>Chi tiết bài viết</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {currentData().map(post => (
                  <tr key={post.id}>
                    <td><input type="checkbox" /></td>
                    <td>{post.id}</td>
                    <td className="text-center">
                      <img src={`http://localhost:8000/images/posts/${post.image}`} alt={post.name} style={{ width: '100px' }} />
                    </td>
                    <td>{post.title}</td>
                    <td>{post.slug}</td>
                    <td>{post.detail}</td>
                    <td className="text-center">
                      <button onClick={() => handleStatusChange(post.id)} className={`btn ${post.status === 1 ? 'btn-success' : 'btn-danger'}`} style={{ width: '40px' }}>
                        <i className={`fas fa-toggle-${post.status === 1 ? 'on' : 'off'}`}></i>
                      </button>
                      <Link to={`/admin/post/edit/${post.id}`} className="btn btn-primary" style={{ width: '40px' }}>
                        <i className="fas fa-edit"></i>
                      </Link>
                      <Link to={`/admin/post/show/${post.id}`} className="btn btn-info" style={{ width: '40px' }}>
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button onClick={() => handleDelete(post.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default PostList;
