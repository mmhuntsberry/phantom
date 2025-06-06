const post = {
  name: "post",
  title: "Posts",
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
      options: { source: "name" },
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
        },
        { type: "snippet" },
      ],
    },
  ],
};

export default post;
