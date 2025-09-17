import ProductCard from "@/components/card/product-card";
import { ProductMock } from "@/data/product-mock";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const ShopGrid = () => {
  return (
    <main className="grid md:grid-cols-7 gap-x-6">
      <section className="md:block hidden col-span-2 p-4 bg-zinc-50 rounded-md shadow-sm space-y-8">
        <div className="flex justify-between pb-4 border-b">
          <h2 className="font-medium text-xl">Filter</h2>
          <Icon icon="mi:filter" width="24" height="24" />{" "}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-medium text-lighttext">Price</h2>
            <hr className="h-[2px] bg-primary/80 w-16 border-none" />
          </div>
          <form className="flex items-start gap-2">
            <div className="space-y-1 flex gap-2">
              <input
                type="number"
                className="w-full xl:h-10 h-8 shadow-none border border-gray-300 rounded p-2"
                placeholder="Min"
              />
              <input
                type="number"
                className="w-full xl:h-10 h-8 shadow-none border border-gray-300 rounded p-2"
                placeholder="Max"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/80 ease-in-out duration-300 rounded-md p-2 text-white cursor-pointer w-16"
            >
              Go
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-medium text-lighttext">Category</h2>
            <hr className="h-[2px] bg-primary/80 w-16 border-none" />
          </div>

          <div>
            {category.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <label className="flex flex-1 items-center justify-between cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        className="accent-primarymain"
                      />
                      <span>{item.name}</span>
                    </div>
                    <p className="text-lighttext text-sm">({item.num})</p>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-medium text-lighttext">Brands</h2>
            <hr className="h-[2px] bg-primary/80 w-16 border-none" />
          </div>

          <div>
            {brands.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <label className="flex flex-1 items-center justify-between cursor-pointer text-sm font-medium text-lighttext hover:text-primary transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        className="accent-primarymain"
                      />
                      <span>{item.name}</span>
                    </div>
                    <p className="text-lighttext text-sm">({item.num})</p>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-medium text-lighttext">Ratings</h2>
            <hr className="h-[2px] bg-primary/80 w-16 border-none" />
          </div>

          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, index) => {
              const rating = 5 - index;
              return (
                <div key={rating} className="flex items-center cursor-pointer">
                  {[...Array(rating)].map((_, i) => (
                    <Icon
                      key={i}
                      icon="ic:round-star"
                      className="text-yellow-500 text-xl"
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="col-span-5">
        <div className=" grid lg:grid-cols-3 grid-cols-2 gap-4 ">
          {ProductMock.map((item, index) => (
            <div key={index}>
              <ProductCard products={item} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ShopGrid;

const category = [
  {
    name: "Keyboards",
    num: 23,
  },
  {
    name: "Mouse",
    num: 48,
  },
  {
    name: "Headphone",
    num: 75,
  },
  {
    name: "Mic",
    num: 12,
  },
  {
    name: "Earbuds",
    num: 52,
  },
];

const brands = [
  {
    name: "Fantech",
    num: 23,
  },
  {
    name: "Viper",
    num: 48,
  },
  {
    name: "MSI",
    num: 75,
  },
  {
    name: "Havit",
    num: 12,
  },
  {
    name: "Acer",
    num: 52,
  },
];
