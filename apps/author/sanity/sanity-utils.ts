// apps/author/sanity/sanity-utils.ts

import { createClient, groq } from "next-sanity";
import { Study } from "../types/Study";
import config from "./config/client-config";
import { Job } from "../types/Job";
import { Writing } from "../types/Writing";
import { StartHerePage } from "../types/StartHerePage";
import { Book } from "../types/Book";
import { AboutPage } from "../types/AboutPage";
import { NewsletterPage } from "../types/NewsletterPage";
import { BetaPacket } from "../types/BetaPacket";

// export async function getProjects(): Promise<Project[]> {
//   const client = createClient(config);

//   return client.fetch(
//     groq`*[_type == "project"]{
//       _id,
//       _createdAt,
//       name,
//       "headings": body[length(style) == 2 && string::startsWith(style, "h")],
//       "slug": slug.current,
//       "image": image.asset->url,
//       url,
//       content
//     }`
//   );
// }

// export async function getProject(slug: string): Promise<Project> {
//   const client = createClient(config);

//   return client.fetch(
//     groq`*[_type == "project" && slug.current == $slug][0]{
//       _id,
//       _createdAt,
//       name,
//       "slug": slug.current,
//       "image": image.asset->url,
//       url,
//       content
//     }`,
//     { slug }
//   );
// }

// export async function getPosts(): Promise<Post[]> {
//   const client = createClient(config);

//   return client.fetch(
//     groq`*[_type == "post"]{
//      _id,
//       _createdAt,
//       name,
//       "slug": slug.current,
//       "code": myCodeField.code,
//       content,
//       "excerpt": array::join(string::split((pt::text(body)), "")[0..255], "") + "..."
//     }`
//   );
// }

// export async function getPost(slug: string): Promise<Post> {
//   const client = createClient(config);

//   return client.fetch(
//     groq`*[_type == "post" && slug.current == $slug][0]{
//       _id,
//       _createdAt,
//       name,
//       "slug": slug.current,
//       "code": myCodeField.code,
//       content
//     }`,
//     { slug }
//   );
// }

export async function getStudies(): Promise<Study[]> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "study"]|order(_createdAt desc){
      _id,
      _createdAt,
      name,
      about,
      "slug": slug.current,
      content,
      media {
        type,
        image{
          asset-> { url },
          alt
        },
        video
      },
      url,
      "excerpt": 
        array::join(
          string::split(pt::text(content), "")[0..255],
          ""
        ) + "..."
    }`,
    {},
    { next: { revalidate: 3600 } }
  );
}

export async function getStudy(slug: string): Promise<Study> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type=="study" && slug.current == $slug][0]{
      _id,
      _createdAt,
      name,
      about,
      "slug": slug.current,
      url,
      media {
        type,
        image {
          asset-> { _id, url },
          alt
        },
        video
      },
      content[]{
        ...,
        _type == "image" => {
          ...,
          asset->{url}
        },
        _type == "section" => {
          ...,
          body[]{
            ...,
            _type == "image" => {
              ...,
              asset->{url}
            }
          }
        }
      }
    }`,
    { slug }
  );
}

export async function getJobs(): Promise<Job[]> {
  const client = createClient(config);

  const jobs = await client.fetch(
    groq`*[_type == "job"]{
      _id,
      _createdAt,
      name,
      company,
      title,
      content,
      "image": image.asset->url,
    }`
  );

  return jobs;
}

export async function getWriting(params: {
  slug?: string;
  seriesSlug?: string;
  season?: string | number;
  episode?: string | number;
}): Promise<Writing | null> {
  const client = createClient(config);

  if (params.slug) {
    return client.fetch(
      groq`*[_type == "writing" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        "slug": slug.current,
        summary,
        category,
        series->{title, slug},
        season,
        episode,
        episodeTitle,
        orderInSeries,
        tags,
        publishedAt,
        media {
          type,
          image {
            asset->{url},
            alt
          },
          video
        },
        content[]{
          ...,
          _type == "image" => {
            ...,
            asset->{url}
          }
        }
      }`,
      { slug: params.slug }
    );
  }

  if (params.seriesSlug && params.season && params.episode) {
    return client.fetch(
      groq`*[
        _type == "writing" &&
        series->slug.current == $seriesSlug &&
        season == $season &&
        episode == $episode
      ][0]{
        _id,
        _createdAt,
        title,
        "slug": slug.current,
        summary,
        category,
        series->{title, slug},
        season,
        episode,
        episodeTitle,
        orderInSeries,
        tags,
        publishedAt,
        media {
          type,
          image {
            asset->{url},
            alt
          },
          video
        },
        content[]{
          ...,
          _type == "image" => {
            ...,
            asset->{url}
          }
        }
      }`,
      {
        seriesSlug: params.seriesSlug,
        season: Number(params.season),
        episode: Number(params.episode),
      }
    );
  }

  return null;
}

