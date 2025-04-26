import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditProduct() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    brand_id: '',
    image: null,
    update_by: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra ID hợp lệ
    if (!id || isNaN(id)) {
      setErrorMessage('ID sản phẩm không hợp lệ');
      navigate('/admin/product');
      return;
    }

    // Lấy user ID từ localStorage cho update_by
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, update_by: user.id }));
    } else {
      setErrorMessage('Vui lòng đăng nhập để chỉnh sửa sản phẩm');
      return;
    }

    // Lấy dữ liệu sản phẩm, danh mục và thương hiệu
    Promise.all([
      axios.get('https://localhost:7213/api/public/Category'),
      axios.get('https://localhost:7213/api/public/Brand'),
      axios.get(`https://localhost:7213/api/public/Product/${id}`),
    ])
      .then(([categoryResponse, brandResponse, productResponse]) => {
        console.log('Product Response:', productResponse.data); // Debug
        setCategories(categoryResponse.data || []);
        setBrands(brandResponse.data || []);

        const product = productResponse.data;
        if (!product) {
          setErrorMessage('Sản phẩm không tồn tại hoặc không tìm thấy');
          return;
        }

        // Gán dữ liệu an toàn với tên trường đúng
        setFormData((prev) => ({
          ...prev,
          name: product.name || '',
          description: product.description || '',
          price: product.price ? product.price.toString() : '',
          category_id: product.category_id ? product.category_id.toString() : '',
          brand_id: product.brand_id ? product.brand_id.toString() : '',
          image: null,
        }));
      })
      .catch((error) => {
        console.error('Lỗi khi lấy dữ liệu:', error);
        if (error.response?.status === 404) {
          setErrorMessage('Sản phẩm không tồn tại');
          navigate('/admin/product');
        } else {
          setErrorMessage(
            `Lỗi khi lấy dữ liệu: ${error.response?.data?.message || error.message}`
          );
        }
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.name) formErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.price) formErrors.price = 'Giá là bắt buộc';
    if (!formData.category_id) formErrors.category_id = 'Danh mục là bắt buộc';
    if (!formData.brand_id) formErrors.brand_id = 'Thương hiệu là bắt buộc';
    if (!formData.update_by || formData.update_by === 'string') {
      formErrors.update_by = 'ID người cập nhật không hợp lệ';
    }
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const productData = new FormData();
    productData.append('Name', formData.name);
    productData.append('Description', formData.description);
    productData.append('Price', formData.price);
    productData.append('Category_id', formData.category_id);
    productData.append('Brand_id', formData.brand_id);
    if (formData.image) {
      productData.append('Image', formData.image);
    }
    productData.append('Update_by', formData.update_by);

    // Debug: Kiểm tra dữ liệu gửi đi
    for (let [key, value] of productData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://localhost:7213/api/public/Product/${id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        navigate('/admin/product');
      } else {
        setErrorMessage('Có lỗi xảy ra khi cập nhật sản phẩm');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      setErrorMessage(
        error.response?.data?.message || `Lỗi khi cập nhật sản phẩm: ${error.message}`
      );
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Chỉnh sửa sản phẩm</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/admin">Home</Link>
                </li>
                <li className="breadcrumb-item active">Chỉnh sửa sản phẩm</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-12 text-right">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn btn-sm btn-success"
                >
                  <i className="fa fa-save"></i> Lưu
                </button>
                <Link className="btn btn-sm btn-info" to="/admin/product">
                  <i className="fa fa-arrow-left"></i> Về danh sách
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-9">
                  <div className="mb-3">
                    <label htmlFor="name">Tên sản phẩm</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.name && <p className="text-danger">{errors.name}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description">Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="8"
                      className="form-control"
                    ></textarea>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="mb-3">
                    <label htmlFor="category_id">Danh mục</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="text-danger">{errors.category_id}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="brand_id">Thương hiệu</label>
                    <select
                      name="brand_id"
                      value={formData.brand_id}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {errors.brand_id && (
                      <p className="text-danger">{errors.brand_id}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="price">Giá</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.price && <p className="text-danger">{errors.price}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="image">Hình ảnh (tùy chọn)</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="form-control"
                    />
                    {errors.image && <p className="text-danger">{errors.image}</p>}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EditProduct;