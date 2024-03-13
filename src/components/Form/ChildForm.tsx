import { Autocomplete, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import React, { FC, useCallback, useEffect, useState } from "react";
import Form, { Bio, useStyles, defaultBio, Error, defaultError } from "./Form";
import { TreeNodeData } from "@tree/src/types/tree";
import { getSpouse } from "@tree/src/lib/services/node";
import { useCacheContext } from "@tree/src/context/cache";

type ChildFormProps = {
  nodeId?: string;
  loading: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
};

const ChildForm: FC<ChildFormProps> = ({ nodeId, onSave, onCancel, loading }) => {
  const classes = useStyles();

  const { get, set } = useCacheContext();

  const [bio, setBio] = useState<Bio>(defaultBio);
  const [spouses, setSpouses] = useState<TreeNodeData[]>([]);
  const [spouse, setSpouse] = useState<TreeNodeData | null>(null);
  const [error, setError] = useState<Error>(defaultError);
  const [loadingSpouses, setLoadingSpouses] = useState<boolean>(false);

  const fetchSpouses = useCallback(() => {
    if (!nodeId) return;
    const spouses = get<TreeNodeData[]>(`spouse-${nodeId}`);
    if (!spouses) {
      setLoadingSpouses(true);
      getSpouse(nodeId)
        .then((data) => {
          set(`spouse-${nodeId}`, data);
          setSpouses(data);
          setSpouse(data?.[0] || null);
        })
        .finally(() => setLoadingSpouses(false));
    } else {
      setSpouses(spouses);
      setSpouse(spouses?.[0] || null);
    }
  }, [nodeId]);

  useEffect(() => {
    fetchSpouses();
  }, [fetchSpouses]);

  const handleSave = () => {
    const { name, gender, birthDate, birthCountry, birthCity } = bio;

    const error = {
      name: !Boolean(name),
      gender: !Boolean(gender),
      spouse: !Boolean(spouse),
    };

    setError(error);
    if (Object.values(error).includes(true) || !spouse?.id) {
      return;
    }

    const names = name.replace(/\s+/g, " ").trim().split(" ");
    const data: Record<string, any> = {
      name: { first: names[0] },
      gender: gender,
      birth: {
        day: birthDate?.date() ?? 0,
        month: birthDate?.month() ? birthDate.month() + 1 : 0,
        year: birthDate?.year() ?? -1,
        place: {
          country: birthCountry,
          city: birthCity,
        },
      },
    };

    if (names.length > 1) Object.assign(data.name, { last: names[names.length - 1] });
    if (names.length > 2) Object.assign(data.name, { middle: names.slice(1, names.length - 1).join(" ") });

    onSave({ spouseId: spouse.id, child: data });
  };

  const handleCancel = () => {
    onCancel();
    setBio({ ...defaultBio });
  };

  return (
    <React.Fragment>
      <Autocomplete
        id="spouses"
        options={spouses}
        getOptionLabel={(option) => option.fullname}
        fullWidth
        value={spouse}
        classes={classes}
        loading={loadingSpouses}
        loadingText={<Typography sx={{ color: "whitesmoke", font: "inherit" }}>Loading spouses...</Typography>}
        isOptionEqualToValue={(option) => option.id === spouse?.id}
        onChange={(event, newValue) => {
          setError((prev) => ({ ...prev, spouse: !Boolean(newValue) }));
          setSpouse(newValue);
        }}
        sx={{ mt: "20px" }}
        componentsProps={{
          popper: {
            sx: { fontSize: "50px" },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            error={error.spouse}
            sx={{ input: { color: "whitesmoke" } }}
            InputLabelProps={{ sx: { color: "grey" } }}
            label="Spouses"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loadingSpouses ? <CircularProgress sx={{ color: "whitesmoke" }} size={15} /> : null}
                  {params.InputProps.startAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />

      <Form bio={bio} setBio={setBio} error={error} setError={setError} />

      <Box sx={{ mt: "30px" }} textAlign="end">
        <Button color="info" variant="outlined" sx={{ mr: "10px" }} onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={15} /> : "Save"}
        </Button>
      </Box>
    </React.Fragment>
  );
};

export default ChildForm;
