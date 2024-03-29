import {
  Autocomplete,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider, PickersLayout } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { ChangeEvent, FC, useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { makeStyles } from "@mui/styles";
import { styled } from "@mui/material/styles";
import { City, searchCities } from "@tree/src/lib/services/city";
import { useDebounce } from "@tree/src/hooks/use-debounce.hook";

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
  noOptions: {
    color: "whitesmoke",
  },
}));

export type Error = {
  name: boolean;
  gender: boolean;
  spouse?: boolean;
};

export type Bio = {
  name: string;
  gender: string;
  birthDate: Dayjs | null;
  birthCity: string;
  birthCountry: string;
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
  birthCountry: "",
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

  const [value, setValue] = useState<string>("");
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const debounceValue = useDebounce(value, 1000);

  useEffect(() => {
    if (!debounceValue) return;
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    searchCities(debounceValue, signal)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoading(false));

    return () => {
      controller.abort();
    };
  }, [debounceValue]);

  const handleBirthDate = (value: Dayjs | null) => {
    setBio({ ...bio, birthDate: value });
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

  const handleBirthPlace = (event: any, value: City | string | null) => {
    if (typeof value === "string") return;

    const birthCity = value?.name ?? "";
    const birthCountry = value?.country ?? "";

    setValue("");
    setBio({ ...bio, birthCity, birthCountry });
  };

  const optionLabel = (option: City | string) => {
    if (typeof option === "string") return option;

    let name = option.name;
    if (option.country) {
      name += `, ${option.country}`;
    }

    return name;
  };

  const onChangeValue = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);

    const [birthCity, birthCountry] = event.target.value.split(",");

    setBio({
      ...bio,
      birthCity: birthCity?.trim() ?? "",
      birthCountry: birthCountry?.trim() ?? "",
    });
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
                  InputLabelProps: {
                    sx: { color: "grey" },
                  },
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: "10px" }}>
          <Autocomplete
            id="city"
            options={cities}
            getOptionLabel={optionLabel}
            fullWidth
            freeSolo
            value={`${bio.birthCity}${bio.birthCountry ? `, ${bio.birthCountry}` : ""}`}
            classes={classes}
            isOptionEqualToValue={(option: City) => option?.name === bio?.birthCity}
            onChange={handleBirthPlace}
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
                label="Birth place"
                onChange={onChangeValue}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? <CircularProgress sx={{ color: "whitesmoke" }} size={15} /> : null}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default Form;
