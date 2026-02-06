import { PortableTextBlock } from "sanity";

export type BetaPacket = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  timeframe?: string;
  expectations?: string[];
  contentNotes?: PortableTextBlock[];
  chapters: PortableTextBlock[];
  files?: {
    epub?: string;
    pdf?: string;
  };
  surveyCta?: string;
  book?: {
    title: string;
    slug: string;
  };
};
