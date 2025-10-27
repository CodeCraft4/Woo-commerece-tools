"use client";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import CustomInput from "../../../../../components/CustomInput/CustomInput";
import { useState } from "react";
import { BorderColorRounded } from "@mui/icons-material";
import toast from "react-hot-toast";
import { supabase } from "../../../../../supabase/supabase";
import { useAdminStore } from "../../../../../stores";

type FormValue = {
  role?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  newpassword?: string;
  confirmpassword?: string;
};

const SettingForm = () => {
  const { register, handleSubmit } = useForm<FormValue>({
    defaultValues: {
      role: "Admin",
    },
  });

  const { admin } = useAdminStore();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string>("/assets/icons/administrater.png");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImage(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValue) => {
    setLoading(true);

    if (!admin?.id) {
      toast.error("Admin ID not found!");
      setLoading(false);
      return;
    }

    const payload = {
      role: data.role || "Admin",
      first_name: data.firstName || admin.first_name,
      last_name: data.lastName || admin.last_name,
      email: data.email || admin.email,
      password: data.newpassword || admin.password,
      profile_image:
        image !== "/assets/icons/administrater.png"
          ? image
          : admin.profile_image,
    };

    console.log("Updating Admin:", payload);

    const { error } = await supabase
      .from("admins")
      .update(payload)
      .eq("id", admin.id);

    if (error) {
      console.error("Supabase Error:", error);
      toast.error("Error updating admin data");
    } else {
      toast.success("Admin updated successfully!");
    }

    setLoading(false);
  };

  return (
    <Box sx={{ p: { md: 5, sm: 5, xs: 2 } }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "block" },
            width: "100%",
          }}
        >
          {/* Left Side - Profile Image */}
          <Box
            sx={{
              width: { md: "50%", sm: "50%", xs: "100%" },
              p:{md: 3,sm:3,xs:0},
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              gap: 4,
            }}
          >
            <Box
              sx={{
                width: {md:350,sm:350,xs:250},
                height: {md:350,sm:350,xs:250},
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #ff4d00",
                position: "relative",
                cursor: "pointer",
              }}
            >
              <img
                src={
                  image !== "/assets/icons/administrater.png"
                    ? image
                    : admin?.profile_image || "/assets/icons/administrater.png"
                }
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {/* Overlay with Edit Icon */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(0, 0, 0, 0.45)",
                  opacity: 0,
                  transition: "0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": { opacity: 1 },
                }}
                onClick={() => document.getElementById("imageUpload")?.click()}
              >
                <BorderColorRounded sx={{ fontSize: 40, color: "#fff" }} />
              </Box>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </Box>

            <Box sx={{ width: "100%" }}>
              <CustomInput
                label="Admin Role"
                placeholder="Enter Your admin role"
                type="select"
                register={register("role")}
                defaultValue={admin?.role || "Admin"}
                options={[
                  { label: "Admin", value: "Admin" },
                  { label: "Contributor", value: "Contributor" },
                  { label: "Guest", value: "Guest" },
                ]}
              />
            </Box>
          </Box>

          {/* Right Side - Form Fields */}
          <Box
            sx={{
              width: { md: "50%", sm: "50%", xs: "100%" },
              p: {md:3,sm:3,xs:0},
            }}
          >
            <CustomInput
              label="First Name"
              placeholder="Enter first name"
              register={register("firstName")}
              defaultValue={admin?.first_name ? admin?.first_name : ""}
            />
            <CustomInput
              label="Last Name"
              placeholder="Enter last name"
              register={register("lastName")}
              defaultValue={admin?.last_name ? admin?.last_name : ""}
            />
            <CustomInput
              label="Email"
              placeholder="Enter email"
              register={register("email")}
              defaultValue={admin?.email ? admin?.email : ""}
            />
            <CustomInput
              label="New Password"
              placeholder="Enter password"
              type="password"
              defaultValue={admin?.password ? admin?.password : ""}
              register={register("newpassword")}
            />
            <CustomInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              register={register("confirmpassword")}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <LandingButton
                title="Update Setting"
                personal
                width="240px"
                variant="outlined"
                type="submit"
                loading={loading}
              />
            </Box>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default SettingForm;
