import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddUser() {
  const [formData, setFormData] = useState({
    UserName: '',
    FullName: '',
    Phone: '',
    Address: '',
    Role: 'customer',
    Email: '',
    PasswordHash: '',
    password_re: '',
    Create_by: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy user ID từ localStorage cho Create_by
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, Create_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để thêm thành viên');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    if (!formData.PasswordHash) {
      formErrors.PasswordHash = 'Mật khẩu là bắt buộc';
    } else if (formData.PasswordHash.length < 6) {
      formErrors.PasswordHash = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (formData.PasswordHash !== formData.password_re) {
      formErrors.password_re = 'Mật khẩu xác nhận không khớp';
    }
    if (!formData.Create_by) {
      formErrors.Create_by = 'Người tạo là bắt buộc';
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

    // Chuẩn bị dữ liệu gửi đi theo model User
    const userData = {
      Id: '', // Backend tự tạo
      UserName: formData.UserName,
      FullName: formData.FullName,
      Phone: formData.Phone,
      Address: formData.Address,
      Role: formData.Role,
      Email: formData.Email,
      PasswordHash: formData.PasswordHash,
      Create_at: new Date().toISOString(), // Backend có thể ghi đè
      Create_by: formData.Create_by,
      Update_at: null,
      Update_by: formData.Create_by, // Mặc định dùng Create_by
      Delete_at: null,
      Delete_by: formData.Create_by, // Mặc định dùng Create_by
    };

    console.log('Dữ liệu gửi đi:', userData); // Debug dữ liệu

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Vui lòng đăng nhập để thêm thành viên');
        return;
      }

      // Tạo người dùng mới
      const response = await axios.post(
        'https://localhost:7213/api/public/User',
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        const userId = response.data.id; // Giả định API trả về userId

        // Tạo giỏ hàng ngầm cho người dùng mới
        try {
          await axios.post(
            'https://localhost:7213/api/public/Cart',
            {
              id: 0,
              user_id: userId,
              totalPrice: 0,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );
          console.log('Giỏ hàng được tạo thành công cho user_id:', userId);
        } catch (cartError) {
          console.error('Lỗi khi tạo giỏ hàng:', cartError);
          setErrorMessage('Thêm thành viên thành công nhưng không thể tạo giỏ hàng. Vui lòng kiểm tra lại.');
          // Tiếp tục chuyển hướng dù lỗi tạo giỏ hàng
        }

        navigate('/admin/user');
      } else {
        setErrorMessage('Có lỗi xảy ra khi thêm thành viên');
      }
    } catch (error) {
      console.error('Lỗi khi thêm thành viên:', error);
      let errorMsg = 'Lỗi khi thêm thành viên';
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
              <h1>Thêm thành viên</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Thêm thành viên</li>
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
                    <label htmlFor="Create_by">Người tạo</label>
                    <input
                      type="text"
                      name="Create_by"
                      value={formData.Create_by}
                      disabled
                      className="form-control"
                    />
                    {errors.Create_by && (
                      <p className="text-danger">{errors.Create_by}</p>
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

export default AddUser;