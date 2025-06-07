import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const TopInfo = () => {
  return (
    <div className="bg-primary p-2 text-white">
      <div className="max-w-7xl mx-auto flex justify-between">
        <div className="flex items-center gap-1">
          <Icon icon="ion:mail" width="16" height="16" />

          <h2>himalayangmt@gmail.com</h2>
        </div>

        <div className="flex items-center gap-1">
          <Icon icon="famicons:call" width="16" height="16" />

          <h2>+977-9842208106</h2>
        </div>
      </div>
    </div>
  );
};

export default TopInfo;
