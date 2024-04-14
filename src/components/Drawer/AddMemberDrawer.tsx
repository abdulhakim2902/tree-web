import {
  Box,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { FC, useEffect, useState } from "react";
import { capitalize } from "lodash";

import ShowIf from "../show-if";
import ChildForm from "../Form/ChildForm";
import SpouseForm from "../Form/SpouseForm";
import SiblingForm from "../Form/SiblingForm";
import ParentForm from "../Form/ParentForm";

/* Hooks */
import { useCacheContext } from "@tree/src/context/cache";
import { useSnackbar } from "notistack";
import { useSocketContext } from "@tree/src/context/socket";

/* Icons */
import SearchIcon from "@mui/icons-material/Search";

type AddMemberDrawerProps = {
  node: TreeNodeDataWithRelations;
  open: boolean;

  onClose: () => void;
  onAction: (id: string, data: any, type: string) => Promise<string[]>;
};

const AddMemberDrawer: FC<AddMemberDrawerProps> = ({ node, open, onClose, onAction }) => {
  const { del } = useCacheContext();
  const { socket } = useSocketContext();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState<boolean>(false);
  const [type, setType] = useState<string>("");
  const [option, setOption] = useState<"new" | "tree">("new");

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (open) {
      setType("");
      setOption("new");
      del(`spouse-${node.id}`);
    }
  }, [open, node]);

  const onAddNode = async (data: any) => {
    try {
      setLoading(true);

      const ids = await onAction(node.id, data, type);

      onClose();
      enqueueSnackbar({
        variant: "success",
        message: "New member is added to the family",
      });

      if (socket && ids.length > 0) {
        socket.emit("nodes", { nodeId: ids[0], action: "add" });
      }
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
    <Drawer
      open={open}
      onClose={loading ? undefined : onClose}
      anchor="right"
      PaperProps={{ sx: { backgroundColor: "var(--background-color)", width: "350px" } }}
    >
      <Box sx={{ p: 3 }}>
        <ShowIf condition={!Boolean(type)}>
          <Typography variant="h5" component="h3" sx={{ color: "whitesmoke" }}>
            Add relative for {node.fullname}
          </Typography>

          <Typography variant="h4" component="h3" sx={{ color: "whitesmoke", mt: 3 }}>
            Who would you like to add?
          </Typography>

          <Grid container rowSpacing={3} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: 1 }}>
            {["parent", "child", "spouse", "brother", "sister"].map((e) => {
              const expandable = node?.metadata?.expandable;

              switch (e) {
                case "parent": {
                  const parents = node?.parents ?? [];
                  if (parents.length > 0 || expandable?.parents) {
                    return;
                  }

                  break;
                }

                case "child": {
                  const spouses = node?.spouses ?? [];
                  if (spouses.length <= 0 && !expandable?.spouses) {
                    return;
                  }

                  break;
                }

                case "brother":
                case "sister":
                  const parentSiblings = node?.parents ?? [];
                  if (parentSiblings.length <= 0 && !expandable?.parents) {
                    return;
                  }

                  break;

                case "spouse":
                  const totalSpouses = node?.metadata?.totalSpouses ?? 0;
                  const maxSpouse = node?.metadata?.maxSpouses ?? 0;
                  if (totalSpouses >= maxSpouse) {
                    return;
                  }

                  break;
              }
              return (
                <Grid item xs={6} key={e} onClick={() => setType(e)}>
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: "center",
                      cursor: "pointer",
                      ":hover": {
                        backgroundColor: "snow",
                      },
                    }}
                  >
                    <Typography variant="h6" component="h3">
                      {capitalize(e)}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </ShowIf>
        <ShowIf condition={Boolean(type)}>
          <Typography variant="h5" component="h3" sx={{ color: "whitesmoke" }}>
            {`Add a ${type} for ${node.fullname}`}
          </Typography>

          <FormControl sx={{ mt: 3 }}>
            <RadioGroup
              row
              sx={{ color: "whitesmoke" }}
              value={option}
              onChange={(event) => setOption(event.target.value as "new" | "tree")}
            >
              <FormControlLabel
                value="new"
                control={<Radio />}
                label="New person"
                componentsProps={{ typography: { variant: "h6" } }}
              />
              <FormControlLabel
                value="tree"
                control={<Radio />}
                label="From your tree"
                componentsProps={{ typography: { variant: "h6" } }}
              />
            </RadioGroup>
          </FormControl>

          <ShowIf condition={option === "new"}>
            <ShowIf condition={type === "parent"}>
              <ParentForm onSave={onAddNode} onCancel={onClose} loading={loading} />
            </ShowIf>

            <ShowIf condition={type === "brother" || type === "sister"}>
              <SiblingForm onSave={onAddNode} onCancel={onClose} loading={loading} relative={type} />
            </ShowIf>

            <ShowIf condition={type === "spouse"}>
              <SpouseForm onSave={onAddNode} onCancel={onClose} loading={loading} node={node} />
            </ShowIf>

            <ShowIf condition={type === "child"}>
              <ChildForm onSave={onAddNode} onCancel={onClose} loading={loading} node={node} />
            </ShowIf>
          </ShowIf>

          <ShowIf condition={option === "tree"}>
            <TextField
              id="search"
              sx={{ mt: 3, input: { color: "whitesmoke" } }}
              size="small"
              fullWidth
              placeholder="Search tree"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: "whitesmoke", cursor: "pointer", opacity: 0.8, ":hover": { opacity: 1 } }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </ShowIf>
        </ShowIf>
      </Box>
    </Drawer>
  );
};

export default AddMemberDrawer;
