import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddBrand() {
  const [formData, setFormData] = useState({
    name: '',
    create_by: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy user ID từ localStorage cho create_by
    let user;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {
      user = null;
    }
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, create_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để thêm thương hiệu');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.name) {
      formErrors.name = 'Tên thương hiệu là bắt buộc';
    } else if (formData.name.length < 3) {
      formErrors.name = 'Tên thương hiệu phải có ít nhất 3 ký tự';
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

    // Gửi đầy đủ trường theo Brand model
    const brandData = {
      id: 0, // Backend tự tạo
      name: formData.name,
      create_at: new Date().toISOString(), // Backend có thể ghi đè
      create_by: formData.create_by,
      update_at: null,
      update_by: formData.create_by, // Sử dụng create_by làm giá trị mặc định
      delete_at: null,
      delete_by: formData.create_by, // Sử dụng create_by làm giá trị mặc định
    };

    console.log('Dữ liệu gửi đi:', brandData); // Debug dữ liệu

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Vui lòng đăng nhập để thêm thương hiệu');
        return;
      }

      const response = await axios.post(
        'https://localhost:7213/api/public/Brand',
        brandData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        navigate('/admin/brand');
      } else {
        setErrorMessage('Có lỗi xảy ra khi thêm thương hiệu');
      }
    } catch (error) {
      console.error('Lỗi khi thêm thương hiệu:', error);
      let errorMsg = 'Lỗi khi thêm thương hiệu';
      if (error.response && error.response.data) {
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
              <h1>Thêm thương hiệu</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Thêm thương hiệu</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/brand">
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
                    <label htmlFor="name">Tên thương hiệu</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.name && (
                      <p className="text-danger">{errors.name}</p>
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

export default AddBrand;