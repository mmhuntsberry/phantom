import StudyContent from "../../../components/StudyContent.server";

import { getStudy } from "../../../sanity/sanity-utils";

type Props = {
  params: {
    study: string;
  };
};

const Page = async ({ params }: Props) => {
  const study = await getStudy(params.study);

  return <StudyContent content={study.content}></StudyContent>;
};

export default Page;
