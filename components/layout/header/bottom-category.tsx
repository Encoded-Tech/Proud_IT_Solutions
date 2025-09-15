import React from "react";
import { Icon } from "@iconify/react";

const BottomCategory = () => {
  return (
    <div className="bg-primary p-4 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
        <div className="flex  items-center font-medium gap-10">
          <h2>Home </h2>
          <h2>Software </h2>
          <h2>Warranty</h2>
          <h2>Promotions</h2>
          <h2>Career</h2>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-white p-2 rounded-full text-black ">
            <Icon icon="et:profile-male" width="24" height="24" />{" "}
          </div>

          <div className="relative bg-white p-2 rounded-full text-black">
            <Icon icon="mdi-light:heart" width="24" height="24" />{" "}
            <span className="absolute -right-4 -top-2 bg-white h-6 w-6 flex justify-center items-center aspect-auto rounded-full text-sm">
              0
            </span>
          </div>
          <div className="relative bg-white p-2 rounded-full text-black">
            <Icon icon="ion:cart-outline" width="24" height="24" />{" "}
            <span className="absolute -right-4 -top-2 bg-white h-6 w-6 flex justify-center items-center aspect-auto rounded-full text-sm">
              0
            </span>
          </div>

          <div>
            <h2 className="font-medium">Rs 0.00</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomCategory;
