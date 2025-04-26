import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrashCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/category');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const filteredCategories = data.data.filter(category => category.status === 0);
        setCategories(filteredCategories);
      } else {
        setError('Dữ liệu trả về không phải là mảng');
      }
    } catch (error) {
      setError('Lỗi khi lấy dữ liệu danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/category/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.message === 'Category status updated successfully') {
        setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
      } else {
        setError('Lỗi khi khôi phục trạng thái danh mục: ' + data.message);
      }
    } catch (error) {
      console.error('Error when restoring category status:', error);
      setError('Lỗi khi khôi phục trạng thái danh mục');
    }
  };

  const handleDestroy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn danh mục này không?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/category/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          // Cập nhật trạng thái sau khi xóa
          setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
        } else {
          const data = await response.json();
          setError('Lỗi khi xóa vĩnh viễn danh mục: ' + data.message);
        }
      } catch (error) {
        console.error('Error when deleting category:', error);
        setError('Lỗi khi xóa vĩnh viễn danh mục');
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
              <h1>Thùng rác danh mục</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/admin">Home</Link></li>
                <li className="breadcrumb-item active">Thùng rác danh mục</li>
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
                <Link className="btn btn-sm btn-info" to="/admin/category">
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
                  <th className="text-center" style={{ width: '300px' }}>Tên danh mục</th>
                  <th className="text-center" style={{ width: '200px' }}>Tên slug</th>
                  <th className="text-center" style={{ width: '250px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td className="text-center">
                      <img src={`http://localhost:8000/images/categorys/${category.image}`} alt={category.name} style={{ width: '100px' }} />
                    </td>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td className="text-center">
                      <button onClick={() => handleRestore(category.id)} className="btn btn-success" style={{ width: '40px' }}>
                        <i className="fas fa-undo"></i>
                      </button>
                      <button onClick={() => handleDestroy(category.id)} className="btn btn-danger" style={{ width: '40px' }}>
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

export default TrashCategory;
