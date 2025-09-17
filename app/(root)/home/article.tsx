import BlogCard from "@/components/card/blog-card";
import PageHeader from "@/components/text/page-header";
import { mockblogs } from "@/data/blog-mock";
import React from "react";

const Article = () => {
  return (
    <div>
      {" "}
      <PageHeader title="Recent Blogs" />
      <div className="grid grid-cols-4 gap-6 my-10">
        {mockblogs.map((item, index) => (
          <div key={index}>
            <BlogCard blogs={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Article;
