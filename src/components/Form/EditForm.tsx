import { Box, Button, CircularProgress } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { startCase } from "lodash";
import Form, { Bio, Error, defaultBio, defaultError } from "./Form";
import { birthDateToDayjs } from "@tree/src/helper/date";

type EditFormProps = {
  node?: TreeNodeDataWithRelations;
  loading: boolean;
  onUpdate: (data: any) => void;
  onCancel: () => void;
};

const EditForm: FC<EditFormProps> = ({ onUpdate, onCancel, node, loading }) => {
  const [bio, setBio] = useState<Bio>(defaultBio);
  const [error, setError] = useState<Error>(defaultError);

  useEffect(() => {
    if (!node) return;
    const country = node?.birth?.place?.country;
    const city = node?.birth?.place?.city;

    const name = node?.fullname ?? "";
    const gender = (node?.gender as string) ?? "";
    const birthCountry = startCase(country ?? "");
    const birthCity = startCase(city ?? "");
    const birthDate = birthDateToDayjs(node?.birth?.day, node?.birth?.month, node?.birth?.year);

    setBio({ name, gender, birthDate, birthCity, birthCountry });
  }, []);

  const handleUpdate = () => {
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

    onUpdate(data);
  };

  return (
    <React.Fragment>
      <Form bio={bio} setBio={setBio} error={error} setError={setError} />
      <Box sx={{ mt: "30px" }} textAlign="end">
        <Button color="info" variant="outlined" sx={{ mr: "10px" }} onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleUpdate} disabled={loading}>
          {loading ? <CircularProgress size={15} /> : "Save"}
        </Button>
      </Box>
    </React.Fragment>
  );
};

export default EditForm;
