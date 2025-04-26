import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//frontend

import Home from './frontend/Home';
//-----------------
import AdminPage from './pages/AdminPage'; // Import trang Admin
import ProductList from './pages/product/ProductList'; 
import AddProduct from './pages/product/AddProduct';
import EditProduct from './pages/product/EditProduct';
import CategoryList from './pages/category/CategoryList';
import EditCategory from './pages/category/EditCategory';
import AddCategory from './pages/category/AddCategory';
import BrandList from './pages/brand/BrandList';
import EditBrand from './pages/brand/EditBrand';
import AddBrand from './pages/brand/AddBrand';
import PostList from './pages/post/PostList';
import EditPost from './pages/post/EditPost';
import AddPost from './pages/post/AddPost';
import TopicList from './pages/topic/TopicList';
import AddTopic from './pages/topic/AddTopic';
import EditTopic from './pages/topic/EditTopic';
import OrderList from './pages/order/OrderList';
import EditOrder from './pages/order/EditOrder';
import ContactList from './pages/contact/ContactList';
import EditContact from './pages/contact/EditContact';
import BannerList from './pages/banner/BannerList';
import AddBanner from './pages/banner/AddBanner';
import EditBanner from './pages/banner/EditBanner';
import UserList from './pages/user/UserList'; 
import AddUser from './pages/user/AddUser';
import EditUser from './pages/user/EditUser';
//Trash
import TrashBanner from './pages/banner/TrashBanner';
import TrashBrand from './pages/brand/TrashBrand';
import TrashProduct from './pages/product/TrashProduct';
import TrashCategory from './pages/category/TrashCategory';
import TrashPost from './pages/post/TrashPost';
import TrashTopic from './pages/topic/TrashTopic';
import TrashOrder from './pages/order/TrashOrder';
import TrashContact from './pages/contact/TrashContact';
import TrashUser from './pages/user/TrashUser';
//Show
import ShowProduct from './pages/product/ShowProduct';
import ShowBanner from './pages/banner/ShowBanner';
import ShowBrand from './pages/brand/ShowBrand';
import ShowCategory from './pages/category/ShowCategory';
import ShowPost from './pages/post/ShowPost';
import ShowTopic from './pages/topic/ShowTopic';
import ShowOrder from './pages/order/ShowOrder';
import ShowContact from './pages/contact/ShowContact';
import ShowUser from './pages/user/ShowUser';
import ChatbotManager from './pages/chatbot/chatbot';
import './App.css';
import '../src/css/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import ProtectedRoute from './frontend/ProtectedRoute';
import ListProduct from './components/ProductList';
import AllProducts from './frontend/product/AllProducts';
import AllPosts from './frontend/post/AllPosts';
import PostDetail from './frontend/post/PostDetail';
import ProductDetail from './frontend/product/ProductDetail';
import Login from './frontend/Login';
import CartPage from './frontend/CartPage';
import PostsByTopic from './frontend/post/PostsByTopic';
import CheckoutPage from './frontend/CheckoutPage';
import OrderDetail from './frontend/OrderDetail';
import Register from './frontend/Register';
import Account from './frontend/Account';
import EditAccount from './frontend/EditAccount';
import SearchProduct from './frontend/SearchProduct';
import Contact from './frontend/Contact';
import Page from './frontend/Page';
import AllPage from './frontend/AllPage';
import Shop from './frontend/Shop';
function App() {
 
  return (
    <BrowserRouter>

      <Routes>
      
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/categories/:slug/products" element={<ListProduct />} />
      <Route path="/danh-muc/:slug" element={<ListProduct />} /> 
      <Route path="tat-ca-san-pham" element={<AllProducts />} />
      <Route path="bai-viet" element={<AllPosts />} />
      <Route path="/bai-viet/:id" element={<PostDetail/>} />
      <Route path="/bai-viet/theo-chu-de/:topicId" element={<PostsByTopic />} />
      <Route path="/chi-tiet-san-pham/:id" element={<ProductDetail />} /> 
      <Route path="/cart" element={<CartPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/account" element={<Account />} />
      <Route path="/edit-user/:id" element={<EditAccount />}/>
      <Route path="/order-history" element={<OrderDetail />} />
      <Route path="/search" element={<SearchProduct />} />
      <Route path="/trang-don/:slug" element={<Page />} />
      <Route path="/trang-don" element={<AllPage />} />
      <Route path="/shop" element={<Shop />} />
        {/* Route cho trang admin */}
        
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>}>
    <Route path="product" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
    <Route path="product/new" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
    <Route path="product/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
    <Route path="product/trash" element={<ProtectedRoute><TrashProduct /></ProtectedRoute>} />
    <Route path="product/show/:id" element={<ProtectedRoute><ShowProduct /></ProtectedRoute>} />
    <Route path="category/new" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
    <Route path="category/edit/:id" element={<ProtectedRoute><EditCategory /></ProtectedRoute>} />
    <Route path="category" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
    <Route path="category/trash" element={<ProtectedRoute><TrashCategory /></ProtectedRoute>} />
    <Route path="category/show/:id" element={<ProtectedRoute><ShowCategory /></ProtectedRoute>} />
    <Route path="brand" element={<ProtectedRoute><BrandList /></ProtectedRoute>} />
    <Route path="brand/new" element={<ProtectedRoute><AddBrand /></ProtectedRoute>} />
    <Route path="brand/edit/:id" element={<ProtectedRoute><EditBrand /></ProtectedRoute>} />
    <Route path="brand/trash" element={<ProtectedRoute><TrashBrand /></ProtectedRoute>} />
    <Route path="brand/show/:id" element={<ProtectedRoute><ShowBrand /></ProtectedRoute>} />
    <Route path="post" element={<ProtectedRoute><PostList /></ProtectedRoute>} />
    <Route path="post/new" element={<ProtectedRoute><AddPost /></ProtectedRoute>} />
    <Route path="post/edit/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
    <Route path="post/trash" element={<ProtectedRoute><TrashPost /></ProtectedRoute>} />
    <Route path="post/show/:id" element={<ProtectedRoute><ShowPost /></ProtectedRoute>} />
    <Route path="topic" element={<ProtectedRoute><TopicList /></ProtectedRoute>} />
    <Route path="topic/new" element={<ProtectedRoute><AddTopic /></ProtectedRoute>} />
    <Route path="topic/edit/:id" element={<ProtectedRoute><EditTopic /></ProtectedRoute>} />
    <Route path="topic/trash" element={<ProtectedRoute><TrashTopic /></ProtectedRoute>} />
    <Route path="topic/show/:id" element={<ProtectedRoute><ShowTopic /></ProtectedRoute>} />
    <Route path="order" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
    <Route path="order/edit/:id" element={<ProtectedRoute><EditOrder /></ProtectedRoute>} />
    <Route path="order/trash" element={<ProtectedRoute><TrashOrder /></ProtectedRoute>} />
    <Route path="order/show/:id" element={<ProtectedRoute><ShowOrder /></ProtectedRoute>} />
    <Route path="contact" element={<ProtectedRoute><ContactList /></ProtectedRoute>} />
    <Route path="contact/edit/:id" element={<ProtectedRoute><EditContact /></ProtectedRoute>} />
    <Route path="contact/trash" element={<ProtectedRoute><TrashContact /></ProtectedRoute>} />
    <Route path="contact/show/:id" element={<ProtectedRoute><ShowContact /></ProtectedRoute>} />
    <Route path="banner" element={<ProtectedRoute><BannerList /></ProtectedRoute>} />
    <Route path="banner/new" element={<ProtectedRoute><AddBanner /></ProtectedRoute>} />
    <Route path="banner/edit/:id" element={<ProtectedRoute><EditBanner /></ProtectedRoute>} />
    <Route path="banner/trash" element={<ProtectedRoute><TrashBanner /></ProtectedRoute>} />
    <Route path="banner/show/:id" element={<ProtectedRoute><ShowBanner /></ProtectedRoute>} />
    <Route path="user" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
    <Route path="user/new" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
    <Route path="user/edit/:id" element={<ProtectedRoute><EditUser /></ProtectedRoute>} />
    <Route path="user/trash" element={<ProtectedRoute><TrashUser /></ProtectedRoute>} />
    <Route path="user/show/:id" element={<ProtectedRoute><ShowUser /></ProtectedRoute>} />
    <Route path="deepseek" element={<ProtectedRoute><ChatbotManager /></ProtectedRoute>} />
    
</Route>

      </Routes>
  
    </BrowserRouter>
  );
}

export default App;
