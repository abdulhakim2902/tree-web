import { FC } from "react";
import s from "./TreeNode.module.css";

type TreeNodeYearsProps = {
  birthYear?: number;
  deathYear?: number;
};

export const TreeNodeYears: FC<TreeNodeYearsProps> = ({ birthYear, deathYear }) => {
  if (!birthYear && !deathYear) {
    return null;
  }

  if (birthYear && birthYear < 0 && !deathYear) {
    return null;
  }

  return (
    <div className={s.years}>
      <span className={s.birthYear}>{birthYear}</span>
      <span className={s.yearsDelimiter}>–</span>
      <span className={s.deathYear}>{deathYear}</span>
    </div>
  );
};
