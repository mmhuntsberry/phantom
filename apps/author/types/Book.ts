import { PortableTextBlock } from "sanity";

export type Book = {
  _id: string;
  _createdAt: string;
  title: string;
  slug: string;
  status: "comingSoon" | "published";
  publicationDate?: string;
  featured?: boolean;
  openForBetaReaders?: boolean;
  priority?: number;
  cover?: {
    asset?: { url: string };
    alt?: string;
  };
  tagline?: string;
  shortPitch?: string;
  longDescription?: PortableTextBlock[];
  contentNotes?: PortableTextBlock[];
  sample?: PortableTextBlock[];
  sampleLink?: string;
  buyLinks?: {
    amazon?: string;
    direct?: string;
    other?: string;
  };
  testimonials?: { quote: string; name?: string }[];
};
