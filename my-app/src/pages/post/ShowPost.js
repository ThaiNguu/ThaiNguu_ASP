import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ShowPost() {
  const { id } = useParams(); // Lấy ID từ URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Gọi API lấy dữ liệu bài viết
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/post/${id}`);
        const data = await response.json();
        if (data.id) {
          setPost(data);
        } else {
          setError('Bài viết không tồn tại');
        }
        setLoading(false);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu bài viết');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            {/* Custom Loading Placeholder */}
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
              {/* Thông tin bài viết */}
              <div className="col-md-12">
                <h1 className="display-6 mb-3">{post.title}</h1>
                <p><strong>Slug: </strong>{post.slug}</p>
                <p><strong>Chi tiết: </strong>{post.detail}</p>
                <p><strong>Mô tả: </strong>{post.description}</p>
                <img src={`http://localhost:8000/images/posts/${post.image}`} alt={post.title} className="img-fluid mb-3" />
                <p><strong>Ngày tạo: </strong>{new Date(post.created_at).toLocaleDateString()}</p>
                <p><strong>Ngày cập nhật: </strong>{new Date(post.updated_at).toLocaleDateString()}</p>
                <p>
                  <strong>Trạng thái: </strong>
                  {post.status === 1 ? (
                    <span className="badge bg-success">Đã công khai</span>
                  ) : (
                    <span className="badge bg-secondary">Bản nháp</span>
                  )}
                </p>

                {/* Nút quay lại */}
                <Link to="/admin/post" className="btn btn-outline-primary mt-3">Quay lại danh sách</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowPost;

/* Custom CSS for loading placeholders */
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

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);
