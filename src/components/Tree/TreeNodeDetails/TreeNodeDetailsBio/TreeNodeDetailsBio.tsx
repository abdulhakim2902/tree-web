import React, { FC, useState } from "react";
import classNames from "classnames";
import BioRelationButtons from "../BioRelationButtons/BioRelationButtons";
import ShowIf from "@tree/src/components/show-if";
import s from "./TreeNodeDetailsBio.module.css";
import { Relative } from "@tree/src/lib/services/node";

import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { getAge, getDate } from "@tree/src/helper/date";
import { getNickname, getPlace } from "@tree/src/helper/string";
import { Box, IconButton } from "@mui/material";
import { UPDATE } from "@tree/src/constants/permissions";

/* Hooks */
import { useAuthContext } from "@tree/src/context/auth";
import { useSnackbar } from "notistack";

/* Icons */
import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import ImageIcon from "@mui/icons-material/Image";
import EditIcon from "@mui/icons-material/Edit";
import { startCase } from "lodash";

const defaultLoading = {
  parents: false,
  siblings: false,
  children: false,
  spouses: false,
};

type Loading = Record<Relative, boolean>;

type TreeNodeDetailsBioProps = TreeNodeDataWithRelations & {
  onRelationNodeClick: (id: string) => void;
  onOpen: () => void;
  onAction: (id: string, relative: Relative) => Promise<void>;
};

export const TreeNodeDetailsBio: FC<TreeNodeDetailsBioProps> = ({
  id,
  name,
  birth,
  death,
  parents,
  siblings,
  spouses,
  children,
  nationality,
  onRelationNodeClick,
  metadata,
  profileImageURL,
  onOpen,
  onAction,
}) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const nickname = getNickname(name.nicknames);
  const birthDate = getDate(birth?.year, birth?.month, birth?.day);
  const birthPlace = getPlace(birth?.place?.country, birth?.place?.city);
  const deathDate = getDate(death?.year, death?.month, death?.day);
  const [age, info] = getAge(birth?.year, birth?.month, birth?.day, death?.year, death?.month, death?.day);

  const [loading, setLoading] = useState<Loading>(defaultLoading);

  const onExpandNode = async (id: string, type: string) => {
    let relative: Relative;
    if (type === "parent") relative = "parents";
    else if (type === "child") relative = "children";
    else if (type === "spouse") relative = "spouses";
    else if (type === "sibling") relative = "siblings";
    else if (type === "brother") relative = "siblings";
    else relative = "siblings";

    try {
      setLoading((prev) => ({ ...prev, [relative]: true }));

      await onAction(id, relative);
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, [relative]: false }));
    }
  };

  return (
    <React.Fragment>
      <div className={s.bioContainer}>
        <div className={classNames(s.bioGrid)}>
          <ShowIf condition={Boolean(nickname)}>
            <span className={s.gridItemTitle}>Nickname</span>
            <span className={s.gridItemValue}>{startCase(nickname)}</span>
          </ShowIf>
          <ShowIf condition={Boolean(birthDate)}>
            <span className={s.gridItemTitle}>Birth Date</span>
            <span className={s.gridItemValue}>
              {birthDate}/{age} {info} old
            </span>
          </ShowIf>
          <ShowIf condition={Boolean(birthPlace)}>
            <span className={s.gridItemTitle}>Birth Place</span>
            <span className={s.gridItemValue}>{birthPlace}</span>
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
                onExpandNode={(type) => onExpandNode(id, type)}
                items={parents}
                relationType="parent"
                expandable={Boolean(metadata?.expandable?.parents)}
                loading={loading.parents}
              />
            </div>
          </ShowIf>
          <ShowIf condition={siblings.length > 0 || Boolean(metadata?.expandable?.siblings)}>
            <span className={s.gridItemTitle}>Siblings</span>
            <div className={classNames(s.gridItemValue)}>
              <BioRelationButtons
                onClick={onRelationNodeClick}
                onExpandNode={(type) => onExpandNode(id, type)}
                items={siblings}
                relationType="sibling"
                expandable={Boolean(metadata?.expandable?.siblings)}
                loading={loading.siblings}
              />
            </div>
          </ShowIf>
          <ShowIf condition={spouses.length > 0 || Boolean(metadata?.expandable?.spouses)}>
            <span className={s.gridItemTitle}>Spouses</span>
            <div className={classNames(s.gridItemValue)}>
              <BioRelationButtons
                onClick={onRelationNodeClick}
                onExpandNode={(type) => onExpandNode(id, type)}
                items={spouses}
                relationType="spouse"
                expandable={Boolean(metadata?.expandable?.spouses)}
                loading={loading.spouses}
              />
            </div>
          </ShowIf>
          <ShowIf condition={children.length > 0 || Boolean(metadata?.expandable?.children)}>
            <span className={s.gridItemTitle}>Children</span>
            <div className={classNames(s.gridItemValue)}>
              <BioRelationButtons
                onClick={onRelationNodeClick}
                onExpandNode={(type) => onExpandNode(id, type)}
                items={children}
                relationType="child"
                expandable={Boolean(metadata?.expandable?.children)}
                loading={loading.children}
              />
            </div>
          </ShowIf>
          <ShowIf condition={Boolean(nationality)}>
            <span className={s.gridItemTitle}>Nationality</span>
            <span className={s.gridItemValue}>{nationality}</span>
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
              {/* eslint-disable @next/next/no-img-element */}
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
