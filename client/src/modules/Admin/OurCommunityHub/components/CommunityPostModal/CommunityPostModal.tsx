import { useState } from "react";
import { Close, UploadFileOutlined } from "@mui/icons-material";
import {
    Box,
    IconButton,
    Modal,
    Typography,
} from "@mui/material";
import { COLORS } from "../../../../../constant/color";
import CustomInput from "../../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { useForm } from "react-hook-form";
import { supabase } from "../../../../../supabase/supabase";
import toast from "react-hot-toast";

type ModalType = {
    open: boolean;
    onCloseModal: () => void;
    title?: string;
};

const CommunityPostModal = ({ open, onCloseModal, title }: ModalType) => {
    const { register, handleSubmit, setValue, reset } = useForm();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            setValue("image_base64", reader.result);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: any) => {
        setLoading(true);

        const payload = {
            image_base64: data.image_base64,
            post_title: data.postTitle,
            admin_thought: data.adminThought,
            created_by: "Admin",
        };

        const { error } = await supabase
            .from("topics")
            .insert([payload]);

        setLoading(false);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Post added successfully!");
        reset();
        onCloseModal();
    };



    return (
        <Modal open={open} onClose={onCloseModal}>
            <Box sx={{ ...style, overflowY: 'scroll', }} component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Header */}
                <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{title}</Typography>
                    <IconButton sx={{ color: COLORS.black }} onClick={onCloseModal}>
                        <Close />
                    </IconButton>
                </Box>

                <br />

                {/* -------- Image Upload Box -------- */}
                <Box
                    sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        position: "relative",
                        cursor: "pointer",
                        "&:hover .overlay": {
                            opacity: 1,
                        },
                        "&:hover .upload-btn": {
                            opacity: 1,
                            transform: "translate(-50%, -50%) scale(1)",
                        },
                    }}
                >
                    <Box
                        component="img"
                        src={imagePreview || "/assets/images/animated-banner.jpg"}
                        alt="category-img"
                        sx={{ width: "100%", height: 300, objectFit: "cover" }}
                    />

                    {/* Hidden Input */}
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        id="category-image-upload"
                        onChange={handleImageUpload}
                    />

                    {/* -------- Overlay (visible on hover) -------- */}
                    <Box
                        className="overlay"
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            bgcolor: "rgba(0,0,0,0.4)",
                            opacity: 0,
                            transition: "0.3s ease",
                        }}
                    />

                    {/* -------- Upload Button (visible on hover) -------- */}
                    <IconButton
                        className="upload-btn"
                        component="label"
                        htmlFor="category-image-upload"
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%) scale(0.6)",
                            transition: "0.3s ease",
                            opacity: 0,
                            zIndex: 99,
                            bgcolor: COLORS.primary,
                            color: "#fff",
                            "&:hover": {
                                bgcolor: COLORS.primary,
                            },
                        }}
                    >
                        <UploadFileOutlined sx={{ fontSize: 35 }} />
                    </IconButton>
                </Box>


                <br />

                {/* ---------------- Main Category Input ---------------- */}
                <CustomInput
                    label="Post Title"
                    placeholder="Enter Your post title"
                    register={register("postTitle")}
                />
                <CustomInput
                    label="Admin tought"
                    placeholder="Enter Your post title"
                    register={register("adminThought")}
                    multiline
                />


                {/* Buttons */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                    <LandingButton
                        title="Cancel"
                        variant="outlined"
                        width="200px"
                        personal
                        onClick={onCloseModal}
                    />
                    <LandingButton
                        title="Add Post"
                        width="200px"
                        personal
                        type="submit"
                        loading={loading}
                    />
                </Box>
            </Box>
        </Modal>
    );
};

export default CommunityPostModal;

const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { md: 500, sm: 500, xs: "95%" },
    height: { md: 600, sm: 600, xs: '500' },
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "8px",
    p: 2,
    textAlign: "center",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
        height: "6px",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "#f1f1f1",
        borderRadius: "20px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: COLORS.primary,
        borderRadius: "20px",
    },
};
