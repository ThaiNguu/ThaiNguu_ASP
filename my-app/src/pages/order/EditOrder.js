import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function EditOrder() {
  const { id } = useParams(); // Lấy id từ URL
  const [formData, setFormData] = useState({
    delivery_name: '',
    delivery_email: '',
    delivery_phone: '',
    delivery_address: '',
    note: '',
    type: '',
    status: '1', // Trạng thái mặc định
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/api/order/${id}`)
      .then(response => response.json())
      .then(orderData => {
        // Giả sử orderData chứa một đối tượng đơn hàng
        setFormData({
          delivery_name: orderData.delivery_name,
          delivery_email: orderData.delivery_email,
          delivery_phone: orderData.delivery_phone,
          delivery_address: orderData.delivery_address,
          note: orderData.note,
          type: orderData.type,
          status: orderData.status,
        });
      })
      .catch(error => setErrorMessage('Lỗi khi lấy dữ liệu đơn hàng'));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.delivery_name) formErrors.delivery_name = 'Tên người nhận là bắt buộc';
    if (!formData.delivery_email) formErrors.delivery_email = 'Email là bắt buộc';
    if (!formData.delivery_phone) formErrors.delivery_phone = 'Điện thoại là bắt buộc';
    if (!formData.delivery_address) formErrors.delivery_address = 'Địa chỉ là bắt buộc';
    if (!formData.type) formErrors.type = 'Loại là bắt buộc';
    
    return formErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    fetch(`http://localhost:8000/api/order/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(data => {
      if (data.ok) {
        navigate('/admin/order');
      } else {
        setErrorMessage('Có lỗi xảy ra khi cập nhật đơn hàng');
      }
    })
    .catch(error => {
      setErrorMessage('Lỗi khi cập nhật đơn hàng');
      console.log(error);
    });
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Sửa đơn hàng</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Sửa đơn hàng</li>
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
                <button type="submit" onClick={handleSubmit} className="btn btn-sm btn-success">
                  <i className="fa fa-save"></i> Cập nhật
                </button>
                <Link className="btn btn-sm btn-info" to="/admin/order">
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
                    <label htmlFor="delivery_name">Tên người nhận</label>
                    <input type="text" name="delivery_name" value={formData.delivery_name} onChange={handleChange} className="form-control" />
                    {errors.delivery_name && <p className="text-danger">{errors.delivery_name}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="delivery_email">Email</label>
                    <input type="email" name="delivery_email" value={formData.delivery_email} onChange={handleChange} className="form-control" />
                    {errors.delivery_email && <p className="text-danger">{errors.delivery_email}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="delivery_phone">Điện thoại</label>
                    <input type="text" name="delivery_phone" value={formData.delivery_phone} onChange={handleChange} className="form-control" />
                    {errors.delivery_phone && <p className="text-danger">{errors.delivery_phone}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="delivery_address">Địa chỉ</label>
                    <input type="text" name="delivery_address" value={formData.delivery_address} onChange={handleChange} className="form-control" />
                    {errors.delivery_address && <p className="text-danger">{errors.delivery_address}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="note">Ghi chú</label>
                    <textarea name="note" value={formData.note} onChange={handleChange} className="form-control"></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="type">Loại</label>
                    <input type="text" name="type" value={formData.type} onChange={handleChange} className="form-control" />
                    {errors.type && <p className="text-danger">{errors.type}</p>}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor="status">Trạng thái</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                      
                      <option value="1">Xuất bản</option>
                      <option value="2">Chưa xuất bản</option>
                    </select>
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

export default EditOrder;
