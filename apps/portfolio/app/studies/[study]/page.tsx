import StudyContent from "../../../components/StudyContent.server";

import { getStudy } from "../../../sanity/sanity-utils";

type Props = {
  params: {
    study: string;
  };
};

const Page = async ({ params }: Props) => {
  const study = await getStudy(params.study);

  return (
    <>
      <h1
        style={{ fontSize: "var(--fs-lg)", lineHeight: "1.2" }}
        className="container"
      >
        {study.name}
      </h1>
      <StudyContent name={study.name} content={study.content}></StudyContent>;
    </>
  );
};

export default Page;
