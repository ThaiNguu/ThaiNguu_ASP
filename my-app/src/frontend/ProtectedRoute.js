
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  // Kiểm tra xem đường dẫn có bắt đầu bằng /admin không
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Nếu không có token, chuyển hướng về trang đăng nhập
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Nếu là tuyến đường admin, kiểm tra vai trò admin
  if (isAdminRoute) {
    const isAdmin = user && user.roles === 'admin';
    if (!isAdmin) {
      // Nếu không phải admin, chuyển hướng về trang chính
      return <Navigate to="/" state={{ from: location }} />;
    }
  }

  // Nếu đã đăng nhập và (không phải tuyến admin hoặc là admin), cho phép truy cập
  return children;
};

export default ProtectedRoute;
