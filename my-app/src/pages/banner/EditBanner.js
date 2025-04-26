import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditBanner() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    Title: '',
    Link: '',
    Position: '',
    Status: true,
    Image: null,
    Update_by: '',
  });
  const [currentImage, setCurrentImage] = useState(''); // Lưu URL hình ảnh hiện tại
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra ID hợp lệ
    if (!id || isNaN(id)) {
      setErrorMessage('ID banner không hợp lệ');
      navigate('/admin/banner');
      return;
    }

    // Lấy user ID từ localStorage cho Update_by
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, Update_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để chỉnh sửa banner');
      return;
    }

    // Lấy dữ liệu banner
    axios
      .get(`https://localhost:7213/api/public/Banner/${id}`)
      .then((response) => {
        const banner = response.data;
        if (!banner) {
          setErrorMessage('Banner không tồn tại hoặc không tìm thấy');
          return;
        }

        // Gán dữ liệu an toàn với tên trường đúng
        setFormData((prev) => ({
          ...prev,
          Title: banner.title || '',
          Link: banner.link || '',
          Position: banner.position ? banner.position.toString() : '0',
          Status: banner.status || false,
          Image: null,
          Update_by: user.id,
        }));
        setCurrentImage(banner.image ? `https://localhost:7213/images/banners/${banner.image}` : '');
      })
      .catch((error) => {
        console.error('Lỗi khi lấy dữ liệu banner:', error);
        if (error.response?.status === 404) {
          setErrorMessage('Banner không tồn tại');
          navigate('/admin/banner');
        } else {
          setErrorMessage(
            `Lỗi khi lấy dữ liệu: ${error.response?.data?.message || error.message}`
          );
        }
      });
  }, [id, navigate]);

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
    if (!formData.Update_by || formData.Update_by === 'string') {
      formErrors.Update_by = 'ID người cập nhật không hợp lệ';
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

    const bannerData = new FormData();
    bannerData.append('Title', formData.Title);
    bannerData.append('Link', formData.Link);
    bannerData.append('Position', formData.Position);
    bannerData.append('Status', formData.Status);
    if (formData.Image) {
      bannerData.append('Image', formData.Image);
    }
    bannerData.append('Update_by', formData.Update_by);

    // Debug: Kiểm tra dữ liệu gửi đi
    for (let [key, value] of bannerData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://localhost:7213/api/public/Banner/${id}`,
        bannerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Không đặt Content-Type, axios tự động xử lý cho FormData
          },
        }
      );

      if (response.status === 204) {
        navigate('/admin/banner');
      } else {
        setErrorMessage('Có lỗi xảy ra khi cập nhật banner');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật banner:', error);
      setErrorMessage(
        error.response?.data?.message || `Lỗi khi cập nhật banner: ${error.message}`
      );
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Chỉnh sửa banner</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Chỉnh sửa banner</li>
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
                    <label htmlFor="Image">Hình ảnh (tùy chọn)</label>
                    {currentImage && (
                      <div className="mb-2">
                        <img
                          src={currentImage}
                          alt="Current banner"
                          style={{ width: '100px', height: 'auto' }}
                          onError={(e) => (e.target.src = '/images/fallback.jpg')}
                        />
                      </div>
                    )}
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

export default EditBanner;