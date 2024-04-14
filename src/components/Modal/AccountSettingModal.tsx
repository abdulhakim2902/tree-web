import { AddPhotoAlternate } from "@mui/icons-material";
import { Box, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { UserProfile } from "@tree/src/types/user";
import { FC } from "react";

type AccountSettingModalProps = {
  open: boolean;
  user: UserProfile;

  onClose: () => void;
};

const AccountSettingModal: FC<AccountSettingModalProps> = ({ open, user, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
        },
      }}
    >
      <DialogTitle>Account Setting</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="space-between">
          <Box
            height={150}
            width={150}
            borderRadius={1}
            borderColor="whitesmoke"
            display="flex"
            justifyContent="center"
            alignItems="center"
            position="relative"
            sx={{ backgroundColor: "grey", cursor: "pointer" }}
          >
            <AddPhotoAlternate style={{ fontSize: 35 }} />
          </Box>
          <Box ml={2} display="flex" flexDirection="column">
            <TextField value={user.username} sx={{ marginBottom: "10px" }} />
            <TextField value={user.email} sx={{ marginBottom: "10px" }} />
            <TextField value={user.role} sx={{ marginBottom: "10px" }} />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingModal;
