import { Box, IconButton, Typography } from "@mui/material";
import CustomInput from "../../../components/CustomInput/CustomInput";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../constant/route";
import { COLORS } from "../../../constant/color";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

type SigninForm = {
  email: string;
  password: string;
};

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninForm>();

  const onSubmitForm = async (data: SigninForm) => {
    try {
      await signIn({
        email: data.email,
        password: data.password,
      });
      toast.success("Login successful!");
      navigate('/');
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
            width: { md: 500, sm: 500, xs: "100%" },
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: { md: "35px", sm: "35px", xs: 22 },
              fontWeight: 700,
            }}
          >
            Sign In
          </Typography>

          <Box mt={5}>
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              // type="email"
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
              title="Sign in"
              width="450px"
              personal
              type="submit"
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

            {/* ✅ GOOGLE SIGN-IN BUTTON */}
            <IconButton
              onClick={signInWithGoogle}
              sx={{
                p: 1,
                bgcolor: "brown",
                color: COLORS.white,
                width: { md: 450, sm: 450, xs: "100%" },
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
