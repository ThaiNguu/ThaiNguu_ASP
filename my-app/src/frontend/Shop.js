import React from 'react';
import MainMenu from '../components/main-menu';
import Footer from '../components/Footer';

const Shop = () => {
  // Dữ liệu giả về các chi nhánh của FM Style
  const branches = [
    {
      id: 1,
      name: 'FM Style - Chi nhánh Hà Nội',
      address: '123 Đường Láng, Đống Đa, Hà Nội',
      phone: '0123 456 789',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.506174054614!2d105.82015931540276!3d21.01219598599827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4c4e986b1b%3A0x5e7e4f0c7b7e4b4e!2sFM%20Style!5e0!3m2!1svi!2s!4v1634567890123!5m2!1svi!2s'
    },
    {
      id: 2,
      name: 'FM Style - Chi nhánh TP.HCM',
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      phone: '0987 654 321',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447174055672!2d106.69808931540276!3d10.77639379231827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f1e1b7b7%3A0x5e7e4f0c7b7e4b4e!2sFM%20Style!5e0!3m2!1svi!2s!4v1634567890123!5m2!1svi!2s'
    },
    {
      id: 3,
      name: 'FM Style - Chi nhánh Đà Nẵng',
      address: '789 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
      phone: '0912 345 678',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.842174055672!2d108.20623031540276!3d16.06791879231827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c33c0b7b7b%3A0x5e7e4f0c7b7e4b4e!2sFM%20Style!5e0!3m2!1svi!2s!4v1634567890123!5m2!1svi!2s'
    }
  ];

  return (
    <>
    <MainMenu />
    <div className="container my-5">
      {/* Giới thiệu về FM Style */}
      <div className="text-center mb-5">
        <h1 className="display-4">FM Style</h1>
        <p className="lead">
          FM Style - Thời trang trẻ trung, năng động, dẫn đầu xu hướng. Chúng tôi mang đến những sản phẩm chất lượng cao với phong cách độc đáo, phù hợp với mọi cá tính.
        </p>
      </div>

      {/* Danh sách chi nhánh */}
      <h2 className="mb-4 text-center">Các Chi Nhánh FM Style</h2>
      <div className="row">
        {branches.map((branch) => (
          <div key={branch.id} className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{branch.name}</h5>
                <p className="card-text">
                  <strong>Địa chỉ:</strong> {branch.address}<br />
                  <strong>Số điện thoại:</strong> {branch.phone}
                </p>
              </div>
              <div className="card-footer bg-transparent border-0">
                <iframe
                  src={branch.mapUrl}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title={`Bản đồ ${branch.name}`}
                ></iframe>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Shop;