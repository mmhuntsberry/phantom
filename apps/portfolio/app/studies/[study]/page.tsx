import StudyContent from "../../../components/StudyContent.server";
import { getStudy } from "../../../sanity/sanity-utils";
import HeroMedia from "../../../components/Hero";
import styles from "./page.module.css";

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
      <h1 className={`container ${styles.title}`}>{study.name}</h1>
      <HeroMedia media={study.media} />
      <StudyContent title={study.name} content={study.content}></StudyContent>
    </div>
  );
};

export default Page;
