import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddBanner() {
  const [formData, setFormData] = useState({
    Title: '',
    Link: '',
    Position: '',
    Status: true, // Mặc định là true (hiển thị)
    Image: null,
    Create_by: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy user ID từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, Create_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để thêm banner');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'Image') {
      setFormData({ ...formData, Image: files[0] });
    } else if (name === 'Status') {
      setFormData({ ...formData, Status: value === 'true' }); // Chuyển đổi string thành boolean
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.Title) formErrors.Title = 'Tên banner là bắt buộc';
    if (!formData.Position) formErrors.Position = 'Vị trí là bắt buộc';
    else if (isNaN(formData.Position) || formData.Position < 0)
      formErrors.Position = 'Vị trí phải là số không âm';
    if (!formData.Image) formErrors.Image = 'Hình ảnh là bắt buộc';
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const bannerData = new FormData();
    bannerData.append('Title', formData.Title);
    bannerData.append('Link', formData.Link);
    bannerData.append('Position', formData.Position);
    bannerData.append('Status', formData.Status);
    bannerData.append('Image', formData.Image);
    bannerData.append('Create_by', formData.Create_by);

    // Debug: Kiểm tra dữ liệu gửi đi
    for (let [key, value] of bannerData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://localhost:7213/api/public/Banner',
        bannerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Không đặt Content-Type, axios tự động xử lý cho FormData
          },
        }
      );

      if (response.status === 201) {
        navigate('/admin/banner');
      } else {
        setErrorMessage('Có lỗi xảy ra khi thêm banner');
      }
    } catch (error) {
      console.error('Lỗi khi thêm banner:', error);
      setErrorMessage(
        error.response?.data?.message || `Lỗi khi thêm banner: ${error.message}`
      );
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Thêm banner</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Thêm banner</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/banner">
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
                    <label htmlFor="Title">Tên banner</label>
                    <input
                      type="text"
                      name="Title"
                      value={formData.Title}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.Title && <p className="text-danger">{errors.Title}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Link">Link</label>
                    <input
                      type="text"
                      name="Link"
                      value={formData.Link}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Position">Vị trí</label>
                    <input
                      type="number"
                      name="Position"
                      value={formData.Position}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.Position && (
                      <p className="text-danger">{errors.Position}</p>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor="Status">Trạng thái</label>
                    <select
                      name="Status"
                      value={formData.Status.toString()}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="true">Hiển thị</option>
                      <option value="false">Ẩn</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Image">Hình ảnh</label>
                    <input
                      type="file"
                      name="Image"
                      accept="image/*"
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.Image && <p className="text-danger">{errors.Image}</p>}
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

export default AddBanner;