import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddCategory() {
  const [formData, setFormData] = useState({
    category_name: '',
    create_by: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy user ID từ localStorage cho create_by
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, create_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để thêm danh mục');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.category_name) {
      formErrors.category_name = 'Tên danh mục là bắt buộc';
    } else if (formData.category_name.length < 3) {
      formErrors.category_name = 'Tên danh mục phải có ít nhất 3 ký tự';
    }
    if (!formData.create_by) {
      formErrors.create_by = 'Người tạo là bắt buộc';
    }
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Gửi đầy đủ trường như Swagger
    const categoryData = {
      category_id: 0, // Backend tự tạo
      category_name: formData.category_name,
      create_at: new Date().toISOString(), // Backend có thể ghi đè
      create_by: formData.create_by,
      update_at: null,
      update_by: formData.create_by, // Sử dụng create_by làm giá trị mặc định
      delete_at: null,
      delete_by: formData.create_by, // Sử dụng create_by làm giá trị mặc định
    };

    console.log('Dữ liệu gửi đi:', categoryData); // Debug dữ liệu

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Vui lòng đăng nhập để thêm danh mục');
        return;
      }

      const response = await axios.post(
        'https://localhost:7213/api/public/Category',
        categoryData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        navigate('/admin/category');
      } else {
        setErrorMessage('Có lỗi xảy ra khi thêm danh mục');
      }
    } catch (error) {
      console.error('Lỗi khi thêm danh mục:', error);
      let errorMsg = 'Lỗi khi thêm danh mục';
      if (error.response && error.response.data) {
        // Trích xuất lỗi chi tiết từ response
        if (error.response.data.errors) {
          errorMsg = Object.values(error.response.data.errors)
            .flat()
            .join('; ');
        } else if (error.response.data.title) {
          errorMsg = error.response.data.title;
        }
        console.log('Phản hồi lỗi từ server:', error.response.data); // Debug lỗi server
      } else {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Thêm danh mục</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Thêm danh mục</li>
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
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn btn-sm btn-success"
                >
                  <i className="fa fa-save"></i> Lưu
                </button>
                <Link className="btn btn-sm btn-info" to="/admin/category">
                  <i className="fa fa-arrow-left"></i> Về danh sách
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-9">
                  <div className="mb-3">
                    <label htmlFor="category_name">Tên danh mục</label>
                    <input
                      type="text"
                      name="category_name"
                      value={formData.category_name}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.category_name && (
                      <p className="text-danger">{errors.category_name}</p>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor="create_by">Người tạo</label>
                    <input
                      type="text"
                      name="create_by"
                      value={formData.create_by}
                      disabled
                      className="form-control"
                    />
                    {errors.create_by && (
                      <p className="text-danger">{errors.create_by}</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AddCategory;