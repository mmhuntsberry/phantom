import React from "react";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponents,
  PortableTextTypeComponentProps,
} from "@portabletext/react";

import Image from "next/image";

// Section renderer
interface SectionProps {
  value: {
    title: string;
    body: PortableTextBlock[];
  };
  index: number;
}

// Image renderer
const ImageComponent = ({
  value,
}: PortableTextTypeComponentProps<{
  alt?: string;
  asset: { url: string };
}>) => {
  const { alt, asset } = value;
  if (!asset?.url) return null;

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

// Video renderer
const VideoComponent = ({
  value,
}: PortableTextTypeComponentProps<{
  url: string;
  title?: string;
}>) => {
  if (!value?.url) return null;

  return (
    <div className="video-wrapper" style={{ margin: "48px 0" }}>
      <iframe
        src={`${value.url}?hideEmbedTopBar=true&hide_share=true&hide_title=true&hide_owner=true&hide_speed=true`}
        title={value.title || "Embedded Video"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "0px",
        }}
      />
      {value.title && (
        <p
          style={{
            textAlign: "center",
            fontSize: "var(--fs-xs)",
            marginTop: "8px",
          }}
        >
          {value.title}
        </p>
      )}
    </div>
  );
};

const components: PortableTextComponents = {
  list: {
    bullet: ({ children }) => (
      <ul style={{ fontSize: "var(--fs-sm)", paddingInlineStart: "64px" }}>
        {children}
      </ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li style={{ listStyleType: "disc" }}>{children}</li>
    ),
  },
  block: {
    h1: ({ children }) => (
      <h1
        style={{
          fontSize: "var(--fs-xl)",
          lineHeight: "1.2",
          paddingBlock: "96px",
        }}
        className="container"
      >
        {children}
      </h1>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: "var(--fs-lg)", lineHeight: "1.2" }}>
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p
        style={{
          fontSize: "var(--fs-xl)",
          lineHeight: "1.2",
          fontWeight: "300",
        }}
      >
        {children}
      </p>
    ),
  },
  types: {
    image: ImageComponent,
    video: VideoComponent,
  },
};

// WritingContent renderer
interface WritingContentProps {
  content: any;
  title: string;
}

const WritingContent: React.FC<WritingContentProps> = ({ title, content }) => {
  return (
    <>
      <PortableText
        value={content}
        onMissingComponent={false}
        components={components}
      />
    </>
  );
};

export default WritingContent;
