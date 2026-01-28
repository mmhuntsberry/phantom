"use client";

import styles from "./LogoWall.module.css";
import { useEffect, useMemo, useRef } from "react";

type Brand = {
  name: string;
  note?: string;
  logoSrc?: string;
};

const featuredBrands: Brand[] = [
  { name: "Men's Health", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/mens-health.svg" },
  { name: "Oprah Daily", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/oprah-daily.svg" },
  { name: "Cosmopolitan", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/cosmopolitan.svg" },
  { name: "Car and Driver", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/car-and-driver.svg" },
  { name: "Autoweek", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/autoweek.svg" },
  { name: "ELLE", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/elle.svg" },
  { name: "Popular Mechanics", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/popular-mechanics.svg" },
  { name: "Good Housekeeping", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/good-housekeeping.svg" },
  { name: "IBM Carbon", note: "IBM", logoSrc: "/logos/wordmarks/ibm-carbon.svg" },
  { name: "Nielsen ONE", note: "Nielsen", logoSrc: "/logos/wordmarks/nielsen-one.svg" },
];

const moreHearstBrands: Brand[] = [
  { name: "Esquire", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/esquire.svg" },
  { name: "Harper's BAZAAR", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/harpers-bazaar.svg" },
  { name: "Town & Country", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/town-and-country.svg" },
  { name: "House Beautiful", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/house-beautiful.svg" },
  { name: "Country Living", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/country-living.svg" },
  { name: "Veranda", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/veranda.svg" },
  { name: "Woman's Day", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/womans-day.svg" },
  { name: "The Pioneer Woman", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/the-pioneer-woman.svg" },
  { name: "Prevention", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/prevention.svg" },
  { name: "Women's Health", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/womens-health.svg" },
  { name: "Runner's World", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/runners-world.svg" },
  { name: "Bicycling", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/bicycling.svg" },
  { name: "Road & Track", note: "Hearst Magazines", logoSrc: "/logos/wordmarks/road-and-track.svg" },
];

function BrandMark({ brand }: { brand: Brand }) {
  if (brand.logoSrc) {
    return (
      <img
        className={styles.logoImg}
        src={brand.logoSrc}
        alt={brand.name}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return <span className={styles.wordmark}>{brand.name}</span>;
}

function useAutoScrollRow({
  enabled,
  direction,
}: {
  enabled: boolean;
  direction: 1 | -1;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let raf = 0;
    let lastTs = 0;
    let pauseUntil = 0;
    let resumeTimer: number | undefined;
    let didInitOffset = false;

    const pause = (ms = 1200) => {
      pauseUntil = Math.max(pauseUntil, performance.now() + ms);
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        pauseUntil = 0;
      }, ms);
    };

    const onPointerDown = () => pause(2500);
    const onWheel = () => pause(2000);
    const onFocusIn = () => pause(3000);

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("focusin", onFocusIn);

    const speedPxPerSec = prefersReducedMotion ? 16 : 42;

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      if (pauseUntil === 0 || ts >= pauseUntil) {
        const scrollWidth = el.scrollWidth;
        const half = Math.floor(scrollWidth / 2);
        if (!didInitOffset && half > 0) {
          if (direction === -1) {
            el.scrollLeft = half;
          }
          didInitOffset = true;
        }
        const next = el.scrollLeft + direction * speedPxPerSec * dt;

        if (direction === 1) {
          if (next >= half) {
            el.scrollLeft = next - half;
          } else {
            el.scrollLeft = next;
          }
        } else {
          if (next <= 0) {
            el.scrollLeft = next + half;
          } else {
            el.scrollLeft = next;
          }
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      if (resumeTimer) window.clearTimeout(resumeTimer);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("focusin", onFocusIn);
    };
  }, [enabled, direction]);

  return ref;
}

function BrandRow({
  items,
  ariaLabel,
  direction,
}: {
  items: Brand[];
  ariaLabel: string;
  direction: 1 | -1;
}) {
  const loopItems = useMemo(() => [...items, ...items], [items]);
  const scrollerRef = useAutoScrollRow({ enabled: true, direction });

  return (
    <div className={styles.rowScroller} aria-label={ariaLabel} ref={scrollerRef}>
      <ul className={styles.track}>
        {loopItems.map((brand, idx) => {
          const isClone = idx >= items.length;
          return (
            <li
              key={`${brand.name}-${idx}`}
              className={styles.tile}
              title={brand.note || brand.name}
              aria-hidden={isClone ? "true" : undefined}
            >
              <BrandMark brand={brand} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function LogoWall() {
  const featured = featuredBrands;
  const hearst = moreHearstBrands;

  return (
    <section className={styles.section} aria-label="Brands supported">
      <p className={styles.kicker}>Built for teams at</p>
      <div className={styles.marquee} aria-label="Brand logos">
        <BrandRow items={featured} ariaLabel="Featured brands" direction={1} />
        <BrandRow items={hearst} ariaLabel="More brands" direction={-1} />
      </div>
    </section>
  );
}
