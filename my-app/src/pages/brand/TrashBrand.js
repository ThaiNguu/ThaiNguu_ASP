import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashBrand() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/brand');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const filteredBrands = data.data.filter(brand => brand.status === 0);
        setBrands(filteredBrands);
      } else {
        setError('Dữ liệu trả về không phải là mảng');
      }
    } catch (error) {
      setError('Lỗi khi lấy dữ liệu thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/brand/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.message === 'Brand status updated successfully') {
        setBrands(prevBrands => prevBrands.filter(brand => brand.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái thương hiệu: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring brand status:', error);
      setError('Lỗi khi khôi phục trạng thái thương hiệu');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn thương hiệu này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/brand/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          // Thay đổi trạng thái sau khi xóa
          setBrands(prevBrands => prevBrands.filter(brand => brand.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn thương hiệu: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting brand:', error);
        setError('Lỗi khi xóa vĩnh viễn thương hiệu');
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
              <h1>Thùng rác thương hiệu</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác thương hiệu</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/brand">
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
                  <th className="text-center" style={{ width: '300px' }}>Tên thương hiệu</th>
                  <th className="text-center" style={{ width: '200px' }}>Tên slug</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {brands.map(brand => (
                  <tr key={brand.id}>
                    <td>{brand.id}</td>
                    <td className="text-center">
                      <img src={`http://localhost:8000/images/brands/${brand.image}`} alt={brand.name} style={{ width: '100px' }} />
                    </td>
                    <td>{brand.name}</td>
                    <td>{brand.slug}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(brand.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(brand.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default TrashBrand;
