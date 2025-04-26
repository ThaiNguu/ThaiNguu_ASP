import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import usePagination from '../usePagination';
import '../../css/pagination.css';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://localhost:7213/api/public/Category', {
          headers: {
            Accept: 'application/json',
          },
        });
        const categoryData = response.data;

        console.log('Dữ liệu API trả về:', categoryData); // Debug dữ liệu API

        if (Array.isArray(categoryData)) {
          // Sắp xếp theo create_at (mới nhất trước)
          const sortedCategories = categoryData.sort(
            (a, b) => new Date(b.create_at) - new Date(a.create_at)
          );
          setCategories(sortedCategories);
          console.log('Danh sách danh mục đã sắp xếp:', sortedCategories);
        } else {
          setError('Dữ liệu danh mục trả về không phải là mảng');
          console.error('Dữ liệu không đúng định dạng:', categoryData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu danh mục:', error);
        const errorMessage =
          error.response?.data?.message || 'Lỗi khi lấy dữ liệu danh mục: ' + error.message;
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xóa danh mục');
        return;
      }

      const response = await axios.delete(`https://localhost:7213/api/public/Category/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.category_id !== id)
        );
        setSuccessMessage('Xóa danh mục thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Lỗi khi xóa danh mục');
      }
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      const errorMessage =
        error.response?.data?.message || 'Lỗi khi xóa danh mục: ' + error.message;
      setError(errorMessage);
    }
  };

  const itemsPerPage = 5;
  const { currentData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(
    categories,
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
              <h1>Quản lý danh mục</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Quản lý danh mục</li>
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
                <Link to="/admin/category/new" className="btn btn-sm btn-success">
                  <i className="fas fa-plus"></i> Thêm danh mục
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            {successMessage && <p className="alert alert-success">{successMessage}</p>}
            {categories.length === 0 ? (
              <p className="text-center">Không có danh mục nào để hiển thị</p>
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
                        Tên danh mục
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
                    {currentData().map((category) => (
                      <tr key={category.category_id}>
                        <td className="text-center">
                          <input type="checkbox" />
                        </td>
                        <td className="text-center">{category.category_id}</td>
                        <td>{category.category_name}</td>
                        <td className="text-center">
                          {new Date(category.create_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="text-center">
                          <Link
                            to={`/admin/category/edit/${category.category_id}`}
                            className="btn btn-primary btn-sm mx-1"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link
                            to={`/admin/category/show/${category.category_id}`}
                            className="btn btn-info btn-sm mx-1"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(category.category_id)}
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

export default CategoryList;