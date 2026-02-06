import { Rule } from "sanity";

const manuscriptChapter = {
  name: "manuscriptChapter",
  title: "Manuscript Chapter",
  type: "document",
  fields: [
    {
      name: "manuscriptKey",
      title: "Manuscript Key",
      type: "string",
      description: 'Use a stable key like "some-peoples-kids".',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "order",
      title: "Order",
      type: "number",
      description: "Chapter order number (1, 2, 3, etc).",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "chapterLabel",
      title: "Chapter Label",
      type: "string",
      description: 'Example: "Chapter One".',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule: Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: "chapterLabel",
      subtitle: "manuscriptKey",
    },
  },
};

export default manuscriptChapter;
