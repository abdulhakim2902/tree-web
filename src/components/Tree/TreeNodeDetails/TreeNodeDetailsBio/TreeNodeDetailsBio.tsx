import React, { FC } from "react";
import classNames from "classnames";
import BioRelationButtons from "../BioRelationButtons/BioRelationButtons";
import ShowIf from "@tree/src/components/show-if";
import s from "./TreeNodeDetailsBio.module.css";

import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { getAge, getDate } from "@tree/src/helper/date";
import { startCase } from "@tree/src/helper/string";
import { Box, IconButton } from "@mui/material";
import { UPDATE } from "@tree/src/constants/permissions";

/* Hooks */
import { useAuthContext } from "@tree/src/context/auth";
import { useTreeNodeDataContext } from "@tree/src/context/data";

/* Icons */
import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import ImageIcon from "@mui/icons-material/Image";
import EditIcon from "@mui/icons-material/Edit";

type TreeNodeDetailsBioProps = TreeNodeDataWithRelations & {
  onRelationNodeClick: (id: string) => void;
  onOpen: () => void;
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
  onRelationNodeClick,
  metadata,
  profileImageURL,
  onOpen,
}) => {
  const { user } = useAuthContext();
  const { expandNode, loading } = useTreeNodeDataContext();

  const birthDate = getDate(birth?.year, birth?.month, birth?.day);
  const deathDate = getDate(death?.year, death?.month, death?.day);
  const [age, info] = getAge(birth?.year, birth?.month, birth?.day, death?.year, death?.month, death?.day);

  return (
    <React.Fragment>
      <div className={s.bioContainer}>
        <div className={classNames(s.bioGrid)}>
          <ShowIf condition={Boolean(birthDate)}>
            <span className={s.gridItemTitle}>Birth Date</span>
            <span className={s.gridItemValue}>
              {birthDate}/{age} {info} old
            </span>
          </ShowIf>
          <ShowIf condition={Boolean(birth?.place.country) || Boolean(birth?.place.city)}>
            <span className={s.gridItemTitle}>Birth Place</span>
            <span className={s.gridItemValue}>
              {birth?.place?.country && birth?.place?.city && (
                <React.Fragment>
                  {startCase(birth?.place?.country ?? "")}, {startCase(birth?.place?.city ?? "")}
                </React.Fragment>
              )}
              {birth?.place?.country && !birth?.place?.city && (
                <React.Fragment>{startCase(birth?.place?.country ?? "")}</React.Fragment>
              )}
              {birth?.place?.city && !birth?.place?.country && (
                <React.Fragment>{startCase(birth?.place?.city ?? "")}</React.Fragment>
              )}
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
                relationType="parent"
                expandable={Boolean(metadata?.expandable?.parents)}
                loading={loading.expanded.parents}
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
                relationType="sibling"
                expandable={Boolean(metadata?.expandable?.siblings)}
                loading={loading.expanded.siblings}
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
                relationType="spouse"
                expandable={Boolean(metadata?.expandable?.spouses)}
                loading={loading.expanded.spouses}
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
                relationType="child"
                expandable={Boolean(metadata?.expandable?.children)}
                loading={loading.expanded.children}
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
        <Box
          height={150}
          width={150}
          sx={{
            mb: "10px",
            backgroundColor: "grey",
            cursor: (() => {
              const canUpdate = UPDATE.some((e) => e === user?.role) || user?.nodeId === id;
              if (canUpdate && !profileImageURL) {
                return "pointer";
              }

              return "default";
            })(),
          }}
          borderRadius={1}
          borderColor="whitesmoke"
          display="flex"
          justifyContent="center"
          alignItems="center"
          onClick={() => {
            const canUpdate = UPDATE.some((e) => e === user?.role) || user?.nodeId === id;
            if (canUpdate && !profileImageURL) {
              return onOpen();
            }

            return;
          }}
          position="relative"
        >
          {profileImageURL ? (
            <React.Fragment>
              <ShowIf condition={UPDATE.some((e) => e === user?.role) || user?.nodeId === id}>
                <IconButton
                  onClick={onOpen}
                  sx={{
                    position: "absolute",
                    color: "whitesmoke",
                    backgroundColor: "var(--background-color)",
                    right: 10,
                    bottom: 10,
                    "&:hover": {
                      backgroundColor: "var(--background-color)",
                      opacity: 0.5,
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </ShowIf>
              <img src={profileImageURL ?? ""} width={150} alt={profileImageURL} loading="lazy" />
            </React.Fragment>
          ) : UPDATE.some((e) => e === user?.role) || user?.nodeId === id ? (
            <AddPhotoAlternate style={{ fontSize: 35 }} />
          ) : (
            <ImageIcon style={{ fontSize: 35 }} />
          )}
        </Box>
      </div>
    </React.Fragment>
  );
};
