import { Family } from "@tree/src/types/tree";
import classNames from "classnames";
import React, { FC, useEffect, useState } from "react";
import s from "./TreeNodeFamilies.module.css";
import { startCase } from "lodash";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { LinearProgress } from "@mui/material";
import { nodeFamilies } from "@tree/src/lib/services/node";
import { useCacheContext } from "@tree/src/context/cache";
import { NODE_FAMILIES_KEY } from "@tree/src/constants/storage-key";
import { DAY } from "@tree/src/helper/date";

type TreeNodeFamiliesProps = {
  id: string;
  fullname: string;
};

export const TreeNodeFamilies: FC<TreeNodeFamiliesProps> = ({ id, fullname }) => {
  const { tree, rootNodes } = useTreeNodeDataContext();
  const { get, set } = useCacheContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [families, setFamilies] = useState<Family[]>([]);

  useEffect(() => {
    const getFamilyNodes = async (id: string) => {
      setLoading(true);

      const data = get<Record<string, Family[]>>(NODE_FAMILIES_KEY) ?? {};
      const familyNodes = data?.[id] ?? [];

      if (!data?.[id]) {
        try {
          const { families: data } = await nodeFamilies(id);
          familyNodes.push(...data);
        } catch {
          // ignore
        }
      }

      data[id] = familyNodes;

      setFamilies(familyNodes);
      set(NODE_FAMILIES_KEY, data, DAY);

      setLoading(false);
    };

    getFamilyNodes(id);
  }, [id]);

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
          if (tree?.root.id === family.id) {
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
