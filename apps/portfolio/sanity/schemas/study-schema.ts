const study = {
  name: "study",
  title: "Studies",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
      },
    },
    {
      name: "image",
      title: "Main Image",
      type: "image",
      options: {
        hotspot: true, // Allows the user to manually adjust the focus point on images
      },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validation: (Rule: any) =>
            Rule.required().error("Alt text is required for accessibility"),
          description:
            "Alternative text for the image, used for accessibility and SEO.",
        },
      ],
    },
    {
      name: "url",
      title: "URL",
      type: "url",
    },
    {
      name: "about",
      title: "About",
      type: "string",
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" }, // Regular text block
        {
          type: "image", // Inline images in the content
          title: "Inline Image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              validation: (Rule: any) =>
                Rule.required().error("Alt text is required for accessibility"),
              description:
                "Alternative text for the image, used for accessibility and SEO.",
            },
          ],
        },
        {
          type: "object",
          name: "section",
          title: "Section",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
            },
            {
              name: "body",
              title: "Body",
              type: "array",
              of: [
                { type: "block" }, // Blocks inside the section
                {
                  type: "image",
                  title: "Section Image",
                  options: {
                    hotspot: true,
                  },
                  fields: [
                    {
                      name: "alt",
                      title: "Alt Text",
                      type: "string",
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      validation: (Rule: any) =>
                        Rule.required().error(
                          "Alt text is required for accessibility"
                        ),
                      description:
                        "Alternative text for the image, used for accessibility and SEO.",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default study;
