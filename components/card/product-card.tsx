import { producttype } from "@/types/product";
import Image from "next/image";
import React from "react";

const ProductCard = ({ products }: { products: producttype }) => {
  const { img, name, price } = products;
  return (
    <div>
      <figure>
        <Image src={img} alt={name} width={1000} height={1000} />
      </figure>
      <div>
        <h2>{name}</h2>
        <h2>{price}</h2>
      </div>
    </div>
  );
};

export default ProductCard;
