import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ShowBanner() {
  const { id } = useParams();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(`https://localhost:7213/api/public/Banner/${id}`);
        const data = response.data;
        if (data.id) {
          setBanner(data);
        } else {
          setError('Banner không tồn tại');
        }
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu banner:', err);
        setError('Lỗi khi tải dữ liệu banner: ' + err.message);
        setLoading(false);
      }
    };

    fetchBanner();
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
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
              {/* Hình ảnh banner */}
              <div className="col-md-6 d-flex align-items-center">
                <img
                  src={`https://localhost:7213/images/banners/${banner.image}`}
                  alt={banner.title}
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
                  onError={(e) => (e.target.src = '/images/fallback.jpg')}
                  loading="lazy"
                />
              </div>

              {/* Thông tin chi tiết banner */}
              <div className="col-md-6">
                <h1 className="display-6 mb-3">{banner.title}</h1>
                <h5 className="text-muted">
                  Link: <a href={banner.link} target="_blank" rel="noopener noreferrer">{banner.link}</a>
                </h5>
                <h6 className="text-secondary">Vị trí: {banner.position}</h6>
                <p>
                  <strong>Trạng thái: </strong>
                  {banner.status ? (
                    <span className="badge bg-success">Hiển thị</span>
                  ) : (
                    <span className="badge bg-secondary">Ẩn</span>
                  )}
                </p>
                <p><strong>Ngày tạo: </strong>{new Date(banner.create_at).toLocaleDateString()}</p>
                <p><strong>Người tạo: </strong>{banner.create_by}</p>
                <p><strong>Ngày cập nhật: </strong>{new Date(banner.update_at).toLocaleDateString()}</p>
                <p><strong>Người cập nhật: </strong>{banner.update_by}</p>

                {/* Nút quay lại */}
                <Link to="/admin/banner" className="btn btn-outline-primary mt-3">
                  Quay lại danh sách
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowBanner;

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