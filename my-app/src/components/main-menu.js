import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../css/mainmenu.css";
import SearchBox from "./SearchBox";

const MainMenu = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCartCount = async () => {
    const userToken = localStorage.getItem("token");
    setIsLoggedIn(!!userToken);

    if (userToken) {
      try {
        // Decode token to get user_id
        let userId;
        try {
          const decodedToken = jwtDecode(userToken);
          userId = decodedToken.sub || decodedToken.id || decodedToken.userId;
          if (!userId) {
            throw new Error("Không tìm thấy user_id trong token");
          }
        } catch (err) {
          console.error("Lỗi khi giải mã token:", err);
          return;
        }

        // Fetch cart
        const cartResponse = await axios.get(
          `https://localhost:7213/api/public/Cart/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              Accept: "application/json",
            },
          }
        );

        const cartId = cartResponse.data.id;

        // Fetch cart items
        const cartItemsResponse = await axios.get(
          "https://localhost:7213/api/admin/CartItem",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              Accept: "application/json",
            },
          }
        );

        const cartItems = cartItemsResponse.data.filter(
          (item) => item.cart_id === cartId
        );

        // Count number of distinct products
        setCartCount(cartItems.length);
      } catch (err) {
        console.error("Lỗi khi lấy giỏ hàng:", err);
        // Fallback to localStorage if backend fails
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartCount(cart.length);
      }
    } else {
      // For non-logged-in users, use localStorage
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdated = (event) => {
      const cart = event.detail || [];
      setCartCount(cart.length);
      // Re-fetch from backend if logged in
      if (isLoggedIn) {
        fetchCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const listMenu = [
    { name: "Trang chủ", link: "/" },
    { name: "Giới Thiệu", link: "/trang-don/gioi-thieu" },
    { name: "Cửa Hàng", link: "/shop" },
    { name: "Tất cả sản phẩm", link: "/tat-ca-san-pham", isDanger: true },
    { name: "Đồ Nam", link: "/danh-muc/1" },
    { name: "Đồ Nữ", link: "/danh-muc/3" },
  ];

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  // Use fullName if available, otherwise fallback to "Khách hàng"
  const userName = user && user.fullName ? user.fullName : "Khách hàng";

  return (
    <>
      <section className="top-info">
        <div className="container d-flex justify-content-center align-items-center">
          <div className="contact-info d-flex flex-wrap justify-content-center">
            <a href="#" className="d-flex align-items-center mx-2">
              <i
                className="fa fa-map-marker"
                aria-hidden="true"
                style={{ color: "#009900", marginRight: "5px" }}
              ></i>
              79 Cửa hàng trên Toàn Quốc
            </a>
            <Link
              to="/contact"
              className="text-danger d-flex align-items-center mx-2"
            >
              <i
                className="fa fa-phone"
                aria-hidden="true"
                style={{ color: "#ff4757", marginRight: "5px" }}
              ></i>
              LIÊN HỆ
            </Link>
            <Link
              to="/trang-don/chinh-sach-mua-hang"
              className="d-flex align-items-center mx-2"
            >
              <i
                className="fa fa-truck"
                aria-hidden="true"
                style={{ color: "#1e90ff", marginRight: "5px" }}
              ></i>
              Điều khoản
            </Link>
            <a href="#" className="d-flex align-items-center mx-2">
              <i
                className="fa fa-headphones"
                aria-hidden="true"
                style={{ color: "#2ed573", marginRight: "5px" }}
              ></i>
              Trung tâm hỗ trợ
            </a>
            <a href="#" className="d-flex align-items-center mx-2">
              <i
                className="fa fa-search"
                aria-hidden="true"
                style={{ color: "#ffa502", marginRight: "5px" }}
              ></i>
              Quan tâm
            </a>
          </div>
        </div>
      </section>
      <header className="header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="logo me-3">
            <Link to="/">
              <img
                src="https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-FM-1024x552.png"
                alt="Logo"
              />
            </Link>
          </div>
          <div className="d-flex justify-content-between align-items-center flex-grow-1">
            <nav className="navbar navbar-expand-lg flex-grow-1">
              <div className="container-fluid">
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNavDropdown"
                  aria-controls="navbarNavDropdown"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <i className="fa-solid fa-bars text-dark fs-3"></i>
                </button>
                <div
                  className="collapse navbar-collapse"
                  id="navbarNavDropdown"
                >
                  <ul className="navbar-nav">
                    {listMenu.map((menuItem, index) => (
                      <li key={index} className="nav-item">
                        <Link
                          to={menuItem.link}
                          className={`nav-link ${
                            menuItem.isDanger ? "text-danger" : ""
                          }`}
                        >
                          {menuItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </nav>
            <div className="d-flex align-items-center">
              <SearchBox />
              <div className="user-actions d-flex align-items-center">
                <Link to="/cart" className="cart me-3">
                  <i
                    className="fa-solid fa-cart-shopping"
                    style={{ fontSize: "24px", color: "green" }}
                    aria-hidden="true"
                  ></i>
                  <span className="badge" id="showqty">
                    {cartCount}
                  </span>
                </Link>

                {user ? (
                  <div
                    className="dropdown"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="user-info-wrapper">
                      <img
                        src={`https://th.bing.com/th/id/OIP.ozhqoYx_yb0Vj0vE10XXLAHaHa?rs=1&pid=ImgDetMain`}
                        alt={userName}
                        className="account-page-img"
                      />
                      <span className="dropdown-toggle" role="button">
                        Xin chào, {userName}
                      </span>
                    </div>

                    {isDropdownOpen && (
                      <div className="dropdown-menu show">
                        <Link to="/account" className="dropdown-item">
                          Thông tin tài khoản
                        </Link>
                        <Link to="/order-history" className="dropdown-item">
                          Lịch sử đơn hàng
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item text-danger"
                        >
                          <strong>Đăng xuất</strong>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="d-flex align-items-center">
                    <Link to="/login" className="me-2">
                      <i className="fa fa-user" aria-hidden="true"></i> ĐĂNG
                      NHẬP
                    </Link>
                    <Link to="/register">ĐĂNG KÝ</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default MainMenu;