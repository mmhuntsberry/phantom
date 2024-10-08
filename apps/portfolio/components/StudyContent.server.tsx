import React from "react";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponents,
  PortableTextTypeComponentProps,
} from "@portabletext/react";
import Image from "next/image";

interface SectionProps {
  value: {
    title: string;
    body: PortableTextBlock[];
  };
  index: number;
}

const Section: React.FC<SectionProps> = ({ value, index }) => {
  const isEven = index % 2 === 0;
  const bgColor = isEven ? "#ffffff" : "#000000";
  const textColor = isEven ? "#000000" : "#ffffff";

  return (
    <section
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: "96px 0",
      }}
    >
      <div className="container">
        <h3
          style={{
            fontSize: "var(--fs-lg)",
          }}
        >
          {value.title}
        </h3>
        <PortableText value={value.body} components={serializers} />
      </div>
    </section>
  );
};

// Define a custom component to handle the image type using Next.js Image component
const ImageComponent = ({
  value,
}: PortableTextTypeComponentProps<{
  alt?: string;
  asset: {
    url: string;
  };
}>) => {
  const { alt, asset } = value;

  if (!asset?.url) return null; // Check for the presence of asset.url

  return (
    <figure style={{ margin: "20px 0" }}>
      <Image
        src={asset.url}
        alt={alt || "Image"}
        width={800}
        height={450}
        layout="responsive"
        objectFit="cover"
      />
      {alt && <figcaption style={{ textAlign: "center" }}>{alt}</figcaption>}
    </figure>
  );
};

// Custom List Serializers
const serializers: PortableTextComponents = {
  list: {
    bullet: ({ children }) => (
      <ul
        style={{
          paddingLeft: "64px",
        }}
      >
        {children}
      </ul>
    ),
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: ({ children }) => (
    <li
      style={{
        fontSize: "var(--fs-sm)",
        lineHeight: "1.2",
        fontWeight: "300",
        listStyle: "disc",
      }}
    >
      {children}
    </li>
  ),
  types: {
    block: (props) => {
      switch (props.value.style) {
        case "h3":
          return (
            <h3
              style={{
                fontSize: "var(--fs-lg)",
              }}
            >
              {props.value.children[0].text}
            </h3>
          );
        default:
          return (
            <p
              style={{
                fontSize: "var(--fs-md)",
                lineHeight: "1.5",
                fontWeight: "300",
              }}
            >
              {props.value.children[0].text}
            </p>
          );
      }
    },
    section: (
      props: PortableTextTypeComponentProps<{
        title: string;
        body: PortableTextBlock[];
      }>
    ) => <Section {...props} />,
    image: ImageComponent,
  },
};

// Define the props type for the main StudyContent component
interface StudyContentProps {
  content: PortableTextBlock[];
}

const StudyContent: React.FC<StudyContentProps> = ({ content }) => {
  return content.map((block, index) => {
    return (
      <PortableText
        key={index}
        value={[block]}
        components={{
          ...serializers,
          types: {
            ...serializers.types,
            section: (props) => <Section {...props} index={index} />,
          },
        }}
      />
    );
  });
};

export default StudyContent;
