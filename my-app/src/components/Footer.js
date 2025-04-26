// src/components/Footer.js
import React from "react";

const Footer = ({ listMenu }) => {
  return (
    <footer id="footer-container" className="footer bg-dark text-light p-4">
      <div className="container">
        <div className="row">
          {/* Thông tin cửa hàng */}
          <div className="col-md-4 mb-4">
            <h5>Về cửa hàng</h5>
            <p>
              Chúng tôi là cửa hàng thời trang hàng đầu, cung cấp nhiều sản phẩm
              quần áo và phụ kiện thời trang. Sứ mệnh của chúng tôi là mang đến
              sản phẩm chất lượng với giá cả phải chăng.
            </p>
            <p>
              © Bản quyền thuộc về{" "}
              <a href="/" className="text-light">
                Thái Ngưu
              </a>{" "}
              Mọi quyền được bảo lưu
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div className="col-md-4 mb-4">
            <h5>Liên kết nhanh</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/shop" className="text-light">
                  Cửa hàng
                </a>
              </li>
              <li>
                <a href="/about" className="text-light">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="/contact" className="text-light">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="/faq" className="text-light">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="/returns" className="text-light">
                  Chính sách đổi/trả
                </a>
              </li>
            </ul>
          </div>

          {/* Liên hệ & Mạng xã hội */}
          <div className="col-md-4 mb-4">
            <h5>Liên hệ</h5>
            <p>
              <i className="fas fa-phone-alt"></i> +84 123 456 789
            </p>
            <p>
              <i className="fas fa-envelope"></i> support@shop.com
            </p>
            <div className="social-icons">
              <a href="https://facebook.com" className="text-light mr-3">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://instagram.com" className="text-light mr-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" className="text-light">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Đăng ký nhận bản tin */}
        <div className="row mt-4">
          <div className="col-md-6">
            <h5>Đăng ký nhận tin mới</h5>
            <form className="newsletter-form">
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Nhập email của bạn"
                />
                <div className="input-group-append">
                  <button className="btn btn-primary" type="submit">
                    Đăng ký
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="col-md-6 text-right">
            <img
              src="https://dangkywebvoibocongthuong.com/wp-content/uploads/2021/11/logo-da-thong-bao-bo-cong-thuong.png"
              alt="Đã thông báo Bộ Công Thương"
              className="img-fluid"
              style={{ width: "150px" }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
