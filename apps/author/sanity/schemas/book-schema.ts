import { Rule } from "sanity";

const book = {
  name: "book",
  title: "Book",
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
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Coming Soon", value: "comingSoon" },
          { title: "Published", value: "published" },
        ],
        layout: "radio",
      },
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Pins this book to the top of lists and Start Here.",
      initialValue: false,
    },
    {
      name: "priority",
      title: "Priority",
      type: "number",
      description:
        "Lower numbers appear first among featured/coming-soon books (optional).",
    },
    {
      name: "publicationDate",
      title: "Publication Date",
      type: "datetime",
    },
    {
      name: "cover",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (Rule: Rule) =>
            Rule.required().error("Alt text is required for accessibility"),
        },
      ],
    },
    {
      name: "tagline",
      title: "Tagline",
      type: "string",
    },
    {
      name: "shortPitch",
      title: "Short Pitch",
      type: "text",
      rows: 3,
      description: "Used for cards and short previews.",
    },
    {
      name: "longDescription",
      title: "Long Description",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "contentNotes",
      title: "Content Notes",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "sample",
      title: "Sample Excerpt",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "sampleLink",
      title: "Sample Link",
      type: "url",
      validation: (Rule: Rule) =>
        Rule.uri({ scheme: ["https", "http"] }).error(
          "Must be a valid URL"
        ),
    },
    {
      name: "buyLinks",
      title: "Buy Links",
      type: "object",
      fields: [
        {
          name: "amazon",
          title: "Amazon",
          type: "url",
        },
        {
          name: "direct",
          title: "Buy Direct",
          type: "url",
        },
        {
          name: "other",
          title: "Other Retailer",
          type: "url",
        },
      ],
    },
    {
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          name: "testimonial",
          title: "Testimonial",
          type: "object",
          fields: [
            {
              name: "quote",
              title: "Quote",
              type: "text",
              rows: 3,
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "name",
              title: "Attribution",
              type: "string",
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "status",
      media: "cover",
    },
  },
};

export default book;
