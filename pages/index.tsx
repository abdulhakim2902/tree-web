import React from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { deleteCookie, getCookie } from "cookies-next";
import s from "@/styles/HomePage.module.css";
import ballS from "@/styles/Ball.module.css";
import Button from "@/components/Button/Button";
import classNames from "classnames";
import { TOKEN_KEY, USER_KEY } from "@/constants/storage-key";

const HomePage: NextPage = () => {
  return (
    <React.Fragment>
      <div className={s.pageContainer}>
        <div className={s.content}>
          <span className={classNames(s.descriptionItem, s.title)}>Tree Project</span>
          <div className={s.buttonsContainer}>
            <Button href="/tree" text="View Tree" className={s.descriptionItem} />
            <Button href="/families" text="View Families" className={s.descriptionItem} isSecondary={true} />
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
    </React.Fragment>
  );
};

export default HomePage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    const token = getCookie(TOKEN_KEY, ctx)?.toString();
    if (!token) {
      throw new Error("Not logged in");
    }
  } catch {
    deleteCookie(USER_KEY, ctx);
    deleteCookie(TOKEN_KEY, ctx);
  }

  return {
    props: {},
  };
}
