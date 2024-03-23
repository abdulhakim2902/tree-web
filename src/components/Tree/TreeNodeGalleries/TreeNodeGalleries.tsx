import { ImageList, ImageListItem, LinearProgress } from "@mui/material";
import { File } from "@tree/src/lib/services/file";
import { getGalleries } from "@tree/src/lib/services/node";
import Image from "next/image";
import React, { FC, useEffect, useState } from "react";

type TreeNodeGalleriesProps = {
  nodeId: string;
  newFile?: File;
};

export const TreeNodeGalleries: FC<TreeNodeGalleriesProps> = ({ nodeId, newFile }) => {
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

  if (loading) {
    return <LinearProgress />;
  }

  if (galleries.length === 0) {
    return <span>Unfortunately, we do not yet have photographs of this person.</span>;
  }

  return (
    <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
      {galleries.map((item) => (
        <ImageListItem key={item._id}>
          <Image src={item.url} alt={item.publicId} loading="lazy" width={250} height={250} />
        </ImageListItem>
      ))}
    </ImageList>
  );
};
