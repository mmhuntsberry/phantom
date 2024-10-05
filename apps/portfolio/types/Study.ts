import { PortableTextBlock } from "sanity";

export type Study = {
  _id: string;
  _createdAt: Date;
  name: string;
  slug: string;
  image: string;
  url: string;
  about: string;
  content: PortableTextBlock[];
};
