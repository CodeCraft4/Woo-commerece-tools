"use client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, InputBase, Typography } from "@mui/material";
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
      <Typography sx={{ fontWeight: 700, mb: "5px" }}>
        {label} <span style={{ color: "red" }}> *</span>
      </Typography>

      {/* Input container */}
      <Box
        sx={{
          display: "flex",
          alignItems: description ? "flex-start" : "center",
          border: "1px solid #ccc",
          borderRadius: "12px",
          px: 1,
          transition: "all 0.2s",
          "&:hover": { border: "1px solid black" },
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

      {error && (
        <Typography sx={{ mt: 1, fontSize: "13px", color: "red" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default CustomInput;
