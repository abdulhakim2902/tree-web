import { AddPhotoAlternate } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Tab,
  Tabs,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Role, UserProfile } from "@tree/src/types/user";
import React, { FC, useState } from "react";
import ShowIf from "../show-if";
import * as emailValidation from "email-validator";
import { startCase } from "@tree/src/helper/string";

/* Icons */
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

type AccountSettingModalProps = {
  open: boolean;
  user: UserProfile;

  onClose: () => void;
  onOpenRoleRequest: () => void;
};

type TabPanelProps = {
  children: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
    >
      {value === index && <Box sx={{ my: 2 }}>{children}</Box>}
    </div>
  );
}

const AccountSettingModal: FC<AccountSettingModalProps> = ({ open, user, onClose, onOpenRoleRequest }) => {
  const [email, setEmail] = useState<string>(user.email);
  const [name, setName] = useState<string>(startCase(user.name));
  const [errorMessageEmail, setErrorMessageEmail] = useState<string>("");
  const [isEditEmail, setIsEditEmail] = useState<boolean>(false);
  const [isEditName, setIsEditName] = useState<boolean>(false);
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState(0);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
          width: "500px",
          height: mobile ? "400px" : "305px",
        },
      }}
    >
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabIndex} onChange={(event, value) => setTabIndex(value)} aria-label="basic tabs example">
            <Tab label="Profile" sx={{ color: "whitesmoke" }} />
            <Tab label="Settings" sx={{ color: "whitesmoke" }} />
          </Tabs>
        </Box>
        <TabPanel value={tabIndex} index={0}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
            alignItems="center"
            flexDirection={mobile ? "column" : "row"}
          >
            <Box
              height={mobile ? 100 : 150}
              width={mobile ? 100 : 150}
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
            <Box ml={2} display="flex" flexDirection="column" width={300}>
              <TextField
                value={name}
                onChange={(event) => {
                  if (isEditName) {
                    setName(event.target.value);
                  }
                }}
                sx={{
                  marginBottom: "10px",
                  marginTop: "10px",
                  input: { color: "whitesmoke" },
                  cursor: "pointer",
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "grey",
                  },
                }}
                fullWidth
                disabled={!isEditName}
                InputLabelProps={{ style: { color: "grey" } }}
                InputProps={{
                  startAdornment: <AccountCircleIcon sx={{ color: "whitesmoke", marginRight: "10px" }} />,
                  endAdornment: (
                    <React.Fragment>
                      <ShowIf condition={!isEditName}>
                        <Button variant="outlined" color="primary" onClick={() => setIsEditName(true)}>
                          Edit
                        </Button>
                      </ShowIf>
                      <ShowIf condition={isEditName}>
                        <IconButton color="primary" sx={{ marginRight: "5px" }}>
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setIsEditName(false);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ShowIf>
                    </React.Fragment>
                  ),
                }}
              />
              <TextField
                value={email}
                error={isErrorEmail}
                helperText={isErrorEmail ? errorMessageEmail : ""}
                onChange={(event) => {
                  if (isEditEmail) {
                    const value = event.target.value;
                    const valid = emailValidation.validate(value);
                    setEmail(event.target.value);
                    setIsErrorEmail(!valid);
                    setErrorMessageEmail(valid ? "" : "Invalid email format");
                  }
                }}
                sx={{
                  marginBottom: "10px",
                  input: { color: "whitesmoke" },
                  cursor: "pointer",
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "grey",
                  },
                }}
                fullWidth
                disabled={!isEditEmail}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: "whitesmoke", marginRight: "10px" }} />,
                  endAdornment: (
                    <React.Fragment>
                      <ShowIf condition={!isEditEmail}>
                        <Button variant="outlined" color="primary" onClick={() => setIsEditEmail(true)}>
                          Edit
                        </Button>
                      </ShowIf>
                      <ShowIf condition={isEditEmail}>
                        <IconButton color="primary" sx={{ marginRight: "5px" }}>
                          <CheckIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => setIsEditEmail(false)}>
                          <CloseIcon />
                        </IconButton>
                      </ShowIf>
                    </React.Fragment>
                  ),
                }}
              />
              <TextField
                value={user.role}
                sx={{
                  marginBottom: "10px",
                  input: { color: "whitesmoke" },
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "grey",
                  },
                }}
                fullWidth
                disabled
                InputProps={{
                  startAdornment: <ManageAccountsIcon sx={{ color: "whitesmoke", marginRight: "10px" }} />,
                  endAdornment: (
                    <React.Fragment>
                      <ShowIf condition={user.role === Role.SUPERADMIN}>
                        <Button variant="outlined" color="primary" onClick={onOpenRoleRequest}>
                          Edit
                        </Button>
                      </ShowIf>
                    </React.Fragment>
                  ),
                }}
              />
            </Box>
          </Box>
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          Setting
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingModal;
