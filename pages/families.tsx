import FamilyLink from "@/components/FamilyLink/FamilyLink";
import { familyNodes } from "@/services/node";
import ballS from "@/styles/Ball.module.css";
import s from "@/styles/FamilyPage.module.css";
import classNames from "classnames";
import type { NextPage } from "next";
import Image from "next/image";

export type Family = {
  _id: string;
  name: string;
};

type FamiliesPageProps = {
  families: Family[];
};

const FamiliesPage: NextPage<FamiliesPageProps> = ({ families }) => {
  return (
    <div className={s.pageContainer}>
      <div className={s.content}>
        <div className={s.descriptionContainer}>
          <div className={classNames(s.titleContainer, s.descriptionItem)}>
            <div className={s.logoContainer}>
              <Image src="/LogoBig.png" width={120} height={110} alt="tree" />
            </div>
            <span className={s.logoTitle}>FAMILIES</span>
          </div>
        </div>
        <div className={s.familiesContainer}>
          {families.map((family) => (
            <FamilyLink key={family._id} familyId={family._id} familyName={family.name} />
          ))}
        </div>
      </div>
      <div className={s.imageContainer}>
        <div className={ballS.ball1} />
        <div className={ballS.ball2} />
        <div className={ballS.ball3} />
        <div className={ballS.ball4} />
        <div className={ballS.ball5} />
      </div>
    </div>
  );
};

export default FamiliesPage;

export async function getServerSideProps() {
  const families = [] as Family[];
  try {
    const { data } = await familyNodes();
    families.push(...data);
  } catch {
    // ignore
  }

  return {
    props: {
      families,
    },
  };
}
