import { useNodeSelectionContext } from "@tree/src/context/tree";
import { CloseIcon } from "@tree/src/components/Icon/CloseIcon";
import React, { FC, useState } from "react";
import BioNavItem from "./BioNavItem/BioNavItem";
import s from "./TreeNodeDetails.module.css";
import { TreeNodeDetailsBio } from "./TreeNodeDetailsBio/TreeNodeDetailsBio";
import { getTreeNodeDetails } from "@tree/src/helper/tree";
import { TreeNode } from "@tree/src/types/tree";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AddMemberModal from "@tree/src/components/Modal/AddMemberModal";
import EditMemberModal from "@tree/src/components/Modal/EditMemberModal";
import { Box, Tooltip } from "@mui/material";
import { useAuthContext } from "@tree/src/context/auth";
import ShowIf from "@tree/src/components/show-if";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteMemberModal from "@tree/src/components/Modal/DeleteMemberModal";
import { TreeNodeFamilies } from "../TreeNodeFamilies/TreeNodeFamilies";
import { startCase } from "lodash";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useTreeNodeDataContext } from "@tree/src/context/data";

const navigation = [
  { id: 1, title: "Biography" },
  { id: 2, title: "Galleries" },
  { id: 3, title: "Families" },
];

type TreeNodeDetailsProps = {
  nodeMap: Record<string, TreeNode>;
};

const TreeNodeDetails: FC<TreeNodeDetailsProps> = ({ nodeMap }) => {
  const { selectedNodeId, unselectNode, selectNode } = useNodeSelectionContext();
  const { init } = useTreeNodeDataContext();
  const { isLoggedIn } = useAuthContext();

  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [navId, setNavId] = useState<number>(1);

  const node = getTreeNodeDetails(nodeMap, selectedNodeId);

  if (!isLoggedIn || !node || init) return <React.Fragment />;
  return (
    <React.Fragment>
      <Box>
        <div className={s.root}>
          <Box>
            <button className={s.closeButton} onClick={unselectNode}>
              <CloseIcon className={s.closeIcon} />
            </button>
            <div className={s.rootItem}>
              <h2 className={s.name}>
                {startCase(node.fullname)}
                <Tooltip title="Edit member" placement="bottom-start">
                  <EditIcon
                    fontSize="small"
                    sx={{ ml: "10px", cursor: "pointer", ":hover": { color: "#4da1ff" } }}
                    onClick={() => setOpenEdit(true)}
                  />
                </Tooltip>
              </h2>
            </div>
            <nav className={s.rootItem}>
              {navigation.map((item, index) => (
                <BioNavItem
                  key={index}
                  id={item.id}
                  text={item.title}
                  isSelected={item.id === navId}
                  onClick={setNavId}
                />
              ))}
            </nav>

            <ShowIf condition={navId === 1}>
              <TreeNodeDetailsBio {...node} onRelationNodeClick={(id) => selectNode(id)} />
            </ShowIf>

            <ShowIf condition={navId === 2}>
              <span className={s.rootItem}>Unfortunately, we do not yet have photographs of this person.</span>;
            </ShowIf>

            <ShowIf condition={navId === 3}>
              <TreeNodeFamilies id={node.id} fullname={node.fullname} />
            </ShowIf>
          </Box>
          <ShowIf condition={navId === 1}>
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <Tooltip title="Add new member" placement="bottom-end">
                <Fab color="primary" aria-label="add" size="small" onClick={() => setOpenAdd(true)}>
                  <AddIcon />
                </Fab>
              </Tooltip>
              <ShowIf condition={false}>
                <Tooltip title="Delete member" placement="bottom-end">
                  <Fab
                    color="error"
                    aria-label="add"
                    size="small"
                    onClick={() => setOpenDelete(true)}
                    sx={{ ml: "10px" }}
                  >
                    <DeleteIcon />
                  </Fab>
                </Tooltip>
              </ShowIf>
            </Box>
          </ShowIf>
          <ShowIf condition={navId === 2}>
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <Tooltip title="Add galleries" placement="bottom-end">
                <Fab color="secondary" aria-label="add" size="small">
                  <AddPhotoAlternateIcon />
                </Fab>
              </Tooltip>
            </Box>
          </ShowIf>
        </div>
      </Box>
      <EditMemberModal open={openEdit} onClose={() => setOpenEdit(false)} node={node} />
      <AddMemberModal nodeId={selectedNodeId} open={openAdd} onClose={() => setOpenAdd(false)} node={node} />
      <DeleteMemberModal nodeId={selectedNodeId} open={openDelete} onClose={() => setOpenDelete(false)} />
    </React.Fragment>
  );
};

export default TreeNodeDetails;
