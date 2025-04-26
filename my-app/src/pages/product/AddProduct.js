  import React, { useState, useEffect } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import axios from 'axios';

  function AddProduct() {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [formData, setFormData] = useState({
      Name: '',
      Description: '',
      Price: '',
      Category_id: '',
      Brand_id: '',
      Image: null,
      Create_by: '',
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      // Lấy user ID từ localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        setFormData((prev) => ({ ...prev, Create_by: user.id }));
      } else {
        setErrorMessage('Vui lòng đăng nhập để thêm sản phẩm');
      }

      // Lấy danh sách danh mục và thương hiệu
      Promise.all([
        axios.get('https://localhost:7213/api/public/Category'),
        axios.get('https://localhost:7213/api/public/Brand'),
      ])
        .then(([categoryResponse, brandResponse]) => {
          setCategories(categoryResponse.data);
          setBrands(brandResponse.data);
        })
        .catch((error) => {
          setErrorMessage('Lỗi khi lấy dữ liệu danh mục hoặc thương hiệu: ' + error.message);
        });
    }, []);

    const handleChange = (e) => {
      const { name, value, files } = e.target;
      if (name === 'Image') {
        setFormData({ ...formData, Image: files[0] });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    };

    const validateForm = () => {
      let formErrors = {};
      if (!formData.Name) formErrors.Name = 'Tên sản phẩm là bắt buộc';
      if (!formData.Price) formErrors.Price = 'Giá là bắt buộc';
      if (!formData.Category_id) formErrors.Category_id = 'Danh mục là bắt buộc';
      if (!formData.Brand_id) formErrors.Brand_id = 'Thương hiệu là bắt buộc';
      if (!formData.Image) formErrors.Image = 'Hình ảnh là bắt buộc';
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
      productData.append('Name', formData.Name);
      productData.append('Description', formData.Description);
      productData.append('Price', formData.Price);
      productData.append('Category_id', formData.Category_id);
      productData.append('Brand_id', formData.Brand_id);
      productData.append('Image', formData.Image);
      productData.append('Create_by', formData.Create_by);

      // Debug: Kiểm tra dữ liệu gửi đi
      for (let [key, value] of productData.entries()) {
        console.log(`${key}: ${value}`);
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('https://localhost:7213/api/public/Product', productData, {
          headers: {
            // Không đặt Content-Type, axios tự động xử lý cho FormData
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 201) {
          navigate('/admin/product');
        } else {
          setErrorMessage('Có lỗi xảy ra khi thêm sản phẩm');
        }
      } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        setErrorMessage(
          error.response?.data?.message || `Lỗi khi thêm sản phẩm: ${error.message}`
        );
      }
    };

    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Thêm sản phẩm</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/admin">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">Thêm sản phẩm</li>
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
                  <button type="submit" onClick={handleSubmit} className="btn btn-sm btn-success">
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
                      <label htmlFor="Name">Tên sản phẩm</label>
                      <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleChange}
                        className="form-control"
                      />
                      {errors.Name && <p className="text-danger">{errors.Name}</p>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="Description">Mô tả</label>
                      <textarea
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        rows="8"
                        className="form-control"
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label htmlFor="Category_id">Danh mục</label>
                      <select
                        name="Category_id"
                        value={formData.Category_id}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                          <option key={category.category_id} value={category.category_id}>
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                      {errors.Category_id && <p className="text-danger">{errors.Category_id}</p>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="Brand_id">Thương hiệu</label>
                      <select
                        name="Brand_id"
                        value={formData.Brand_id}
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
                      {errors.Brand_id && <p className="text-danger">{errors.Brand_id}</p>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="Price">Giá</label>
                      <input
                        type="number"
                        name="Price"
                        value={formData.Price}
                        onChange={handleChange}
                        className="form-control"
                      />
                      {errors.Price && <p className="text-danger">{errors.Price}</p>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="Image">Hình ảnh</label>
                      <input
                        type="file"
                        name="Image"
                        accept="image/*"
                        onChange={handleChange}
                        className="form-control"
                      />
                      {errors.Image && <p className="text-danger">{errors.Image}</p>}
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

  export default AddProduct;