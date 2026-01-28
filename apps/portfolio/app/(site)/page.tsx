import { getStudies } from "../../sanity/sanity-utils";

import NextLink from "next/link";
import styles from "./page.module.css";
import {
  ArrowRight,
  Compass,
  Cpu,
  Link,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import LogoWall from "../../components/LogoWall";
import type { Study } from "../../types/Study";

function normalize(value: string) {
  return value.toLowerCase();
}

function scoreStudy(study: Study, keywords: readonly string[]) {
  const hay = [
    normalize(study.name),
    normalize(study.summary || ""),
    normalize(study.about || ""),
    ...(study.tags || []).map((t) => normalize(t)),
  ].join(" | ");

  let score = 0;
  for (const kw of keywords) {
    if (hay.includes(kw)) score += 1;
  }
  return score;
}

function pickBestStudy(
  studies: Study[],
  keywords: readonly string[],
  excludeIds: Set<string>
) {
  let best: Study | null = null;
  let bestScore = 0;

  for (const study of studies) {
    if (excludeIds.has(study._id)) continue;
    const s = scoreStudy(study, keywords);
    if (s > bestScore) {
      bestScore = s;
      best = study;
    }
  }

  return { best, bestScore };
}

type StartHereItem = {
  label: string;
  icon: React.ReactNode;
  study: Study;
};

function pickStartHere(studies: Study[]): StartHereItem[] {
  const categories = [
    {
      label: "Architecture",
      icon: <Compass size={20} />,
      keywords: ["token", "tokens", "theming", "theme", "architecture", "primitives", "alias"],
    },
    {
      label: "Accessibility",
      icon: <ShieldCheck size={20} />,
      keywords: ["a11y", "accessibility", "wcag", "aria", "keyboard", "screen reader"],
    },
    {
      label: "AI workflows",
      icon: <Cpu size={20} />,
      keywords: ["mcp", "ai", "automation", "workflow", "llm", "prompt", "token aware"],
    },
    {
      label: "Leadership",
      icon: <UsersThree size={20} />,
      keywords: ["lead", "leading", "leadership", "teams", "ownership", "trust", "governance"],
    },
  ] as const;

  const used = new Set<string>();
  const picked: StartHereItem[] = [];

  for (const category of categories) {
    const { best, bestScore } = pickBestStudy(studies, category.keywords, used);
    if (best && bestScore > 0) {
      used.add(best._id);
      picked.push({
        label: category.label,
        icon: category.icon,
        study: best,
      });
    }
  }

  // Fill any remaining slots (up to 4) with the most recent studies not yet used.
  for (const s of studies) {
    if (picked.length >= 4) break;
    if (used.has(s._id)) continue;
    used.add(s._id);
    picked.push({
      label: "Case study",
      icon: <ArrowRight size={20} />,
      study: s,
    });
  }

  return picked.slice(0, 4);
}

export default async function Index() {
  const studies = await getStudies();
  const startHere = pickStartHere(studies);

  return (
    <>
      <section className={`${styles.hero} container`}>
        <p className={styles.kicker}>Design systems engineer and platform builder</p>
        <h1 className={styles.headline}>
          I design systems that help teams ship faster with confidence
        </h1>
        <p className={styles.lede}>
          I build token-driven foundations, accessible component libraries, and the
          ops that keep them healthy as products and teams grow.
        </p>

        <div className={styles.ctaRow}>
          <NextLink className={`control control--primary ${styles.primaryCta}`} href="#work">
            View work <ArrowRight className={styles.inlineArrow} size={20} />
          </NextLink>
          <NextLink className={`control ${styles.secondaryCta}`} href="/resume">
            Resume
          </NextLink>
        </div>

        <ul className={styles.chips} aria-label="Core capabilities">
          <li className={styles.chip}>Tokens and theming</li>
          <li className={styles.chip}>Figma automation</li>
          <li className={styles.chip}>Accessibility baseline</li>
          <li className={styles.chip}>Docs and governance</li>
          <li className={styles.chip}>Quality gates in CI</li>
          <li className={styles.chip}>Adoption analytics</li>
        </ul>

        <div className={styles.metrics}>
          <div className={styles.metricCard}>
            <p className={styles.metricValue}>48</p>
            <p className={styles.metricLabel}>Brands supported in one ecosystem</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricValue}>A11y</p>
            <p className={styles.metricLabel}>Accessible patterns as default</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricValue}>Ops</p>
            <p className={styles.metricLabel}>Automation that scales the system</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Where I’ve shipped</h2>
          <p className={styles.sectionSubtitle}>
            Design systems work across publishing brands and enterprise platforms.
          </p>
        </div>
        <LogoWall />
      </section>

      <section id="work" className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Impact at scale</h2>
          <p className={styles.sectionSubtitle}>
            Case studies focused on systems, outcomes, and the decisions behind them.
          </p>
        </div>

        {startHere.length > 0 && (
          <div className={styles.startHere}>
            <div className={styles.startHereIntro}>
              <p className={styles.startHereKicker}>Start here</p>
              <h3 className={styles.startHereTitle}>Pick a path based on what you care about</h3>
              <p className={styles.startHereBody}>
                Each study is written for scan-first reading. Open one and jump via the table of contents.
              </p>
            </div>
            <div className={styles.startHereGrid}>
              {startHere.map((item) => (
                <NextLink
                  key={`${item.label}-${item.study._id}`}
                  className={styles.startHereCard}
                  href={`/studies/${item.study.slug}`}
                >
                  <div className={styles.startHereIcon} aria-hidden="true">
                    {item.icon}
                  </div>
                  <div className={styles.startHereText}>
                    <p className={styles.startHereCardKicker}>{item.label}</p>
                    <p className={styles.startHereCardTitle}>{item.study.name}</p>
                  </div>
                  <ArrowRight className={styles.startHereArrow} size={24} aria-hidden="true" />
                </NextLink>
              ))}
            </div>
          </div>
        )}

        <ul className={styles.workGrid}>
          {studies.length === 0 ? (
            <li className={styles.emptyState}>
              <p className={styles.emptyTitle}>Work is loading</p>
              <p className={styles.emptyBody}>
                If you are running locally without access to Sanity, this section will
                stay empty.
              </p>
            </li>
          ) : (
            studies.map((study) => (
              <li key={study._id} className={styles.workCard}>
                <NextLink className={styles.workLink} href={`/studies/${study.slug}`}>
                  {study.media?.type === "image" && study.media?.image?.asset?.url ? (
                    <div className={styles.workMedia} aria-hidden="true">
                      <img
                        className={styles.workMediaImg}
                        src={study.media.image.asset.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <div className={styles.workMediaFade} />
                    </div>
                  ) : (
                    <div className={styles.workMediaPlaceholder} aria-hidden="true" />
                  )}
                  <div className={styles.workTop}>
                    <h3 className={styles.workTitle}>{study.name}</h3>
                    <ArrowRight className={styles.workArrow} size={24} />
                  </div>
                  <p className={styles.workSummary}>
                    {study.summary || study.about || study.excerpt}
                  </p>
                  <div className={styles.workMeta}>
                    {study.role && (
                      <span className={styles.metaPill}>{study.role}</span>
                    )}
                    {study.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.metaPill}>
                        {tag}
                      </span>
                    ))}
                    {study.url && (
                      <span
                        className={styles.metaLink}
                        aria-label="External link available"
                      >
                        <Link size={16} />
                      </span>
                    )}
                  </div>
                </NextLink>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>System artifacts</h2>
          <p className={styles.sectionSubtitle}>
            The work behind the UI. These are the pieces that make a design system
            durable and easy to adopt.
          </p>
        </div>

        <div className={styles.artifactGrid}>
          <div className={styles.artifactCard}>
            <h3 className={styles.artifactTitle}>Token taxonomy</h3>
            <p className={styles.artifactBody}>
              A naming model that supports themes, density, and semantic intent across
              platforms.
            </p>
            <ul className={styles.artifactList}>
              <li>Core tokens</li>
              <li>Semantic tokens</li>
              <li>Component tokens</li>
            </ul>
          </div>

          <div className={styles.artifactCard}>
            <h3 className={styles.artifactTitle}>Automation and ops</h3>
            <p className={styles.artifactBody}>
              Pipelines that keep design and code aligned and reduce maintenance cost.
            </p>
            <ul className={styles.artifactList}>
              <li>Figma to tokens</li>
              <li>Release notes and versioning</li>
              <li>Visual regression gates</li>
            </ul>
          </div>

          <div className={styles.artifactCard}>
            <h3 className={styles.artifactTitle}>Accessibility baseline</h3>
            <p className={styles.artifactBody}>
              Accessible patterns baked in so product teams do not need to remember
              the rules.
            </p>
            <ul className={styles.artifactList}>
              <li>Keyboard and focus patterns</li>
              <li>Contrast and motion safety</li>
              <li>Screen reader semantics</li>
            </ul>
          </div>

          <div className={styles.artifactCard}>
            <h3 className={styles.artifactTitle}>Governance that ships</h3>
            <p className={styles.artifactBody}>
              Clear contribution paths that support scale and avoid design drift.
            </p>
            <ul className={styles.artifactList}>
              <li>RFC workflow</li>
              <li>Contribution guidelines</li>
              <li>Adoption analytics</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
