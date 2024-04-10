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
import React, { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useSnackbar } from "notistack";
import ShowIf from "../show-if";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { ScaleLoader } from "react-spinners";

type GalleryModalProps = {
  node: TreeNodeDataWithRelations;
  open: boolean;

  onClose: () => void;
  onAction: (id: string, data?: File) => Promise<void>;
};

const GalleryModal: FC<GalleryModalProps> = ({ node, open, onClose, onAction }) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { enqueueSnackbar } = useSnackbar();

  const [loadGalleries, setLoadGalleries] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [galleries, setGalleries] = useState<File[]>([]);

  const fetchGalleries = useCallback(() => {
    setLoadGalleries(true);
    nodeFiles(node.id)
      .then(setGalleries)
      .finally(() => setLoadGalleries(false));
  }, [node.id]);

  useEffect(() => {
    if (open) {
      fetchGalleries();
    }
  }, [open, fetchGalleries]);

  const onUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length <= 0 || loading) return;

    const file = files[0];
    const form = new FormData();
    form.append("file", file);
    form.set("nodeId", node.id);

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
    if (file.url === node.profileImageURL) return;

    try {
      await onAction(node.id, file);

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
      await onAction(node.id);

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
    <Modal open={open} onClose={loading ? undefined : onClose}>
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
                    opacity: node.profileImageURL === item.url ? "50%" : "100%",
                    cursor: node.profileImageURL === item.url ? "default" : "pointer",
                    ":hover": {
                      opacity: node.profileImageURL === item.url ? "50%" : "75%",
                    },
                  }}
                  onClick={!loading ? () => onSelect(item) : undefined}
                >
                  {/* eslint-disable @next/next/no-img-element */}
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
            {loading ? <ScaleLoader color="whitesmoke" height={10} width={2} /> : "Upload media"}
            <input type="file" hidden={true} onChange={onUploadImage} disabled={loading} />
          </Button>
          <Button variant="outlined" onClick={onRemove} disabled={loading}>
            Remove profile image
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GalleryModal;
