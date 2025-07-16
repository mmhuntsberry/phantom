const series = {
  name: "series",
  title: "Series",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Series Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Short description of the series shown on landing pages.",
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
              validation: (Rule: any) =>
                Rule.required().error("Alt text is required for accessibility"),
            },
          ],
        },
        {
          name: "video",
          title: "Video URL",
          type: "url",
          hidden: ({ parent }: any) => parent?.type !== "video",
          validation: (Rule: any) =>
            Rule.uri({ scheme: ["http", "https"] }).error(
              "Must be a valid URL"
            ),
        },
      ],
    },
  ],
};

export default series;
