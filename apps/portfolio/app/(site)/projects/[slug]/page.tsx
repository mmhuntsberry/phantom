import { Code } from "../../../../components/code";
import { getProject } from "../../../../sanity/sanity-utils";
import { PortableText, PortableTextReactComponents } from "@portabletext/react";
import speakingurl from "speakingurl";

// @ts-expect-error TODO: fix this
const filter = (ast, match) =>
  // @ts-expect-error TODO: fix this
  ast.reduce((acc, node) => {
    if (match(node)) acc.push(node);
    if (node.children) acc.push(...filter(node.children, match));
    return acc;
  }, []);

// @ts-expect-error TODO: fix this
const findHeadings = (ast) =>
  // @ts-expect-error TODO: fix this
  filter(ast, (node) => /h\d/.test(node.style)).map((node) => {
    const text = getChildrenText(node);
    const slug = speakingurl(text);

    return { ...node, text, slug };
  });

// @ts-expect-error TODO: fix this
const get = (object, path) => path.reduce((prev, curr) => prev[curr], object);
// @ts-expect-error TODO: fix this
const getObjectPath = (path) =>
  path.length === 0
    ? path
    : ["subheadings"].concat(path.join(".subheadings.").split("."));

// @ts-expect-error TODO: fix this
const parseOutline = (ast) => {
  const outline = { subheadings: [] };
  const headings = findHeadings(ast);
  // @ts-expect-error TODO: fix this
  const path = [];
  let lastLevel = 0;

  // @ts-expect-error TODO: fix this
  headings.forEach((heading) => {
    console.log(heading);
    const level = Number(heading.style.slice(1));
    heading.subheadings = [];

    // @ts-expect-error TODO: fix this
    if (level < lastLevel) for (let i = lastLevel; i >= level; i--) path.pop();
    // @ts-expect-error TODO: fix this
    else if (level === lastLevel) path.pop();

    // @ts-expect-error TODO: fix this
    const prop = get(outline, getObjectPath(path));
    prop.subheadings.push(heading);
    path.push(prop.subheadings.length - 1);
    lastLevel = level;
  });

  return outline.subheadings;
};

const customPortableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    snippet: (props) => {
      return <Code value={props.value.code.code} />;
    },
  },
  block: {
    // @ts-expect-error TODO: fix this
    h1: ({ children, node }) => (
      <h2 className="grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3 mt-xl mb-lg text-size-3xl">
        {children}
      </h2>
    ),
    h2: (props) => {
      // @ts-expect-error TODO: fix this
      const { node, children } = props;
      const { style, _key } = node;

      if (/^h\d/.test(style)) {
        // Even though HTML5 allows id to start with a digit, we append it with a letter to avoid various JS methods to act up and make problems
        const headingId = `h${_key}`;
        return (
          <h2
            id={headingId}
            className="grid-span-all md:grid-span-2-to-neg2 mt-lg lg:grid-span-3-to-neg3  mb-lg text-size-xl block title-md-regular text-color-secondary"
          >
            {children}
          </h2>
        );
      }
    },
    // h2: ({ children }) => (
    //   <h2 className="grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3 mt-lg mb-lg text-size-xl">
    //     {children}
    //   </h2>
    // ),
    normal: ({ children }) => (
      <p className="grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3 mt-md text-size-xs">
        {children}
      </p>
    ),
  },
  marks: {
    code: ({ children }) => (
      <code className="d-inline p-xxs bg-color-secondary">{children}</code>
    ),
    link: ({ children, value }) => {
      const rel = !value.href.startsWith("/")
        ? "noreferrer noopener"
        : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          className="cursor-pointer link-text-color-primary hover:link-text-color-primary"
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="pl-lg grid list-disc gap-md">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className=" pl-lg grid list-decimal gap-md">{children}</ol>
    ),
  },
  listItem: ({ children }) => {
    return (
      <li className="grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3 text-size-xs">
        {children}
      </li>
    );
  },
};

// @ts-expect-error TODO: fix this
export default async function Project({ params }) {
  const slug = params.slug;
  const project = await getProject(slug);
  const outline = parseOutline(project.content);

  return (
    <>
      <TableOfContents outline={outline} />
      <PortableText
        value={project.content}
        components={customPortableTextComponents}
      />
    </>
  );
}

// @ts-expect-error TODO: fix this
const getChildrenText = (props) =>
  props.children
    // @ts-expect-error TODO: fix this
    .map((node) => (typeof node === "string" ? node : node.text || ""))
    .join("");

// @ts-expect-error TODO: fix this
const TableOfContents = (props) => (
  <ul className="grid gap-xs pl-lg mt-4xl mb-4xl pl-xl">
    {props.outline.map(
      // @ts-expect-error TODO: fix this
      (heading) => (
        <li
          key={heading}
          className="cursor-pointer link-text-color-primary hover:link-text-color-primary"
        >
          <a href={"#h" + heading._key}>{heading.text}</a>

          {heading.subheadings.length > 0 && (
            <TableOfContents outline={heading.subheadings} />
          )}
        </li>
      )
    )}
  </ul>
);
