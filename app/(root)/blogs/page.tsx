import BlogCard from "@/components/card/blog-card";
import PageHeader from "@/components/text/page-header";
import { mockblogs } from "@/data/blog-mock";
import React from "react";

const Blogs = () => {
  return (
    <div className="max-w-7xl xl:mx-auto mx-4 my-10">
      <PageHeader title="Popular Blogs" />

      <div className="grid md:grid-cols-3 sm:grid-cols-2 lg:gap-6 gap-4 my-8">
        {mockblogs.map((item, index) => (
          <div key={index}>
            <BlogCard blogs={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
