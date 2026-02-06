import { PortableTextBlock } from "sanity";

export type Study = {
  _id: string;
  _createdAt: string; // ISO timestamp from Sanity
  name: string;
  slug: string; // because you’re doing `"slug": slug.current`
  url?: string;
  summary?: string;
  about: string;
  role?: string;
  tags?: string[];
  excerpt?: string;
  media: {
    type: "image" | "video";
    image?: {
      asset: { _id?: string; url: string };
      alt?: string;
    };
    video?: string;
  };
  content: PortableTextBlock[];
};
