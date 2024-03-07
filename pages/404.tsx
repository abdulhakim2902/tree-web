import Button from "@/components/Button/Button";
import ShowIf from "@/components/show-if";
import s from "@/styles/404.module.css";
import ballS from "@/styles/Ball.module.css";
import classNames from "classnames";
import type { NextPage } from "next";

type ErrorProps = {
  title?: string;
};

const ErrorPage: NextPage<ErrorProps> = (props) => {
  const title = props.title ?? "Oops! Page not found";

  return (
    <div className={s.pageContainer}>
      <div className={s.content}>
        <span className={classNames(s.descriptionItem, s.title)}>{title}</span>
        <ShowIf condition={!Boolean(props.title)}>
          <div className={s.buttonsContainer}>
            <Button href="/tree" text="View Tree" className={s.descriptionItem} />
          </div>
        </ShowIf>
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

export default ErrorPage;
