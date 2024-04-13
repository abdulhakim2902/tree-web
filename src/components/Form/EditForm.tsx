import { Box, Button } from "@mui/material";
import React, { FC, useEffect, useRef, useState } from "react";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { startCase } from "lodash";
import Form, { Bio, Error, defaultBio, defaultError } from "./Form";
import { birthDateToDayjs } from "@tree/src/helper/date";
import { ScaleLoader } from "react-spinners";

type EditFormProps = {
  node?: TreeNodeDataWithRelations;
  loading: boolean;
  onUpdate: (data: any) => Promise<void>;
  onCancel: () => void;
};

const EditForm: FC<EditFormProps> = ({ onUpdate, onCancel, node, loading }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [bio, setBio] = useState<Bio>(defaultBio);
  const [error, setError] = useState<Error>(defaultError);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!node) return;
    const country = node?.birth?.place?.country;
    const city = node?.birth?.place?.city;

    const name = node?.fullname ?? "";
    const nicknames = node?.name?.nicknames ?? [];
    const gender = (node?.gender as string) ?? "";
    const birthCountry = startCase(country ?? "");
    const birthCity = startCase(city ?? "");
    const birthDate = birthDateToDayjs(node?.birth?.day, node?.birth?.month, node?.birth?.year);
    const deathCountry = startCase(node?.death?.place?.country ?? "");
    const deathCity = startCase(node?.death?.place?.city ?? "");
    const deathDate = birthDateToDayjs(node?.death?.day, node?.death?.month, node?.death?.year);

    setBio({ name, nicknames, gender, birthDate, birthCity, birthCountry, deathDate, deathCity, deathCountry });
  }, []);

  const handleUpdate = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;
      const { name, nicknames, gender, birthDate, birthCountry, birthCity, deathDate, deathCountry, deathCity } = bio;

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
      if (nicknames.length > 0) data.nicknames = nicknames;

      await onUpdate(data);

      buttonRef.current.disabled = false;
    }
  };

  return (
    <React.Fragment>
      <Form bio={bio} setBio={setBio} error={error} setError={setError} isEdit />
      <Box sx={{ mt: "30px" }} textAlign="end">
        <Button color="info" variant="outlined" sx={{ mr: "10px" }} onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button ref={buttonRef} variant="contained" onClick={handleUpdate}>
          {loading ? <ScaleLoader color="whitesmoke" height={10} width={2} /> : "Update"}
        </Button>
      </Box>
    </React.Fragment>
  );
};

export default EditForm;
