import { FC, useState } from "react";
import { Box, Drawer, Typography } from "@mui/material";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { useSnackbar } from "notistack";

import EditForm from "../Form/EditForm";

type EditMemberDrawerProps = {
  node: TreeNodeDataWithRelations;
  open: boolean;

  onClose: () => void;
  onAction: (id: string, data: any) => Promise<void>;
};

const EditMemberDrawer: FC<EditMemberDrawerProps> = ({ node, open, onClose, onAction }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState<boolean>(false);

  const onUpdate = async (data: any) => {
    try {
      setLoading(true);

      await onAction(node.id, data);

      onClose();
      enqueueSnackbar({
        variant: "success",
        message: `${node.fullname} biography is updated`,
      });
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={loading ? undefined : onClose}
      anchor="right"
      PaperProps={{ sx: { backgroundColor: "var(--background-color)", width: "350px" } }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" component="h3" sx={{ color: "whitesmoke" }}>
          Edit person
        </Typography>

        {/* eslint-disable @next/next/no-img-element */}
        {node.profileImageURL && (
          <Box sx={{ mt: 2 }}>
            <img src={node.profileImageURL} alt={node.profileImageURL} width={80} />
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <EditForm onUpdate={onUpdate} onCancel={onClose} node={node} loading={loading} />
        </Box>
      </Box>
    </Drawer>
  );
};

export default EditMemberDrawer;
