// src/components/profile/ProfileTabs.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useForm } from "react-hook-form";
import { EditOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";

import CustomInput from "../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../components/LandingButton/LandingButton";
import { useAuth } from "../../../../context/AuthContext";
import { supabase } from "../../../../supabase/supabase";

type FormValues = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const USER_TABLE = "Users";
const USER_AUTH_COL = "auth_id"; // ✅ IMPORTANT (supabase auth user.id)
const STORAGE_BUCKET = "UserProfile";
const PROFILE_URL_COL = "profileUrl";

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function extFromFile(file: File) {
  const raw = file.name.split(".").pop()?.toLowerCase();
  if (!raw) return "jpg";
  if (raw === "jpeg") return "jpg";
  return raw;
}

function getAuthMetaAvatar(user: any): string {
  return (
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.identities?.[0]?.identity_data?.avatar_url ||
    user?.identities?.[0]?.identity_data?.picture ||
    ""
  );
}

function isMissingColumnError(err: any, colName: string) {
  const msg = String(err?.message ?? "");
  return msg.includes(`Could not find the '${colName}' column`);
}

async function uploadProfileImageToSupabase(userId: string, file: File) {
  const ext = extFromFile(file);
  const path = `${userId}/profile.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error("Failed to get public URL (bucket public?)");
  return publicUrl;
}

/**
 * No UNIQUE needed.
 * Tries UPDATE by auth_id, if 0 rows updated then INSERT.
 */
async function saveUserRow(authId: string, payload: Record<string, any>) {
  const { data: updated, error: upErr } = await supabase
    .from(USER_TABLE)
    .update(payload)
    .eq(USER_AUTH_COL, authId)
    .select("id"); // returns [] if no row matched

  if (upErr) throw upErr;

  if (Array.isArray(updated) && updated.length > 0) return;

  const { error: insErr } = await supabase
    .from(USER_TABLE)
    .insert([{ [USER_AUTH_COL]: authId, ...payload }]);

  if (insErr) throw insErr;
}

const ProfileTabs: React.FC = () => {
  const theme = useTheme();
  const isUpMd = useMediaQuery(theme.breakpoints.up("md"));

  const { user, profile } = useAuth() as any;
  const authId: string | null = user?.id ?? null;

  const baseAvatarSrc = useMemo(() => {
    const fromDb = profile?.[PROFILE_URL_COL] || profile?.profileUrl || profile?.photoUrl || "";
    const fromAuth = getAuthMetaAvatar(user);
    return fromDb || fromAuth || "/assets/icons/administrater.png";
  }, [profile, user]);

  const defaultValues = useMemo<FormValues>(
    () => ({
      fullName:
        profile?.full_name ??
        profile?.fullName ??
        user?.user_metadata?.full_name ??
        user?.user_metadata?.name ??
        "",
      phone: profile?.phone ?? profile?.mobile ?? user?.phone ?? "",
      email: profile?.email ?? user?.email ?? "",
      password: "",
      confirmPassword: "",
    }),
    [profile, user]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const passwordValue = watch("password");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>(baseAvatarSrc);

  useEffect(() => {
    if (!selectedFile) setCurrentAvatarUrl(baseAvatarSrc);
  }, [baseAvatarSrc, selectedFile]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const displaySrc = previewUrl ?? currentAvatarUrl;

  const [publishing, setPublishing] = useState(false);

  const openPicker = () => fileRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error("Please select an image file (JPG/PNG).");
      e.target.value = "";
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("Image too large (max 5MB).");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);

    e.target.value = "";
  };

  const clearPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  // const onCancel = () => {
  //   reset(defaultValues);
  //   clearPreview();
  //   setCurrentAvatarUrl(baseAvatarSrc);
  // };

  const submit = async (values: FormValues, publish: boolean) => {
    if (!authId) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      setPublishing(true);

      let uploadedProfileUrl: string | null = null;
      if (selectedFile) {
        uploadedProfileUrl = await uploadProfileImageToSupabase(authId, selectedFile);
      }

      // ✅ Ensure these keys match your Users table columns
      const payload: Record<string, any> = {
        full_name: values.fullName?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
      };

      if (uploadedProfileUrl) payload[PROFILE_URL_COL] = uploadedProfileUrl;
      if (publish) payload.published = true;

      try {
        await saveUserRow(authId, payload);
      } catch (err: any) {
        if (publish && isMissingColumnError(err, "published")) {
          delete payload.published;
          await saveUserRow(authId, payload);
        } else {
          throw err;
        }
      }

      // ✅ Update password in Supabase Auth (not in Users table)
      if (values.password?.trim()) {
        const { error } = await supabase.auth.updateUser({ password: values.password.trim() });
        if (error) throw error;
      }

      if (uploadedProfileUrl) {
        setCurrentAvatarUrl(uploadedProfileUrl);
        clearPreview();
      }

      toast.success(publish ? "Updated ✅" : "Updated ✅");
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
        justifyContent: "space-between",
        p: { xs: 1.5, md: 2 },
        alignItems: { xs: "stretch", md: "center" },
      }}
    >
      {/* Left: Avatar */}
      <Box sx={{ display: "flex", width: { xs: "100%", md: "40%" }, height:  { xs: "100%", md: "40%" } }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 100,
            boxShadow: 5,
            overflow: "hidden",
            cursor: "pointer",
            "&:hover .avatarOverlay": { opacity: 1 },
          }}
          onClick={openPicker}
          role="button"
          aria-label="Edit avatar"
        >
          <Box
            component="img"
            src={displaySrc}
            alt="user avatar"
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          <Box
            className="avatarOverlay"
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(0,0,0,0.45)",
              opacity: 0,
              transition: "opacity 180ms ease",
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                openPicker();
              }}
              sx={{
                width: 54,
                height: 54,
                bgcolor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(2px)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.26)" },
              }}
              aria-label="Select new image"
            >
              <EditOutlined sx={{ color: "#fff" }} />
            </IconButton>
          </Box>

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
        </Box>
      </Box>

      {/* Right: Form */}
      <Box sx={{ width: { xs: "100%", md: 520 } }}>
        <CustomInput
          label="Full Name"
          placeholder="Enter your full name"
          showRequiredAsterisk={false}
          defaultValue={defaultValues.fullName}
          register={register("fullName")}
          error={errors.fullName?.message}
        />

        <CustomInput
          label="Phone Number"
          placeholder="Enter mobile number"
          showRequiredAsterisk={false}
          defaultValue={defaultValues.phone}
          register={register("phone")}
          error={errors.phone?.message}
        />

        <CustomInput
          label="Email"
          placeholder="example@email.com"
          type="email"
          showRequiredAsterisk={false}
          defaultValue={defaultValues.email}
          register={register("email", {
            validate: (v) => (v?.trim() === "" ? true : EMAIL_REGEX.test(v) || "Invalid email"),
          })}
          error={errors.email?.message}
        />

        <CustomInput
          label="Password"
          placeholder="Enter Password"
          type="password"
          showRequiredAsterisk={false}
          register={register("password", {
            validate: (v) => (v?.trim() === "" ? true : v.length >= 6 || "Min 6 characters"),
          })}
          error={errors.password?.message}
        />

        <CustomInput
          label="Confirm Password"
          placeholder="Confirm password"
          type="password"
          showRequiredAsterisk={false}
          register={register("confirmPassword", {
            validate: (v) => {
              if (!passwordValue) return true;
              return v === passwordValue || "Passwords do not match";
            },
          })}
          error={errors.confirmPassword?.message}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 4, mt: 1 }}>
          {/* <LandingButton
            title="Cancel"
            variant="outlined"
            width={isUpMd ? "300px" : "100%"}
            personal
            onClick={onCancel}
            // disabled={publishing || isSubmitting}
          /> */}

          <LandingButton
            title={publishing ? "Updating..." : "Update & Publish"}
            width={isUpMd ? "250px" : "100%"}
            personal
            onClick={handleSubmit((v) => submit(v, true))}
            loading={publishing || isSubmitting}
            // disabled={publishing || isSubmitting}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileTabs;
