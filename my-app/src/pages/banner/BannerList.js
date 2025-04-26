import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import usePagination from "../usePagination";
import "../../css/pagination.css";

function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Gọi API danh sách banner
        const response = await axios.get(
          "https://localhost:7213/api/public/Banner"
        );
        const bannerData = response.data;

        // Kiểm tra dữ liệu trả về
        if (Array.isArray(bannerData)) {
          // Lọc banner có Status = true và sắp xếp theo Position hoặc Create_at
          const filteredBanners = bannerData.filter(
            (banner) => banner.status === true
          );
          const sortedBanners = filteredBanners.sort(
            (a, b) =>
              a.position - b.position ||
              new Date(b.create_at) - new Date(a.create_at)
          );
          setBanners(sortedBanners);
          console.log("Danh sách banner:", sortedBanners);
        } else {
          setError("Dữ liệu banner trả về không phải là mảng");
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu banner:", error);
        setError("Lỗi khi lấy dữ liệu banner: " + error.message);
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleStatusChange = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để thay đổi trạng thái banner");
        return;
      }

      // Lấy banner hiện tại để lấy thông tin cập nhật
      const banner = banners.find((b) => b.id === id);
      if (!banner) {
        setError("Banner không tồn tại");
        return;
      }

      // Gửi yêu cầu PUT để cập nhật trạng thái
      const formData = new FormData();
      formData.append("Title", banner.title);
      formData.append("Link", banner.link || "");
      formData.append("Status", !banner.status); // Đảo ngược trạng thái
      formData.append("Position", banner.position);
      formData.append("Update_by", "admin"); // Giả sử người dùng hiện tại

      await axios.put(
        `https://localhost:7213/api/public/Banner/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Cập nhật trạng thái trong state
      setBanners((prevBanners) =>
        prevBanners.map((banner) =>
          banner.id === id ? { ...banner, status: !banner.status } : banner
        )
      );
      setSuccessMessage("Thay đổi trạng thái banner thành công!");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái banner:", error);
      setError("Lỗi khi thay đổi trạng thái banner: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này không?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để xóa banner");
        return;
      }

      // Gửi yêu cầu DELETE
      await axios.delete(`https://localhost:7213/api/public/Banner/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Xóa banner khỏi state
      setBanners((prevBanners) =>
        prevBanners.filter((banner) => banner.id !== id)
      );
      setSuccessMessage("Xóa banner thành công!");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Lỗi khi xóa banner:", error);
      setError("Lỗi khi xóa banner: " + error.message);
    }
  };

  const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } =
    usePagination(banners, itemsPerPage);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý banner</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Quản lý banner</li>
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
                <Link to="/admin/banner/new" className="btn btn-sm btn-success">
                  <i className="fas fa-plus"></i> Thêm banner
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            {successMessage && (
              <p className="alert alert-success">{successMessage}</p>
            )}
            {banners.length === 0 ? (
              <p>Không có banner nào để hiển thị</p>
            ) : (
              <>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: "30px" }}>
                        <input type="checkbox" />
                      </th>
                      <th className="text-center" style={{ width: "30px" }}>
                        ID
                      </th>
                      <th className="text-center" style={{ width: "130px" }}>
                        Hình ảnh
                      </th>
                      <th className="text-center" style={{ width: "300px" }}>
                        Tên banner
                      </th>
                      <th className="text-center" style={{ width: "200px" }}>
                        Link
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        Vị trí
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        Trạng thái
                      </th>
                      <th className="text-center" style={{ width: "200px" }}>
                        Chức năng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData().map((banner) => (
                      <tr key={banner.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>{banner.id}</td>
                        <td className="text-center">
                          <img
                            src={`https://localhost:7213/images/banners/${banner.image}`}
                            alt={banner.title}
                            style={{ width: "100px" }}
                            onError={(e) =>
                              (e.target.src = "/images/fallback.jpg")
                            }
                          />
                        </td>
                        <td>{banner.title}</td>
                        <td>{banner.link}</td>
                        <td>{banner.position}</td>
                        <td>{banner.status ? "Hiển thị" : "Ẩn"}</td>
                        <td className="text-center">
                          
                          <Link
                            to={`/admin/banner/edit/${banner.id}`}
                            className="btn btn-primary"
                            style={{ width: "40px" }}
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link
                            to={`/admin/banner/show/${banner.id}`}
                            className="btn btn-info"
                            style={{ width: "40px" }}
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="btn btn-danger"
                            style={{ width: "40px" }}
                          >
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
                    <button
                      key={i + 1}
                      onClick={() => goToPage(i + 1)}
                      className={currentPage === i + 1 ? "active" : ""}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default BannerList;
