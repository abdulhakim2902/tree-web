import React, { ChangeEvent, FC, useState } from "react";
import BioNavItem from "./BioNavItem/BioNavItem";
import ShowIf from "@tree/src/components/show-if";
import Fab from "@mui/material/Fab";
import s from "./TreeNodeDetails.module.css";
import ConnectNodeModal from "../../Modal/ConnectNodeModal";
import DisconnectNodeModal from "../../Modal/DisconnectNodeModal";

import { TreeNodeDetailsBio } from "./TreeNodeDetailsBio/TreeNodeDetailsBio";
import { getTreeNodeDetails } from "@tree/src/helper/tree";
import { Root, TreeNode } from "@tree/src/types/tree";
import { Box, Tooltip } from "@mui/material";
import { TreeNodeFamilies } from "../TreeNodeFamilies/TreeNodeFamilies";
import { File, upload } from "@tree/src/lib/services/file";
import { TreeNodeGalleries } from "../TreeNodeGalleries/TreeNodeGalleries";
import { CREATE, DELETE, UPDATE } from "@tree/src/constants/permissions";
import { CloseIcon } from "@tree/src/components/Icon/CloseIcon";
import { Relative } from "@tree/src/lib/services/node";

/* Hooks */
import { useNodeSelectionContext } from "@tree/src/context/tree";
import { useAuthContext } from "@tree/src/context/auth";
import { useSnackbar } from "notistack";

/* Drawers */
import AddMemberDrawer from "../../Drawer/AddMemberDrawer";
import EditMemberDrawer from "../../Drawer/EditMemberDrawer";

/* Modals */
import GalleryModal from "../../Modal/GalleryModal";
import DeleteMemberModal from "@tree/src/components/Modal/DeleteMemberModal";

/* Icons */
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const navigation = [
  { id: 1, title: "Biography" },
  { id: 2, title: "Galleries" },
  { id: 3, title: "Families" },
];

type TreeNodeDetailsProps = {
  root: Root;
  nodeMap: Record<string, TreeNode>;

  addNode: (id: string, data: any, type: string) => Promise<string[]>;
  editNode: (id: string, data: any) => Promise<void>;
  removeNode: (id: string) => Promise<void>;
  expandNode: (id: string, relative: Relative) => Promise<void>;
  editImageNode: (id: string, data?: File) => Promise<void>;
};

