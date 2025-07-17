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
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1024px",
          height: "512px",
          margin: "0 auto",
        }}
      >
        <Image
          src={media.image.asset.url}
          alt={media.image.alt || "Hero Image"}
          fill
          style={{ objectFit: "cover", objectPosition: "bottom" }}
          priority
        />
      </div>
    );
  }

  if (media.type === "video" && media.video) {
    return (
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          height: 0,
          maxWidth: "1024px",
          margin: "0 auto",
        }}
      >
        <iframe
          src={`${media.video}?hideEmbedTopBar=true&hide_share=true&hide_title=true&hide_owner=true&hide_speed=true`}
          title="Hero Video"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "80%",
            border: "none",
            borderRadius: "0",
          }}
        />
      </div>
    );
  }

  return null;
};

export default HeroMedia;
