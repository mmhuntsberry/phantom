import { Rule } from "sanity";

const betaFeedback = {
  name: "betaFeedback",
  title: "Beta Feedback",
  type: "document",
  fields: [
    {
      name: "packet",
      title: "Beta Packet",
      type: "reference",
      to: [{ type: "betaPacket" }],
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "hookMoment",
      title: "Where were you most hooked?",
      type: "text",
      rows: 3,
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "attentionDrop",
      title: "Where did your attention drop?",
      type: "text",
      rows: 3,
    },
    {
      name: "confusion",
      title: "Where were you confused?",
      type: "text",
      rows: 3,
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "characterReal",
      title: "Which character felt most or least real?",
      type: "text",
      rows: 3,
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "keepReading",
      title: "Would you keep reading?",
      type: "string",
      options: {
        list: [
          { title: "Yes", value: "yes" },
          { title: "Maybe", value: "maybe" },
          { title: "No", value: "no" },
        ],
        layout: "radio",
      },
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "stopPoint",
      title: "If you stopped, where?",
      type: "string",
    },
    {
      name: "testimonialPermission",
      title: "Permission to Quote",
      type: "boolean",
    },
    {
      name: "attributionPreference",
      title: "Attribution Preference",
      type: "string",
      options: {
        list: [
          { title: "Anonymous", value: "anonymous" },
          { title: "Initials", value: "initials" },
          { title: "First name + initial", value: "firstNameInitial" },
          { title: "Full name", value: "fullName" },
        ],
        layout: "radio",
      },
    },
    {
      name: "attributionName",
      title: "Attribution Name",
      type: "string",
    },
    {
      name: "createdAt",
      title: "Submitted At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    },
  ],
};

export default betaFeedback;
