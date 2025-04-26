import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/banner');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const filteredBanners = data.data.filter(banner => banner.status === 0);
        setBanners(filteredBanners);
      } else {
        setError('Dữ liệu trả về không phải là mảng');
      }
    } catch (error) {
      setError('Lỗi khi lấy dữ liệu banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/banner/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (data.message === 'Banner status updated successfully') {
        setBanners(prevBanners => prevBanners.filter(banner => banner.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái banner: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring banner status:', error);
      setError('Lỗi khi khôi phục trạng thái banner');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn banner này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/banner/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          // Thay đổi trạng thái sau khi xóa
          setBanners(prevBanners => prevBanners.filter(banner => banner.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn banner: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting banner:', error);
        setError('Lỗi khi xóa vĩnh viễn banner');
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
              <h1>Thùng rác banner</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác banner</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/banner">
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
                  <th className="text-center" style={{ width: '300px' }}>Tên banner</th>
                  <th className="text-center" style={{ width: '200px' }}>Link</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {banners.map(banner => (
                  <tr key={banner.id}>
                    <td>{banner.id}</td>
                    <td className="text-center">
                      <img src={`http://localhost:8000/images/banners/${banner.image}`} alt={banner.name} style={{ width: '100px' }} />
                    </td>
                    <td>{banner.name}</td>
                    <td>{banner.link}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(banner.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(banner.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default TrashBanner;
