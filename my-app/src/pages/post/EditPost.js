import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function EditPost() {
  const { id } = useParams(); // Lấy ID từ URL
  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    description: '',
    topic_id: '',
    type: 'post', // Giá trị mặc định cho kiểu bài viết
    image: null,
    status: '1', // Giá trị mặc định cho trạng thái
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [topics, setTopics] = useState([]); // Khởi tạo danh sách chủ đề là mảng trống
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dữ liệu bài viết dựa trên ID
    fetch(`http://localhost:8000/api/post/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setFormData({
          title: data.title || '',
          detail: data.detail || '',
          description: data.description || '',
          topic_id: data.topic_id || '',
          type: data.type || 'post',
          status: data.status || '1',
          image: null, // Không gán hình ảnh từ API
        });
      })
      .catch(error => {
        setErrorMessage('Lỗi khi lấy dữ liệu bài viết: ' + error.message);
        console.log(error);
      });

    // Fetch danh sách chủ đề
    fetch(`http://localhost:8000/api/topic`) // Thay đổi URL này thành API lấy danh sách chủ đề
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data); // In dữ liệu ra console để kiểm tra
        if (Array.isArray(data.data)) { // Kiểm tra dữ liệu có phải là mảng không
          setTopics(data.data); // Gán dữ liệu chủ đề từ thuộc tính data
        } else {
          setErrorMessage('Dữ liệu trả về không phải là mảng');
        }
      })
      .catch(error => {
        setErrorMessage('Lỗi khi lấy danh sách chủ đề: ' + error.message);
        console.log(error);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, [name]: files[0] }); // Lưu trữ tệp hình ảnh
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

    // Gửi yêu cầu PUT để cập nhật bài viết
    const data = {
      title: formData.title,
      detail: formData.detail,
      description: formData.description,
      topic_id: formData.topic_id,
      type: formData.type,
      status: formData.status,
    };

    updatePost(data);
  };

  const updatePost = (data) => {
    fetch(`http://localhost:8000/api/post/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (response.ok) {
          // Nếu có hình ảnh mới, gửi yêu cầu tải hình ảnh lên
          if (formData.image) {
            uploadImage(formData.image);
          } else {
            navigate('/admin/post'); // Chuyển hướng về danh sách bài viết nếu không có hình ảnh
          }
        } else {
          setErrorMessage('Có lỗi xảy ra khi cập nhật bài viết');
        }
      })
      .catch(error => {
        setErrorMessage('Lỗi khi cập nhật bài viết');
        console.log(error);
      });
  };

  const uploadImage = (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    fetch(`http://localhost:8000/api/post/${id}/upload-image`, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          navigate('/admin/post'); // Chuyển hướng về danh sách bài viết
        } else {
          setErrorMessage('Có lỗi xảy ra khi tải hình ảnh');
        }
      })
      .catch(error => {
        setErrorMessage('Lỗi khi tải hình ảnh');
        console.log(error);
      });
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Sửa bài viết</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Sửa bài viết</li>
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
                      {topics.map(topic => ( // Đã bỏ kiểm tra Array.isArray ở đây
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                      ))}
                    </select>
                    {errors.topic_id && <p className="text-danger">{errors.topic_id}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="image">Hình ảnh</label>
                    <input type="file" name="image" onChange={handleChange} className="form-control" />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor="type">Kiểu</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="form-control">
                      <option value="post">Bài viết</option>
                      <option value="page">Trang</option>
                    </select>
                  </div>
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

export default EditPost;
