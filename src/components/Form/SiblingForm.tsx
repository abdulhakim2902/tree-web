import { Box, Button } from "@mui/material";
import React, { FC, useEffect, useRef, useState } from "react";
import Form, { Bio, defaultBio, Error, defaultError } from "./Form";
import { ScaleLoader } from "react-spinners";

type SiblingFormProps = {
  relative: string;
  loading: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
};

const SiblingForm: FC<SiblingFormProps> = ({ relative, onSave, onCancel, loading }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [bio, setBio] = useState<Bio>(defaultBio);
  const [error, setError] = useState<Error>(defaultError);

  useEffect(() => {
    if (relative === "brother") {
      setBio((prev) => ({ ...prev, gender: "male" }));
    } else {
      setBio((prev) => ({ ...prev, gender: "female" }));
    }
  }, [relative]);

  const handleSave = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      const { name, gender, birthDate, birthCountry, birthCity } = bio;

      const error = {
        name: !Boolean(name),
        gender: !Boolean(gender),
      };

      setError(error);
      if (Object.values(error).includes(true)) {
        return;
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

      await onSave(data);

      buttonRef.current.disabled = false;
    }
  };

  const handleCancel = () => {
    onCancel();
    setBio({ ...defaultBio });
  };

  return (
    <React.Fragment>
      <Form bio={bio} setBio={setBio} error={error} setError={setError} disabledGender={true} />

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

export default SiblingForm;
