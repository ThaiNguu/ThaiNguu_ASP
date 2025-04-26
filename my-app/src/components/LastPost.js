import React from 'react';
import { Link } from 'react-router-dom';

// Bootstrap CSS (add to your project via CDN or npm)
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

const LastPost = () => {
  // Dữ liệu bài viết cứng
  const posts = [
    {
      id: 1,
      title: 'Top 10 Xu Hướng Thời Trang Xuân Hè 2025',
      description: 'Khám phá những xu hướng thời trang nóng nhất mùa Xuân Hè 2025 với sắc màu tươi sáng, phom dáng độc đáo và chất liệu thân thiện môi trường.',
      image: 'https://media.fmplus.com.vn/uploads/news/2867070b-4701-4a0e-9d00-557fb55af13f.jpg',
      created_at: '2025-04-20',
    },
    {
      id: 2,
      title: 'Cách Phối Đồ Đi Làm Thanh Lịch Nhưng Vẫn Năng Động',
      description: 'Học ngay mẹo phối đồ công sở vừa chuyên nghiệp, vừa trẻ trung để tự tin tỏa sáng tại nơi làm việc.',
      image: 'https://media.fmplus.com.vn/uploads/news/d3ad003c-1416-44b0-b84e-69af107ea5ce.jpg',
      created_at: '2025-04-18',
    },
    {
      id: 3,
      title: 'Bí Quyết Chọn Phụ Kiện Tôn Dáng Mùa Hè',
      description: 'Tìm hiểu cách chọn phụ kiện thời trang giúp tôn lên vóc dáng và phong cách cá nhân trong mùa hè năng động.',
      image: 'https://media.fmplus.com.vn/uploads/news/6a9301fc-2945-4d12-bc3e-434990590380.jpg',
      created_at: '2025-04-15',
    },
  ];

  // Hàm kiểm tra xem image có phải là URL không
  const getImageSrc = (image) => {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `/images/posts/${image}`; // Fallback cho ảnh local
  };

  return (
    <section id="post-new" className="py-5 bg-light">
      <div className="container-fluid px-5">
        <h2 className="text-warning text-center mb-4">
          <i className="fas fa-newspaper me-2"></i> BÀI VIẾT
        </h2>
        <div className="row">
          {posts.length > 0 ? (
            <>
              {/* Bài viết lớn bên trái */}
              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm">
                  <img
                    src={getImageSrc(posts[0].image)}
                    alt={posts[0].title}
                    className="card-img-top"
                    style={{ height: '400px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200'; }}
                  />
                  <div className="card-body">
                    <h4 className="card-title">
                      <Link
                        className="text-dark text-decoration-none"
                        to={`/bai-viet/${posts[0].id}`}
                        title={posts[0].title}
                      >
                        {posts[0].title}
                      </Link>
                    </h4>
                    <p className="card-text">{posts[0].description}</p>
                  </div>
                </div>
              </div>

              {/* Hai bài viết nhỏ bên phải */}
              <div className="col-md-6 mb-4">
                <div className="d-flex flex-column h-100">
                  {posts.slice(1).map((post) => (
                    <div key={post.id} className="card shadow-sm mb-4 flex-grow-1">
                      <img
                        src={getImageSrc(post.image)}
                        alt={post.title}
                        className="card-img-top"
                        style={{ height: '150px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200'; }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">
                          <Link
                            className="text-dark text-decoration-none"
                            to={`/bai-viet/${post.id}`}
                            title={post.title}
                          >
                            {post.title}
                          </Link>
                        </h5>
                        <p className="card-text">{post.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="col-12 text-center">
              <p>Không có bài viết nào.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LastPost;