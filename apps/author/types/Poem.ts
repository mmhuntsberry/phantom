export type Poem = {
  _id: string;
  _createdAt: string;
  title: string;
  slug: string;
  summary?: string;
  tags?: string[];
  publishedAt?: string;
  content: any[];
};

