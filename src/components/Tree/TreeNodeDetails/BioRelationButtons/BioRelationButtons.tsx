import { RelationInfo } from "@tree/src/types/tree";
import { FC } from "react";
import s from "./BioRelationButtons.module.css";
import { startCase } from "lodash";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CircularProgress, IconButton } from "@mui/material";
import { RelType } from "@tree/src/lib/relatives-tree/types";

export enum RelationType {
  Parents = "Parents",
  Spouses = "Spouses",
  Children = "Children",
  Siblings = "Siblings",
}

type BioRelationButtonsProps = {
  relationType: RelationType;
  items: RelationInfo[];
  expandable: boolean;
  loading: boolean;

  onClick: (id: string) => void;
  onExpandNode: (type: RelationType) => void;
};

const getName = (relationType: RelationType, relationInfo: RelationInfo, isLast: boolean) => {
  switch (relationType) {
    case RelationType.Parents: {
      const fullname = startCase(relationInfo.fullname);
      if (relationInfo.type === RelType.adopted) {
        return isLast ? `${fullname} (adoptive parent)` : `${fullname} (adoptive parent), `;
      }
      return isLast ? fullname : `${fullname}, `;
    }
    case RelationType.Children: {
      const name = startCase(relationInfo?.nicknames?.[0] ?? relationInfo.firstName);
      if (relationInfo.type === RelType.adopted) {
        return isLast ? `${name} (adopted child)` : `${name} (adopted child),`;
      }
      return isLast ? name : `${name},`;
    }
    case RelationType.Siblings: {
      const name = startCase(relationInfo?.nicknames?.[0] ?? relationInfo.firstName);
      return isLast ? name : `${name},`;
    }
    case RelationType.Spouses: {
      const fullname = startCase(relationInfo.fullname);
      if (relationInfo.type === RelType.divorced) {
        return isLast ? `${fullname} (divorce)` : `${fullname} (divorce),`;
      }
      return isLast ? fullname : `${fullname},`;
    }
  }
};

const BioRelationButtons: FC<BioRelationButtonsProps> = ({
  relationType,
  items,
  onClick,
  onExpandNode,
  expandable,
  loading,
}) => {
  return (
    <>
      {items.map((item, index) => (
        <button className={s.button} key={index} onClick={() => onClick(item.id)}>
          {getName(relationType, item, index === items.length - 1)}
        </button>
      ))}
      {expandable && (
        <IconButton
          onClick={() => onExpandNode(relationType)}
          sx={{
            p: 0,
            color: "#4da1ff",
            transition: "all 0.2s ease-in-out",
            ":hover": {
              color: "#4dffdf",
            },
            ":focus": {
              color: "#4dffdf",
            },
          }}
        >
          {loading ? <CircularProgress color="inherit" size={15} /> : <VisibilityIcon />}
        </IconButton>
      )}
    </>
  );
};

export default BioRelationButtons;
