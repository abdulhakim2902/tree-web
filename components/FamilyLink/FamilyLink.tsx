import classNames from "classnames";
import { FC } from "react";
import s from "./FamilyLink.module.css";
import { startCase } from "lodash";
import { useTreeNodeDataContext } from "@/context/data";

type FamilyLinkProps = {
  familyId: string;
  familyName: string;
};

const FamilyLink: FC<FamilyLinkProps> = ({ familyId, familyName }) => {
  const { rootNodes } = useTreeNodeDataContext();

  return (
    <div className={s.container}>
      <div className={classNames(s.ball)} />
      <a onClick={() => rootNodes(familyId)} className={s.familyLink}>
        {startCase(familyName.replace(/  +/g, " ").trim())}
      </a>
    </div>
  );
};

export default FamilyLink;
