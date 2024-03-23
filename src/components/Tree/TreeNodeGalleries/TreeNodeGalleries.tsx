import { Box, IconButton, ImageList, ImageListItem, LinearProgress, useMediaQuery, useTheme } from "@mui/material";
import { File, remove } from "@tree/src/lib/services/file";
import { getGalleries } from "@tree/src/lib/services/node";
import React, { FC, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";

type TreeNodeGalleriesProps = {
  nodeId: string;
  current?: string;
  newFile?: File;
};

export const TreeNodeGalleries: FC<TreeNodeGalleriesProps> = ({ nodeId, newFile, current }) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));

  const { enqueueSnackbar } = useSnackbar();

  const [galleries, setGalleries] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGalleries = async (id: string) => {
      setLoading(true);

      try {
        const files = await getGalleries(id);
        setGalleries(files);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries(nodeId);
  }, [nodeId]);

  useEffect(() => {
    if (!newFile) return;
    setGalleries((prev) => [...prev, newFile]);
  }, [newFile]);

  const removeGallery = async (id: string) => {
    try {
      await remove(id);
      setGalleries((prev) => prev.filter((e) => e._id != id));
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (galleries.length === 0) {
    return <span>Unfortunately, we do not yet have photographs of this person.</span>;
  }

  return (
    <ImageList cols={mobile ? 2 : 3} gap={8} variant="masonry">
      {galleries.map((item) => (
        <ImageListItem key={item._id}>
          <Box position="relative">
            {current !== item.url && (
              <IconButton
                sx={{
                  position: "absolute",
                  color: "whitesmoke",
                  right: "2%",
                  bottom: "2%",
                  backgroundColor: "grey",
                }}
                onClick={() => removeGallery(item._id)}
              >
                <DeleteIcon />
              </IconButton>
            )}

            <img src={item.url} alt={item.publicId} loading="lazy" />
          </Box>
        </ImageListItem>
      ))}
    </ImageList>
  );
};
