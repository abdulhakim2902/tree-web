import { Badge, Box } from "@mui/material";
import React, { FC, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { UserRequest, getRequest, handleRequest } from "@tree/src/lib/services/user";
import AcceptRequestModal from "../Modal/AcceptRequestModal";

const Notification: FC = () => {
  const [selected, setSelected] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  const getUserRequest = async () => {
    try {
      setOpen(true);
      setLoading(true);

      const requests = await getRequest();
      setRequests([...requests]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onHandleRequest = async (id: string, action: string) => {
    if (loadingAction) return;

    try {
      setLoadingAction(true);
      await handleRequest(id, action);
      setError("");
      setSuccess(action === "accept" ? "Role change is accepted" : "Role change is rejected");
      setRequests((prev) => prev.filter((e) => e._id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const onReset = () => {
    setError("");
    setSuccess("");
    setOpen(false);
    setRequests([]);
    setSelected(false);
  };

  return (
    <React.Fragment>
      <Badge
        badgeContent={25}
        overlap="circular"
        sx={{ cursor: "pointer", mr: "10px" }}
        color="success"
        onClick={() => {
          if (loading) return;
          if (!selected) {
            getUserRequest();
          }

          setSelected((prev) => !prev);
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
              color: selected ? "#0866ff" : "var(--background-color)",
            }}
          />
        </Box>
      </Badge>
      <AcceptRequestModal
        open={open}
        error={error}
        success={success}
        onClose={onReset}
        loading={loading}
        loadingAction={loadingAction}
        requestLists={requests}
        onHandleRequest={onHandleRequest}
      />
    </React.Fragment>
  );
};

export default Notification;
