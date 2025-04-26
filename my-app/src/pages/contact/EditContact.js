import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function EditContact() {
  const { id } = useParams(); // Lấy id từ URL
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    content: '',
    replay_id: '',
    status: '1', // Giả sử trạng thái mặc định là "Đã xuất bản"
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/api/contact/${id}`)
      .then(response => response.json())
      .then(contactData => {
        // Giả sử contactData chứa một đối tượng liên hệ
        setFormData({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          title: contactData.title,
          content: contactData.content,
          replay_id: contactData.replay_id,
          status: contactData.status,
        });
      })
      .catch(error => setErrorMessage('Lỗi khi lấy dữ liệu liên hệ'));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.name) formErrors.name = 'Tên là bắt buộc';
    if (!formData.email) formErrors.email = 'Email là bắt buộc';
    if (!formData.phone) formErrors.phone = 'Điện thoại là bắt buộc';
    if (!formData.title) formErrors.title = 'Tiêu đề là bắt buộc';
    if (!formData.content) formErrors.content = 'Nội dung là bắt buộc';

    return formErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    fetch(`http://localhost:8000/api/contact/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(data => {
      if (data.ok) {
        navigate('/admin/contact');
      } else {
        setErrorMessage('Có lỗi xảy ra khi cập nhật liên hệ');
      }
    })
    .catch(error => {
      setErrorMessage('Lỗi khi cập nhật liên hệ');
      console.log(error);
    });
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Sửa liên hệ</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Sửa liên hệ</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/contact">
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
                    <label htmlFor="name">Tên</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" />
                    {errors.name && <p className="text-danger">{errors.name}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
                    {errors.email && <p className="text-danger">{errors.email}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone">Điện thoại</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
                    {errors.phone && <p className="text-danger">{errors.phone}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="title">Tiêu đề</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" />
                    {errors.title && <p className="text-danger">{errors.title}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content">Nội dung</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} className="form-control"></textarea>
                    {errors.content && <p className="text-danger">{errors.content}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="replay_id">ID phản hồi</label>
                    <input type="text" name="replay_id" value={formData.replay_id} onChange={handleChange} className="form-control" />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor="status">Trạng thái</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                      <option value="1">Đã xuất bản</option>
                      <option value="0">Chưa xuất bản</option>
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

export default EditContact;
