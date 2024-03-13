import {
  Box,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { FC, useEffect, useState } from "react";
import ShowIf from "../show-if";
import ChildForm from "../Form/ChildForm";
import SpouseForm from "../Form/SpouseForm";
import SiblingForm from "../Form/SiblingForm";
import ParentForm from "../Form/ParentForm";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { capitalize } from "lodash";
import SearchIcon from "@mui/icons-material/Search";
import { useCacheContext } from "@tree/src/context/cache";
import EditForm from "../Form/EditForm";

type EditMemberDrawerProps = {
  node: TreeNodeDataWithRelations;
  open: boolean;
  onClose: () => void;
};

const EditMemberDrawer: FC<EditMemberDrawerProps> = ({ node, open, onClose }) => {
  const { updateNode, loading } = useTreeNodeDataContext();

  const onUpdate = async (data: any) => {
    if (!node?.id) return;
    updateNode(node.id, data, (success) => {
      if (success) {
        onClose();
      }
    });
  };

  return (
    <Drawer
      open={open}
      onClose={(event, reason) => {
        if (loading.added && reason === "backdropClick") return;
        if (loading.added && reason === "escapeKeyDown") return;
        onClose();
      }}
      anchor="right"
      PaperProps={{ sx: { backgroundColor: "var(--background-color)", width: "350px" } }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" component="h3" sx={{ color: "whitesmoke" }}>
          Edit person
        </Typography>

        <Box sx={{ mt: 5 }}>
          <EditForm onUpdate={onUpdate} onCancel={onClose} node={node} loading={loading.updated} />
        </Box>
      </Box>
    </Drawer>
  );
};

export default EditMemberDrawer;
