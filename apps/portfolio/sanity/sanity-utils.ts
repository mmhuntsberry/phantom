import { createClient, groq } from "next-sanity";
import { Study } from "../types/Study";
import config from "./config/client-config";
import { Job } from "../types/Job";

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

  try {
    return await client.fetch(
      groq`*[_type == "study"]|order(_createdAt desc){
        _id,
        _createdAt,
        name,
        about,
        summary,
        role,
        tags,
        "slug": slug.current,
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
  } catch {
    return [];
  }
}

export async function getStudy(slug: string): Promise<Study> {
  const client = createClient(config);

  try {
    return await client.fetch(
      groq`*[_type=="study" && slug.current == $slug][0]{
        _id,
        _createdAt,
        name,
        about,
        summary,
        role,
        tags,
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
  } catch {
    return {
      _id: "",
      _createdAt: new Date().toISOString(),
      name: "Case study",
      about: "",
      slug,
      content: [],
      media: { type: "image" },
    } as Study;
  }
}

export async function getJobs(): Promise<Job[]> {
  const client = createClient(config);

  try {
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
  } catch {
    return [];
  }
}
