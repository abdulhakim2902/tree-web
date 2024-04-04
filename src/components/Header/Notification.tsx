import {
  Badge,
  Box,
  Divider,
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
import React, { FC, createRef, useEffect, useMemo, useRef, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { handleRequest, handleInvitation } from "@tree/src/lib/services/user";
import {
  Notification as NotificationData,
  NotificationType,
  getNotifications,
  notificationCount,
  updateNotification,
} from "@tree/src/lib/services/notification";
import { useAuthContext } from "@tree/src/context/auth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MarkunreadIcon from "@mui/icons-material/Markunread";
import ShowIf from "../show-if";
import { useSnackbar } from "notistack";
import { NotificationSkeletons } from "../Skeleton/NotificationSkeleton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";

dayjs.extend(relativeTime);

const Notification: FC = () => {
  const router = useRouter();

  const { isLoggedIn, logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [count, setCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

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

  const onHandleRequest = async (action: string, notification: NotificationData) => {
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

  const onHandleInvitation = async (action: string, notification: NotificationData) => {
    const referenceId = notification.referenceId;
    if (!referenceId) return;

    const buttonRef = buttonRefs[notification._id];
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        const newNotification = await handleInvitation(referenceId, action);
        setCount((prev) => {
          if (!prev) return prev;
          return prev - 1;
        });
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

  const onReadNotification = async (id: string) => {
    const buttonRef = buttonRefs[id];
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        await updateNotification(id);
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
      }

      buttonRef.current.disabled = false;
    }
  };

  const handleAction = (action: string, notification: NotificationData) => {
    if (notification.type === NotificationType.REQUEST) {
      onHandleRequest(action, notification);
    }

    if (notification.type === NotificationType.INVITATION) {
      onHandleInvitation(action, notification);
    }
  };

  const onClose = () => {
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
        onClick={(event) => setAnchorEl(event.currentTarget)}
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
        onClose={onClose}
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
        <Divider sx={{ bgcolor: "whitesmoke" }} />
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
                  <MenuItem style={{ whiteSpace: "normal" }} sx={{}}>
                    <ListItemIcon>
                      <AccountCircleIcon sx={{ color: "whitesmoke" }} fontSize="large" />
                    </ListItemIcon>
                    <ListItemText>
                      <Box display="flex" justifyContent="space-between" alignItems="center" minHeight={31}>
                        <Typography fontSize={12} sx={{ color: notification.read ? "#5C5470" : "whitesmoke" }}>
                          {notification.message}
                        </Typography>
                        <ShowIf condition={notification.action}>
                          <Box minWidth={60}>
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
                          <Tooltip title="Mark as unread">
                            <IconButton
                              ref={buttonRefs[notification._id]}
                              onClick={() => onReadNotification(notification._id)}
                              sx={{ mr: "2px", color: "whitesmoke" }}
                            >
                              <MarkunreadIcon />
                            </IconButton>
                          </Tooltip>
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
          <Box sx={{ width: "440px", height: "300px", display: "flex", justifyContent: "center" }}>
            <Typography
              component="div"
              alignItems="center"
              sx={{ display: "flex", flexDirection: "row" }}
              fontSize={14}
            >
              No notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </React.Fragment>
  );
};

export default Notification;