const TreeNodeDetails: FC<TreeNodeDetailsProps> = ({
  root,
  nodeMap,
  addNode,
  editNode,
  removeNode,
  editImageNode,
  expandNode,
}) => {
  const { selectedNodeId, unselectNode, selectNode } = useNodeSelectionContext();
  const { isLoggedIn, user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openRemove, setOpenRemove] = useState<boolean>(false);
  const [openGalleries, setOpenGalleries] = useState<boolean>(false);
  const [openConnect, setOpenConnect] = useState<boolean>(false);
  const [openDisconnect, setOpenDisconnect] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [newFile, setNewFile] = useState<File>();
  const [navId, setNavId] = useState<number>(1);

  const node = getTreeNodeDetails(nodeMap, selectedNodeId);

  const onUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files?.length <= 0) return;

    setUploading(true);

    const file = files[0];
    const form = new FormData();
    form.append("file", file);
    if (node) {
      form.set("id", node?.id);
      form.set("type", "node");
    }

    try {
      setNewFile({ _id: "new", assetId: "new", publicId: "new", url: URL.createObjectURL(file) });

      const result = await upload(form);
      setNewFile((prev) => {
        if (prev) {
          prev._id = result._id;
          prev.assetId = result.assetId;
          prev.publicId = result.publicId;
        } else {
          prev = result;
        }

        return prev;
      });
    } catch (err: any) {
      setNewFile(undefined);
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  if (!isLoggedIn || !node || !user) return <React.Fragment />;
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
                {node.fullname}
                <ShowIf condition={UPDATE.some((e) => e === user.role) || node.id === user.nodeId}>
                  <Tooltip title="Edit the information for this person" placement="bottom-start">
                    <EditIcon
                      fontSize="small"
                      sx={{ ml: "10px", cursor: "pointer", ":hover": { color: "#4da1ff" } }}
                      onClick={() => setOpenEdit(true)}
                    />
                  </Tooltip>
                </ShowIf>
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
              <TreeNodeDetailsBio
                {...node}
                onRelationNodeClick={(id) => selectNode(id)}
                onOpen={() => setOpenGalleries(true)}
                onAction={expandNode}
              />
            </ShowIf>

            <ShowIf condition={navId === 2}>
              <TreeNodeGalleries
                nodeId={node.id}
                newFile={newFile}
                current={node.profileImageURL}
                uploading={uploading}
              />
            </ShowIf>

            <ShowIf condition={navId === 3}>
              <TreeNodeFamilies id={node.id} rootId={root.id} fullname={node.fullname} />
            </ShowIf>
          </Box>
          <ShowIf condition={navId === 1}>
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <ShowIf condition={DELETE.some((e) => e === user.role) || node.id === user.nodeId}>
                <Tooltip title="Delete relative" placement="bottom-end">
                  <Fab
                    color="error"
                    aria-label="add"
                    sx={{ ml: "10px" }}
                    size="small"
                    onClick={() => setOpenRemove(true)}
                  >
                    <DeleteIcon />
                  </Fab>
                </Tooltip>
              </ShowIf>
              <ShowIf condition={node.id === user.nodeId && node?.user?.id === user.id}>
                <Tooltip title="Disconnect" placement="bottom-end">
                  <Fab
                    color="success"
                    aria-label="unpin-people"
                    sx={{ marginLeft: "10px" }}
                    size="small"
                    component="label"
                    onClick={() => setOpenDisconnect(true)}
                  >
                    <RadioButtonCheckedIcon />
                  </Fab>
                </Tooltip>
              </ShowIf>
              <ShowIf
                condition={
                  node.id !== user.nodeId &&
                  node.user?.id !== user.id &&
                  !Boolean(node.user?.id) &&
                  !Boolean(user.nodeId)
                }
              >
                <Tooltip title="Connect" placement="bottom-end">
                  <Fab
                    color="success"
                    aria-label="pin-people"
                    sx={{ marginLeft: "10px" }}
                    size="small"
                    component="label"
                    onClick={() => setOpenConnect(true)}
                  >
                    <RadioButtonUncheckedIcon />
                  </Fab>
                </Tooltip>
              </ShowIf>
              <ShowIf condition={CREATE.some((e) => e === user.role)}>
                <Tooltip title="Add relative" placement="bottom-end">
                  <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ marginLeft: "10px" }}
                    size="small"
                    component="label"
                    onClick={() => setOpenAdd(true)}
                  >
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </ShowIf>
            </Box>
          </ShowIf>
          <ShowIf condition={navId === 2}>
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <ShowIf condition={UPDATE.some((e) => e === user.role) || user.nodeId === node.id}>
                <Tooltip title="Add galleries" placement="bottom-end">
                  <Fab color="secondary" aria-label="add-galleries" size="small" component="label">
                    <AddPhotoAlternateIcon />
                    <input type="file" hidden={true} onChange={onUploadImage} disabled={uploading} />
                  </Fab>
                </Tooltip>
              </ShowIf>
            </Box>
          </ShowIf>
        </div>
      </Box>

      <ConnectNodeModal open={openConnect} onClose={() => setOpenConnect(false)} node={node} />
      <DisconnectNodeModal open={openDisconnect} onClose={() => setOpenDisconnect(false)} node={node} />
      <AddMemberDrawer open={openAdd} onClose={() => setOpenAdd(false)} onAction={addNode} node={node} />
      <EditMemberDrawer open={openEdit} onClose={() => setOpenEdit(false)} onAction={editNode} node={node} />
      <DeleteMemberModal open={openRemove} onClose={() => setOpenRemove(false)} onAction={removeNode} node={node} />
      <GalleryModal open={openGalleries} onClose={() => setOpenGalleries(false)} onAction={editImageNode} node={node} />
    </React.Fragment>
  );
};

export default TreeNodeDetails;
