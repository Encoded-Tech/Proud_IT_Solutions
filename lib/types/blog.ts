export type BlogType = {
    _id: string;
    title: string;
    slug: string;
    content: string;
    coverImage?: string;
    category: "Web Development" | "Mobile Development" | "UI/UX Design" | "Game Development" | "AI Development";
    author: string;
    createdAt: string | null;
  };
  