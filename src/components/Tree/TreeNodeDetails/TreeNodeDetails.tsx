import { useNodeSelectionContext } from "@tree/src/context/tree";
import { CloseIcon } from "@tree/src/components/Icon/CloseIcon";
import React, { ChangeEvent, FC, useState } from "react";
import BioNavItem from "./BioNavItem/BioNavItem";
import s from "./TreeNodeDetails.module.css";
import { TreeNodeDetailsBio } from "./TreeNodeDetailsBio/TreeNodeDetailsBio";
import { getTreeNodeDetails } from "@tree/src/helper/tree";
import { TreeNode } from "@tree/src/types/tree";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Tooltip } from "@mui/material";
import { useAuthContext } from "@tree/src/context/auth";
import ShowIf from "@tree/src/components/show-if";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteMemberModal from "@tree/src/components/Modal/DeleteMemberModal";
import { TreeNodeFamilies } from "../TreeNodeFamilies/TreeNodeFamilies";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import AddMemberDrawer from "../../Drawer/AddMemberDrawer";
import EditMemberDrawer from "../../Drawer/EditMemberDrawer";
import { File, upload } from "@tree/src/lib/services/file";
import { useSnackbar } from "notistack";
import { TreeNodeGalleries } from "../TreeNodeGalleries/TreeNodeGalleries";
import GalleryModal from "../../Modal/GalleryModal";
import { CREATE, DELETE, UPDATE } from "@tree/src/constants/permissions";
import { Role } from "@tree/src/types/user";

const navigation = [
  { id: 1, title: "Biography" },
  { id: 2, title: "Galleries" },
  { id: 3, title: "Families" },
];

const actions = [
  { icon: <AddIcon />, name: 'Add relative' },
  { icon: <AddPhotoAlternateIcon />, name: 'Update profile image' },
  { icon: <DeleteIcon />, name: 'Remove relative' },
];

type TreeNodeDetailsProps = {
  nodeMap: Record<string, TreeNode>;
};

const TreeNodeDetails: FC<TreeNodeDetailsProps> = ({ nodeMap }) => {
  const { selectedNodeId, unselectNode, selectNode } = useNodeSelectionContext();
  const { init } = useTreeNodeDataContext();
  const { isLoggedIn, user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openGalleries, setOpenGalleries] = useState<boolean>(false);
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
      form.set("nodeId", node?.id);
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

  if (!isLoggedIn || !node || init || !user) return <React.Fragment />;
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
                <ShowIf condition={UPDATE.some((e) => e === user.role)}>
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
              <TreeNodeDetailsBio {...node} onRelationNodeClick={(id) => selectNode(id)} />
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
              <TreeNodeFamilies id={node.id} fullname={node.fullname} />
            </ShowIf>
          </Box>
          <ShowIf condition={navId === 1 && user.role !== Role.GUEST}>
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <ShowIf condition={UPDATE.some((e) => e === user.role)}>
                <Tooltip title="Update profile image" placement="bottom-end" sx={{ mr: "10px" }}>
                  <Fab
                    color="secondary"
                    aria-label="update-profile"
                    size="small"
                    component="label"
                    onClick={() => setOpenGalleries(true)}
                  >
                    <AddPhotoAlternateIcon />
                  </Fab>
                </Tooltip>
              </ShowIf>
              <ShowIf condition={CREATE.some((e) => e === user.role)}>
                <Tooltip title="Add relative" placement="bottom-end">
                  <Fab color="primary" aria-label="add" size="small" onClick={() => setOpenAdd(true)}>
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </ShowIf>

              <ShowIf condition={DELETE.some((e) => e === user.role)}>
                <Tooltip title="Delete relative" placement="bottom-end">
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
          <ShowIf condition={navId === 2 && user.role !== Role.GUEST}>
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <ShowIf condition={UPDATE.some((e) => e === user.role)}>
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
      <AddMemberDrawer open={openAdd} onClose={() => setOpenAdd(false)} node={node} />
      <EditMemberDrawer open={openEdit} onClose={() => setOpenEdit(false)} node={node} />
      <DeleteMemberModal nodeId={selectedNodeId} open={openDelete} onClose={() => setOpenDelete(false)} />
      <GalleryModal
        open={openGalleries}
        onClose={() => setOpenGalleries(false)}
        nodeId={node.id}
        current={node.profileImageURL}
      />
    </React.Fragment>
  );
};

export default TreeNodeDetails;
