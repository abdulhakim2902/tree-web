import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Modal,
  Typography,
} from "@mui/material";
import { File, upload } from "@tree/src/lib/services/file";
import { getGalleries, updateNodeProfile } from "@tree/src/lib/services/node";
import Image from "next/image";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useSnackbar } from "notistack";
import { useTreeNodeDataContext } from "@tree/src/context/data";

type GalleryModalProps = {
  current: string;
  nodeId: string;
  open: boolean;

  onClose: () => void;
};

const GalleryModal: FC<GalleryModalProps> = ({ current, nodeId, open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { updateNodeProfile: setNodeProfile } = useTreeNodeDataContext();

  const [loadGalleries, setLoadGalleries] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [galleries, setGalleries] = useState<File[]>([]);

  const fetchGalleries = useCallback(() => {
    if (!nodeId) return;
    setLoadGalleries(true);
    getGalleries(nodeId)
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
      const result = await upload(form);
      setGalleries([...galleries, result]);
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
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async () => {
    try {
      setLoading(true);

      await updateNodeProfile(nodeId);
      setNodeProfile(nodeId);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
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
              width: 500,
              height: 450,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <ImageList sx={{ width: 500, height: 450, mt: "20px" }} cols={3} rowHeight={164}>
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
                onClick={() => onSelect(item)}
              >
                <Image src={item.url} alt={item.publicId} loading="lazy" width={250} height={250} />
              </ImageListItem>
            ))}
          </ImageList>
        )}
        <Divider sx={{ backgroundColor: "whitesmoke" }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: "20px" }}>
          <Button variant="contained" startIcon={<CloudUploadIcon />} component="label" disabled={loading}>
            Upload media
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
