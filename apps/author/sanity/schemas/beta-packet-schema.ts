import { Rule } from "sanity";

const betaPacket = {
  name: "betaPacket",
  title: "Beta Packet",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: Rule) => Rule.required(),
      description:
        "Use a slug like chapters-1-3-<random> to match the unlisted route.",
    },
    {
      name: "isActive",
      title: "Active Packet",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "book",
      title: "Related Book",
      type: "reference",
      to: [{ type: "book" }],
    },
    {
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Short explanation for beta readers.",
    },
    {
      name: "timeframe",
      title: "Timeframe",
      type: "string",
      description: "Example: Two weeks after signup.",
    },
    {
      name: "expectations",
      title: "Feedback We Want",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "contentNotes",
      title: "Content Notes",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "chapters",
      title: "Chapters 1-3",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "files",
      title: "Download Files",
      type: "object",
      fields: [
        {
          name: "epub",
          title: "EPUB URL",
          type: "url",
        },
        {
          name: "pdf",
          title: "PDF URL",
          type: "url",
        },
      ],
    },
    {
      name: "surveyCta",
      title: "Survey CTA",
      type: "string",
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "timeframe",
    },
  },
};

export default betaPacket;
