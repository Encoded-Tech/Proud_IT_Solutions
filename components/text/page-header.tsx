import React from "react";
import { cn } from "@/lib/utils";

type titleprops = {
  title: string;
  className?: string;
};

const PageHeader = ({ title, className }: titleprops) => {
  return <h2 className={cn(className, "font-medium text-lighttext text-4xl text-start border-b pb-2 w-fit")}>{title}</h2>;
};

export default PageHeader;
