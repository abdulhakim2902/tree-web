import { Box, Button, CircularProgress } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import Form, { Bio, defaultBio, Error, defaultError } from "./Form";
import { TreeNodeDataWithRelations } from "@/types/tree";
import { Gender } from "@/lib/relatives-tree/types";

type SpouseFormProps = {
  node?: TreeNodeDataWithRelations;
  loading: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
};

const SpouseForm: FC<SpouseFormProps> = ({ onSave, onCancel, loading, node }) => {
  const [bio, setBio] = useState<Bio>(defaultBio);
  const [error, setError] = useState<Error>(defaultError);
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (!node) return;
    setDisabled(true);
    if (node.gender === Gender.male) {
      setBio((prev) => ({ ...prev, gender: Gender.female }));
    } else {
      setBio((prev) => ({ ...prev, gender: Gender.male }));
    }
  }, [node]);

  const handleSave = () => {
    const { name, gender, birthDate, birthCountry, birthCity } = bio;

    const error = {
      name: !Boolean(name),
      gender: !Boolean(gender),
      birthDate: !Boolean(birthDate?.date()) || !Boolean(birthDate?.month()) || !Boolean(birthDate?.year()),
      birthCity: !Boolean(birthCity),
      birthCountry: !Boolean(birthCountry?.country),
    };

    setError(error);
    if (Object.values(error).includes(true) || !birthDate) {
      return;
    }

    const names = name.replace(/\s+/g, " ").trim().split(" ");
    const date = birthDate.date();
    const month = birthDate.month();
    const year = birthDate.year();
    const data = {
      name: { first: names[0] },
      gender: gender,
      birth: {
        day: date,
        month: month + 1,
        year: year,
        place: {
          city: birthCity,
          country: birthCountry?.country,
        },
      },
    };

    if (names.length > 1) Object.assign(data.name, { last: names[names.length - 1] });
    if (names.length > 2) Object.assign(data.name, { middle: names.slice(1, names.length - 1).join(" ") });

    onSave([data]);
  };

  const handleCancel = () => {
    onCancel();
    setBio({ ...defaultBio });
  };

  return (
    <React.Fragment>
      <Form bio={bio} setBio={setBio} error={error} setError={setError} disabledGender={disabled} />

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

export default SpouseForm;
