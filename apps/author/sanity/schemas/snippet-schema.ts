export const snippet = {
  name: "snippet",
  title: "Snippet",
  type: "object",
  fields: [
    {
      type: "code",
      name: "code",
      title: "Code",
      options: {
        language: "javascript",
        languageAlternatives: [
          { title: "Javascript", value: "javascript" },
          { title: "HTML", value: "html" },
          { title: "CSS", value: "css" },
        ],
        withFilename: true,
      },
    },
  ],
};

export default snippet;
