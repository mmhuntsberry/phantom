import Image from "next/image";
import styles from "./Hero.module.css";

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
      <div className={styles.frame}>
        <Image
          src={media.image.asset.url}
          alt={media.image.alt || ""}
          fill
          className={styles.image}
          priority
        />
      </div>
    );
  }

  if (media.type === "video" && media.video) {
    return (
      <div className={styles.frame}>
        <iframe
          src={`${media.video}?hideEmbedTopBar=true&hide_share=true&hide_title=true&hide_owner=true&hide_speed=true`}
          title="Hero Video"
          allow="autoplay; fullscreen"
          allowFullScreen
          className={styles.iframe}
        />
      </div>
    );
  }

  return null;
};

export default HeroMedia;
