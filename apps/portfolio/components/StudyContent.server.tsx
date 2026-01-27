import React from "react";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponents,
  PortableTextTypeComponentProps,
} from "@portabletext/react";

import Image from "next/image";
import styles from "./StudyContent.module.css";
import { slugify } from "../utils";

// Section renderer
interface SectionProps {
  value: {
    title: string;
    body: PortableTextBlock[];
  };
  index: number;
}

const Section: React.FC<SectionProps> = ({ value, index }) => {
  return (
    <section
      id={slugify(value.title)}
      className={styles.section}
      data-variant={index % 2 === 0 ? "a" : "b"}
    >
      <div className={`container ${styles.sectionInner}`}>
        <h2 className={styles.sectionTitle}>{value.title}</h2>
        <div className={styles.prose}>
          <PortableText value={value.body} components={serializers} />
        </div>
      </div>
    </section>
  );
};

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
    <figure className={styles.figure}>
      <Image
        src={asset.url}
        alt={alt || ""}
        width={800}
        height={450}
        className={styles.figureMedia}
      />
      {alt && (
        <figcaption className={styles.figcaption}>{alt}</figcaption>
      )}
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
    <div className={styles.video}>
      <iframe
        src={`${value.url}?hideEmbedTopBar=true&hide_share=true&hide_title=true&hide_owner=true&hide_speed=true`}
        title={value.title || "Embedded Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={styles.videoFrame}
      />
      {value.title && (
        <p className={styles.videoCaption}>{value.title}</p>
      )}
    </div>
  );
};

// Portable Text serializers
const serializers: PortableTextComponents = {
  list: {
    bullet: ({ children }) => <ul className={styles.ul}>{children}</ul>,
  },
  listItem: {
    bullet: ({ children }) => <li className={styles.li}>{children}</li>,
  },
  block: {
    h1: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    normal: ({ children }) => <p className={styles.p}>{children}</p>,
  },
  types: {
    image: ImageComponent,
    video: VideoComponent,
    section: (
      props: PortableTextTypeComponentProps<{
        title: string;
        body: PortableTextBlock[];
      }>
    ) => <Section {...props} />,
  },
};

// StudyContent renderer
interface StudyContentProps {
  content: any;
  title: string;
}

const StudyContent: React.FC<StudyContentProps> = ({ title, content }) => {
  return (
    <>
      {content.map((block: any, index: number) => {
        const isSection = block?._type === "section";

        const components = {
          ...serializers,
          types: {
            ...serializers.types,
            section: (props: any) => <Section {...props} index={index} />,
          },
        };

        if (isSection) {
          return (
            <PortableText
              key={index}
              value={[block]}
              onMissingComponent={false}
              components={components}
            />
          );
        }

        return (
          <div key={index} className={`container ${styles.block}`}>
            <div className={styles.prose}>
              <PortableText
                value={[block]}
                onMissingComponent={false}
                components={components}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default StudyContent;