export async function getWritingsGrouped(): Promise<{
  standalone: Writing[];
  seriesList: {
    title: string;
    slug: string;
    summary?: string;
    coverImage?: string;
  }[];
}> {
  const client = createClient(config);

  const standalone = await client.fetch(
    groq`*[_type == "writing" && !defined(series)] | order(publishedAt desc) {
      _id,
      _createdAt,
      title,
      "slug": slug.current,
      summary,
      category,
      tags,
      publishedAt,
      media {
        type,
        image {
          asset->{url},
          alt
        },
        video
      },
    }`
  );

  const seriesList = await client.fetch(
    groq`*[_type == "series"] | order(title asc) {
      title,
      "slug": slug.current,
      description,
      "summary": description,
      "coverImage": coalesce(image.asset->url, null)
    }`
  );

  return { standalone, seriesList };
}

export async function getSeriesWithEpisodes(seriesSlug: string): Promise<{
  title: string;
  slug: string;
  description?: string;
  media?: {
    image?: {
      asset: { url: string };
      alt?: string;
    };
  };
  episodes: {
    _id: string;
    title: string;
    episodeTitle?: string;
    season?: number;
    episode?: number;
  }[];
} | null> {
  const client = createClient(config);

  const series = await client.fetch(
    groq`*[_type == "series" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      description,
      media {
        image {
          alt,
          asset->{url}
        }
      }
    }`,
    { slug: seriesSlug }
  );

  if (!series) return null;

  const episodes = await client.fetch(
    groq`*[_type == "writing" && series->slug.current == $slug]
      | order(season asc, episode asc) {
        _id,
        title,
        episodeTitle,
        season,
        episode
      }`,
    { slug: seriesSlug }
  );

  return { ...series, episodes };
}

export async function getStartHerePage(): Promise<StartHerePage | null> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "startHerePage"][0]{
      brandPromise,
      entryPoints[]{
        title,
        description,
        ctaLabel,
        customHref,
        "link": link->{
          _type,
          title,
          "slug": slug.current
        }
      },
      expectations
    }`
  );
}

export async function getBooks(): Promise<Book[]> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "book"] | order(status == "comingSoon" desc, publicationDate desc) {
      _id,
      _createdAt,
      title,
      "slug": slug.current,
      status,
      publicationDate,
      cover{
        asset->{url},
        alt
      },
      tagline,
      shortPitch
    }`
  );
}

export async function getBook(slug: string): Promise<Book | null> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "book" && slug.current == $slug][0]{
      _id,
      _createdAt,
      title,
      "slug": slug.current,
      status,
      publicationDate,
      cover{
        asset->{url},
        alt
      },
      tagline,
      shortPitch,
      longDescription,
      contentNotes,
      sample,
      sampleLink,
      buyLinks,
      testimonials
    }`,
    { slug }
  );
}

export async function getAboutPage(): Promise<AboutPage | null> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "aboutPage"][0]{
      title,
      body,
      photo{
        asset->{url},
        alt
      }
    }`
  );
}

export async function getNewsletterPage(): Promise<NewsletterPage | null> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "newsletterPage"][0]{
      title,
      intro,
      valueProps,
      frequency,
      privacyNote,
      leadMagnet
    }`
  );
}

export async function getActiveBetaPacket(): Promise<BetaPacket | null> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "betaPacket" && isActive == true][0]{
      _id,
      title,
      "slug": slug.current,
      summary,
      timeframe,
      expectations,
      contentNotes,
      chapters,
      files,
      surveyCta,
      book->{
        title,
        "slug": slug.current
      }
    }`
  );
}

export async function getBetaPacketBySlug(
  slug: string
): Promise<BetaPacket | null> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "betaPacket" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      summary,
      timeframe,
      expectations,
      contentNotes,
      chapters,
      files,
      surveyCta,
      book->{
        title,
        "slug": slug.current
      }
    }`,
    { slug }
  );
}

export async function getManuscriptChapters(params: {
  manuscriptKey: string;
  startOrder?: number;
  endOrder?: number;
}): Promise<
  {
    manuscriptKey: string;
    order: number;
    chapterLabel: string;
    title?: string;
    content: any[];
  }[]
> {
  const client = createClient(config);
  const { manuscriptKey, startOrder, endOrder } = params;

  return client.fetch(
    groq`*[_type == "manuscriptChapter" && manuscriptKey == $manuscriptKey
      && (!defined($startOrder) || order >= $startOrder)
      && (!defined($endOrder) || order <= $endOrder)
    ] | order(order asc) {
      manuscriptKey,
      order,
      chapterLabel,
      title,
      content
    }`,
    { manuscriptKey, startOrder, endOrder }
  );
}
