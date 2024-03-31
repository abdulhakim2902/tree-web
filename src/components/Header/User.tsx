import { useAuthContext } from "@tree/src/context/auth";
import {
  Avatar,
  Badge,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import React, { FC, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { useRouter } from "next/router";
import { makeStyles } from "@mui/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import { getNameSymbol, startCase } from "@tree/src/helper/string";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import ShowIf from "../show-if";
import InvitePeopleModal from "../Modal/InvitePeopleModal";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { Role } from "@tree/src/types/user";
import RequestRoleModal from "../Modal/RequestRoleModal";

const useStyles = makeStyles(() => ({
  paper: {
    background: "var(--background-color)",
    color: "whitesmoke",
  },
}));

const User: FC = () => {
  const classes = useStyles();

  const { isLoggedIn, user, logout } = useAuthContext();
  const { clearNodes } = useTreeNodeDataContext();
  const { replace, push } = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openInvite, setOpenInvite] = useState<boolean>(false);
  const [openRequest, setOpenRequest] = useState<boolean>(false);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const onReset = () => {
    setAnchorEl(null);
    setOpenInvite(false);
    setOpenRequest(false);
  };

  if (!isLoggedIn || !user) return <React.Fragment />;
  return (
    <React.Fragment>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ cursor: "pointer" }}
        badgeContent={
          <KeyboardArrowDownIcon
            sx={{
              backgroundColor: "grey",
              borderRadius: "100%",
              borderColor: "var(--background-color)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          />
        }
      >
        <Avatar
          sx={{
            bgcolor: deepOrange[500],
            opacity: 1,
            ":hover": { opacity: 0.9 },
            height: mobile ? "30px" : "35px",
            width: mobile ? "30px" : "35px",
          }}
        >
          <Typography sx={{ color: "whitesmoke" }}>{getNameSymbol(user.name)}</Typography>
        </Avatar>
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        sx={{
          marginTop: "5px",
          "& .MuiMenu-paper": { backgroundColor: "var(--background-color)", color: "whitesmoke" },
        }}
        onClose={onReset}
        classes={classes}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <AccountCircleIcon sx={{ color: "whitesmoke" }} />
          </ListItemIcon>
          <ListItemText>{startCase(user.name)}</ListItemText>
        </MenuItem>
        <ShowIf condition={user.role === Role.SUPERADMIN}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setOpenInvite(true);
            }}
          >
            <ListItemIcon>
              <ForwardToInboxIcon sx={{ color: "whitesmoke" }} />
            </ListItemIcon>
            <ListItemText>Invite People</ListItemText>
          </MenuItem>
        </ShowIf>
        <ShowIf condition={user.role !== Role.SUPERADMIN}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setOpenRequest(true);
            }}
          >
            <ListItemIcon>
              <PersonAddAltIcon sx={{ color: "whitesmoke" }} />
            </ListItemIcon>
            <ListItemText>Request Role</ListItemText>
          </MenuItem>
        </ShowIf>
        <MenuItem
          onClick={() => {
            push("/families");
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Diversity1Icon sx={{ color: "whitesmoke" }} />
          </ListItemIcon>
          <ListItemText>Families</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            await replace("/");
            logout();
            clearNodes();
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: "whitesmoke" }} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
      <InvitePeopleModal open={openInvite} onClose={() => setOpenInvite(false)} />
      <RequestRoleModal open={openRequest} onClose={() => setOpenRequest(false)} />
    </React.Fragment>
  );
};

export default User;
