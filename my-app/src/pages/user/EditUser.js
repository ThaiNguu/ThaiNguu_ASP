import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditUser() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    UserName: '',
    FullName: '',
    Phone: '',
    Address: '',
    Role: 'customer',
    Email: '',
    PasswordHash: '',
    password_re: '',
    Create_at: null,
    Create_by: '',
    Update_by: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`https://localhost:7213/api/public/User/${id}`, {
          headers: {
            Accept: 'application/json',
            // Nếu API yêu cầu token, thêm Authorization
            // Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        console.log('Dữ liệu API trả về:', response.data); // Debug dữ liệu API

        // Xử lý tên trường chữ hoa đầu hoặc chữ thường
        setFormData((prev) => ({
          ...prev,
          UserName: response.data.UserName || response.data.userName || '',
          FullName: response.data.FullName || response.data.fullName || '',
          Phone: response.data.Phone || response.data.phone || '',
          Address: response.data.Address || response.data.address || '',
          Role: response.data.Role || response.data.role || 'customer',
          Email: response.data.Email || response.data.email || '',
          Create_at: response.data.Create_at || response.data.create_at || null,
          Create_by: response.data.Create_by || response.data.create_by || prev.Update_by,
        }));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
        setErrorMessage(error.response?.data?.message || 'Lỗi khi lấy dữ liệu người dùng');
      } finally {
        setLoading(false);
      }
    };

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, Update_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để chỉnh sửa thành viên');
      navigate('/login');
    }

    fetchUser();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.UserName) {
      formErrors.UserName = 'Tên đăng nhập là bắt buộc';
    } else if (formData.UserName.length < 3) {
      formErrors.UserName = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    if (!formData.FullName) {
      formErrors.FullName = 'Họ tên là bắt buộc';
    }
    if (!formData.Phone) {
      formErrors.Phone = 'Số điện thoại là bắt buộc';
    } else if (!/^\d{10,11}$/.test(formData.Phone)) {
      formErrors.Phone = 'Số điện thoại phải có 10-11 chữ số';
    }
    if (!formData.Email) {
      formErrors.Email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      formErrors.Email = 'Email không hợp lệ';
    }
    if (formData.PasswordHash && formData.PasswordHash.length < 6) {
      formErrors.PasswordHash = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (formData.PasswordHash !== formData.password_re) {
      formErrors.password_re = 'Mật khẩu xác nhận không khớp';
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

    // Cấu trúc dữ liệu người dùng đầy đủ, giữ nguyên Create_at và Create_by
    const userData = {
      Id: id,
      UserName: formData.UserName,
      FullName: formData.FullName,
      Phone: formData.Phone,
      Address: formData.Address,
      Role: formData.Role,
      Email: formData.Email,
      PasswordHash: formData.PasswordHash || null, // Chỉ gửi nếu có mật khẩu mới
      Create_at: formData.Create_at,
      Create_by: formData.Create_by,
      Update_at: new Date().toISOString(),
      Update_by: formData.Update_by,
      Delete_at: null,
      Delete_by: formData.Update_by,
    };

    console.log('Dữ liệu gửi đi:', userData);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Vui lòng đăng nhập để chỉnh sửa thành viên');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `https://localhost:7213/api/public/User/${id}`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        navigate('/admin/user');
      } else {
        setErrorMessage('Có lỗi xảy ra khi cập nhật thành viên');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thành viên:', error);
      let errorMsg = 'Lỗi khi cập nhật thành viên';
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
              <h1>Chỉnh sửa thành viên</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Chỉnh sửa thành viên</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/user">
                  <i className="fa fa-arrow-left"></i> Về danh sách
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="FullName">Họ tên</label>
                    <input
                      type="text"
                      name="FullName"
                      value={formData.FullName}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.FullName && (
                      <p className="text-danger">{errors.FullName}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Phone">Số điện thoại</label>
                    <input
                      type="text"
                      name="Phone"
                      value={formData.Phone}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.Phone && (
                      <p className="text-danger">{errors.Phone}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Email">Email</label>
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.Email && (
                      <p className="text-danger">{errors.Email}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Address">Địa chỉ</label>
                    <input
                      type="text"
                      name="Address"
                      value={formData.Address}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="UserName">Tên đăng nhập</label>
                    <input
                      type="text"
                      name="UserName"
                      value={formData.UserName}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.UserName && (
                      <p className="text-danger">{errors.UserName}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="PasswordHash">Mật khẩu</label>
                    <input
                      type="password"
                      name="PasswordHash"
                      value={formData.PasswordHash}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.PasswordHash && (
                      <p className="text-danger">{errors.PasswordHash}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password_re">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      name="password_re"
                      value={formData.password_re}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.password_re && (
                      <p className="text-danger">{errors.password_re}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Role">Quyền</label>
                    <select
                      name="Role"
                      value={formData.Role}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="admin">Quản lý</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Update_by">Người cập nhật</label>
                    <input
                      type="text"
                      name="Update_by"
                      value={formData.Update_by}
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

export default EditUser;