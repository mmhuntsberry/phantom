import type { Rule } from "sanity";

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
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "One-paragraph summary for preview cards and list views.",
    },
    {
      name: "media",
      title: "Hero Media",
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
          hidden: ({ parent }: { parent: { type: string } }) =>
            parent?.type !== "image",
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
          hidden: ({ parent }: { parent: { type: string } }) =>
            parent?.type !== "video",
          validation: (Rule: Rule) =>
            Rule.uri({ scheme: ["https", "http"] }).error(
              "Must be a valid video URL"
            ),
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
      name: "role",
      title: "My Role",
      type: "text",
      description: "Clarify your leadership scope, responsibilities, or title.",
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (Rule: Rule) =>
                Rule.required().error("Alt text is required for accessibility"),
              description:
                "Alternative text for the image, used for accessibility and SEO.",
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
              description: "Supports YouTube, Vimeo, Loom, etc.",
            },
            {
              name: "title",
              title: "Title",
              type: "string",
              description: "Descriptive title for the video.",
            },
          ],
          preview: {
            select: {
              title: "title",
              url: "url",
            },
            prepare({ title, url }: { title: string; url: string }) {
              return {
                title: title || "Embedded Video",
                subtitle: url,
              };
            },
          },
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
                { type: "block" },
                {
                  type: "image",
                  title: "Section Image",
                  options: { hotspot: true },
                  fields: [
                    {
                      name: "alt",
                      title: "Alt Text",
                      type: "string",
                      validation: (Rule: Rule) =>
                        Rule.required().error(
                          "Alt text is required for accessibility"
                        ),
                      description:
                        "Alternative text for the image, used for accessibility and SEO.",
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
                      description: "Supports YouTube, Vimeo, Loom, etc.",
                    },
                    {
                      name: "title",
                      title: "Title",
                      type: "string",
                      description: "Descriptive title for the video.",
                    },
                  ],
                  preview: {
                    select: {
                      title: "title",
                      url: "url",
                    },
                    prepare({ title, url }: { title: string; url: string }) {
                      return {
                        title: title || "Embedded Video",
                        subtitle: url,
                      };
                    },
                  },
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
