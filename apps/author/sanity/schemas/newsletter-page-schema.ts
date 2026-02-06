import { Rule } from "sanity";

const newsletterPage = {
  name: "newsletterPage",
  title: "Newsletter Page",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Newsletter",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "valueProps",
      title: "What You'll Get",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule: Rule) => Rule.min(1),
    },
    {
      name: "frequency",
      title: "Frequency",
      type: "string",
    },
    {
      name: "privacyNote",
      title: "Privacy Note",
      type: "string",
    },
    {
      name: "leadMagnet",
      title: "Lead Magnet",
      type: "string",
      description: "Optional callout for a free download or perk.",
    },
  ],
};

export default newsletterPage;
