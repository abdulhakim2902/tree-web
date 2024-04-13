import {
  Autocomplete,
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
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
import ShowIf from "../show-if";
import { Nickname } from "@tree/src/types/tree";
import { startCase } from "@tree/src/helper/string";

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
  nicknames: Nickname[];
  gender: string;
  birthDate: Dayjs | null;
  birthCity: string;
  birthCountry: string;
  deathDate: Dayjs | null;
  deathCity: string;
  deathCountry: string;
};

type FormProps = {
  bio: Bio;
  error: Error;
  isEdit?: boolean;
  setBio: (bio: Bio) => void;
  setError: (error: Error) => void;
  disabledGender?: boolean;
};

export const defaultBio = {
  name: "",
  nicknames: [] as Nickname[],
  gender: "",
  birthDate: null,
  birthCity: "",
  birthCountry: "",
  deathDate: null,
  deathCity: "",
  deathCountry: "",
};

export const defaultError = {
  name: false,
  gender: false,
  birthDate: false,
  birthCountry: false,
  birthCity: false,
  spouse: false,
};

const Form: FC<FormProps> = ({ bio, error, setBio, setError, disabledGender = false, isEdit = false }) => {
  const classes = useStyles();
  const isDeceased = Boolean(bio?.deathDate || bio?.deathCountry || bio?.deathCity);

  const [cities, setCities] = useState<City[]>([]);
  const [nicknames, setNicknames] = useState<string[]>([]);
  const [deceased, setDeceased] = useState<boolean>(isDeceased);
  const [selectedNickname, setSelectedNickname] = useState<string>("");

  const [birthPlaceValue, setBirthPlaceValue] = useState<string>("");
  const [deathPlaceValue, setDeathPlaceValue] = useState<string>("");
  const [loading, setLoading] = useState<{ birth: boolean; death: boolean }>({ birth: false, death: false });

  const debounceBirthPlaceValue = useDebounce(birthPlaceValue, 1000);
  const debounceDeathPlaceValue = useDebounce(deathPlaceValue, 1000);

  useEffect(() => {
    if (!debounceBirthPlaceValue) return;
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading((prev) => ({ ...prev, birth: true }));
    searchCities(debounceBirthPlaceValue, signal)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoading((prev) => ({ ...prev, birth: false })));

    return () => {
      controller.abort();
    };
  }, [debounceBirthPlaceValue]);

  useEffect(() => {
    if (!debounceDeathPlaceValue) return;
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading((prev) => ({ ...prev, death: true }));
    searchCities(debounceDeathPlaceValue, signal)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoading((prev) => ({ ...prev, death: false })));

    return () => {
      controller.abort();
    };
  }, [debounceDeathPlaceValue]);

  useEffect(() => {
    if (bio.nicknames.length > 0) {
      setNicknames(bio.nicknames.map((e) => e.name));
      const nickname = bio.nicknames.find((e) => e.selected === true);
      if (nickname) {
        setSelectedNickname(nickname.name);
      }
    }
  }, [bio.nicknames]);

  const handleBirthDate = (value: Dayjs | null) => {
    setBio({ ...bio, birthDate: value });
  };

  const handleDeathDate = (value: Dayjs | null) => {
    setBio({ ...bio, deathDate: value });
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

    setBirthPlaceValue("");
    setBio({ ...bio, birthCity, birthCountry });
  };

  const handleDeathPlace = (event: any, value: City | string | null) => {
    if (typeof value === "string") return;

    const deathCity = value?.name ?? "";
    const deathCountry = value?.country ?? "";

    setDeathPlaceValue("");
    setBio({ ...bio, deathCity, deathCountry });
  };

  const handleNicknames = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const nicknames = value.split(",");
    setSelectedNickname(nicknames[0]);
    setNicknames(nicknames);
    setBio({
      ...bio,
      nicknames: nicknames.map((e, i) => {
        return {
          name: e,
          selected: i === 0,
        };
      }),
    });
  };

  const handleNickname = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedNickname(value);
    setBio({
      ...bio,
      nicknames: bio.nicknames.map((e) => {
        return {
          name: e.name,
          selected: e.name === value,
        };
      }),
    });
  };

  const optionLabel = (option: City | string) => {
    if (typeof option === "string") return option;

    let name = option.name;
    if (option.country) {
      name += `, ${option.country}`;
    }

    return name;
  };

  const onChangeBirthPlaceValue = (event: ChangeEvent<HTMLInputElement>) => {
    setBirthPlaceValue(event.target.value);

    const [birthCity, birthCountry] = event.target.value.split(",");

    setBio({
      ...bio,
      birthCity: birthCity?.trim() ?? "",
      birthCountry: birthCountry?.trim() ?? "",
    });
  };

  const onChangeDeathPlaceValue = (event: ChangeEvent<HTMLInputElement>) => {
    setDeathPlaceValue(event.target.value);

    const [deathCity, deathCountry] = event.target.value.split(",");

    setBio({
      ...bio,
      deathCity: deathCity?.trim() ?? "",
      deathCountry: deathCountry?.trim() ?? "",
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
            required
            variant="outlined"
            value={bio.name}
            onChange={handleName}
            sx={{ input: { color: "whitesmoke" }, width: "64%" }}
            InputLabelProps={{ sx: { color: "grey" } }}
          />
          <FormControl sx={{ width: "34%" }}>
            <InputLabel id="relation-type" sx={{ color: "grey" }} error={error.gender} required>
              Gender
            </InputLabel>
            <Select
              value={bio.gender}
              onChange={handleGender}
              label="Gender"
              required
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

        <ShowIf condition={isEdit}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: "10px" }}>
            <TextField
              id="nicknames"
              label="Nicknames"
              variant="outlined"
              value={nicknames.join(",")}
              onChange={handleNicknames}
              placeholder="Ex: john,doe"
              sx={{ input: { color: "whitesmoke" }, width: "64%" }}
              InputLabelProps={{ sx: { color: "grey" } }}
            />
            <FormControl sx={{ width: "34%" }}>
              <InputLabel id="relation-type" sx={{ color: "grey" }} error={error.gender}>
                Selected Nickname
              </InputLabel>
              <Select
                value={selectedNickname}
                onChange={handleNickname}
                label="Selected Nickname"
                sx={{
                  color: "whitesmoke",
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "whitesmoke",
                  },
                }}
                MenuProps={{ classes }}
              >
                {nicknames.map((e, i) => {
                  return (
                    <MenuItem key={i} value={e}>
                      {startCase(e)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </ShowIf>

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
                sx={{ input: { color: "whitesmoke" } }}
                InputLabelProps={{ sx: { color: "grey" } }}
                label="Birth place"
                onChange={onChangeBirthPlaceValue}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading.birth ? <CircularProgress sx={{ color: "whitesmoke" }} size={15} /> : null}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </Box>

        <FormControlLabel
          sx={{ mt: "10px" }}
          control={<Switch checked={deceased} onChange={(event) => setDeceased(event.target.checked)} />}
          label="Deceased?"
        />

        <ShowIf condition={deceased}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: "10px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Death date"
                sx={{ input: { color: "whitesmoke" } }}
                value={bio.deathDate}
                onChange={handleDeathDate}
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
              value={`${bio.deathCity}${bio.deathCountry ? `, ${bio.deathCountry}` : ""}`}
              classes={classes}
              isOptionEqualToValue={(option: City) => option?.name === bio?.deathCity}
              onChange={handleDeathPlace}
              componentsProps={{
                popper: {
                  sx: { fontSize: "50px" },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ input: { color: "whitesmoke" } }}
                  InputLabelProps={{ sx: { color: "grey" } }}
                  label="Death place"
                  onChange={onChangeDeathPlaceValue}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading.death ? <CircularProgress sx={{ color: "whitesmoke" }} size={15} /> : null}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </ShowIf>
      </Box>
    </React.Fragment>
  );
};

export default Form;
