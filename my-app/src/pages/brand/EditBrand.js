import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditBrand() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    create_at: null,
    create_by: '',
    update_by: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await axios.get(`https://localhost:7213/api/public/Brand/${id}`, {
          headers: {
            Accept: 'application/json',
          },
        });
        setFormData((prev) => ({
          ...prev,
          name: response.data.name || '',
          create_at: response.data.create_at || null,
          create_by: response.data.create_by || prev.update_by,
        }));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thương hiệu:', error);
        setErrorMessage(error.response?.data?.message || 'Lỗi khi lấy dữ liệu thương hiệu');
      } finally {
        setLoading(false);
      }
    };

    let user;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {
      user = null;
    }
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, update_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để chỉnh sửa thương hiệu');
      navigate('/login');
    }

    fetchBrand();
  }, [id, navigate]);

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
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Cấu trúc dữ liệu thương hiệu đầy đủ, giữ nguyên create_at
    const brandData = {
      id: parseInt(id),
      name: formData.name,
      create_at: formData.create_at,
      create_by: formData.create_by,
      update_at: new Date().toISOString(),
      update_by: formData.update_by,
      delete_at: null,
      delete_by: formData.update_by,
    };

    console.log('Dữ liệu gửi đi:', brandData);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Vui lòng đăng nhập để chỉnh sửa thương hiệu');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `https://localhost:7213/api/public/Brand/${id}`,
        brandData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        navigate('/admin/brand');
      } else {
        setErrorMessage('Có lỗi xảy ra khi cập nhật thương hiệu');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thương hiệu:', error);
      let errorMsg = 'Lỗi khi cập nhật thương hiệu';
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          errorMsg = Object.values(error.response.data.errors)
            .flat()
            .join('; ');
        } else if (error.response.data.title) {
          errorMsg = error.response.data.title;
        }
        console.log('Phản hồi lỗi từ server:', error.response.data);
      } else {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <section className="content">
          <div className="card">
            <div className="card-body">
              <p>Đang tải...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Sửa thương hiệu</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Sửa thương hiệu</li>
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
                    <label htmlFor="update_by">Người cập nhật</label>
                    <input
                      type="text"
                      name="update_by"
                      value={formData.update_by}
                      disabled
                      className="form-control"
                    />
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

export default EditBrand;