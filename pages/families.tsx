import FamilyLink from "@tree/src/components/FamilyLink/FamilyLink";
import { TOKEN_KEY } from "@tree/src/constants/storage-key";
import { allFamilyNodes } from "@tree/src/lib/services/node";
import { Family } from "@tree/src/types/tree";
import ballS from "@tree/styles/Ball.module.css";
import s from "@tree/styles/FamilyPage.module.css";
import classNames from "classnames";
import { getCookie } from "cookies-next";
import type { GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";

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
            <FamilyLink key={family.id} familyId={family.id} familyName={family.name} />
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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const families = [] as Family[];
  const token = getCookie(TOKEN_KEY, ctx)?.toString();

  try {
    const { data } = await allFamilyNodes(token);
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
