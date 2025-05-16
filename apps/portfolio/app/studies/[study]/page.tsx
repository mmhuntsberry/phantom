import StudyContent from "../../../components/StudyContent.server";

import { getStudy } from "../../../sanity/sanity-utils";
import HeroMedia from "../../../components/Hero";
type Props = {
  params: {
    study: string;
  };
};

const Page = async ({ params }: Props) => {
  const study = await getStudy(params.study);

  return (
    <div>
      <HeroMedia
        media={{
          type: "image",
          image: {
            asset: { url: study.image },
            alt: "Hero Image",
          },
        }}
      />
      <StudyContent content={study.content}></StudyContent>
    </div>
  );
};

export default Page;
