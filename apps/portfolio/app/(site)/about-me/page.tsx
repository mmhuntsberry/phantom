import { Badge, Surface } from "@mmhuntsberry/components";

import NextLink from "next/link";
import { Trilby } from "packages/phantom-components/src/lib/icons";

import {
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  Envelope,
} from "@phosphor-icons/react/dist/ssr";

const skills = [
  "HTML/CSS",
  "JavaScript",
  "React",
  "TypeScript",
  "Web Components",
  "Lit Element",
  "Jest",
  "Storybook",
  "ESLint",
  "Figma",
  "Accessibility",
  "WCAG Compliance",
  "Open Source",
  "Code Reviews",
  "Documentation",
  "Git",
  "Systems Thinking",
  "Design Thinking",
  "Design Token Management",
  "Multi-Brand Theming",
  "Collaboration",
  "Dev Tools",
  "Individual Contributor",
  "Code Audits",
  "Library Maintenance",
  "Design Systems",
  "Monorepos",
  "Stakeholder Engagement",
  "Systems Architecture",
  "Leadership",
];
export default function About() {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-lg">
      <section className="grid-span-all">
        <Surface className="items-center">
          <div className="pt-2xl">
            <Trilby />
          </div>
          <h2 className="mt-3xl mb-xl title-lg-regular">
            Hello, digital traveler!
          </h2>
          <p className="paragraph-md-regular">
            I’m Matt, your guide to the intricate maze of building design
            systems and component libraries.
          </p>
        </Surface>
      </section>
      <section className="grid-span-all md:grid-span-6 lg:grid-span-9">
        <h3 className="small-md-regular">Skills</h3>
        <Surface className="mt-sm">
          <ul className="list-none flex flex-wrap gap-sm row-gap-lg justify-center items-center">
            {skills.map((skill) => (
              <li key={skill}>
                <Badge>{skill}</Badge>
              </li>
            ))}
          </ul>
        </Surface>
      </section>
      <section className="grid-span-all md:grid-span-2 lg:grid-span-3">
        <h3 className="small-md-regular">Find me here</h3>
        <Surface className="mt-sm">
          <section className="flex items-center flex-wrap gap-sm justify-around">
            <NextLink
              href="https://github.com/mmhuntsberry"
              aria-label="Matt's Github"
            >
              <GithubLogo
                size={64}
                className="link-text-color-primary hover:link-text-color-primary"
              />
            </NextLink>
            <NextLink
              href="https://www.linkedin.com/in/mmhuntsberry/"
              aria-label="Matt's Linkedin"
            >
              <LinkedinLogo
                size={64}
                className="link-text-color-primary hover:link-text-color-primary"
              />
            </NextLink>
            <NextLink
              href="https://www.instagram.com/matt_huntsberry/"
              aria-label="Matt's Instagram"
            >
              <InstagramLogo
                size={64}
                className="link-text-color-primary hover:link-text-color-primary"
              />
            </NextLink>
            <NextLink
              href="mailto:mmhuntsberry@gmail.com"
              aria-label="Matt's Email"
            >
              <Envelope
                size={64}
                className="link-text-color-primary hover:link-text-color-primary"
              />
            </NextLink>
          </section>
        </Surface>
      </section>
    </div>
  );
}
