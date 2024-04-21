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
  Typography,
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
import { removeFile, upload } from "@tree/src/lib/services/file";

/* Icons */
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { ScaleLoader } from "react-spinners";

const defaultShowPassword = {
  current: false,
  new: false,
};

const defaultIsEdit = {
  name: false,
  email: false,
};

const defaultPassword = {
  current: "",
  new: "",
};

const defaultUpdating = {
  name: false,
  email: false,
  password: false,
  profileImage: false,
};

const defaultIsError = {
  name: false,
  email: false,
  password: true,
};

const defaultErrorMessage = {
  name: "",
  email: "",
  password: "",
};

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
  const [tabIndex, setTabIndex] = useState<0 | 1>(0);
  const [isEdit, setIsEdit] = useState({ ...defaultIsEdit });
  const [isError, setIsError] = useState({ ...defaultIsError });
  const [password, setPassword] = useState({ ...defaultPassword });
  const [updating, setUpdating] = useState({ ...defaultUpdating });
  const [errorMessage, setErrorMessage] = useState({ ...defaultErrorMessage });
  const [showPassword, setShowPassword] = useState({ ...defaultShowPassword });

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const onUpdateName = async () => {
    if (!updating.name && !isError.name) {
      try {
        setUpdating((prev) => ({ ...prev, name: true }));

        await update({ name: name });
        const userProfile = await me();
        setCookie(USER_KEY, userProfile, { maxAge: DAY });
        setUser(userProfile);
        setName(startCase(userProfile.name));
        setIsEdit((prev) => ({ ...prev, name: false }));

        enqueueSnackbar({
          variant: "success",
          message: "Successfully change name",
        });
      } catch (err: any) {
        setName(user.name);
        setIsError((prev) => ({ ...prev, name: true }));
        setErrorMessage((prev) => ({ ...prev, name: err.message }));
      } finally {
        setUpdating((prev) => ({ ...prev, name: false }));
      }
    }
  };

  const onUpdateEmail = async () => {
    if (!updating.email && !isError.email) {
      try {
        setUpdating((prev) => ({ ...prev, email: true }));

        await update({ email: email });

        setEmail(user.email);
        setIsEdit((prev) => ({ ...prev, email: false }));
        onReset();

        enqueueSnackbar({
          variant: "success",
          message: "Please check your email to verify new email address.",
        });
      } catch (err: any) {
        setEmail(user.email);
        setIsError((prev) => ({ ...prev, email: true }));
        setErrorMessage((prev) => ({ ...prev, email: err.message }));
      } finally {
        setUpdating((prev) => ({ ...prev, email: false }));
      }
    }
  };

  const onUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length <= 0 || updating.profileImage) return;

    const file = files[0];
    const [id, profileImageURL] = user.profileImageURL?.split(";") ?? [];

    try {
      setUpdating((prev) => ({ ...prev, profileImage: true }));
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
        message: "Successfully change profile image.",
      });
    } catch (err: any) {
      setProfileURL(profileImageURL);
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setUpdating((prev) => ({ ...prev, profileImage: false }));
    }
  };

  const onUpdatePassword = async () => {
    console.log(updating, isError);
    if (!updating.password && !isError.password) {
      try {
        setUpdating((prev) => ({ ...prev, password: true }));
        console.log(password);
        await update({ password });

        setTabIndex(0);
        setPassword({ ...defaultPassword });
        enqueueSnackbar({
          variant: "success",
          message: "Successfully change password",
        });
      } catch (err: any) {
        setIsError((prev) => ({ ...prev, password: true }));
        setErrorMessage((prev) => ({ ...prev, password: err.message }));
        enqueueSnackbar({
          variant: "error",
          message: "Successfully change password",
        });
      } finally {
        setUpdating((prev) => ({ ...prev, password: false }));
      }
    }
  };

  const onReset = () => {
    setShowPassword({ ...defaultShowPassword });
    setErrorMessage({ ...defaultErrorMessage });
    setPassword({ ...defaultPassword });
    setIsError({ ...defaultIsError });
    setIsEdit({ ...defaultIsEdit });
    onClose();
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
        <Box>
          <Tabs value={tabIndex} onChange={(event, value) => setTabIndex(value)} aria-label="basic tabs example">
            <Tab label="Profile" sx={{ color: "whitesmoke" }} />
            <Tab label="Security" sx={{ color: "whitesmoke" }} />
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

                <ShowIf condition={updating.profileImage}>
                  <CircularProgress size={20} sx={{ position: "absolute", right: "45%", top: "45%" }} />
                </ShowIf>
                <input type="file" hidden={true} onChange={onUploadImage} disabled={updating.profileImage} />
              </Box>
            </Button>
            <Box ml={2} display="flex" flexDirection="column" width={300}>
              <TextField
                error={isError.name}
                helperText={errorMessage.name}
                value={name}
                onChange={(event) => {
                  if (isEdit.name) {
                    const value = event.target.value;
                    setName(value);
                    setIsError((prev) => ({ ...prev, name: !value }));
                    setErrorMessage((prev) => ({ ...prev, name: !value ? "Name cannot be empty" : "" }));
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
                disabled={!isEdit.name}
                InputLabelProps={{ style: { color: "grey" } }}
                InputProps={{
                  startAdornment: <AccountCircleIcon sx={{ color: "whitesmoke", marginRight: "10px" }} />,
                  endAdornment: (
                    <React.Fragment>
                      <ShowIf condition={!isEdit.name}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => setIsEdit((prev) => ({ ...prev, name: true }))}
                        >
                          Edit
                        </Button>
                      </ShowIf>
                      <ShowIf condition={isEdit.name}>
                        <ShowIf condition={!updating.name}>
                          <IconButton
                            color="primary"
                            sx={{ marginRight: "5px" }}
                            onClick={onUpdateName}
                            disabled={user.name.toLowerCase() === name.toLowerCase() || isError.name}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setName(startCase(user.name));
                              setIsEdit((prev) => ({ ...prev, name: false }));
                              setIsError((prev) => ({ ...prev, name: false }));
                              setErrorMessage((prev) => ({ ...prev, name: "" }));
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ShowIf>
                        <ShowIf condition={updating.name}>
                          <CircularProgress size={15} />
                        </ShowIf>
                      </ShowIf>
                    </React.Fragment>
                  ),
                }}
              />
              <TextField
                value={email}
                error={isError.email}
                helperText={errorMessage.email}
                onChange={(event) => {
                  if (isEdit.email) {
                    const value = event.target.value;
                    const valid = emailValidation.validate(value);
                    setEmail(event.target.value);
                    setIsError((prev) => ({ ...prev, email: !valid }));
                    setErrorMessage((prev) => ({ ...prev, email: !valid ? "Invalid email format" : "" }));
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
                disabled={!isEdit.email}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: "whitesmoke", marginRight: "10px" }} />,
                  endAdornment: (
                    <React.Fragment>
                      <ShowIf condition={!isEdit.email}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => setIsEdit((prev) => ({ ...prev, email: true }))}
                        >
                          Edit
                        </Button>
                      </ShowIf>
                      <ShowIf condition={isEdit.email}>
                        <ShowIf condition={!updating.email}>
                          <IconButton
                            color="primary"
                            sx={{ marginRight: "5px" }}
                            onClick={onUpdateEmail}
                            disabled={email === user.email || isError.email}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setEmail(user.email);
                              setIsEdit((prev) => ({ ...prev, email: false }));
                              setIsError((prev) => ({ ...prev, email: false }));
                              setErrorMessage((prev) => ({ ...prev, email: "" }));
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ShowIf>
                        <ShowIf condition={updating.email}>
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
        <TabPanel value={tabIndex} index={1}>
          <Box display="flex" flexDirection="column">
            <Typography marginBottom={2}>Enter your current password and then create a new one.</Typography>
            <TextField
              id="password"
              placeholder="Current password"
              type={showPassword.current ? "text" : "password"}
              value={password.current}
              onChange={(event) => {
                const valid = password.new.length >= 6 && event.target.value.length >= 6;
                setPassword((prev) => ({ ...prev, current: event.target.value }));
                setIsError((prev) => ({ ...prev, password: !valid }));
              }}
              fullWidth
              sx={{ input: { color: "whitesmoke" }, marginBottom: "10px" }}
              InputLabelProps={{ sx: { color: "grey" } }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                    sx={{ color: "whitesmoke" }}
                  >
                    {showPassword.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              id="password"
              placeholder="New password"
              type={showPassword.new ? "text" : "password"}
              value={password.new}
              onChange={(event) => {
                const valid = password.current.length >= 6 && event.target.value.length >= 6;
                setPassword((prev) => ({ ...prev, new: event.target.value }));
                setIsError((prev) => ({ ...prev, password: !valid }));
              }}
              fullWidth
              sx={{ input: { color: "whitesmoke" }, marginBottom: "20px" }}
              InputLabelProps={{ sx: { color: "grey" } }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                    sx={{ color: "whitesmoke" }}
                  >
                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <Button
              color="primary"
              variant="contained"
              sx={{ alignItems: "right" }}
              disabled={isError.password}
              onClick={onUpdatePassword}
            >
              {updating.password ? <ScaleLoader color="whitesmoke" height={10} /> : "Confirm"}
            </Button>
          </Box>
        </TabPanel>
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
