"use client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  IconButton,
  InputBase,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type Option = {
  label: string;
  value: string | number;
};

type InputTypes = {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  label: string;
  placeholder: string;
  icon?: string;
  register?: UseFormRegisterReturn;
  error?: string;
  options?: Option[];
  description?: boolean;
  defaultValue?: string;
  multiline?: boolean;
};

const CustomInput = (props: InputTypes) => {
  const {
    label,
    placeholder,
    icon,
    onChange,
    type = "text",
    register,
    error,
    description,
    defaultValue,
    multiline,
    options = [],
  } = props;

  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        mb: 1.5,
      }}
    >
      <Typography sx={{ fontWeight: 700, mb: "5px",fontSize:{md:'auto',sm:'auto',xs:'12px'} }}>
        {label} <span style={{ color: "red" }}> *</span>
      </Typography>

      {/* Input container: Apply error styling here */}

      {type === "select" ? (
        <TextField
          select
          fullWidth
          variant="standard"
          defaultValue={defaultValue || ""}
          {...register}
          sx={{
            py: "10px",
            px: "12px",
            "&:focus": { outline: "none" },
            borderRadius: "12px",
            border: "1px solid #ccc",
            "& .MuiInputBase-root:before, & .MuiInputBase-root:after": {
              borderBottom: "none !important",
            },
            "& .MuiInput-underline:before, & .MuiInput-underline:after": {
              borderBottom: "none !important",
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={defaultValue || option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: description ? "flex-start" : "center",
            // CRITICAL: Set border color based on the presence of the error message string
            border: `1px solid ${error ? "red" : "#ccc"}`,
            borderRadius: "12px",
            px: 1,
            transition: "all 0.2s",
            // Maintain hover effect but ensure 'error' takes precedence
            "&:hover": {
              borderColor: error ? "red" : "black",
            },
          }}
        >
          {icon && (
            <Box
              component="img"
              src={icon}
              alt="icon"
              sx={{ width: 24, height: 24, mr: 1 }}
            />
          )}

          <InputBase
            fullWidth
            type={inputType}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={onChange}
            rows={multiline ? 6 : 0}
            multiline={multiline}
            // The spread operator correctly applies the register return object
            {...register}
            sx={{
              py: "10px",
              px: "12px",
              "&:focus": { outline: "none" },
            }}
          />

          {type === "password" && !description && (
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
              size="small"
              sx={{ color: "grey.600" }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          )}
        </Box>
      )}

      {/* Error Message Text */}
      {error && (
        <Typography sx={{ mt: 1, fontSize: "13px", color: "red" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default CustomInput;
