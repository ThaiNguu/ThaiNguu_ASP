import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditCategory() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    category_name: '',
    create_at: null, // Thêm trường create_at để lưu ngày tạo
    create_by: '',   // Thêm trường create_by để lưu người tạo
    update_by: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`https://localhost:7213/api/public/Category/${id}`, {
          headers: {
            Accept: 'application/json',
          },
        });
        setFormData((prev) => ({
          ...prev,
          category_name: response.data.category_name || '',
          create_at: response.data.create_at || null, // Lưu ngày tạo từ API
          create_by: response.data.create_by || prev.update_by, // Lưu người tạo
        }));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu danh mục:', error);
        setErrorMessage(error.response?.data?.message || 'Lỗi khi lấy dữ liệu danh mục');
      } finally {
        setLoading(false);
      }
    };

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, update_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để chỉnh sửa danh mục');
      navigate('/login');
    }

    fetchCategory();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.category_name) {
      formErrors.category_name = 'Tên danh mục là bắt buộc';
    } else if (formData.category_name.length < 3) {
      formErrors.category_name = 'Tên danh mục phảiBRE có ít nhất 3 ký tự';
    }
    // Bỏ qua validate update_by vì được lấy từ localStorage
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Cấu trúc dữ liệu danh mục đầy đủ, giữ nguyên create_at
    const categoryData = {
      category_id: parseInt(id),
      category_name: formData.category_name,
      create_at: formData.create_at, // Giữ nguyên ngày tạo từ API
      create_by: formData.create_by, // Giữ nguyên người tạo
      update_at: new Date().toISOString(),
      update_by: formData.update_by,
      delete_at: null,
      delete_by: formData.update_by, // Đặt delete_by bằng update_by
    };

    console.log('Dữ liệu gửi đi:', categoryData);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Vui lòng đăng nhập để chỉnh sửa danh mục');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `https://localhost:7213/api/public/Category/${id}`,
        categoryData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        navigate('/admin/category');
      } else {
        setErrorMessage('Có lỗi xảy ra khi cập nhật danh mục');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      let errorMsg = 'Lỗi khi cập nhật danh mục';
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
              <h1>Sửa danh mục</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Sửa danh mục</li>
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

export default EditCategory;