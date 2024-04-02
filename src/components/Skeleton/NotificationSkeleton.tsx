import { ListItemIcon, ListItemText, MenuItem, Skeleton } from "@mui/material";
import { FC } from "react";

const NotificationSkeleton: FC = () => {
  return (
    <MenuItem style={{ whiteSpace: "normal", width: "420px" }}>
      <ListItemIcon>
        <Skeleton sx={{ bgcolor: "grey.800" }} variant="circular" width={30} height={30} />
      </ListItemIcon>
      <ListItemText>
        <Skeleton sx={{ bgcolor: "grey.800" }} variant="rectangular" width={340} height={31} />
      </ListItemText>
    </MenuItem>
  );
};

export default NotificationSkeleton;

export const NotificationSkeletons = (n: number) => {
  return Array(n)
    .fill(0)
    .map((e, i) => <NotificationSkeleton key={i} />);
};
