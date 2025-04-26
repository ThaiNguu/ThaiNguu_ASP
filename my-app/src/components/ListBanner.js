import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/listbanner.css';

function BannerList() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Fetch banners from the API
        const response = await axios.get('https://localhost:7213/api/public/Banner');
        const bannerData = response.data;

        // Check if the response is an array
        if (Array.isArray(bannerData)) {
          // Filter banners with status === true and sort by position and create_at
          const filteredBanners = bannerData.filter((banner) => banner.status === true);
          const sortedBanners = filteredBanners.sort(
            (a, b) =>
              a.position - b.position ||
              new Date(b.create_at) - new Date(a.create_at)
          );
          setBanners(sortedBanners);
          console.log('Danh sách banner:', sortedBanners);
        } else {
          setError('Dữ liệu banner trả về không phải là mảng');
        }
      } catch (error) {
        console.error('Có lỗi xảy ra khi gọi API:', error);
        setError('Không thể tải banner. Vui lòng thử lại sau.');
      }
    };

    fetchBanners();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (error) {
    return (
      <section id="custom-slider" className="p-3" style={{ paddingTop: '100px' }}>
        <div className="slider-container">
          <p className="text-danger text-center">{error}</p>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section id="custom-slider" className="p-3" style={{ paddingTop: '100px' }}>
        <div className="slider-container">
          <p className="text-center">Không có banner nào để hiển thị</p>
        </div>
      </section>
    );
  }

  return (
    <section id="custom-slider" className="p-3" style={{ paddingTop: '100px' }}>
      <div className="slider-container">
        <button className="prev" onClick={prevSlide}>
          ❮
        </button>
        <div
          className="slides"
          style={{
            transform: `translateX(${-currentIndex * 100}%)`,
          }}
        >
          {banners.map((banner) => (
            <div className="slide" key={banner.id}>
              <a href={banner.link || '#'} target="_blank" rel="noopener noreferrer">
                <img
                  src={`https://localhost:7213/images/banners/${banner.image}`}
                  alt={banner.title}
                  className="d-block w-100"
                  onError={(e) => (e.target.src = '/images/fallback.jpg')}
                />
              </a>
            </div>
          ))}
        </div>
        <button className="next" onClick={nextSlide}>
          ❯
        </button>

        <div className="dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BannerList;