import React from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { deleteCookie, getCookie } from "cookies-next";
import s from "@tree/styles/HomePage.module.css";
import ballS from "@tree/styles/Ball.module.css";
import Button from "@tree/src/components/Button/Button";
import classNames from "classnames";
import { TOKEN_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { useAuthContext } from "@tree/src/context/auth";
import ShowIf from "@tree/src/components/show-if";

const HomePage: NextPage = () => {
  const { isLoggedIn } = useAuthContext();

  return (
    <React.Fragment>
      <div className={s.pageContainer}>
        <div className={s.content}>
          <span className={classNames(s.descriptionItem, s.title)}>Tree Project</span>
          <div className={s.buttonsContainer}>
            <Button href="/tree" text="View Tree" className={s.descriptionItem} />
            <ShowIf condition={isLoggedIn}>
              <Button href="/families" text="View Families" className={s.descriptionItem} isSecondary={true} />
            </ShowIf>
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
  const token = getCookie(TOKEN_KEY, ctx)?.toString();
  if (!token) {
    deleteCookie(USER_KEY, ctx);
    deleteCookie(TOKEN_KEY, ctx);
  }

  return {
    props: {},
  };
}
