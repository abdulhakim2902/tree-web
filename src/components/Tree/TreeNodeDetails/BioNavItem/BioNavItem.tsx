import classNames from "classnames";
import s from "./BioNavItem.module.css";

import { FC } from "react";

type BioNavItemProps = {
  isSelected: boolean;
  id: number;
  text: string;
  onClick: (selectedId: number) => void;
};

const BioNavItem: FC<BioNavItemProps> = ({ isSelected, id, text, onClick }) => (
  <button className={classNames(s.navItem, { [s.selected]: isSelected })} onClick={() => onClick(id)}>
    {text}
  </button>
);

export default BioNavItem;
