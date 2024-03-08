import { Box, Button, CircularProgress } from "@mui/material";
import React, { FC, useState } from "react";
import Form, { Bio, defaultBio, Error, defaultError } from "./Form";

type SiblingFormProps = {
  loading: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
};

const SiblingForm: FC<SiblingFormProps> = ({ onSave, onCancel, loading }) => {
  const [bio, setBio] = useState<Bio>(defaultBio);
  const [error, setError] = useState<Error>(defaultError);

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

    onSave(data);
  };

  const handleCancel = () => {
    onCancel();
    setBio({ ...defaultBio });
  };

  return (
    <React.Fragment>
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

export default SiblingForm;
