import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import usePagination from '../usePagination';
import '../../css/pagination.css';

function BrandList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('https://localhost:7213/api/public/Brand', {
          headers: {
            Accept: 'application/json',
          },
        });
        const brandData = response.data;

        console.log('Dữ liệu API trả về:', brandData); // Debug dữ liệu API

        if (Array.isArray(brandData)) {
          // Sắp xếp theo create_at (mới nhất trước)
          const sortedBrands = brandData.sort(
            (a, b) => new Date(b.create_at) - new Date(a.create_at)
          );
          setBrands(sortedBrands);
          console.log('Danh sách thương hiệu đã sắp xếp:', sortedBrands);
        } else {
          setError('Dữ liệu thương hiệu trả về không phải là mảng');
          console.error('Dữ liệu không đúng định dạng:', brandData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thương hiệu:', error);
        const errorMessage =
          error.response?.data?.message || 'Lỗi khi lấy dữ liệu thương hiệu: ' + error.message;
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này không?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xóa thương hiệu');
        return;
      }

      const response = await axios.delete(`https://localhost:7213/api/public/Brand/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setBrands((prevBrands) => prevBrands.filter((brand) => brand.id !== id));
        setSuccessMessage('Xóa thương hiệu thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Lỗi khi xóa thương hiệu');
      }
    } catch (error) {
      console.error('Lỗi khi xóa thương hiệu:', error);
      const errorMessage =
        error.response?.data?.message || 'Lỗi khi xóa thương hiệu: ' + error.message;
      setError(errorMessage);
    }
  };

  const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(
    brands,
    itemsPerPage
  );

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <p className="text-center">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid mt-5">
        <p className="alert alert-danger text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý thương hiệu</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Quản lý thương hiệu</li>
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
                <Link to="/admin/brand/new" className="btn btn-sm btn-success">
                  <i className="fas fa-plus"></i> Thêm thương hiệu
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            {successMessage && <p className="alert alert-success">{successMessage}</p>}
            {brands.length === 0 ? (
              <p className="text-center">Không có thương hiệu nào để hiển thị</p>
            ) : (
              <>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '30px' }}>
                        <input type="checkbox" />
                      </th>
                      <th className="text-center" style={{ width: '50px' }}>
                        ID
                      </th>
                      <th className="text-center" style={{ width: '300px' }}>
                        Tên thương hiệu
                      </th>
                      <th className="text-center" style={{ width: '150px' }}>
                        Ngày tạo
                      </th>
                      <th className="text-center" style={{ width: '150px' }}>
                        Chức năng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData().map((brand) => (
                      <tr key={brand.id}>
                        <td className="text-center">
                          <input type="checkbox" />
                        </td>
                        <td className="text-center">{brand.id}</td>
                        <td>{brand.name}</td>
                        <td className="text-center">
                          {brand.create_at
                            ? new Date(brand.create_at).toLocaleDateString('vi-VN')
                            : 'Không xác định'}
                        </td>
                        <td className="text-center">
                          <Link
                            to={`/admin/brand/edit/${brand.id}`}
                            className="btn btn-primary btn-sm mx-1"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link
                            to={`/admin/brand/show/${brand.id}`}
                            className="btn btn-info btn-sm mx-1"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className="btn btn-danger btn-sm mx-1"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination-controls mt-3">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="btn btn-outline-secondary btn-sm mx-1"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => goToPage(i + 1)}
                      className={`btn btn-outline-secondary btn-sm mx-1 ${
                        currentPage === i + 1 ? 'active' : ''
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline-secondary btn-sm mx-1"
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

export default BrandList;