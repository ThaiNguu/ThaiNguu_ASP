import React, { useState } from 'react';
import axios from 'axios';
import MainMenu from '../components/main-menu';
import Footer from '../components/Footer';

const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user')); // Đảm bảo rằng thông tin là JSON hợp lệ
    const userId = user ? user.id : null; // Lấy userId từ đối tượng user

    const handleSubmit = async (e) => {
        e.preventDefault();
        const contactData = {
            user_id: userId, // Gán userId vào contactData
            name,
            email,
            phone,
            title,
            content,
        };

        try {
            const response = await axios.post('http://localhost:8000/api/contact', contactData);
            setSuccessMessage('Phản ánh của bạn đã được gửi thành công!');
            setErrorMessage(''); // Xóa bất kỳ thông báo lỗi nào trước đó
            // Reset các trường trong form
            setName('');
            setEmail('');
            setPhone('');
            setTitle('');
            setContent('');
        } catch (error) {
            setErrorMessage('Không thể gửi phản ánh. Vui lòng thử lại.');
            setSuccessMessage(''); // Xóa bất kỳ thông báo thành công nào trước đó
        }
    };

    return (
        <><MainMenu/>
        <div className="container mt-5">
            <h1>Liên hệ với chúng tôi</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Tên</label>
                    <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Điện thoại</label>
                    <input type="tel" className="form-control" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Tiêu đề</label>
                    <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="content" className="form-label">Nội dung</label>
                    <textarea className="form-control" id="content" rows="3" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Gửi</button>
            </form>
            {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
        </div>
        <Footer/>
        </>
    );
};

export default Contact;
