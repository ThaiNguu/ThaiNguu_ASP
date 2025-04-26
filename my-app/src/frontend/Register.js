import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    UserName: '',
    FullName: '',
    Phone: '',
    Address: '',
    Email: '',
    PasswordHash: '',
    password_re: '',
    Role: 'customer', // Fixed to 'customer'
    Create_by: 'system', // Default for public registration
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Prepare user data for API
    const userData = {
      Id: '', // Backend will generate
      UserName: formData.UserName,
      FullName: formData.FullName,
      Phone: formData.Phone,
      Address: formData.Address,
      Role: 'customer', // Fixed to 'customer'
      Email: formData.Email,
      PasswordHash: formData.PasswordHash,
      Create_at: new Date().toISOString(),
      Create_by: formData.Create_by, // 'system' for public registration
      Update_at: null,
      Update_by: formData.Create_by,
      Delete_at: null,
      Delete_by: formData.Create_by,
    };

    console.log('Dữ liệu gửi đi:', userData); // Debug data

    try {
      // Register user
      const response = await axios.post(
        'https://localhost:7213/api/public/User',
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            // Token not included, assuming public endpoint
          },
        }
      );

      if (response.status === 201) {
        const userId = response.data.id; // Assuming API returns user ID

        // Create cart for new user
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
                // Token not included, assuming public endpoint
              },
            }
          );
          console.log('Giỏ hàng được tạo thành công cho user_id:', userId);
        } catch (cartError) {
          console.error('Lỗi khi tạo giỏ hàng:', cartError);
          toast.warn('Đăng ký thành công nhưng không thể tạo giỏ hàng. Vui lòng kiểm tra lại.');
        }

        toast.success('Đăng ký thành công!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrorMessage('Có lỗi xảy ra khi đăng ký');
        toast.error('Có lỗi xảy ra khi đăng ký');
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      let errorMsg = 'Lỗi khi đăng ký';
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
      toast.error(errorMsg);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-header">Đăng ký tài khoản</h2>
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-form-group">
          <label htmlFor="FullName" className="register-label">
            Họ tên
          </label>
          <input
            type="text"
            name="FullName"
            value={formData.FullName}
            onChange={handleChange}
            className="register-input"
          />
          {errors.FullName && <p className="register-error">{errors.FullName}</p>}
        </div>
        <div className="register-form-group">
          <label htmlFor="Phone" className="register-label">
            Điện thoại
          </label>
          <input
            type="text"
            name="Phone"
            value={formData.Phone}
            onChange={handleChange}
            className="register-input"
          />
          {errors.Phone && <p className="register-error">{errors.Phone}</p>}
        </div>
        <div className="register-form-group">
          <label htmlFor="Email" className="register-label">
            Email
          </label>
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            className="register-input"
          />
          {errors.Email && <p className="register-error">{errors.Email}</p>}
        </div>
        <div className="register-form-group">
          <label htmlFor="Address" className="register-label">
            Địa chỉ
          </label>
          <input
            type="text"
            name="Address"
            value={formData.Address}
            onChange={handleChange}
            className="register-input"
          />
        </div>
        <div className="register-form-group half-width">
          <label htmlFor="UserName" className="register-label">
            Tên đăng nhập
          </label>
          <input
            type="text"
            name="UserName"
            value={formData.UserName}
            onChange={handleChange}
            className="register-input"
          />
          {errors.UserName && <p className="register-error">{errors.UserName}</p>}
        </div>
        <div className="register-form-group half-width">
          <label htmlFor="PasswordHash" className="register-label">
            Mật khẩu
          </label>
          <input
            type="password"
            name="PasswordHash"
            value={formData.PasswordHash}
            onChange={handleChange}
            className="register-input"
          />
          {errors.PasswordHash && (
            <p className="register-error">{errors.PasswordHash}</p>
          )}
        </div>
        <div className="register-form-group half-width">
          <label htmlFor="password_re" className="register-label">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            name="password_re"
            value={formData.password_re}
            onChange={handleChange}
            className="register-input"
          />
          {errors.password_re && (
            <p className="register-error">{errors.password_re}</p>
          )}
        </div>
        <button type="submit" className="register-button">
          Đăng ký
        </button>
      </form>
    </div>
  );
}

export default Register;