import { PortableTextBlock } from "sanity";

export type Post = {
  _id: string;
  _createdAt: Date;
  name: string;
  slug: string;
  content: PortableTextBlock[];
};
