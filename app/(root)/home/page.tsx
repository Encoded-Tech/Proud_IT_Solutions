import React from "react";
import Hero from "./hero";


import Article from "./article";



import ListCategories from "@/components/server/ListCategories";
import HomeProducts from "@/components/server/ListHomeProducts";


const HomeMain = () => {
  return (
    <>
      <Hero />
      <div className="max-w-7xl xl:mx-auto mx-4 my-20 space-y-20">
       <ListCategories page="home" />
        <HomeProducts showBestSellers/>
      
   
        <Article />
      </div>
    </>
  );
};

export default HomeMain;
