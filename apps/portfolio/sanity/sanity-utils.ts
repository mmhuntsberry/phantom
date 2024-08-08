import { createClient, groq } from "next-sanity";
import { Project } from "../types/Project";
import { Post } from "../types/Post";
import config from "./config/client-config";

export async function getProjects(): Promise<Project[]> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "project"]{
      _id,
      _createdAt,
      name,
      "headings": body[length(style) == 2 && string::startsWith(style, "h")],
      "slug": slug.current,
      "image": image.asset->url,
      url,
      content
    }`
  );
}

export async function getProject(slug: string): Promise<Project> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug][0]{
      _id,
      _createdAt,
      name,
      "slug": slug.current,
      "image": image.asset->url,
      url,
      content
    }`,
    { slug }
  );
}

export async function getPosts(): Promise<Post[]> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "post"]{
     _id,
      _createdAt,
      name,
      "slug": slug.current,
      "code": myCodeField.code,
      content,
      "excerpt": array::join(string::split((pt::text(body)), "")[0..255], "") + "..."
    }`
  );
}

export async function getPost(slug: string): Promise<Post> {
  const client = createClient(config);

  return client.fetch(
    groq`*[_type == "post" && slug.current == $slug][0]{
      _id,
      _createdAt,
      name,
      "slug": slug.current,
      "code": myCodeField.code,
      content
    }`,
    { slug }
  );
}
