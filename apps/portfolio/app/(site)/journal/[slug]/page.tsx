import { Code } from "../../../../components/code";
import { getPost } from "../../../../sanity/sanity-utils";
import { PortableText } from "@portabletext/react";

const customPortableTextComponents = {
  types: {
    // @ts-expect-error TODO: fix this
    snippet: (props) => {
      return <Code value={props.value.code.code} />;
    },
  },
  block: {
    // @ts-expect-error TODO: fix this
    h1: ({ children }) => (
      <h2 className="grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3 mt-xl mb-lg text-size-3xl">
        {children}
      </h2>
    ),
    // @ts-expect-error TODO: fix this
    h2: ({ children }) => (
      <h2 className="grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3 mt-lg mb-lg text-size-xl">
        {children}
      </h2>
    ),
    // @ts-expect-error TODO: fix this
    normal: ({ children }) => (
      <p className=" grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3 mt-lg mb-lg text-size-xs">
        {children}
      </p>
    ),
  },
  marks: {
    // @ts-expect-error TODO: fix this
    code: ({ children }) => (
      <code className="d-inline p-xxs bg-color-secondary">{children}</code>
    ),
  },
};

// @ts-expect-error TODO: fix this
export default async function Post({ params }) {
  const slug = params.slug;
  const post = await getPost(slug);

  return (
    post && (
      <PortableText
        value={post.content}
        // @ts-expect-error TODO: fix this
        components={customPortableTextComponents}
      />
    )
  );
}
