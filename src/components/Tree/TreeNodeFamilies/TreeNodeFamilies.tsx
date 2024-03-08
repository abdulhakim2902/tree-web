import { Family } from "@tree/src/types/tree";
import classNames from "classnames";
import React, { FC } from "react";
import s from "./TreeNodeFamilies.module.css";
import { startCase } from "lodash";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { LinearProgress } from "@mui/material";

type TreeNodeFamiliesProps = {
  loading: boolean;
  fullname: string;
  families: Family[];
};

export const TreeNodeFamilies: FC<TreeNodeFamiliesProps> = ({ fullname, families, loading }) => {
  const { node, rootNodes } = useTreeNodeDataContext();

  if (loading) {
    return (
      <React.Fragment>
        <span className={s.familyLinksTitle}>{`${fullname} is a descendant of families:`}</span>
        <LinearProgress />
      </React.Fragment>
    );
  }

  if (families.length <= 0) {
    return <span className={s.familyLinksTitle}>{`${fullname} is the root and has no other branches.`}</span>;
  }

  return (
    <React.Fragment>
      <span className={s.familyLinksTitle}>{`${fullname} is a descendant of families:`}</span>
      <div className={s.familyLinksContainer}>
        {families.map((family) => {
          if (node.id === family.id) {
            return (
              <span
                key={family.id}
                className={classNames(s.selectedFamily, s.familyItem)}
              >{`${startCase(family.name)} – current root`}</span>
            );
          }

          return (
            <a key={family.id} className={classNames(s.familyLink, s.familyItem)} onClick={() => rootNodes(family.id)}>
              {startCase(family.name)}
            </a>
          );
        })}
      </div>
    </React.Fragment>
  );
};
