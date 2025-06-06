import { PortableTextBlock } from "sanity";

export type Job = {
  _id: string;
  _createdAt: Date;
  company: string;
  title: string;
  image: string;
  content: PortableTextBlock[];
};
