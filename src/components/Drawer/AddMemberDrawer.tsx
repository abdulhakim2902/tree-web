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
import ShowIf from "../show-if";
import ChildForm from "../Form/ChildForm";
import SpouseForm from "../Form/SpouseForm";
import SiblingForm from "../Form/SiblingForm";
import ParentForm from "../Form/ParentForm";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { capitalize } from "lodash";
import SearchIcon from "@mui/icons-material/Search";
import { useCacheContext } from "@tree/src/context/cache";

type AddMemberDrawerProps = {
  node: TreeNodeDataWithRelations;
  open: boolean;
  onClose: () => void;
};

const AddMemberDrawer: FC<AddMemberDrawerProps> = ({ node, open, onClose }) => {
  const { addNode, loading } = useTreeNodeDataContext();
  const { del } = useCacheContext();

  const [relative, setRelative] = useState<string>("");
  const [option, setOption] = useState<"new" | "tree">("new");

  useEffect(() => {
    if (open) {
      setRelative("");
      setOption("new");
      del(`spouse-${node.id}`);
    }
  }, [open]);

  const onAddNode = (data: any) => {
    if (!node?.id) return;
    addNode(node.id, data, relative, (success, error) => {
      if (success) onClose();
    });
  };

  return (
    <Drawer
      open={open}
      onClose={(event, reason) => {
        if (loading.added && reason === "backdropClick") return;
        if (loading.added && reason === "escapeKeyDown") return;
        onClose();
      }}
      anchor="right"
      PaperProps={{ sx: { backgroundColor: "var(--background-color)", width: "350px" } }}
    >
      <Box sx={{ p: 3 }}>
        <ShowIf condition={!Boolean(relative)}>
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
                <Grid item xs={6} key={e} onClick={() => setRelative(e)}>
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
        <ShowIf condition={Boolean(relative)}>
          <Typography variant="h5" component="h3" sx={{ color: "whitesmoke" }}>
            {`Add a ${relative} for ${node.fullname}`}
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
            <ShowIf condition={relative === "parent"}>
              <ParentForm onSave={(data) => onAddNode(data)} onCancel={onClose} loading={loading.added} />
            </ShowIf>

            <ShowIf condition={relative === "brother" || relative === "sister"}>
              <SiblingForm
                relative={relative}
                onSave={(data) => onAddNode(data)}
                onCancel={onClose}
                loading={loading.added}
              />
            </ShowIf>

            <ShowIf condition={relative === "spouse"}>
              <SpouseForm
                node={node}
                onSave={(data) => onAddNode(DataTransferItemList)}
                onCancel={onClose}
                loading={loading.added}
              />
            </ShowIf>

            <ShowIf condition={relative === "child"}>
              <ChildForm
                onSave={(data) => onAddNode(data)}
                onCancel={onClose}
                nodeId={node.id}
                loading={loading.added}
              />
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
