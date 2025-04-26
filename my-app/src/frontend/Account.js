import React from 'react';
import '../css/Account.css'; // Import CSS file
import MainMenu from '../components/main-menu';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

function Account() {
    // Lấy thông tin người dùng từ localStorage
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user) {
        return <p>Không có thông tin người dùng.</p>;
    }

    return (
        <>
            <MainMenu />
            <div className="account-page-container">
                <h2 className="account-page-header">Thông tin tài khoản</h2>
                <div className="account-page-info">
                    <img
                        src={`https://th.bing.com/th/id/OIP.ozhqoYx_yb0Vj0vE10XXLAHaHa?rs=1&pid=ImgDetMain`} // Đường dẫn đến ảnh
                        alt={user.name}
                        className="account-page-img" // Thay đổi class
                    />
                    <div className="account-page-details">
                        <p><strong>Họ tên:</strong> {user.name}</p>
                        <p><strong>Tên đăng nhập:</strong> {user.username}</p>

                        <p><strong>Điện thoại:</strong> {user.phone}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Địa chỉ:</strong> {user.address}</p>
                        <p><strong>Vai trò:</strong> {user.roles}</p>
                        <p><strong>Trạng thái:</strong> {user.status === 1 ? 'Kích hoạt' : 'Không kích hoạt'}</p>
                        <p><strong>Ngày tạo:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : 'Chưa có'}</p>
                        <p><strong>Ngày cập nhật:</strong> {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Chưa có'}</p>
                    </div>
                </div>
                {/* Nút đổi thông tin người dùng */}
                <Link to={`/edit-user/${user.id}`} className="btn btn-primary account-page-btn mt-3">
                    Đổi thông tin người dùng
                </Link>
            </div>
            <Footer />
        </>
    );
}

export default Account;
