import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MainMenu from "../components/main-menu";
import Footer from "../components/Footer";
import '../css/Page.css'; 

const Page = () => {
    const { slug } = useParams(); 
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDetail, setShowDetail] = useState(false); 

    useEffect(() => {
        axios.get("http://localhost:8000/api/post")
            .then((response) => {
                const page = response.data.data.find(
                    (post) => post.type === "page" && post.status === 1 && post.slug === slug
                );
                if (page) {
                    setPageData(page);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Lỗi khi lấy dữ liệu:", error);
                setLoading(false);
            });
    }, [slug]);

    const toggleDetail = () => {
        setShowDetail(!showDetail); 
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (!pageData) {
        return <div className="no-data">Không có dữ liệu.</div>;
    }

    return (
        <>
            <MainMenu />
            <div className="page-container">
                <div 
                    className={`page-card ${showDetail ? 'active' : ''}`} 
                    onClick={toggleDetail} // Nhấn vào card để mở/đóng chi tiết
                >
                    <div className="page-image">
                        <img
                            src={`http://localhost:8000/images/posts/${pageData.image}`}
                            alt={pageData.title}
                            className="img-fluid"
                        />
                    </div>
                    <div className="page-content">
                        <h1 className="page-title">{pageData.title}</h1>
                        <p className="page-description">{pageData.description}</p>
                        {showDetail && (
                            <div className="page-detail">
                                <p>{pageData.detail}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Page;
