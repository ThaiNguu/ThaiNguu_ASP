// src/components/PostCard.js

import React from 'react';
import '../css/PostCard.css'; // Import CSS tùy chỉnh

const PostCard = ({ postItem }) => {
  return (
    <div className="custom-card d-flex flex-column mb-4">
      <div className="custom-post-image">
        <img 
          src={`http://localhost:8000/images/posts/${postItem.image}`} 
          alt={postItem.title} 
          className="custom-img"
        />
      </div>
      <div className="custom-card-body">
        <h5 className="custom-product-name">{postItem.title}</h5>
        <p className="custom-post-description">{postItem.description}</p>
        <a href={`/bai-viet/${postItem.id}`} className="custom-post-button">Xem chi tiết</a>
      </div>
    </div>
  );
};

export default PostCard;
