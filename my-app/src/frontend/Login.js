import React, { useState } from 'react';
import axios from 'axios';
import '../css/login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Xóa lỗi cũ
        try {
            // Gọi API đăng nhập
            const loginResponse = await axios.post('https://localhost:7213/api/login', { email, password });
            const { token } = loginResponse.data;
            localStorage.setItem('token', token);

            // Gọi API lấy danh sách người dùng
            const userResponse = await axios.get('https://localhost:7213/api/public/User', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const users = userResponse.data;

            // Lọc người dùng có email khớp
            const currentUser = users.find(user => user.email === email);
            if (!currentUser) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            // Chuẩn hóa dữ liệu người dùng
            const userData = {
                id: currentUser.id,
                username: currentUser.userName,
                fullName: currentUser.fullName,
                email: currentUser.email,
                phone: currentUser.phone || '',
                address: currentUser.address || '',
                roles: currentUser.role, // Chuẩn hóa thành 'roles' để khớp với ProtectedRoute
                created_at: currentUser.create_at || null,
                updated_at: currentUser.update_at || null
            };

            localStorage.setItem('user', JSON.stringify(userData));

            // Chuyển hướng đến trang admin
            window.location.replace('/admin');
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            const errorMessage = error.response?.data?.message || 'Tài khoản hoặc mật khẩu không đúng';
            setError(errorMessage);
        }
    };

    return (
        <div className="login-custom-container">
            <h2 className="login-title">Đăng Nhập</h2>
            {error && <p className="login-error-message">{error}</p>}
            <form onSubmit={handleLogin} className="login-form-custom">
                <div className="login-form-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="login-form-group">
                    <label htmlFor="login-password">Mật khẩu</label>
                    <input
                        id="login-password"
                        type="password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-submit-btn">Đăng Nhập</button>
            </form>
        </div>
    );
};

export default Login;