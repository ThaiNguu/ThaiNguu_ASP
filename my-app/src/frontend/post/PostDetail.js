import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Sử dụng useNavigate thay vì useHistory
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '../../components/Footer';
import MainMenu from '../../components/main-menu';
import '../../css/PostDetail.css'; // Thêm file CSS riêng nếu cần thiết

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/post/${id}`);

        if (!response.ok) {
          throw new Error('Bài viết không tồn tại.');
        }

        const responseText = await response.text(); // Nhận phản hồi dạng text
        console.log('Response Text:', responseText); // In phản hồi ra console

        let data;
        try {
          data = JSON.parse(responseText); // Chuyển đổi từ text sang JSON
        } catch (jsonError) {
          throw new Error('Lỗi phân tích cú pháp JSON: ' + jsonError.message);
        }

        setPost(data); // Đặt dữ liệu bài viết
      } catch (error) {
        console.error('Fetch error:', error);
        setError("Lỗi khi lấy thông tin bài viết: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  if (!post) {
    return <div className="text-center">Bài viết không tồn tại</div>;
  }

  const { title, detail, description, image, topic_id, type, created_at, updated_at, created_by, updated_by } = post;

  return (
    <div className="post-detail-container-unique"> {/* Đổi tên class container */}
      <MainMenu />
      
      <div className="post-detail-content-unique container my-4"> {/* Đổi tên class nội dung */}
      <button
              className="btn btn-primary mt-4" // Class Bootstrap cho nút
              onClick={() => navigate(-1)} // Điều hướng về trang trước
            >
              Trở về
            </button>
        <h1 className="post-detail-title-unique my-4 text-center">{title}</h1> {/* Đổi tên class tiêu đề */}
        <div className="row">
          <div className="col-md-12">
            
            <img
              src={`http://localhost:8000/images/posts/${image}`} // Đường dẫn tới hình ảnh
              alt={title}
              className="post-detail-image-unique img-fluid rounded shadow-lg" // Đổi tên class cho hình ảnh
            />
            <h2 className="post-detail-heading-unique mt-3">Chi tiết</h2> {/* Đổi tên class cho heading chi tiết */}
            <p className="post-detail-text-unique">{detail}</p> {/* Đổi tên class cho nội dung chi tiết */}
            <h3 className="post-description-heading-unique">Mô tả</h3> {/* Đổi tên class cho mô tả */}
            <p className="post-description-text-unique">{description}</p> {/* Đổi tên class cho mô tả văn bản */}
            <h4 className="post-info-heading-unique">Thông tin khác</h4> {/* Đổi tên class cho thông tin khác */}
            <ul className="post-info-list-unique"> {/* Đổi tên class cho danh sách thông tin */}
              <li><strong>Topic ID:</strong> {topic_id}</li>
              <li><strong>Loại:</strong> {type}</li>
              <li><strong>Ngày tạo:</strong> {new Date(created_at).toLocaleString()}</li>
              <li><strong>Ngày cập nhật:</strong> {new Date(updated_at).toLocaleString()}</li>
              <li><strong>Đã tạo bởi:</strong> {created_by}</li>
              <li><strong>Đã cập nhật bởi:</strong> {updated_by}</li>
            </ul>
            
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PostDetail;
