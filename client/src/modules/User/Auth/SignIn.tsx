import { Box, IconButton, Typography } from "@mui/material";
import CustomInput from "../../../components/CustomInput/CustomInput";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../constant/route";
import { COLORS } from "../../../constant/color";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

type SigninForm = {
  email: string;
  password: string;
};

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninForm>();

  const onSubmitForm = async (data: SigninForm) => {
    console.log(data, "---");
    try {
      const res = await signIn({
        email: data.email,
        password: data.password,
      });

      console.log("✅ Signed in:", res);

      toast.success("Login successful!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <Box
        component={"img"}
        src="/assets/images/animated-banner.jpg"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          filter: "brightness(60%)",
        }}
      />

      {/* Centered form */}
      <Box
        component={"form"}
        onSubmit={handleSubmit(onSubmitForm)}
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: 500,
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "35px", fontWeight: 700 }}>
            Sign In
          </Typography>
          {/* Your inputs & buttons go here */}
          <Box mt={5}>
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              type="email"
              register={register("email", {
                required: "Email is required",
              })}
              error={errors.email?.message}
            />
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              type="password"
              register={register("password", {
                required: "Password is required",
              })}
              error={errors.password?.message}
            />
            <LandingButton
              title="Sign in "
              width="450px"
              personal
              type={"submit"}
            />

            <Typography sx={{ fontSize: "13px", textAlign: "start", mt: 3 }}>
              I have no account{" "}
              <span
                onClick={() => navigate(USER_ROUTES.SIGNUP)}
                style={{
                  fontWeight: "bold",
                  color: "rgba(44, 5, 44, 1)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Sign Up
              </span>
              .
            </Typography>

            <IconButton
              sx={{
                p: 1,
                bgcolor: "brown",
                color: COLORS.white,
                width: 450,
                borderRadius: 1,
                fontSize: "15px",
                mt: 3,
                display: "flex",
                gap: 2,
                "&:hover": { bgcolor: COLORS.primary },
              }}
            >
              Continue with Google
              <Box
                component={"img"}
                src="/assets/images/google.png"
                sx={{ width: "30px", height: "30px" }}
              />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn;
