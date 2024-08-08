import { Surface } from "@mmhuntsberry/components";
import { getPosts } from "../../../sanity/sanity-utils";

import NextLink from "next/link";
import LinkWrapper from "packages/phantom-components/src/lib/components/link-wrapper/link-wrapper";

// @ts-expect-error TODO: fix this
export default async function Posts({ params }) {
  const posts = await getPosts();
  console.log(posts);
  return (
    <section className="gap-sm grid-span-5 sm:grid-span-all">
      <h2 className="small-md-regular">Things I've written</h2>

      <Surface className="mt-sm">
        <ul>
          {posts.map((post, i) => {
            return (
              <li key={post._id} className="grid">
                <LinkWrapper size="lg">
                  <NextLink href={`journal/${posts[i].slug}`}>
                    <h2>{post.name}</h2>
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
