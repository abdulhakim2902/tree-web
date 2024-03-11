import { Box, Drawer, FormControl, FormControlLabel, Grid, Paper, Radio, RadioGroup, Typography } from "@mui/material";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { FC, useEffect, useState } from "react";
import { RelationType } from "../Tree/TreeNodeDetails/BioRelationButtons/BioRelationButtons";
import ShowIf from "../show-if";
import ChildForm from "../Form/ChildForm";
import SpouseForm from "../Form/SpouseForm";
import SiblingForm from "../Form/SiblingForm";
import ParentForm from "../Form/ParentForm";
import { useTreeNodeDataContext } from "@tree/src/context/data";

type AddMemberDrawerProps = {
  node: TreeNodeDataWithRelations;
  open: boolean;
  onClose: () => void;
};

const AddMemberDrawer: FC<AddMemberDrawerProps> = ({ node, open, onClose }) => {
  const { addNode, loading } = useTreeNodeDataContext();

  const [relative, setRelative] = useState<RelationType>();
  const [option, setOption] = useState<"new" | "tree">("new");

  useEffect(() => {
    if (open) {
      setRelative(undefined);
      setOption("new");
    }
  }, [open]);

  const onAddNode = (data: any, relation: RelationType) => {
    if (!node?.id) return;
    addNode(node.id, data, relation, (success, error) => {
      if (success) {
        onClose();
        setRelative(undefined);
      }
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
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
            {[RelationType.Parents, RelationType.Children, RelationType.Spouses, RelationType.Siblings].map((e) => {
              const expandable = node?.metadata?.expandable;

              switch (e) {
                case RelationType.Parents: {
                  const parents = node?.parents ?? [];
                  if (parents.length > 0 || expandable?.parents) {
                    return;
                  }

                  break;
                }

                case RelationType.Children: {
                  const spouses = node?.spouses ?? [];
                  if (spouses.length <= 0 && !expandable?.spouses) {
                    return;
                  }

                  break;
                }

                case RelationType.Siblings:
                  const parentSiblings = node?.parents ?? [];
                  if (parentSiblings.length <= 0 && !expandable?.parents) {
                    return;
                  }

                  break;

                case RelationType.Spouses:
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
                      {e}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </ShowIf>
        <ShowIf condition={Boolean(relative)}>
          <Typography variant="h5" component="h3" sx={{ color: "whitesmoke" }}>
            {`Add ${relative?.toLowerCase()} for ${node.fullname}`}
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
            <ShowIf condition={relative === RelationType.Parents}>
              <ParentForm
                onSave={(data) => onAddNode(data, RelationType.Parents)}
                onCancel={onClose}
                loading={loading.added}
              />
            </ShowIf>

            <ShowIf condition={relative === RelationType.Siblings}>
              <SiblingForm
                onSave={(data) => onAddNode(data, RelationType.Siblings)}
                onCancel={onClose}
                loading={loading.added}
              />
            </ShowIf>

            <ShowIf condition={relative === RelationType.Spouses}>
              <SpouseForm
                node={node}
                onSave={(data) => onAddNode(data, RelationType.Spouses)}
                onCancel={onClose}
                loading={loading.added}
              />
            </ShowIf>

            <ShowIf condition={relative === RelationType.Children}>
              <ChildForm
                onSave={(data) => onAddNode(data, RelationType.Children)}
                onCancel={onClose}
                nodeId={node.id}
                loading={loading.added}
              />
            </ShowIf>
          </ShowIf>

          <ShowIf condition={option === "tree"}>
            <Typography variant="h5" component="h3" sx={{ color: "whitesmoke", mt: 3 }}>
              Still on progress...
            </Typography>
          </ShowIf>
        </ShowIf>
      </Box>
    </Drawer>
  );
};

export default AddMemberDrawer;
