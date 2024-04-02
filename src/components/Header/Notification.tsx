import { Badge, Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { handleRequest } from "@tree/src/lib/services/user";
import {
  Notification as NotificationData,
  getNotifications,
  notificationCount,
  updateNotification,
} from "@tree/src/lib/services/notification";
import { useAuthContext } from "@tree/src/context/auth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ShowIf from "../show-if";
import { useSnackbar } from "notistack";

const Notification: FC = () => {
  const { isLoggedIn } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    notificationCount({ read: "false" }).then(({ count }) => setCount(count));
  }, [isLoggedIn]);

  const getNotification = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const notifications = await getNotifications({});
      setNotifications([...notifications]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onHandleRequest = async (action: string, notification: NotificationData) => {
    const requestId = notification.relatedModelId;
    if (loadingAction) return;
    if (!requestId) return;

    try {
      setLoadingAction(true);
      await handleRequest(requestId, action);
      await updateNotification(notification._id, { action: true });
      setCount((prev) => {
        if (!prev) return prev;
        return prev - 1;
      });
      setNotifications((prev) => prev.map((e) => Object.assign(e, { action: true, read: true })));
      enqueueSnackbar({
        variant: "success",
        message: action === "accept" ? "Role change is accepted" : "Role change is rejected",
      });
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const onReset = () => {
    setAnchorEl(null);
    setNotifications([]);
  };

  return (
    <React.Fragment>
      <Badge
        badgeContent={count}
        overlap="circular"
        sx={{ cursor: "pointer", mr: "10px" }}
        color="success"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          getNotification();
        }}
      >
        <Box
          component="span"
          sx={{
            bgcolor: "#e4e6eb",
            width: 35,
            height: 35,
            borderRadius: "50%",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <NotificationsIcon
            fontSize="large"
            sx={{
              color: anchorEl !== null ? "#0866ff" : "var(--background-color)",
            }}
          />
        </Box>
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        sx={{
          width: "440px",
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
        <Typography padding={2} variant="h4">
          Notifications
        </Typography>
        {notifications.map((notification) => {
          return (
            <MenuItem
              key={notification._id}
              sx={{
                ":hover": {
                  backgroundColor: "#2f2f5e",
                },
              }}
              style={{ whiteSpace: "normal", width: "420px" }}
            >
              <ListItemIcon>
                <AccountCircleIcon sx={{ color: "whitesmoke" }} fontSize="large" />
              </ListItemIcon>
              <ListItemText>
                <Box display="flex" justifyContent="space-between" alignItems="center" minHeight={31}>
                  <Typography fontSize={12}>{notification.message}</Typography>
                  <ShowIf condition={!notification.action}>
                    <Box component="span" minWidth={80}>
                      <Tooltip title="Accept request">
                        <IconButton
                          color="primary"
                          onClick={() => onHandleRequest("accept", notification)}
                          sx={{ mr: "2px" }}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject request">
                        <IconButton color="error" onClick={() => onHandleRequest("reject", notification)}>
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ShowIf>
                </Box>
              </ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </React.Fragment>
  );
};

export default Notification;
