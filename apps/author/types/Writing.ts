export type Writing = {
  _id: string;
  _createdAt: string;
  title: string;
  slug: string;
  summary?: string;
  category: string;
  series?: {
    title: string;
    slug: string;
  };
  season?: number;
  episode?: number;
  episodeTitle?: string;
  orderInSeries?: number;
  tags?: string[];
  publishedAt?: string;
  media?: {
    type: "image" | "video";
    image?: {
      asset: { url: string };
      alt: string;
    };
    video?: string;
  };
  excerpt?: string;
  content: any[];
};
