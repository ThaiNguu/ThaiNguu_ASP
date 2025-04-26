import React from "react";
import ListBanner from "../components/ListBanner";
import Footer from "../components/Footer";
import ProductNew from "../components/ProductNew";
import ProductSale from "../components/ProductSale";
import MainMenu from "../components/main-menu";




import ChatbotUser from "./ChatbotUser";
import ProductWoman from "../components/ProductWoman";
import LastPost from "../components/LastPost";

const Home = () => {
  return (
    <div>
      <MainMenu />
      <ListBanner />
      <ProductSale />
      <ProductNew />
      <ProductWoman />
      <LastPost />
      <Footer />
      <ChatbotUser />
    </div>
  );
};

export default Home;
