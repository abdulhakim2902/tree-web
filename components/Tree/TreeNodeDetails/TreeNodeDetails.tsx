import { useNodeSelectionContext } from "@/context/tree";
import { CloseIcon } from "@/icons/CloseIcon";
import React, { FC, useEffect, useState } from "react";
import BioNavItem from "./BioNavItem/BioNavItem";
import s from "./TreeNodeDetails.module.css";
import { TreeNodeDetailsBio } from "./TreeNodeDetailsBio/TreeNodeDetailsBio";
import { getTreeNodeDetails } from "@/helper/tree";
import { Family, TreeNode, TreeNodeDataWithRelations } from "@/types/tree";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AddMemberModal from "@/components/Modal/AddMemberModal";
import EditMemberModal from "@/components/Modal/EditMemberModal";
import { Box, Tooltip } from "@mui/material";
import { useAuthContext } from "@/context/auth";
import ShowIf from "@/components/show-if";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteMemberModal from "@/components/Modal/DeleteMemberModal";
import { TreeNodeFamilies } from "../TreeNodeFamilies/TreeNodeFamilies";
import { parseJSON } from "@/helper/parse-json";
import { nodeFamilies } from "@/services/node";
import { startCase } from "lodash";
import { NODE_FAMILIES_KEY } from "@/constants/storage-key";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const navigation = [
  { id: 1, title: "Biography" },
  { id: 2, title: "Galleries" },
  { id: 3, title: "Families" },
];

type SelectedTabsProps = {
  id: number;
  node: TreeNodeDataWithRelations;
  selectNode: (id: string, hasSubTree?: boolean) => void;
};

const SelectedTab: FC<SelectedTabsProps> = ({ id, selectNode, node }) => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getFamilyNodes = async (id: string) => {
      setLoading(true);

      const familiesStr = localStorage.getItem(NODE_FAMILIES_KEY);
      let families = parseJSON<Record<string, Family[]>>(familiesStr);
      if (!families) families = {};
      if (!families[id]) {
        const { id: nodeId, families: data } = await nodeFamilies(id);
        families[nodeId] = data;
      }

      localStorage.setItem(NODE_FAMILIES_KEY, JSON.stringify(families));

      setFamilies(families[id]);
      setLoading(false);
    };

    if (id === 3) {
      getFamilyNodes(node.id);
    }
  }, [id, node]);

  if (id === 1) {
    return <TreeNodeDetailsBio {...node} onRelationNodeClick={(id) => selectNode(id)} />;
  }

  if (id === 2) {
    return <span className={s.rootItem}>Unfortunately, we do not yet have photographs of this person.</span>;
  }

  return <TreeNodeFamilies fullname={node.fullname} families={families} loading={loading} />;
};

type TreeNodeDetailsProps = {
  nodeMap: Record<string, TreeNode>;
};

const TreeNodeDetails: FC<TreeNodeDetailsProps> = ({ nodeMap }) => {
  const { selectedNodeId, unselectNode, selectNode } = useNodeSelectionContext();
  const { isLoggedIn } = useAuthContext();

  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [navId, setNavId] = useState<number>(1);

  const node = getTreeNodeDetails(nodeMap, selectedNodeId);

  if (!isLoggedIn || !node) return <React.Fragment />;
  return (
    <React.Fragment>
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

          <SelectedTab id={navId} node={node} selectNode={selectNode} />
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

      <EditMemberModal open={openEdit} onClose={() => setOpenEdit(false)} node={node} />

      <AddMemberModal nodeId={selectedNodeId} open={openAdd} onClose={() => setOpenAdd(false)} node={node} />

      <DeleteMemberModal nodeId={selectedNodeId} open={openDelete} onClose={() => setOpenDelete(false)} />
    </React.Fragment>
  );
};

export default TreeNodeDetails;
