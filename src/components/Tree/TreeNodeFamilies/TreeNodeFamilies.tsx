import React, { FC, useEffect, useState } from "react";
import classNames from "classnames";
import Link from "next/link";
import s from "./TreeNodeFamilies.module.css";

import { LinearProgress } from "@mui/material";
import { familyNodes } from "@tree/src/lib/services/node";
import { NODE_FAMILIES_KEY } from "@tree/src/constants/storage-key";
import { DAY } from "@tree/src/helper/date";
import { startCase } from "@tree/src/helper/string";
import { Family } from "@tree/src/types/tree";

/* Hooks */
import { useCacheContext } from "@tree/src/context/cache";
import { useTreeNodeDataContext } from "@tree/src/context/data";

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
      const nodes = data?.[id] ?? [];

      if (!data?.[id]) {
        try {
          const { families: data } = await familyNodes(id);
          nodes.push(...data);
        } catch {
          // ignore
        }
      }

      data[id] = nodes;

      setFamilies(nodes);
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
            <Link
              href=""
              key={family.id}
              className={classNames(s.familyLink, s.familyItem)}
              onClick={() => rootNodes(family.id)}
            >
              {startCase(family.name)}
            </Link>
          );
        })}
      </div>
    </React.Fragment>
  );
};
