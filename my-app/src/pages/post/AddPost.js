import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AddPost() {
  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    description: '',
    topic_id: '',
    type: 'post', // Giá trị mặc định cho kiểu bài viết
    image: null,
    status: '1', // Giá trị mặc định cho trạng thái
  });
  const [topics, setTopics] = useState([]);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  // Lấy danh sách các chủ đề từ API
  useEffect(() => {
    fetch('http://localhost:8000/api/topic')
      .then(response => response.json())
      .then(data => setTopics(data.data)) // Lấy dữ liệu từ thuộc tính data
      .catch(error => setErrorMessage('Lỗi khi lấy dữ liệu chủ đề'));
  }, []);
  

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.title) formErrors.title = 'Tiêu đề là bắt buộc';
    if (!formData.detail) formErrors.detail = 'Chi tiết là bắt buộc';
    if (!formData.description) formErrors.description = 'Mô tả là bắt buộc';
    if (!formData.topic_id) formErrors.topic_id = 'Chủ đề là bắt buộc';

    return formErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    fetch('http://localhost:8000/api/post', {
      method: 'POST',
      body: formDataToSend,
    })
      .then(response => {
        if (response.ok) {
          navigate('/admin/post');
        } else {
          setErrorMessage('Có lỗi xảy ra khi thêm bài viết');
        }
      })
      .catch(error => {
        setErrorMessage('Lỗi khi thêm bài viết');
        console.log(error);
      });
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Thêm bài viết</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thêm bài viết</li>
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
                  <i className="fa fa-save"></i> Lưu
                </button>
                <Link className="btn btn-sm btn-info" to="/admin/post">
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
                    <label htmlFor="title">Tiêu đề</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" />
                    {errors.title && <p className="text-danger">{errors.title}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="detail">Chi tiết</label>
                    <textarea name="detail" value={formData.detail} onChange={handleChange} className="form-control"></textarea>
                    {errors.detail && <p className="text-danger">{errors.detail}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description">Mô tả</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="form-control"></textarea>
                    {errors.description && <p className="text-danger">{errors.description}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="topic_id">Chủ đề</label>
                    <select name="topic_id" value={formData.topic_id} onChange={handleChange} className="form-control">
                      <option value="">Chọn chủ đề</option>
                      {topics.map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                      ))}
                    </select>
                    {errors.topic_id && <p className="text-danger">{errors.topic_id}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="type">Kiểu</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="form-control">
                      <option value="post">Bài viết</option>
                      <option value="page">Trang đơn</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="image">Hình ảnh</label>
                    <input type="file" name="image" onChange={handleChange} className="form-control" />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor="status">Trạng thái</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                      <option value="1">Xuất bản</option>
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

export default AddPost;
