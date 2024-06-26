import classNames from "classnames";
import s from "./TreeNode.module.css";

import { TreeExternalNode } from "@tree/src/types/tree";
import { FC, memo, useState } from "react";
import { TreeNodeYears } from "./TreeNodeYears";
import { getTreeNodeStyleTransform } from "./utils";
import { capitalize } from "lodash";

interface TreeNodeProps {
  width: number;
  height: number;
  isSelected: boolean;
  node: TreeExternalNode;
  onClick: (id: string, hasSubTree?: boolean) => void;
}

const TreeNode: FC<TreeNodeProps> = ({ isSelected, node, onClick, width, height }) => {
  const { data, gender } = node;
  const { name, birth, death, metadata } = data;
  const { first, middle, last } = name;

  const [isMouseOver, setMouseOver] = useState(false);

  return (
    <div
      style={{
        width: width,
        height: height,
        transform: getTreeNodeStyleTransform(node, width, height),
      }}
      className={s.root}
    >
      <div
        className={classNames(s.scalingWrapper, {
          [s.selected]: isSelected,
        })}
        onMouseEnter={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
      >
        <button
          style={{ cursor: "pointer" }}
          onClick={() => onClick(node.id, node.hasSubTree)}
          className={classNames(s.inner, s[gender], {
            [s.animated]: isSelected || isMouseOver,
            [s.hasSubtree]: node.hasSubTree || (Boolean(metadata?.expandable?.parents) && node.parents.length <= 0),
          })}
        >
          <div className={s.fullname}>
            <span className={s.firstName}>{capitalize(first)}</span>
            <span className={s.middleName}>{capitalize(middle)}</span>
            <span className={s.lastName}>{capitalize(last)}</span>
          </div>
          <TreeNodeYears birthYear={birth?.year} deathYear={death?.year} />
        </button>
      </div>
    </div>
  );
};

export default memo(TreeNode);
