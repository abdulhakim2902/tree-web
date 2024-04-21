import React, { FC, useState } from "react";
import {
  Avatar,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Role } from "@tree/src/types/user";
import { getNameSymbol, startCase } from "@tree/src/helper/string";

/* Modals */
import InvitePeopleModal from "../Modal/InvitePeopleModal";
import RequestRoleModal from "../Modal/RequestRoleModal";

/* Hooks */
import { useAuthContext } from "@tree/src/context/auth";
import { useCacheContext } from "@tree/src/context/cache";
import { useRouter } from "next/router";

/* Icons */
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountSettingModal from "../Modal/AccountSettingModal";

const menus = [
  {
    name: "account",
    text: "Account",
    icon: (sx?: SxProps<Theme>) => <AccountCircleIcon sx={sx} />,
  },
  {
    name: "invite",
    text: "Invite People",
    icon: (sx?: SxProps<Theme>) => <ForwardToInboxIcon sx={sx} />,
  },
  {
    name: "request",
    text: "Request Role",
    icon: (sx?: SxProps<Theme>) => <PersonAddAltIcon sx={sx} />,
  },
  {
    name: "families",
    text: "View Family",
    icon: (sx?: SxProps<Theme>) => <Diversity1Icon sx={sx} />,
  },
  {
    name: "logout",
    text: "Logout",
    icon: (sx?: SxProps<Theme>) => <LogoutIcon sx={sx} />,
  },
];

const User: FC = () => {
  const { clear } = useCacheContext();
  const { replace, push } = useRouter();
  const { isLoggedIn, user, logout } = useAuthContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openInvite, setOpenInvite] = useState<boolean>(false);
  const [openRequest, setOpenRequest] = useState<boolean>(false);
  const [openSetting, setOpenSetting] = useState<boolean>(false);

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
            bgcolor: "#2f2f5e",
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
          "& .MuiMenu-paper": {
            backgroundColor: "var(--background-color)",
            color: "whitesmoke",
          },
        }}
        onClose={onReset}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {menus.map((menu) => {
          if (menu.name === "invite" && user.role !== Role.SUPERADMIN) {
            return null;
          }

          if (menu.name === "request" && user.role === Role.SUPERADMIN) {
            return null;
          }

          return [
            <MenuItem
              key={menu.name}
              sx={{
                minHeight: "31px",
                ":hover": {
                  backgroundColor: "#2f2f5e",
                },
              }}
              onClick={() => {
                setAnchorEl(null);
                switch (menu.name) {
                  case "account":
                    setOpenSetting(true);
                    break;
                  case "invite":
                    setOpenInvite(true);
                    break;
                  case "request":
                    setOpenRequest(true);
                    break;
                  case "families":
                    push("/families");
                    break;
                  case "logout":
                    clear();
                    logout();
                    replace("/");
                    break;
                }
              }}
            >
              <ListItemIcon>{menu.icon({ color: "whitesmoke" })}</ListItemIcon>
              <ListItemText>
                <Typography fontSize={12}>{menu.name === "account" ? startCase(user.name) : menu.text}</Typography>
              </ListItemText>
            </MenuItem>,
            menu.name === "account" && <Divider variant="middle" />,
          ];
        })}
      </Menu>
      <AccountSettingModal
        user={user}
        open={openSetting}
        onClose={() => setOpenSetting(false)}
        onOpenRoleRequest={() => setOpenRequest(true)}
      />
      <InvitePeopleModal open={openInvite} onClose={() => setOpenInvite(false)} />
      <RequestRoleModal open={openRequest} onClose={() => setOpenRequest(false)} />
    </React.Fragment>
  );
};

export default User;
