import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function ShowBrand() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7213/api/public/Brand/${id}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        const data = response.data;
        if (data.id) {
          setBrand(data);
        } else {
          setError("Thương hiệu không tồn tại");
        }
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thương hiệu:", err);
        setError("Lỗi khi tải dữ liệu thương hiệu: " + err.message);
        setLoading(false);
      }
    };

    fetchBrand();
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
              {/* Hình ảnh thương hiệu (placeholder vì không có trường image) */}
              <div className="col-md-6 d-flex align-items-center">
                <div
                  className="img-fluid rounded shadow-sm bg-light d-flex align-items-center justify-content-center"
                  style={{ height: "400px", width: "100%" }}
                >
                  <span className="text-muted">Không có hình ảnh</span>
                </div>
              </div>

              {/* Thông tin chi tiết thương hiệu */}
              <div className="col-md-6">
                <h1 className="display-6 mb-3">{brand.name}</h1>
                <p>
                  <strong>Ngày tạo: </strong>
                  {brand.create_at
                    ? new Date(brand.create_at).toLocaleDateString("vi-VN")
                    : "Không xác định"}
                </p>
                <p>
                  <strong>Người tạo: </strong>
                  {brand.create_by || "Không xác định"}
                </p>
                <p>
                  <strong>Ngày cập nhật: </strong>
                  {brand.update_at
                    ? new Date(brand.update_at).toLocaleDateString("vi-VN")
                    : "Không xác định"}
                </p>
                <p>
                  <strong>Người cập nhật: </strong>
                  {brand.update_by || "Không xác định"}
                </p>
                {brand.delete_at && (
                  <p>
                    <strong>Ngày xóa: </strong>
                    {new Date(brand.delete_at).toLocaleDateString("vi-VN")}
                  </p>
                )}
                {brand.delete_by && (
                  <p>
                    <strong>Người xóa: </strong>
                    {brand.delete_by}
                  </p>
                )}

                {/* Nút quay lại */}
                <Link
                  to="/admin/brand"
                  className="btn btn-outline-primary mt-3"
                >
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

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);

export default ShowBrand;
