import classNames from "classnames";
import { FC } from "react";
import s from "./FamilyLink.module.css";
import { startCase } from "lodash";
import { useTreeNodeDataContext } from "@/context/data";
import { useAuthContext } from "@/context/auth";

type FamilyLinkProps = {
  familyId: string;
  familyName: string;
};

const FamilyLink: FC<FamilyLinkProps> = ({ familyId, familyName }) => {
  const { isLoggedIn } = useAuthContext();
  const { rootNodes } = useTreeNodeDataContext();

  return (
    <div className={s.container}>
      <div className={classNames(s.ball)} />
      <a onClick={() => rootNodes(familyId, !isLoggedIn)} className={s.familyLink}>
        {startCase(familyName.replace(/  +/g, " ").trim())}
      </a>
    </div>
  );
};

export default FamilyLink;
