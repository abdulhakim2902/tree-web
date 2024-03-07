import { TreeNodeDataWithRelations } from "@/types/tree";
import classNames from "classnames";
import { FC } from "react";
import BioRelationButtons, { RelationType } from "../BioRelationButtons/BioRelationButtons";
import { getAge, getDate } from "@/helper/date";
import s from "./TreeNodeDetailsBio.module.css";
import { startCase } from "lodash";
import ShowIf from "@/components/show-if";
import { useTreeNodeDataContext } from "@/context/data";

type TreeNodeDetailsBioProps = TreeNodeDataWithRelations & {
  onRelationNodeClick: (id: string) => void;
};

export const TreeNodeDetailsBio: FC<TreeNodeDetailsBioProps> = ({
  id,
  birth,
  death,
  parents,
  siblings,
  spouses,
  children,
  nationality,
  education,
  occupation,
  rewards,
  bio,
  onRelationNodeClick,
  metadata,
}) => {
  const { expandNode, loading } = useTreeNodeDataContext();

  const birthDate = getDate(birth?.year, birth?.month, birth?.day);
  const deathDate = getDate(death?.year, death?.month, death?.day);
  const [age, info] = getAge(birth?.year, birth?.month, birth?.day);

  return (
    <div className={s.bioContainer}>
      <div className={classNames(s.bioGrid)}>
        <ShowIf condition={Boolean(birthDate)}>
          <span className={s.gridItemTitle}>Birth Date</span>
          <span className={s.gridItemValue}>
            {birthDate}/{age} {info} old
          </span>
        </ShowIf>
        <ShowIf condition={Boolean(birth?.place)}>
          <span className={s.gridItemTitle}>Birth Place</span>
          <span className={s.gridItemValue}>
            {startCase(birth?.place?.country ?? "")}, {startCase(birth?.place?.city ?? "")}
          </span>
        </ShowIf>
        <ShowIf condition={Boolean(deathDate)}>
          <span className={s.gridItemTitle}>Death Date</span>
          <span className={s.gridItemValue}>{deathDate}</span>
        </ShowIf>
        <ShowIf condition={Boolean(death?.place)}>
          <span className={s.gridItemTitle}>Death Place</span>
          <span className={s.gridItemValue}>
            {death?.place.country}, {death?.place.city}
          </span>
        </ShowIf>
        <ShowIf condition={parents.length > 0 || Boolean(metadata?.expandable?.parents)}>
          <span className={s.gridItemTitle}>Parents</span>
          <div className={classNames(s.gridItemValue)}>
            <BioRelationButtons
              onClick={onRelationNodeClick}
              onExpandNode={(type) => expandNode(id, type)}
              items={parents}
              relationType={RelationType.Parents}
              expandable={Boolean(metadata?.expandable?.parents)}
              loading={loading.expanded.parent}
            />
          </div>
        </ShowIf>
        <ShowIf condition={siblings.length > 0 || Boolean(metadata?.expandable?.siblings)}>
          <span className={s.gridItemTitle}>Siblings</span>
          <div className={classNames(s.gridItemValue)}>
            <BioRelationButtons
              onClick={onRelationNodeClick}
              onExpandNode={(type) => expandNode(id, type)}
              items={siblings}
              relationType={RelationType.Siblings}
              expandable={Boolean(metadata?.expandable?.siblings)}
              loading={loading.expanded.parent}
            />
          </div>
        </ShowIf>
        <ShowIf condition={spouses.length > 0 || Boolean(metadata?.expandable?.spouses)}>
          <span className={s.gridItemTitle}>Spouses</span>
          <div className={classNames(s.gridItemValue)}>
            <BioRelationButtons
              onClick={onRelationNodeClick}
              onExpandNode={(type) => expandNode(id, type)}
              items={spouses}
              relationType={RelationType.Spouses}
              expandable={Boolean(metadata?.expandable?.spouses)}
              loading={loading.expanded.spouse}
            />
          </div>
        </ShowIf>
        <ShowIf condition={children.length > 0 || Boolean(metadata?.expandable?.children)}>
          <span className={s.gridItemTitle}>Children</span>
          <div className={classNames(s.gridItemValue)}>
            <BioRelationButtons
              onClick={onRelationNodeClick}
              onExpandNode={(type) => expandNode(id, type)}
              items={children}
              relationType={RelationType.Children}
              expandable={Boolean(metadata?.expandable?.children)}
              loading={loading.expanded.spouse}
            />
          </div>
        </ShowIf>
        <ShowIf condition={Boolean(nationality)}>
          <span className={s.gridItemTitle}>Nationality</span>
          <span className={s.gridItemValue}>{nationality}</span>
        </ShowIf>
        <ShowIf condition={Boolean(education)}>
          <span className={s.gridItemTitle}>Education</span>
          <span className={s.gridItemValue}>{education}</span>
        </ShowIf>
        <ShowIf condition={Boolean(occupation)}>
          <span className={s.gridItemTitle}>Education</span>
          <span className={s.gridItemValue}>{education}</span>
        </ShowIf>
        <ShowIf condition={Boolean(rewards)}>
          <span className={s.gridItemTitle}>Awards</span>
          <span className={s.gridItemValue}>{rewards?.join(", ")}</span>
        </ShowIf>
      </div>
      <ShowIf condition={Boolean(bio)}>
        <span className={classNames(s.rootItem)}>{bio}</span>
      </ShowIf>
    </div>
  );
};
