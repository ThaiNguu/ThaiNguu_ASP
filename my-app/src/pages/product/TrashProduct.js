import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
  try {
    const response = await fetch('http://localhost:8000/api/product');
    const data = await response.json();
    console.log('Fetched data:', data); // Log the fetched data
    if (Array.isArray(data.data)) {
      const filteredProducts = data.data.filter(product => product.status === 0);
      setProducts(filteredProducts);
    } else {
      setError('Dữ liệu trả về không phải là mảng');
    }
  } catch (error) {
    setError('Lỗi khi lấy dữ liệu sản phẩm');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/product/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.message === 'Product status updated successfully') {
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái sản phẩm: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring product status:', error);
      setError('Lỗi khi khôi phục trạng thái sản phẩm');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/product/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn sản phẩm: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting product:', error);
        setError('Lỗi khi xóa vĩnh viễn sản phẩm');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Thùng rác sản phẩm</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác sản phẩm</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/product">
                  <i className="fa fa-arrow-left"></i> Về danh sách
                </Link>
              </div>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '30px' }}>ID</th>
                  <th className="text-center" style={{ width: '130px' }}>Hình ảnh</th>
                  <th className="text-center" style={{ width: '300px' }}>Tên sản phẩm</th>
                  <th className="text-center">Danh mục</th>
                  <th className="text-center" style={{ width: '200px' }}>Thương hiệu</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td className="text-center">
                      <img src={`http://localhost:8000/images/products/${product.image}`} alt={product.name} style={{ width: '100px' }} />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.categoryname}</td>
                    <td>{product.brandname}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(product.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(product.id)} className="btn btn-danger" style={{ width: '40px' }}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TrashProduct;
