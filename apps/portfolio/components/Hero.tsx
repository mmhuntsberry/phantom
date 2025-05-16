import Image from "next/image";

export const HeroMedia = ({
  media,
}: {
  media: {
    type: "image" | "video";
    image?: {
      asset: { url: string };
      alt?: string;
    };
    video?: string;
  };
}) => {
  if (!media) return null;

  if (media.type === "image" && media.image?.asset?.url) {
    return (
      <Image
        src={media.image.asset.url}
        alt={media.image.alt || "Hero Image"}
        width={1200}
        height={600}
        layout="responsive"
        objectFit="cover"
      />
    );
  }

  if (media.type === "video" && media.video) {
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
        <iframe
          src={media.video}
          title="Hero Video"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "8px",
          }}
        />
      </div>
    );
  }

  return null;
};

export default HeroMedia;
