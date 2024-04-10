import { Box, Button, Modal, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { FC, useRef, useState } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import { ScaleLoader } from "react-spinners";
import { useSnackbar } from "notistack";
import { disconnectNode } from "@tree/src/lib/services/user";
import { useAuthContext } from "@tree/src/context/auth";
import { useRouter } from "next/navigation";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";

type DisconnectNodeModal = {
  node: TreeNodeDataWithRelations;
  open: boolean;
  onClose: () => void;
};

const DisconnectNodeModal: FC<DisconnectNodeModal> = ({ node, open, onClose }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { enqueueSnackbar } = useSnackbar();
  const { logout } = useAuthContext();

  const [loading, setLoading] = useState<boolean>(false);

  const onDisconnect = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        setLoading(true);

        await disconnectNode(node.id);

        router.replace("/");
        logout();
        enqueueSnackbar({
          variant: "success",
          message: "Successfully disconnect node",
        });
      } catch (err: any) {
        enqueueSnackbar({
          variant: "error",
          message: err.message,
        });
      } finally {
        setLoading(false);
      }

      buttonRef.current.disabled = false;
    }
  };

  return (
    <Modal open={open} onClose={loading ? undefined : onClose}>
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
          You are about to disconnect this people.
        </Typography>
        <Box sx={{ mt: "30px" }} textAlign="end">
          {loading ? (
            <React.Fragment />
          ) : (
            <Button variant="outlined" onClick={onClose} color="primary">
              Cancel
            </Button>
          )}
          <Button
            ref={buttonRef}
            onClick={onDisconnect}
            variant="contained"
            color="error"
            sx={{ ml: "10px" }}
            autoFocus
          >
            {loading ? <ScaleLoader color="whitesmoke" height={10} /> : "Disconnect"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DisconnectNodeModal;
