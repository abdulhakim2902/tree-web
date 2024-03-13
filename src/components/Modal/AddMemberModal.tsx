import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ParentForm from "../Form/ParentForm";
import ChildForm from "../Form/ChildForm";
import { FC, useState } from "react";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import ShowIf from "../show-if";
import { makeStyles } from "@mui/styles";
import SiblingForm from "../Form/SiblingForm";
import SpouseForm from "../Form/SpouseForm";

const useStyles = makeStyles(() => ({
  paper: {
    background: "var(--background-color)",
    color: "whitesmoke",
  },
}));

type AddMemberModalProps = {
  nodeId?: string;
  open: boolean;
  node?: TreeNodeDataWithRelations;

  onClose: () => void;
};

const AddMemberModal: FC<AddMemberModalProps> = ({ open, onClose, nodeId, node }) => {
  const classes = useStyles();

  const { addNode, loading } = useTreeNodeDataContext();

  const [relative, setRelative] = useState<string>("");

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    onClose();
    setRelative("");
  };

  const onAddNode = (data: any) => {
    if (!node?.id) return;
    addNode(node.id, data, relative, (success, error) => {
      if (success) {
        onClose();
        setRelative("");
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (loading.added && reason === "backdropClick") return;
        if (loading.added && reason === "escapeKeyDown") return;
        handleClose();
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: mobile ? "80%" : 400,
          bgcolor: "var(--background-color)",
          borderRadius: "10px",
          p: 4,
        }}
      >
        <Typography sx={{ mb: "20px", fontWeight: "bold" }} variant="h4" component="h2">
          New Family Member
        </Typography>
        <FormControl size="small" fullWidth>
          <InputLabel id="relation" sx={{ color: "grey" }}>
            Relation
          </InputLabel>
          <Select
            value={relative}
            onChange={(event) => setRelative(event.target.value)}
            label="Relation"
            sx={{ color: "whitesmoke" }}
            MenuProps={{ classes }}
          >
            {["parent", "child", "spouse", "brother", "sister"].map((e, i) => {
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
                <MenuItem key={i} value={e}>
                  {e}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <ShowIf condition={relative === "parent"}>
          <ParentForm onSave={(data) => onAddNode(data)} onCancel={handleClose} loading={loading.added} />
        </ShowIf>

        <ShowIf condition={relative === "brother" || relative === "sister"}>
          <SiblingForm onSave={(data) => onAddNode(data)} onCancel={handleClose} loading={loading.added} />
        </ShowIf>

        <ShowIf condition={relative === "spouse"}>
          <SpouseForm node={node} onSave={(data) => onAddNode(data)} onCancel={handleClose} loading={loading.added} />
        </ShowIf>

        <ShowIf condition={relative === "child"}>
          <ChildForm
            onSave={(data) => onAddNode(data)}
            onCancel={handleClose}
            nodeId={nodeId}
            loading={loading.added}
          />
        </ShowIf>

        <ShowIf condition={!Boolean(relative)}>
          <Box sx={{ mt: "20px" }} textAlign="end">
            <Button color="info" variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </ShowIf>
      </Box>
    </Modal>
  );
};

export default AddMemberModal;
