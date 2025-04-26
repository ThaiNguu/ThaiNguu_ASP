import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ShowTopic() {
  const { id } = useParams(); // Lấy ID từ URL
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Gọi API lấy dữ liệu chủ đề
    const fetchTopic = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/topic/${id}`);
        const data = await response.json();
        if (data.id) {
          setTopic(data);
        } else {
          setError('Chủ đề không tồn tại');
        }
        setLoading(false);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu chủ đề');
        setLoading(false);
      }
    };

    fetchTopic();
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
              {/* Thông tin chủ đề */}
              <div className="col-md-12">
                <h1 className="display-6 mb-3">{topic.name}</h1>
                <p><strong>Slug: </strong>{topic.slug}</p>
                <p><strong>Mô tả: </strong>{topic.description}</p>
                <p><strong>Ngày tạo: </strong>{new Date(topic.created_at).toLocaleDateString()}</p>
                <p><strong>Ngày cập nhật: </strong>{new Date(topic.updated_at).toLocaleDateString()}</p>
                <p>
                  <strong>Trạng thái: </strong>
                  {topic.status === 1 ? (
                    <span className="badge bg-success">Đang hoạt động</span>
                  ) : (
                    <span className="badge bg-secondary">Không hoạt động</span>
                  )}
                </p>

                {/* Nút quay lại */}
                <Link to="/admin/topic" className="btn btn-outline-primary mt-3">Quay lại danh sách</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowTopic;

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
