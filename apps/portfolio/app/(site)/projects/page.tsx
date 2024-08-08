import { Surface } from "@mmhuntsberry/components";
import { getProjects } from "../../../sanity/sanity-utils";

import NextLink from "next/link";
import LinkWrapper from "packages/phantom-components/src/lib/components/link-wrapper/link-wrapper";

// @ts-expect-error TODO: fix this
export default async function Posts({ params }) {
  const projects = await getProjects();
  console.log(projects);
  return (
    <section className="gap-sm grid-span-5 sm:grid-span-all">
      <h2 className="small-md-regular">Things I've built</h2>

      <Surface className="mt-sm">
        <ul>
          {projects.map((project, i) => {
            return (
              <li key={project._id} className="grid">
                <LinkWrapper size="lg">
                  <NextLink href={`projects/${projects[i].slug}`}>
                    <h2>{project.name}</h2>
                  </NextLink>
                </LinkWrapper>
              </li>
            );
          })}
        </ul>
      </Surface>
    </section>
  );
}
