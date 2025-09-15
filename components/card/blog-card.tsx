import { blogType } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const BlogCard = ({ blogs }: { blogs: blogType }) => {
  const { title, slug, author, date, summary, image } = blogs;
  return (
    <main>
      <div className="rounded-lg shadow-sm p-2 group hover:shadow-md">
        <figure className="rounded-md overflow-hidden">
          <Image
            src={image}
            alt="blog"
            width={1000}
            height={1000}
            className="h-[15em] object-cover group-hover:scale-110 ease-in-out duration-300"
          />
        </figure>

        <div className="space-y-2 my-4 p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-zinc-500">{author}</span>
            <span className="text-sm text-zinc-500">{date}</span>
          </div>
          <h2 className="font-medium text-lg line-clamp-1">{title}</h2>
          <p className="text-zinc-500  text-md line-clamp-2">{summary}</p>
        </div>
      </div>
      <Link href={`/blog/${slug}`}>
        <button className="mt-4 border border-lighttext rounded-full  inset-shdaow-xs px-6 py-2  hover:bg-primary/90 hover:text-white hover:border-none cursor-pointer ease-in-out duration-100  w-full flex items-center gap-2 justify-center">
          Read More
        </button>
      </Link>
    </main>
  );
};

export default BlogCard;
