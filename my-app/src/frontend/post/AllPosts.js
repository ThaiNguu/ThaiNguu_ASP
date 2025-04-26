import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from '../../components/PostCard';
import MainMenu from '../../components/main-menu'; 
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom'; // Nhập useNavigate
import '../../css/phantrang.css';

const AllPosts = ({ slug }) => {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]); // Trạng thái để lưu danh sách chủ đề
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4); // Số bài viết mỗi trang
  const navigate = useNavigate(); // Khởi tạo useNavigate

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/post?slug=${slug}`);
        const filteredPosts = response.data.data.filter(post => post.status === 1 && post.type==="post");
        const sortedPosts = filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    const fetchTopics = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/topic'); // Lấy danh sách chủ đề
        setTopics(response.data.data);
      } catch (error) {
        console.error("Error fetching topics: ", error);
      }
    };

    fetchPosts();
    fetchTopics();
  }, [slug]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const pageCount = Math.ceil(posts.length / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleTopicClick = (topicId) => {
    navigate(`/bai-viet/theo-chu-de/${topicId}`); // Chuyển hướng đến trang theo chủ đề
  };

  return (
    <div className="post">
      <MainMenu />
      <div className="container-fluid d-flex">
        <div className="col-3">
          <div className="sidebar">
            <h3 className='text-black'>Chủ đề</h3>
            <ul className="list-group">
              {topics.map(topic => (
                <li 
                  key={topic.id} 
                  className="list-group-item" 
                  onClick={() => handleTopicClick(topic.id)} // Gọi hàm khi nhấp vào chủ đề
                  style={{ cursor: 'pointer' }} // Thêm hiệu ứng con trỏ
                >
                  {topic.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-9">
          <h1 className="text-center my-4">Tất cả bài viết</h1>
          <div className="row no-gutters">
            {currentPosts.length === 0 ? (
              <p className="text-center">Không có bài viết nào</p>
            ) : (
              currentPosts.map(post => (
                <div key={post.id} className="col-6 mb-4 px-0">
                  <PostCard postItem={post} />
                </div>
              ))
            )}
          </div>

          {/* Phân trang */}
          <div className="pagination d-flex justify-content-center mt-4">
            <button 
              className="btn btn-primary me-2" 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="align-self-center">Page {currentPage} of {pageCount}</span>
            <button 
              className="btn btn-primary ms-2" 
              onClick={handleNextPage} 
              disabled={currentPage === pageCount}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllPosts;
