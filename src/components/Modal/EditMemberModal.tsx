import { Box, Modal, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Bio } from "../Form/Form";
import { FC } from "react";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import EditForm from "../Form/EditForm";
import { useTreeNodeDataContext } from "@tree/src/context/data";

type EditMemberModalProps = {
  open: boolean;
  node?: TreeNodeDataWithRelations;

  onClose: () => void;
};

const EditMemberModal: FC<EditMemberModalProps> = ({ open, onClose, node }) => {
  const { updateNode, loading } = useTreeNodeDataContext();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const onUpdate = async (data: any) => {
    if (!node?.id) return;
    updateNode(node.id, data, (success) => {
      if (success) {
        onClose();
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (loading.updated && reason === "backdropClick") return;
        if (loading.updated && reason === "escapeKeyDown") return;
        onClose();
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: mobile ? "80%" : 400,
          bgcolor: "var(--background-color)",
          borderRadius: "10px",
          p: 4,
        }}
      >
        <Typography sx={{ mb: "20px", fontWeight: "bold" }} variant="h4" component="h2">
          Edit Member
        </Typography>
        <EditForm onUpdate={onUpdate} onCancel={onClose} node={node} loading={loading.updated} />
      </Box>
    </Modal>
  );
};

export default EditMemberModal;
