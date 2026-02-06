import { PortableTextBlock } from "sanity";

export type AboutPage = {
  title: string;
  body: PortableTextBlock[];
  photo?: {
    asset?: { url: string };
    alt?: string;
  };
};
