import { ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Skeleton } from "@mui/material";
import { FC } from "react";

const NotificationSkeleton: FC = () => {
  return (
    <Paper
      sx={{
        width: 320,
        maxWidth: "100%",
        margin: 1,
        backgroundColor: "#1d1d3b",
      }}
    >
      <MenuList>
        <MenuItem style={{ whiteSpace: "normal" }}>
          <ListItemIcon>
            <Skeleton sx={{ bgcolor: "grey.800" }} variant="circular" width={30} height={30} />
          </ListItemIcon>
          <ListItemText>
            <Skeleton sx={{ bgcolor: "grey.800" }} variant="rectangular" width="100%" height={31} />
            <Skeleton sx={{ bgcolor: "grey.800", marginTop: "5px" }} variant="rectangular" width="20%" height={10} />
          </ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  );
};

export default NotificationSkeleton;

export const NotificationSkeletons = (n: number) => {
  return Array(n)
    .fill(0)
    .map((e, i) => <NotificationSkeleton key={i} />);
};
