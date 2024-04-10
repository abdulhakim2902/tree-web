import { Box, InputAdornment, TextField } from "@mui/material";
import Image from "next/image";
import { FC, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ShowIf from "../show-if";
import Link from "next/link";
import { useAuthContext } from "@tree/src/context/auth";
import { useRouter } from "next/router";

const Search: FC = () => {
  const router = useRouter();

  const { isLoggedIn } = useAuthContext();

  const [query, setQuery] = useState<string>("");

  const goToTree = () => {
    if (query.length > 0) {
      if (router.pathname === "/tree") {
        router.replace(`/tree?search=${query}`);
      } else {
        router.push(`/tree?search=${query}`);
      }

      setQuery("");
    }
  };

  if (!isLoggedIn) {
    return (
      <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
        <Link passHref={true} href="/">
          <span style={{ cursor: "pointer" }}>
            <Image src="/favicon.ico" width={40} height={34} alt="Tree project" />
          </span>
        </Link>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
      <Link passHref={true} href="/">
        <span style={{ cursor: "pointer" }}>
          <Image src="/favicon.ico" width={40} height={34} alt="Tree project" />
        </span>
      </Link>
      <TextField
        id="search"
        sx={{ ml: "10px", input: { color: "whitesmoke" }, width: "auto" }}
        size="small"
        placeholder="Search Family"
        value={query}
        onKeyUp={(event) => (event.key === "Enter" ? goToTree() : undefined)}
        onChange={(event) => setQuery(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{ color: "whitesmoke", cursor: "pointer", opacity: 0.8, ":hover": { opacity: 1 } }}
                onClick={goToTree}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <ShowIf condition={Boolean(query)}>
              <InputAdornment position="start">
                <CloseIcon
                  sx={{
                    color: "whitesmoke",
                    cursor: "pointer",
                    opacity: 0.8,
                    ":hover": {
                      opacity: 1,
                    },
                  }}
                  onClick={() => setQuery("")}
                />
              </InputAdornment>
            </ShowIf>
          ),
        }}
      />
    </Box>
  );
};

export default Search;
