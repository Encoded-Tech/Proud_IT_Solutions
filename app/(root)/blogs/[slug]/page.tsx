import Image from "next/image";
import React from "react";
import { redirect } from "next/navigation";
import { mockblogs } from "@/data/blog-mock";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

type BlogPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blogItem = mockblogs.find((blog) => blog.slug === slug);

  if (!blogItem) {
    redirect("/blogs");
  }

  return (
    <main className="max-w-5xl xl:mx-auto mx-4 my-10  ">
      <Link
        href="/blogs"
        className="flex items-center gap-2 mb-6  hover:scale-110 text-primary ease-in-out duration-300 w-fit"
      >
        <Icon icon="weui:back-filled" width="12" height="24" />
        <span className="font-medium text-base"> Back</span>
      </Link>
      <h1 className="text-center lg:text-4xl md:text-3xl text-2xl font-semibold">{blogItem?.title}</h1>

      <div className="flex justify-between items-center text-sm text-lighttext mt-6">
        <p>By : {blogItem?.author}</p>
        <p>{blogItem?.date}</p>
      </div>
      <figure>
        <Image
          src={blogItem?.image}
          alt="biryani"
          width={1000}
          height={1000}
          className="object-cover w-full rounded-xl md:my-10 my-4 max-h-[60vh] "
        />
      </figure>

      <div className=" md:text-lg text-md space-y-6">
        <p>
          {" "}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio,
          ratione! Quibusdam officia maxime odit, voluptate tempore laboriosam,
          nobis perferendis sequi temporibus laborum sint accusamus quidem
          dignissimos minima vero! Hic, natus. Lorem ipsum dolor sit amet
          consectetur adipisicing elit. Distinctio, ratione! Quibusdam officia
          maxime odit, voluptate tempore laboriosam, nobis perferendis sequi
          temporibus laborum sint accusamus quidem dignissimos minima vero! Hic,
          natus. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Distinctio, ratione! Quibusdam officia maxime odit, voluptate tempore
          laboriosam, nobis perferendis sequi temporibus laborum sint accusamus
          quidem dignissimos minima vero! Hic, natus.
        </p>
        <p>
          {" "}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio,
          ratione! Quibusdam officia maxime odit, voluptate tempore laboriosam,
          nobis perferendis sequi temporibus laborum sint accusamus quidem
          dignissimos minima vero! Hic, natus. Lorem ipsum dolor sit amet
          consectetur adipisicing elit. Distinctio, ratione! Quibusdam officia
          maxime odit, voluptate tempore laboriosam, nobis perferendis sequi
          temporibus laborum sint accusamus quidem dignissimos minima vero! Hic,
          natus. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Distinctio, ratione! Quibusdam officia maxime odit, voluptate tempore
          laboriosam, nobis perferendis sequi temporibus laborum sint accusamus
          quidem dignissimos minima vero! Hic, natus.
        </p>
      </div>
    </main>
  );
}
