import { getStudies } from "../../sanity/sanity-utils";

import NextLink from "next/link";
import styles from "./page.module.css";
import { ArrowRight, Compass, Link, Sparkle, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import LogoWall from "../../components/LogoWall";
import type { Study } from "../../types/Study";

function normalize(value: string) {
  return value.toLowerCase();
}

function pickStartHere(studies: Study[]) {
  const by = (predicate: (study: Study) => boolean) => studies.find(predicate);
  const has = (study: Study, needle: string) =>
    normalize(study.name).includes(needle) ||
    normalize(study.summary || "").includes(needle) ||
    (study.tags || []).some((t) => normalize(t).includes(needle));

  const designSystems = by((s) => has(s, "design system") || has(s, "component"));
  const accessibility = by((s) => has(s, "a11y") || has(s, "accessibility"));
  const automation = by((s) => has(s, "mcp") || has(s, "ai") || has(s, "automation"));

  const unique: Study[] = [];
  for (const candidate of [designSystems, accessibility, automation]) {
    if (!candidate) continue;
    if (unique.some((s) => s._id === candidate._id)) continue;
    unique.push(candidate);
  }

  for (const s of studies) {
    if (unique.length >= 3) break;
    if (unique.some((u) => u._id === s._id)) continue;
    unique.push(s);
  }

  return unique.slice(0, 3);
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
          <h2 className={styles.sectionTitle}>Credibility</h2>
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
              <NextLink className={styles.startHereCard} href={`/studies/${startHere[0].slug}`}>
                <div className={styles.startHereIcon} aria-hidden="true">
                  <Compass size={20} />
                </div>
                <div className={styles.startHereText}>
                  <p className={styles.startHereCardKicker}>Design systems</p>
                  <p className={styles.startHereCardTitle}>{startHere[0].name}</p>
                </div>
                <ArrowRight className={styles.startHereArrow} size={24} aria-hidden="true" />
              </NextLink>

              {startHere[1] && (
                <NextLink className={styles.startHereCard} href={`/studies/${startHere[1].slug}`}>
                  <div className={styles.startHereIcon} aria-hidden="true">
                    <ShieldCheck size={20} />
                  </div>
                  <div className={styles.startHereText}>
                    <p className={styles.startHereCardKicker}>Accessibility</p>
                    <p className={styles.startHereCardTitle}>{startHere[1].name}</p>
                  </div>
                  <ArrowRight className={styles.startHereArrow} size={24} aria-hidden="true" />
                </NextLink>
              )}

              {startHere[2] && (
                <NextLink className={styles.startHereCard} href={`/studies/${startHere[2].slug}`}>
                  <div className={styles.startHereIcon} aria-hidden="true">
                    <Sparkle size={20} />
                  </div>
                  <div className={styles.startHereText}>
                    <p className={styles.startHereCardKicker}>Automation</p>
                    <p className={styles.startHereCardTitle}>{startHere[2].name}</p>
                  </div>
                  <ArrowRight className={styles.startHereArrow} size={24} aria-hidden="true" />
                </NextLink>
              )}
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
