import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { groq } from "next-sanity";
import { getWriteClient } from "../sanity/config/write-client";

type Args = {
  manuscriptKey?: string;
  order?: string;
  file?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) continue;
    const normalized = key.slice(2);
    if (normalized === "manuscript-key") args.manuscriptKey = value;
    if (normalized === "order") args.order = value;
    if (normalized === "file") args.file = value;
    i += 1;
  }
  return args;
}

function markdownToPortableText(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.map((text) => ({
    _type: "block",
    _key: nanoid(),
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: nanoid(),
        text,
        marks: [],
      },
    ],
  }));
}

async function main() {
  const args = parseArgs(process.argv);
  const manuscriptKey = args.manuscriptKey;
  const order = args.order ? Number(args.order) : undefined;
  const filePath = args.file;

  if (!manuscriptKey || !order || !filePath) {
    throw new Error(
      "Usage: --manuscript-key <key> --order <number> --file <path>"
    );
  }

  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  const markdown = fs.readFileSync(absolutePath, "utf8");
  const content = markdownToPortableText(markdown);

  const client = getWriteClient();
  const doc = await client.fetch(
    groq`*[_type == "manuscriptChapter" && manuscriptKey == $manuscriptKey && order == $order][0]{
      _id
    }`,
    { manuscriptKey, order }
  );

  if (!doc?._id) {
    throw new Error(
      `No manuscriptChapter found for manuscriptKey="${manuscriptKey}" order=${order}`
    );
  }

  await client.patch(doc._id).set({ content }).commit();

  console.log(
    `Updated manuscriptChapter ${doc._id} (manuscriptKey="${manuscriptKey}", order=${order})`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
