import React, { FC, createRef, useEffect, useMemo, useRef, useState } from "react";

import { NotificationSkeletons } from "../Skeleton/NotificationSkeleton";
import {
  Badge,
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ShowIf from "../show-if";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import parse from "html-react-parser";

/* API Services */
import { handleRequest, handleInvitation, handleRegistration } from "@tree/src/lib/services/user";
import {
  Notification,
  NotificationType,
  getNotifications,
  notificationCount,
  readNotification,
  readAllNotification,
} from "@tree/src/lib/services/notification";
import { useRouter } from "next/router";

/* Hooks */
import { useAuthContext } from "@tree/src/context/auth";
import { useSnackbar } from "notistack";
import { useSocketContext } from "@tree/src/context/socket";

/* Icons */
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MarkunreadIcon from "@mui/icons-material/Markunread";
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread";
import NotificationsIcon from "@mui/icons-material/Notifications";

dayjs.extend(relativeTime);

const Notifications: FC = () => {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { isLoggedIn, logout, user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { isConnected, socket } = useSocketContext();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [count, setCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const buttonRefs = useMemo(() => {
    const refs = Object.fromEntries(notifications.map((e) => [e._id, createRef<HTMLButtonElement>()]));
    return refs;
  }, [notifications]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const controller = new AbortController();
    const signal = controller.signal;
    getNotificationCount(signal);

    return () => controller.abort();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !anchorEl) return;
    const controller = new AbortController();
    const signal = controller.signal;
    getNotification(signal);

    return () => controller.abort();
  }, [isLoggedIn, anchorEl]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isConnected && user) {
      socket.on(`notification:${user.id}`, (data: { count: number; action?: string }) => {
        const { count, action } = data;
        if (action === "logout") {
          logout();
          socket.off(`notification:${user.id}`, () => {
            console.log("Close notifications event");
          });
          enqueueSnackbar({
            variant: "success",
            message: "Admin accepted your change request. Please sign in again to make changes.",
          });
        } else {
          setCount(count);
          enqueueSnackbar({
            variant: "success",
            message: "You have a new notification",
          });
        }
      });
    }

    return () => {
      if (isConnected && user) {
        socket.off(`notification:${user.id}`, () => {
          console.log("Close notifications event");
        });
      }
    };
  }, [isConnected, user]);

  const getNotificationCount = async (signal?: AbortSignal) => {
    try {
      const { count } = await notificationCount({ read: "false" });
      setCount(count);
    } catch {
      // ignore
    }
  };

  const getNotification = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const notifications = await getNotifications({}, signal);
      setNotifications([...notifications]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onHandleRequest = async (action: string, notification: Notification) => {
    const referenceId = notification.referenceId;
    if (!referenceId) return;

    const buttonRef = buttonRefs[notification._id];
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        await handleRequest(referenceId, action);
        setCount((prev) => {
          if (!prev) return prev;
          return prev - 1;
        });
        setNotifications((prev) =>
          prev.map((e) => {
            if (e._id === notification._id) {
              Object.assign(e, { read: true, action: false });
            }

            return e;
          }),
        );
        enqueueSnackbar({
          variant: "success",
          message: action === "accept" ? "Role change is accepted" : "Role change is rejected",
        });
      } catch (err: any) {
        enqueueSnackbar({
          variant: "error",
          message: err.message,
        });
      }

      buttonRef.current.disabled = false;
    }
  };

  const onHandleInvitation = async (action: string, notification: Notification) => {
    const referenceId = notification.referenceId;
    if (!referenceId) return;

    const buttonRef = buttonRefs[notification._id];
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        const newNotification = await handleInvitation(referenceId, action);
        setNotifications((prev) => [
          newNotification,
          ...prev.map((e) => {
            if (e._id === notification._id) {
              Object.assign(e, { read: true, action: false });
            }

            return e;
          }),
        ]);
        enqueueSnackbar({
          variant: "success",
          message: action === "accept" ? "Invitation is accepted. Please sign in again" : "Invitation is rejected",
        });
        if (action === "accept") {
          logout();
          router.replace("/");
        }
      } catch (err: any) {
        enqueueSnackbar({
          variant: "error",
          message: err.message,
        });
      }

      buttonRef.current.disabled = false;
    }
  };

  const onHandleRegistration = async (action: string, notification: Notification) => {
    const referenceId = notification.referenceId;
    if (!referenceId) return;

    const buttonRef = buttonRefs[notification._id];
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        const response = await handleRegistration(referenceId, action);
        setCount((prev) => {
          if (!prev) return prev;
          return prev - 1;
        });
        setNotifications((prev) =>
          prev.map((e) => {
            if (e._id === notification._id) {
              Object.assign(e, { read: true, action: false });
            }

            return e;
          }),
        );
        enqueueSnackbar({
          variant: "success",
          message: response.message,
        });
      } catch (err: any) {
        enqueueSnackbar({
          variant: "error",
          message: err.message,
        });
      }

      buttonRef.current.disabled = false;
    }
  };

  const onReadNotification = async (id: string) => {
    const buttonRef = buttonRefs[id];
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        await readNotification(id);
        setCount((prev) => {
          if (!prev) return prev;
          return prev - 1;
        });
        setNotifications((prev) =>
          prev.map((e) => {
            if (e._id === id) {
              Object.assign(e, { read: true });
            }

            return e;
          }),
        );
      } catch (err) {
        // ignore
        console.log(err);
      }

      buttonRef.current.disabled = false;
    }
  };

  const handleAction = (action: string, notification: Notification) => {
    if (notification.type === NotificationType.REQUEST) {
      onHandleRequest(action, notification);
    }

    if (notification.type === NotificationType.INVITATION) {
      onHandleInvitation(action, notification);
    }

    if (notification.type === NotificationType.REGISTRATION) {
      onHandleRegistration(action, notification);
    }
  };

  const onReadAllNotification = async () => {
    if (count <= 0) return;
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        await readAllNotification();
        setCount(0);
        setNotifications((prev) => prev.map((e) => Object.assign(e, { read: true })));
      } catch (err) {
        // ignore
      }

      buttonRef.current.disabled = false;
    }
  };

  const notificationTextWidth = (notification: Notification) => {
    if (!notification.action) {
      if (notification.read) return "100%";
      return "85%";
    }

    return "85%";
  };

  const notificationIconWidth = (notification: Notification) => {
    if (!notification.action) {
      if (notification.read) return "0%";
      return "15%";
    }

    return "15%";
  };

  return (
    <React.Fragment>
      <Badge
        badgeContent={count}
        overlap="circular"
        color="success"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          cursor: "pointer",
          mr: "10px",
        }}
      >
        <Box
          component="span"
          sx={{
            bgcolor: "#e4e6eb",
            height: mobile ? "30px" : "35px",
            width: mobile ? "30px" : "35px",
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
          marginTop: "5px",
          "& .MuiMenu-paper": {
            backgroundColor: "var(--background-color)",
            color: "whitesmoke",
          },
        }}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box display="flex" justifyContent="space-between" padding={2}>
          <Typography variant="h4">Notifications</Typography>
          <ShowIf condition={notifications.length > 0}>
            <Tooltip title="Mark read all">
              <IconButton
                ref={buttonRef}
                sx={{ color: count <= 0 ? "#5C5470" : "whitesmoke" }}
                onClick={count <= 0 ? undefined : onReadAllNotification}
              >
                <MarkAsUnreadIcon />
              </IconButton>
            </Tooltip>
          </ShowIf>
        </Box>
        {loading ? (
          NotificationSkeletons(5)
        ) : notifications.length > 0 ? (
          notifications.map((notification) => {
            return (
              <Paper
                key={notification._id}
                sx={{
                  width: 320,
                  maxWidth: "100%",
                  margin: 1,
                  backgroundColor: "#1d1d3b",
                  ":hover": {
                    backgroundColor: "#2f2f5e",
                  },
                }}
              >
                <MenuList key={notification._id}>
                  <MenuItem style={{ whiteSpace: "normal" }} disableRipple sx={{ cursor: "default" }}>
                    <ListItemIcon>
                      <AccountCircleIcon sx={{ color: "whitesmoke" }} fontSize="large" />
                    </ListItemIcon>
                    <ListItemText>
                      <Box display="flex" justifyContent="space-between" alignItems="center" minHeight={31}>
                        <Typography
                          fontSize={12}
                          sx={{ color: notification.read ? "#5C5470" : "whitesmoke" }}
                          width={notificationTextWidth(notification)}
                        >
                          {parse(notification.message)}
                        </Typography>
                        <ShowIf condition={notification.action}>
                          <Box
                            component="div"
                            display="flex"
                            justifyContent="space-evenly"
                            width={notificationIconWidth(notification)}
                          >
                            <Tooltip title="Accept request">
                              <IconButton
                                ref={buttonRefs[notification._id]}
                                color="primary"
                                onClick={() => handleAction("accept", notification)}
                                sx={{ mr: "2px" }}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject request">
                              <IconButton
                                ref={buttonRefs[notification._id]}
                                color="error"
                                onClick={() => handleAction("reject", notification)}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ShowIf>
                        <ShowIf condition={!notification.action && !notification.read}>
                          <Box
                            component="div"
                            display="flex"
                            justifyContent="space-evenly"
                            width={notificationIconWidth(notification)}
                          >
                            <Tooltip title="Mark as unread">
                              <IconButton
                                ref={buttonRefs[notification._id]}
                                onClick={() => onReadNotification(notification._id)}
                                sx={{ mr: "2px", color: "whitesmoke" }}
                              >
                                <MarkunreadIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ShowIf>
                      </Box>
                      <Typography sx={{ color: !notification.read ? "#2196f3" : "#e3e1d9", mt: "8px" }}>
                        {dayjs(notification.createdAt).fromNow()}
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                </MenuList>
              </Paper>
            );
          })
        ) : (
          <Box
            sx={{
              width: "336px",
              height: "400px",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" component="div">
              No notification
            </Typography>
            <Typography variant="h5" component="div" sx={{ color: "#5C5470" }}>
              You don&apos;t have notification
            </Typography>
          </Box>
        )}
      </Menu>
    </React.Fragment>
  );
};

export default Notifications;
