import { Box, Button, Typography } from "@mui/material";
import React, { FC, useEffect, useRef, useState } from "react";
import Form, { Bio, Error, defaultBio, defaultError } from "./Form";
import { ScaleLoader } from "react-spinners";

type ParentFormProps = {
  loading: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
};

const ParentForm: FC<ParentFormProps> = ({ onSave, onCancel, loading }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [fatherBio, setFatherBio] = useState<Bio>(defaultBio);
  const [fatherError, setFatherError] = useState<Error>(defaultError);

  const [motherBio, setMotherBio] = useState<Bio>(defaultBio);
  const [motherError, setMotherError] = useState<Error>(defaultError);

  useEffect(() => {
    setFatherBio((prev) => ({ ...prev, gender: "male" }));
    setMotherBio((prev) => ({ ...prev, gender: "female" }));
  }, []);

  const handleSave = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      const result = [fatherBio, motherBio].map((bio, index) => {
        const { name, gender, birthDate, birthCountry, birthCity } = bio;
        const error = {
          name: !Boolean(name),
          gender: !Boolean(gender),
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
        };

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

        if (names.length > 1) Object.assign(data.name, { last: names[names.length - 1] });
        if (names.length > 2) Object.assign(data.name, { middle: names.slice(1, names.length - 1).join(" ") });
        return data;
      });

      if (result.includes(null)) return;

      await onSave({ father: result[0], mother: result[1] });

      buttonRef.current.disabled = false;
    }
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
        <Button ref={buttonRef} variant="contained" onClick={handleSave}>
          {loading ? <ScaleLoader color="whitesmoke" height={10} width={2} /> : "Save"}
        </Button>
      </Box>
    </React.Fragment>
  );
};

export default ParentForm;
