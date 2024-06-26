import { Autocomplete, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import Form, { Bio, useStyles, defaultBio, Error, defaultError } from "./Form";
import { TreeNodeData, TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { getSpouse } from "@tree/src/lib/services/node";
import { useCacheContext } from "@tree/src/context/cache";
import { ScaleLoader } from "react-spinners";
import { startCase } from "@tree/src/helper/string";

type ChildFormProps = {
  node: TreeNodeDataWithRelations;
  loading: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
};

const ChildForm: FC<ChildFormProps> = ({ node, onSave, onCancel, loading }) => {
  const classes = useStyles();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { get, set } = useCacheContext();

  const [bio, setBio] = useState<Bio>(defaultBio);
  const [spouses, setSpouses] = useState<TreeNodeData[]>([]);
  const [spouse, setSpouse] = useState<TreeNodeData | null>(null);
  const [error, setError] = useState<Error>(defaultError);
  const [loadingSpouses, setLoadingSpouses] = useState<boolean>(false);

  /* eslint-disable react-hooks/exhaustive-deps */
  const fetchSpouses = useCallback(() => {
    if (!node) return;
    const spouses = get<TreeNodeData[]>(`spouse-${node.id}`);

    if (!spouses) {
      setLoadingSpouses(true);
      getSpouse(node.id)
        .then((data) => {
          const spouses = data.filter((e) => e.gender !== node.gender);
          set(`spouse-${node.id}`, spouses);
          setSpouses(spouses);
          setSpouse(spouses?.[0] || null);
        })
        .finally(() => setLoadingSpouses(false));
    } else {
      setSpouses(spouses);
      setSpouse(spouses?.[0] || null);
    }
  }, [node]);

  useEffect(() => {
    fetchSpouses();
  }, [fetchSpouses]);

  const handleSave = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      const { name, gender, birthDate, birthCountry, birthCity, deathDate, deathCountry, deathCity } = bio;

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
      };

      {
        const day = birthDate?.date() ?? 0;
        const month = birthDate?.month() ? birthDate.month() + 1 : 0;
        const year = birthDate?.year() ?? -1;

        if (day > 0 || month > 0 || year >= 0 || birthCity || birthCountry) {
          data.birth = {};

          if (day > 0) data.birth.day = day;
          if (month > 0) data.birth.month = month;
          if (year >= 0) data.birth.year = year;

          if (birthCity || birthCountry) {
            data.birth.place = {};
          }

          if (birthCountry) {
            data.birth.place.country = birthCountry;
          }

          if (birthCity) {
            data.birth.place.city = birthCity;
          }
        }
      }

      {
        const day = deathDate?.date() ?? 0;
        const month = deathDate?.month() ? deathDate.month() + 1 : 0;
        const year = deathDate?.year() ?? -1;

        if (day > 0 || month > 0 || year >= 0 || birthCity || birthCountry) {
          data.death = {};

          if (day > 0) data.death.day = day;
          if (month > 0) data.death.month = month;
          if (year >= 0) data.death.year = year;

          if (deathCity || deathCountry) {
            data.death.place = {};
          }

          if (deathCountry) {
            data.death.place.country = deathCountry;
          }

          if (deathCity) {
            data.death.place.city = deathCity;
          }
        }
      }

      if (names.length > 1) Object.assign(data.name, { last: names[names.length - 1] });
      if (names.length > 2) Object.assign(data.name, { middle: names.slice(1, names.length - 1).join(" ") });

      await onSave({ spouseId: spouse.id, child: data });

      buttonRef.current.disabled = false;
    }
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
        getOptionLabel={(option) => startCase(option.fullname)}
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
        <Button ref={buttonRef} variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? <ScaleLoader color="whitesmoke" height={10} width={2} /> : "Save"}
        </Button>
      </Box>
    </React.Fragment>
  );
};

export default ChildForm;
