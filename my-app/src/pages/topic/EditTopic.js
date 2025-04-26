import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function EditTopic() {
  const { id } = useParams(); // Lấy id từ URL
  const [formData, setFormData] = useState({
    name: '',
    sort_order: '',
    description: '',
    status: '2',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/api/topic/${id}`)
      .then(response => response.json())
      .then(topicData => {
        // Giả sử topicData chứa một đối tượng chủ đề
        setFormData({
          name: topicData.name,
          sort_order: topicData.sort_order,
          description: topicData.description,
          status: topicData.status,
        });
      })
      .catch(error => setErrorMessage('Lỗi khi lấy dữ liệu chủ đề'));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.name) formErrors.name = 'Tên chủ đề là bắt buộc';
    if (!formData.sort_order) formErrors.sort_order = 'Sắp xếp là bắt buộc';
    if (!formData.description) formErrors.description = 'Mô tả là bắt buộc';
    
    return formErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    fetch(`http://localhost:8000/api/topic/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(data => {
      if (data.ok) {
        navigate('/admin/topic');
      } else {
        setErrorMessage('Có lỗi xảy ra khi cập nhật chủ đề');
      }
    })
    .catch(error => {
      setErrorMessage('Lỗi khi cập nhật chủ đề');
      console.log(error);
    });
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Sửa chủ đề</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Sửa chủ đề</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/topic">
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
                    <label htmlFor="name">Tên chủ đề</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" />
                    {errors.name && <p className="text-danger">{errors.name}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sort_order">Sắp xếp</label>
                    <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} className="form-control" />
                    {errors.sort_order && <p className="text-danger">{errors.sort_order}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description">Mô tả</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="form-control"></textarea>
                    {errors.description && <p className="text-danger">{errors.description}</p>}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor="status">Trạng thái</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                      <option value="2">Chưa xuất bản</option>
                      <option value="1">Xuất bản</option>
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

export default EditTopic;
