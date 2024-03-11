import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import Form, { Bio, Error, defaultBio, defaultError } from "./Form";

type ParentFormProps = {
  loading: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
};

const ParentForm: FC<ParentFormProps> = ({ onSave, onCancel, loading }) => {
  const [fatherBio, setFatherBio] = useState<Bio>(defaultBio);
  const [fatherError, setFatherError] = useState<Error>(defaultError);

  const [motherBio, setMotherBio] = useState<Bio>(defaultBio);
  const [motherError, setMotherError] = useState<Error>(defaultError);

  useEffect(() => {
    setFatherBio((prev) => ({ ...prev, gender: "male" }));
    setMotherBio((prev) => ({ ...prev, gender: "female" }));
  }, []);

  const handleSave = () => {
    const result = [fatherBio, motherBio].map((bio, index) => {
      const { name, gender, birthDate, birthCountry, birthCity } = bio;
      const error = {
        name: !Boolean(name),
        gender: !Boolean(gender),
        birthCountry: !Boolean(birthCountry?.country),
      };

      const setError = index === 0 ? setFatherError : setMotherError;
      setError(error);

      if (Object.values(error).includes(true)) {
        return null;
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
            country: birthCountry?.country ?? "",
            city: birthCity ?? "",
          },
        },
      };

      if (names.length > 1) Object.assign(data.name, { last: names[names.length - 1] });
      if (names.length > 2) Object.assign(data.name, { middle: names.slice(1, names.length - 1).join(" ") });
      return data;
    });

    if (result.includes(null)) return;

    onSave({ father: result[0], mother: result[1] });
  };

  const handleCancel = () => {
    onCancel();
    setFatherBio({ ...defaultBio });
    setMotherBio({ ...defaultBio });
  };

  return (
    <React.Fragment>
      <React.Fragment>
        <Typography variant="h6" component="h2" sx={{ mt: "20px", color: "whitesmoke" }}>
          Father
        </Typography>
        <Form
          bio={fatherBio}
          error={fatherError}
          setBio={setFatherBio}
          setError={setFatherError}
          disabledGender={true}
        />
      </React.Fragment>

      <React.Fragment>
        <Typography variant="h6" component="h2" sx={{ mt: "15px", color: "whitesmoke" }}>
          Mother
        </Typography>
        <Form
          bio={motherBio}
          error={motherError}
          setBio={setMotherBio}
          setError={setMotherError}
          disabledGender={true}
        />
      </React.Fragment>
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

export default ParentForm;
