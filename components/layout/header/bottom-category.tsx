import React from "react";
import { Icon } from "@iconify/react";

const BottomCategory = () => {
  return (
    <div className="bg-primary p-3 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
        <div className="flex  items-center font-medium gap-6">
          <h2 className="rounded-full bg-white px-4 py-2 text-primary">
            Gaming{" "}
          </h2>
          <h2>Software </h2>
          <h2>Warranty</h2>
          <h2>Promotions</h2>
          <h2>Career</h2>
        </div>

        <div className="flex gap-6">
          <Icon icon="mdi:cart" width="24" height="24" />
          <Icon icon="ri:heart-fill" width="24" height="24" />
          <Icon icon="iconamoon:profile-circle-fill" width="24" height="24" />
        </div>
      </div>
    </div>
  );
};

export default BottomCategory;
