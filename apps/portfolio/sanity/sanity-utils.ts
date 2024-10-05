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

  return client.fetch(
    groq`*[_type == "study"]{
     _id,
      _createdAt,
      name,
      about,
      "slug": slug.current,
      content,
      "image": image.asset->url,
      url,
      "excerpt": array::join(string::split((pt::text(body)), "")[0..255], "") + "..."
    }`
  );
}

export async function getStudy(slug: string): Promise<Study> {
  const client = createClient(config);

  const studyData = await client.fetch(
    groq`*[_type == "study" && slug.current == $slug][0]{
      _id,
      _createdAt,
      name,
      "slug": slug.current,
      "image": image.asset->url,
      about,
      content[]{
        ...,
        _type == "image" => {
          ...,
          "asset": {
            "url": asset->url // Fetch asset as an object
          }
        },
        _type == "section" => {
          ...,
          body[]{
            ...,
            _type == "image" => {
              ...,
              "asset": {
                "url": asset->url // Fetch asset as an object within section as well
              }
            }
          }
        }
      }
    }`,
    { slug }
  );
  return studyData;
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

  console.log("Jobs fetched:", jobs); // Add this line to inspect the output

  return jobs;
}
