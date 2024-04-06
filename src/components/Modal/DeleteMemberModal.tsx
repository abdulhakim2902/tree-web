import { Box, Button, Modal, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FC } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { useNodeSelectionContext } from "@tree/src/context/tree";

type DeleteMemberModalProps = {
  nodeId?: string;
  open: boolean;
  onClose: () => void;
};

const DeleteMemberModal: FC<DeleteMemberModalProps> = ({ nodeId, open, onClose }) => {
  const { deleteNode, loading } = useTreeNodeDataContext();
  const { unselectNode } = useNodeSelectionContext();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (loading.deleted && reason === "backdropClick") return;
        if (loading.deleted && reason === "escapeKeyDown") return;
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
        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ fontSize: "18px" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <WarningIcon fontSize="large" sx={{ mr: "10px" }} />
            Are your sure?
          </Box>
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2, fontSize: "15px" }}>
          You are about to delete this people.
        </Typography>
        <Box sx={{ mt: "30px" }} textAlign="end">
          <Button
            color="info"
            variant="outlined"
            sx={{ mr: "10px" }}
            onClick={() => {
              if (loading.deleted) return;
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (loading.deleted) return;
              deleteNode(nodeId ?? "", (success) => {
                if (success) {
                  unselectNode();
                }

                onClose();
              });
            }}
          >
            {loading.deleted ? "Deleting..." : "Delete"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteMemberModal;
