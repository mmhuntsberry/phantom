import { Rule } from "sanity";

const writing = {
  name: "writing",
  title: "Writing",
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
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Short description for cards, previews, or SEO.",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Flash Fiction", value: "flash-fiction" },
          { title: "Serialized Fiction", value: "serialized-fiction" },
          { title: "Poetry", value: "poetry" },
          { title: "Short Story", value: "short-story" },
          { title: "Screenplay", value: "screenplay" },
          { title: "Essay", value: "essay" },
        ],
        layout: "dropdown",
      },
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "series",
      title: "Series",
      type: "reference",
      to: [{ type: "series" }],
      description:
        "Optional. Link to a Series document if this is part of one.",
    },
    {
      name: "season",
      title: "Season",
      type: "number",
      description: "Optional. Season number if part of a serialized series.",
    },
    {
      name: "episode",
      title: "Episode",
      type: "number",
      description: "Optional. Episode number if part of a serialized series.",
    },
    {
      name: "episodeTitle",
      title: "Episode Title",
      type: "string",
      description:
        "Optional. Only used if this is an episode in a serialized series.",
    },
    {
      name: "orderInSeries",
      title: "Sort Order (Override)",
      type: "number",
      description:
        "Optional. Used to override default season/episode sort order.",
    },
    {
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },
    {
      name: "media",
      title: "Cover Media",
      type: "object",
      fields: [
        {
          name: "type",
          title: "Media Type",
          type: "string",
          options: {
            list: [
              { title: "Image", value: "image" },
              { title: "Video", value: "video" },
            ],
            layout: "radio",
          },
        },
        {
          name: "image",
          title: "Image",
          type: "image",
          hidden: ({ parent }: any) => parent?.type !== "image",
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
          name: "video",
          title: "Video URL",
          type: "url",
          hidden: ({ parent }: any) => parent?.type !== "video",
          validation: (Rule: Rule) =>
            Rule.uri({ scheme: ["https", "http"] }).error(
              "Must be a valid video URL"
            ),
        },
      ],
    },
    {
      name: "content",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
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
          type: "object",
          name: "video",
          title: "Video Embed",
          fields: [
            {
              name: "url",
              title: "Video URL",
              type: "url",
              validation: (Rule: Rule) =>
                Rule.uri({ scheme: ["https", "http"] }).error(
                  "Must be a valid video URL"
                ),
            },
            {
              name: "title",
              title: "Title",
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
      subtitle: "category",
      media: "media.image",
    },
  },
};

export default writing;
