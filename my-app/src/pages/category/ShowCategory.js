import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ShowCategory() {
  const { id } = useParams(); // Lấy ID từ URL
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`https://localhost:7213/api/public/Category/${id}`, {
          headers: {
            Accept: 'application/json',
          },
        });
        const data = response.data;
        if (data.category_id) {
          setCategory(data);
        } else {
          setError('Danh mục không tồn tại');
        }
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu danh mục:', err);
        setError('Lỗi khi tải dữ liệu danh mục: ' + err.message);
        setLoading(false);
      }
    };

    fetchCategory();
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
              {/* Hình ảnh danh mục (nếu có) */}
              <div className="col-md-6 d-flex align-items-center">
                {category.image ? (
                  <img
                    src={`https://localhost:7213/images/categories/${category.image}`}
                    alt={category.category_name}
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="img-fluid rounded shadow-sm bg-light d-flex align-items-center justify-content-center"
                    style={{ height: '400px', width: '100%' }}
                  >
                    <span className="text-muted">Không có hình ảnh</span>
                  </div>
                )}
              </div>

              {/* Thông tin chi tiết danh mục */}
              <div className="col-md-6">
                <h1 className="display-6 mb-3">{category.category_name}</h1>
                {category.description && (
                  <p className="mt-3">
                    <strong>Mô tả: </strong>{category.description}
                  </p>
                )}
                <p>
                  <strong>Ngày tạo: </strong>
                  {new Date(category.create_at).toLocaleDateString()}
                </p>
                <p>
                  <strong>Người tạo: </strong>{category.create_by}
                </p>
                <p>
                  <strong>Ngày cập nhật: </strong>
                  {new Date(category.update_at).toLocaleDateString()}
                </p>
                <p>
                  <strong>Người cập nhật: </strong>{category.update_by}
                </p>
                {category.delete_at && (
                  <p>
                    <strong>Ngày xóa: </strong>
                    {new Date(category.delete_at).toLocaleDateString()}
                  </p>
                )}
                {category.delete_by && (
                  <p>
                    <strong>Người xóa: </strong>{category.delete_by}
                  </p>
                )}

                {/* Nút quay lại */}
                <Link to="/admin/category" className="btn btn-outline-primary mt-3">
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

/* Custom CSS cho placeholder tải dữ liệu */
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

document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);

export default ShowCategory;