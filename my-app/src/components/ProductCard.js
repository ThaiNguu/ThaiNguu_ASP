import React from "react";
import { Link } from "react-router-dom";
import "../css/productcard.css";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductCard = ({ productItem, brands, categories }) => {
  if (!productItem) {
    return <div>Product not found</div>;
  }

  const { id, name, price, image, brand_id, category_id } = productItem;

  // Hàm tìm tên thương hiệu theo brand_id
  const getBrandName = (brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand ? brand.name : "Không xác định";
  };

  // Hàm tìm tên danh mục theo category_id
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.category_id === categoryId);
    return category ? category.category_name : "Không xác định";
  };

  return (
    <div className="card card-custom">
      <Link to={`/chi-tiet-san-pham/${id}`} className="text-dark">
        <img
          src={`https://localhost:7213/images/products/${image}`}
          alt={name}
          className="card-img-top"
          style={{
            width: "100%",
            maxHeight: "300px", // Use max-height to prevent cropping
            objectFit: "contain", // Ensure entire image is visible
            padding: "10px", // Optional: Add padding for better spacing
          }}
          onError={(e) => (e.target.src = "/images/fallback.jpg")}
        />
        <div className="card-body">
          <h4
            className="card-title"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <b>{name}</b>
          </h4>
          <p className="card-text text-muted">
            <small>
              Thương hiệu: {getBrandName(brand_id)} | Danh mục:{" "}
              {getCategoryName(category_id)}
            </small>
          </p>
          <div className="price text-danger d-flex align-items-center justify-content-between">
            <div className="price col-8">
              <span>{price.toLocaleString("vi-VN")} VNĐ</span>
              {/* Nếu API có trường pricesale, thêm logic như sau */}
              {/* {productItem.pricesale > 0 && productItem.pricesale < price ? (
                <>
                  <span>{productItem.pricesale.toLocaleString('vi-VN')} VNĐ</span>
                  <del className="ms-2">{price.toLocaleString('vi-VN')} VNĐ</del>
                </>
              ) : (
                <span>{price.toLocaleString('vi-VN')} VNĐ</span>
              )} */}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
