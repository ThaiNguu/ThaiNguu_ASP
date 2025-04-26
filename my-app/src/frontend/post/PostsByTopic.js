import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../../components/PostCard';
import MainMenu from '../../components/main-menu';
import Footer from '../../components/Footer';
import '../../css/phantrang.css'; // Đảm bảo sử dụng cùng file CSS

const PostsByTopic = () => {
  const { topicId } = useParams();
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4); // Số bài viết mỗi trang giống với AllPosts
  const [cache, setCache] = useState({});
  const [selectedTopicName, setSelectedTopicName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostsByTopic = async () => {
      setLoading(true);
      setError('');

      // Nếu có trong cache, lấy từ cache
      if (cache[topicId]) {
        setPosts(cache[topicId]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/posts/by-topic?topic_id=${topicId}`);
        if (response.data.data && response.data.data.length > 0) {
          setPosts(response.data.data);
          setCache((prevCache) => ({ ...prevCache, [topicId]: response.data.data }));
        } else {
          setPosts([]);
          setError('Chủ đề này không có bài viết nào.');
        }
      } catch (err) {
        setError('Không có bài viết nào trong chủ đề này.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTopics = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/topic');
        setTopics(response.data.data);

        // Tìm tên chủ đề hiện tại từ topicId
        const selectedTopic = response.data.data.find(topic => topic.id === Number(topicId));
        if (selectedTopic) {
          setSelectedTopicName(selectedTopic.name);
        } else {
          setSelectedTopicName('');
        }
      } catch (error) {
        console.error("Error fetching topics: ", error);
      }
    };

    fetchPostsByTopic();
    fetchTopics();
  }, [topicId]);

  // Phân trang
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

  const handleTopicClick = (newTopicId) => {
    if (newTopicId !== topicId) {
      navigate(`/bai-viet/theo-chu-de/${newTopicId}`);
    }
  };

  return (
    <>
      <MainMenu />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <div className="sidebar">
              <h3>Chủ đề</h3>
              <ul className="list-group">
                {topics.map(topic => (
                  <li 
                    key={topic.id} 
                    className="list-group-item" 
                    onClick={() => handleTopicClick(topic.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {topic.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-md-9">
            <h1 className="text-center my-4">
              {selectedTopicName ? `Bài Viết Theo Chủ Đề: ${selectedTopicName}` : 'Bài Viết Theo Chủ Đề'}
            </h1>
            <div className="row">
              {error ? (
                <p className="text-center">{error}</p>
              ) : (
                currentPosts.length > 0 ? (
                  currentPosts.map(post => (
                    <div key={post.id} className="col-md-6 mb-4">
                      <PostCard postItem={post} />
                    </div>
                  ))
                ) : (
                  <p className="text-center">Chưa có bài viết nào.</p>
                )
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
      </div>
      <Footer />
    </>
  );
};

export default PostsByTopic;
