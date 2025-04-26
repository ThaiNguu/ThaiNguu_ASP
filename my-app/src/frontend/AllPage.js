import React, { useEffect, useState } from "react";
import axios from "axios";
import MainMenu from "../components/main-menu";
import Footer from "../components/Footer";
import '../css/AllPage.css'; // Import CSS tùy chỉnh cho AllPage

const AllPage = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePageId, setActivePageId] = useState(null); // Trạng thái để theo dõi page đang mở

    useEffect(() => {
        // Gọi API để lấy dữ liệu các trang đơn
        axios.get("http://localhost:8000/api/post")
            .then((response) => {
                // Lọc các bài viết có type là 'page' và status là 1
                const filteredPages = response.data.data.filter(
                    (post) => post.type === "page" && post.status === 1
                );
                setPages(filteredPages);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Lỗi khi lấy dữ liệu:", error);
                setLoading(false);
            });
    }, []);

    const toggleDetails = (id) => {
       
        setActivePageId((prevId) => (prevId === id ? null : id));
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (pages.length === 0) {
        return <div className="no-data">Không có trang đơn nào để hiển thị.</div>;
    }

    return (
        <>
            <MainMenu />
            <div className="all-pages-container">
                <h1 className="all-pages-title text-red">Danh sách các trang đơn</h1>
                <div className="all-pages-list">
                    {pages.map((page) => (
                        <div
                            key={page.id}
                            className={`page-card ${activePageId === page.id ? 'active' : ''}`} // Thêm class active nếu card đang mở
                            onClick={() => toggleDetails(page.id)} // Sự kiện click để mở/đóng chi tiết
                        >
                            <div className="page-image">
                                <img 
                                    src={`http://localhost:8000/images/posts/${page.image}`} 
                                    alt={page.title} 
                                    className="img-fluid"
                                />
                            </div>
                            <div className="page-content">
                                <h2 className="page-title">{page.title}</h2>
                                <p className="page-description">{page.description}</p>
                                {activePageId === page.id && ( // Kiểm tra nếu page đang mở thì hiển thị chi tiết
                                    <div className="page-detail">
                                        <p>{page.detail}</p> {/* Hiển thị nội dung chi tiết của bài viết */}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllPage;
