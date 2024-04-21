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
  CircularProgress,
} from "@mui/material";
import { Role, UserProfile } from "@tree/src/types/user";
import React, { ChangeEvent, FC, useState } from "react";
import ShowIf from "../show-if";
import * as emailValidation from "email-validator";
import { startCase } from "@tree/src/helper/string";
import { useSnackbar } from "notistack";
import { me, update } from "@tree/src/lib/services/user";
import { setCookie } from "cookies-next";
import { USER_KEY } from "@tree/src/constants/storage-key";
import { DAY } from "@tree/src/helper/date";
import { useAuthContext } from "@tree/src/context/auth";

/* Icons */
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { File, removeFile, upload } from "@tree/src/lib/services/file";

type AccountSettingModalProps = {
  open: boolean;
  user: UserProfile;

  onClose: () => void;
  onOpenRoleRequest: () => void;
};

const AccountSettingModal: FC<AccountSettingModalProps> = ({ open, user, onClose, onOpenRoleRequest }) => {
  const { setUser } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState<string>(user.email);
  const [name, setName] = useState<string>(startCase(user.name));
  const [profileURL, setProfileURL] = useState(user.profileImageURL?.split(";")?.[1]);
  const [errorMessageEmail, setErrorMessageEmail] = useState<string>("");
  const [isEditEmail, setIsEditEmail] = useState<boolean>(false);
  const [isEditName, setIsEditName] = useState<boolean>(false);
  const [isErrorName, setIsErrorName] = useState<boolean>(false);
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [updatingName, setUpdatingName] = useState<boolean>(false);
  const [updatingEmail, setUpdatingEmail] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const onUpdateName = async () => {
    if (!updatingName && !isErrorName) {
      try {
        setUpdatingName(true);

        await update({ name: name });
        const userProfile = await me();
        setCookie(USER_KEY, userProfile, { maxAge: DAY });
        setUser(userProfile);
        setName(startCase(userProfile.name));
        setIsEditName(false);

        enqueueSnackbar({
          variant: "success",
          message: "Successfully change name",
        });
      } catch (err: any) {
        enqueueSnackbar({
          variant: "error",
          message: err.message,
        });
      } finally {
        setUpdatingName(false);
      }
    }
  };

  const onUpdateEmail = async () => {
    if (!updatingEmail && !isErrorEmail) {
      try {
        setUpdatingEmail(true);

        await update({ email: email });

        setEmail(user.email);
        setIsEditEmail(false);
        setIsErrorEmail(false);
        setErrorMessageEmail("");
        onReset();

        enqueueSnackbar({
          variant: "success",
          message: "Please check your email to verify new email address.",
        });
      } catch (err: any) {
        enqueueSnackbar({
          variant: "error",
          message: err.message,
        });
      } finally {
        setUpdatingEmail(false);
      }
    }
  };

  const onUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length <= 0 || uploading) return;

    const file = files[0];
    const [id, profileImageURL] = user.profileImageURL?.split(";") ?? [];

    try {
      setUploading(true);
      setProfileURL(URL.createObjectURL(file));
      const form = new FormData();
      form.append("file", file);
      form.set("id", user.id);
      form.set("type", "user");
      const { _id, url } = await upload(form);
      await update({ profileImage: _id });
      await removeFile(id);
      const userProfile = await me();
      setCookie(USER_KEY, userProfile, { maxAge: DAY });
      setUser(userProfile);
      setProfileURL(url);
      enqueueSnackbar({
        variant: "success",
        message: "Successfully update user profile image.",
      });
    } catch (err: any) {
      setProfileURL(profileImageURL);
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const onReset = () => {
    onClose();
    setErrorMessageEmail("");
    setIsEditEmail(false);
    setIsErrorEmail(false);
    setIsEditName(false);
    setIsErrorName(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onReset}
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
            <Button component="label" sx={{ color: "whitesmoke", padding: 0 }}>
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
                {/* eslint-disable @next/next/no-img-element */}
                {profileURL ? (
                  <img src={profileURL} alt="profile_image" loading="lazy" width="100%" height="100%" />
                ) : (
                  <AddPhotoAlternate style={{ fontSize: 35 }} />
                )}

                <ShowIf condition={uploading}>
                  <CircularProgress size={20} sx={{ position: "absolute", right: "45%", top: "45%" }} />
                </ShowIf>
                <input type="file" hidden={true} onChange={onUploadImage} disabled={uploading} />
              </Box>
            </Button>
            <Box ml={2} display="flex" flexDirection="column" width={300}>
              <TextField
                error={isErrorName}
                helperText={isErrorName ? "Name cannot be empty" : ""}
                value={name}
                onChange={(event) => {
                  if (isEditName) {
                    const value = event.target.value;
                    setName(value);
                    setIsErrorName(!value);
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
                        <ShowIf condition={!updatingName}>
                          <IconButton
                            color="primary"
                            sx={{ marginRight: "5px" }}
                            onClick={onUpdateName}
                            disabled={user.name.toLowerCase() === name.toLowerCase()}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setIsEditName(false);
                              setName(startCase(user.name));
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ShowIf>
                        <ShowIf condition={updatingName}>
                          <CircularProgress size={15} />
                        </ShowIf>
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
                        <ShowIf condition={!updatingEmail}>
                          <IconButton
                            color="primary"
                            sx={{ marginRight: "5px" }}
                            onClick={onUpdateEmail}
                            disabled={email === user.email}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => setIsEditEmail(false)}>
                            <CloseIcon />
                          </IconButton>
                        </ShowIf>
                        <ShowIf condition={updatingEmail}>
                          <CircularProgress size={15} />
                        </ShowIf>
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
                      <ShowIf condition={user.role !== Role.SUPERADMIN}>
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
        <TabPanel value={tabIndex} index={1}></TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingModal;

type TabPanelProps = {
  children?: React.ReactNode;
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
