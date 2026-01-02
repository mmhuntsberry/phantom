import { Rule } from "sanity";

const betaApplicant = {
  name: "betaApplicant",
  title: "Beta Applicant",
  type: "document",
  fields: [
    {
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule: Rule) => Rule.required().email(),
    },
    {
      name: "formatPreference",
      title: "Format Preference",
      type: "string",
      options: {
        list: [
          { title: "Web", value: "web" },
          { title: "EPUB", value: "epub" },
          { title: "PDF", value: "pdf" },
        ],
        layout: "radio",
      },
    },
    {
      name: "consent",
      title: "Consent",
      type: "boolean",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "readingPreferences",
      title: "Reading Preferences",
      type: "string",
    },
    {
      name: "referralSource",
      title: "Referral Source",
      type: "string",
    },
    {
      name: "packet",
      title: "Beta Packet",
      type: "reference",
      to: [{ type: "betaPacket" }],
    },
    {
      name: "createdAt",
      title: "Submitted At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    },
  ],
  preview: {
    select: {
      title: "email",
      subtitle: "formatPreference",
    },
  },
};

export default betaApplicant;
