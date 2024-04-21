import { Box, Button, Modal, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FC, useRef, useState } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { ScaleLoader } from "react-spinners";

/* Hooks */
import { useSnackbar } from "notistack";
import { useNodeSelectionContext } from "@tree/src/context/tree";

type DeleteMemberModalProps = {
  node: TreeNodeDataWithRelations;
  open: boolean;
  onClose: () => void;
  onAction: (id: string) => Promise<void>;
};

const DeleteMemberModal: FC<DeleteMemberModalProps> = ({ node, open, onClose, onAction }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { enqueueSnackbar } = useSnackbar();
  const { unselectNode } = useNodeSelectionContext();

  const [loading, setLoading] = useState<boolean>(false);

  const handleRemove = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        setLoading(true);

        await onAction(node.id);

        unselectNode();
        onClose();
      } catch (err: any) {
        buttonRef.current.disabled = false;
        enqueueSnackbar({
          variant: "error",
          message: err.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
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
          <Button color="info" variant="outlined" sx={{ mr: "10px" }} disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button ref={buttonRef} variant="contained" color="error" onClick={handleRemove} disabled>
            {loading ? <ScaleLoader color="whitesmoke" height={10} width={2} /> : "Delete"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteMemberModal;
