import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider, PickersLayout } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { ChangeEvent, FC, useEffect, useState } from "react";
import countries from "country-json/src/country-by-name.json";
import { Dayjs } from "dayjs";
import { makeStyles } from "@mui/styles";
import { styled } from "@mui/material/styles";

export const StyledPickersLayout = styled(PickersLayout)({
  ".MuiDateCalendar-root": {
    backgroundColor: "var(--background-color)",
    color: "whitesmoke",
  },
  ".MuiDayCalendar-weekDayLabel": {
    color: "whitesmoke",
  },
  ".MuiPickersDay-root": {
    color: "whitesmoke",
  },
  ".MuiPickersDay-today": {
    borderColor: "whitesmoke",
  },
  ".MuiPickersCalendarHeader-switchViewButton": {
    color: "whitesmoke",
  },
  ".MuiPickersArrowSwitcher-button": {
    color: "whitesmoke",
  },
});

export const useStyles = makeStyles(() => ({
  paper: {
    background: "var(--background-color)",
    color: "whitesmoke",
  },
}));

export type Error = {
  name: boolean;
  gender: boolean;
  birthDate: boolean;
  birthCountry: boolean;
  birthCity: boolean;
  spouse?: boolean;
};

export type Bio = {
  name: string;
  gender: string;
  birthDate: Dayjs | null;
  birthCity: string;
  birthCountry: {
    country: string;
  } | null;
};

type FormProps = {
  bio: Bio;
  error: Error;
  setBio: (bio: Bio) => void;
  setError: (error: Error) => void;
  disabledGender?: boolean;
};

export const defaultBio = {
  name: "",
  gender: "",
  birthDate: null,
  birthCity: "",
  birthCountry: null,
};

export const defaultError = {
  name: false,
  gender: false,
  birthDate: false,
  birthCountry: false,
  birthCity: false,
  spouse: false,
};

const Form: FC<FormProps> = ({ bio, error, setBio, setError, disabledGender = false }) => {
  const classes = useStyles();

  const handleBirthDate = (value: Dayjs | null) => {
    const err = !Boolean(value?.date()) || !Boolean(value?.month()) || !Boolean(value?.year());
    setBio({ ...bio, birthDate: value });
    setError({ ...error, birthDate: err });
  };

  const handleName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBio({ ...bio, name: value });
    setError({ ...error, name: !Boolean(value) });
  };

  const handleGender = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setBio({ ...bio, gender: value });
    setError({ ...error, gender: !Boolean(value) });
  };

  const handleBirthCity = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBio({ ...bio, birthCity: value });
    setError({ ...error, birthCity: !Boolean(value) });
  };

  const handleBirthCountry = (event: any, value: { country: string } | null) => {
    setBio({ ...bio, birthCountry: value });
    setError({ ...error, birthCountry: !Boolean(value?.country) });
  };

  return (
    <React.Fragment>
      <Box sx={{ color: "whitesmoke", mt: "20px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            error={error.name}
            id="name"
            label="Name"
            variant="outlined"
            value={bio.name}
            onChange={handleName}
            sx={{ input: { color: "whitesmoke" }, width: "64%" }}
            InputLabelProps={{ sx: { color: "grey" } }}
          />
          <FormControl sx={{ width: "34%" }}>
            <InputLabel id="relation-type" sx={{ color: "grey" }} error={error.gender}>
              Gender
            </InputLabel>
            <Select
              value={bio.gender}
              onChange={handleGender}
              label="Gender"
              sx={{
                color: "whitesmoke",
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "whitesmoke",
                },
              }}
              error={error.gender}
              MenuProps={{ classes }}
              disabled={disabledGender}
            >
              <MenuItem value={"male"}>male</MenuItem>
              <MenuItem value={"female"}>female</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: "10px" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Birth date"
              sx={{ input: { color: "whitesmoke" } }}
              value={bio.birthDate}
              disableFuture
              onChange={handleBirthDate}
              slots={{ layout: StyledPickersLayout as any }}
              slotProps={{
                openPickerIcon: { fontSize: "large" },
                openPickerButton: { sx: { color: "grey" } },
                textField: {
                  error: error.birthDate,
                  InputLabelProps: {
                    sx: { color: "grey" },
                    error: error.birthDate,
                  },
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: "10px" }}>
          <Autocomplete
            id="countries"
            options={countries}
            getOptionLabel={(option) => option.country}
            onChange={handleBirthCountry}
            value={bio.birthCountry}
            isOptionEqualToValue={(option) => option.country === bio.birthCountry?.country}
            sx={{ input: { color: "whitesmoke" }, width: "49%" }}
            classes={classes}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Birth Country"
                error={error.birthCountry}
                sx={{ input: { color: "whitesmoke" } }}
                InputLabelProps={{ sx: { color: "grey" }, classes }}
              />
            )}
          />

          <TextField
            id="name"
            label="Birth City"
            variant="outlined"
            error={error.birthCity}
            value={bio.birthCity}
            onChange={handleBirthCity}
            sx={{ input: { color: "whitesmoke" }, width: "49%" }}
            InputLabelProps={{ sx: { color: "grey" } }}
          />
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default Form;
