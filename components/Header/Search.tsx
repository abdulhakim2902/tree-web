import { Box, InputAdornment, TextField } from "@mui/material";
import Image from "next/image";
import { FC } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ShowIf from "../show-if";
import { useTreeNodeDataContext } from "@/context/data";
import Link from "next/link";

const Search: FC = () => {
  const { query, setQuery, searchNodes } = useTreeNodeDataContext();

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
        onKeyUp={(event) => searchNodes(event)}
        onChange={(event) => setQuery(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{ color: "whitesmoke", cursor: "pointer", opacity: 0.8, ":hover": { opacity: 1 } }}
                onClick={() => searchNodes()}
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
