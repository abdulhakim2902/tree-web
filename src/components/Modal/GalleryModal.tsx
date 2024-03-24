import {
  Box,
  Button,
  CircularProgress,
  ImageList,
  ImageListItem,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { File, nodeFiles, upload } from "@tree/src/lib/services/file";
import { updateNodeProfile } from "@tree/src/lib/services/node";
import React, { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useSnackbar } from "notistack";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import ShowIf from "../show-if";

type GalleryModalProps = {
  current?: string;
  nodeId: string;
  open: boolean;

  onClose: () => void;
};

const GalleryModal: FC<GalleryModalProps> = ({ current, nodeId, open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { updateNodeProfile: setNodeProfile } = useTreeNodeDataContext();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loadGalleries, setLoadGalleries] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [galleries, setGalleries] = useState<File[]>([]);

  const fetchGalleries = useCallback(() => {
    if (!nodeId) return;
    setLoadGalleries(true);
    nodeFiles(nodeId)
      .then(setGalleries)
      .finally(() => setLoadGalleries(false));
  }, [nodeId]);

  useEffect(() => {
    if (!open) return;
    fetchGalleries();
  }, [open, fetchGalleries]);

  const onUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files?.length <= 0) return;
    const file = files[0];
    const form = new FormData();
    form.append("file", file);
    form.set("nodeId", nodeId);

    try {
      setLoading(true);
      setGalleries([...galleries, { _id: "new", url: URL.createObjectURL(file), publicId: "new", assetId: "new" }]);
      const result = await upload(form);
      setGalleries((prev) => {
        return prev.map((e) => {
          if (e._id === "new") {
            e._id = result._id;
            e.assetId = result.assetId;
            e.publicId = result.publicId;
          }

          return e;
        });
      });
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSelect = async (file: File) => {
    if (file.url === current) return;

    try {
      await updateNodeProfile(nodeId, file._id);
      setNodeProfile(nodeId, file);
      onClose();
      enqueueSnackbar({
        variant: "success",
        message: "Successfully update profile image",
      });
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    }
  };

  const onRemove = async () => {
    try {
      await updateNodeProfile(nodeId);
      setNodeProfile(nodeId);
      onClose();
      enqueueSnackbar({
        variant: "success",
        message: "Successfully remove profile image",
      });
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (loading && reason === "backdropClick") return;
        if (loading && reason === "escapeKeyDown") return;
        onClose();
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: mobile ? "90%" : 560,
          transform: "translate(-50%, -50%)",
          bgcolor: "var(--background-color)",
          borderRadius: "10px",
          p: 4,
        }}
      >
        <Typography variant="h4" component="h2">
          Add media
        </Typography>
        {loadGalleries ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <React.Fragment>
            <ImageList sx={{ mt: "20px" }} cols={mobile ? 2 : 3} gap={8} variant="masonry">
              {galleries.map((item) => (
                <ImageListItem
                  key={item._id}
                  sx={{
                    opacity: current === item.url ? "50%" : "100%",
                    cursor: current === item.url ? "default" : "pointer",
                    ":hover": {
                      opacity: current === item.url ? "50%" : "75%",
                    },
                  }}
                  onClick={!loading ? () => onSelect(item) : () => {}}
                >
                  <Box position="relative">
                    <img src={item.url} alt={item.publicId} loading="lazy" />
                    <ShowIf condition={item._id === "new" && loading}>
                      <CircularProgress size={20} sx={{ position: "absolute", right: "45%", top: "45%" }} />
                    </ShowIf>
                  </Box>
                </ImageListItem>
              ))}
            </ImageList>
          </React.Fragment>
        )}
        <Divider sx={{ backgroundColor: "whitesmoke", mt: "20px" }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: "20px" }}>
          <Button variant="contained" startIcon={<CloudUploadIcon />} component="label">
            {loading ? "Uploading..." : "Upload media"}
            <input type="file" hidden={true} onChange={onUploadImage} disabled={loading} />
          </Button>
          <Button variant="outlined" onClick={onRemove}>
            Remove profile image
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GalleryModal;
