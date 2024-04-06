import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridColDef, GridSlots, GridValidRowModel } from "@mui/x-data-grid";
import React, { FC } from "react";
import { CustomNoRowsOverlay, CustomPagination, StyledDataGrid } from "../DataGrid";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { startCase } from "lodash";
import { Role } from "@tree/src/types/user";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const color: Record<Role, "primary" | "secondary" | "warning" | "error"> = {
  [Role.GUEST]: "primary",
  [Role.CONTRIBUTOR]: "secondary",
  [Role.EDITOR]: "warning",
  [Role.SUPERADMIN]: "error",
};

const columns = (
  onHandleRequest: (id: string, action: string) => void,
  hiddenAction = false,
): GridColDef<GridValidRowModel>[] => {
  const data: GridColDef<GridValidRowModel>[] = [
    {
      field: "email",
      headerName: "Email",
      headerAlign: "center",
      align: "center",
      width: 150,
      renderHeader: (row) => <Typography style={{ fontSize: "11px" }}>{startCase(row.field)}</Typography>,
      renderCell: ({ row }) => <Typography>{row.email}</Typography>,
    },
    {
      field: "currentRole",
      headerName: "Current",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderHeader: (row) => <Typography style={{ fontSize: "11px" }}>{startCase(row.colDef.headerName)}</Typography>,
      renderCell: ({ row }) => {
        return (
          <Chip
            label={startCase(row.currentRole)}
            color={color[row.currentRole as Role]}
            size="small"
            sx={{ height: "50%" }}
          />
        );
      },
    },
    {
      field: "requestedRole",
      headerName: "Requested",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderHeader: (row) => <Typography style={{ fontSize: "11px" }}>{startCase(row.colDef.headerName)}</Typography>,
      renderCell: ({ row }) => {
        return (
          <Chip
            label={startCase(row.requestedRole)}
            color={color[row.requestedRole as Role]}
            size="small"
            sx={{ height: "50%" }}
          />
        );
      },
    },
  ];

  if (!hiddenAction) {
    data.push({
      field: "action",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderHeader: () => <React.Fragment />,
      renderCell: ({ row }) => {
        return (
          <Box display="flex" justifyContent="center" height="100%">
            <Tooltip title="Accept request">
              <IconButton color="primary" onClick={() => onHandleRequest(row._id, "accept")}>
                <CheckIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject request">
              <IconButton color="error" onClick={() => onHandleRequest(row._id, "reject")}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    });
  }

  return data;
};

type AcceptRequestModalProps = {
  open: boolean;
  error: string;
  success: string;
  loading: boolean;
  loadingAction: boolean;
  requestLists: any[];

  onClose: () => void;
  onHandleRequest: (id: string, action: string) => void;
};

const AcceptRequestModal: FC<AcceptRequestModalProps> = ({
  open,
  error,
  loading,
  loadingAction,
  success,
  requestLists,
  onClose,
  onHandleRequest,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (loadingAction) return;
        onClose();
      }}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
        },
      }}
    >
      <DialogTitle marginTop={2}>Request List</DialogTitle>
      <Divider />
      <DialogContent sx={{ marginBottom: "15px" }}>
        <DialogContentText sx={{ color: "whitesmoke" }}>
          Give others permission to view, contribute, or edit your tree. We’ll let you know when it’s been accessed.
        </DialogContentText>
        <Box
          sx={{
            height: 400,
            width: "100%",
            marginTop: "12px",
          }}
        >
          <StyledDataGrid
            sx={{ "--DataGrid-overlayHeight": "300px" }}
            rowHeight={35}
            rows={requestLists}
            columns={columns(onHandleRequest, requestLists.length <= 0)}
            columnHeaderHeight={35}
            getRowId={(row) => row._id}
            rowSelection={false}
            disableColumnSorting
            disableColumnMenu
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            loading={loading || loadingAction}
            pageSizeOptions={[5]}
            slots={{
              pagination: CustomPagination,
              loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
              noRowsOverlay: CustomNoRowsOverlay,
            }}
          />
        </Box>
        {error && (
          <TextField
            disabled
            value={error}
            fullWidth
            sx={{
              marginTop: 2,
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "whitesmoke",
              },
              backgroundColor: "#2f2f5e",
            }}
            InputProps={{
              startAdornment: <ErrorOutlineIcon sx={{ marginRight: 1 }} color="error" />,
            }}
          />
        )}
        {success && (
          <TextField
            disabled
            value={success}
            fullWidth
            sx={{
              marginTop: 2,
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "whitesmoke",
              },
              backgroundColor: "#2f2f5e",
            }}
            InputProps={{
              startAdornment: <CheckIcon sx={{ marginRight: 1 }} color="success" />,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AcceptRequestModal;
