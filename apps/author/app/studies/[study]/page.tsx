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

  console.log;

  return (
    <div>
      <HeroMedia media={study.media} />
      <StudyContent title={study.name} content={study.content}></StudyContent>
    </div>
  );
};

export default Page;
