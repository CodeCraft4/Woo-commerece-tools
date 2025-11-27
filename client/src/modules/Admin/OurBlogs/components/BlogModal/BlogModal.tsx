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
import toast from "react-hot-toast";
import { supabase } from "../../../../../supabase/supabase";

type ModalType = {
    open: boolean;
    onCloseModal: () => void;
    title?: string;
};

const BlogsModal = (props: ModalType) => {
    const { open, onCloseModal, title } = props;

    // ---------------- React Hook Form ----------------
    const { register, handleSubmit, setValue } = useForm();

    // ---------------- Image Upload (Base64) ----------------
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)

    const handleImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            setValue("image", reader.result);
        };
        reader.readAsDataURL(file);
    };

    // ---------------- Submit Form ----------------
    const onSubmit = async (data: any) => {
        setLoading(true);

        const payload = {
            image_base64: imagePreview,
            title: data.title,
            category: data.blogCategory,
            short_description: data.shortDescription,
            long_description: data.longDescription,
        };

        const {error } = await supabase
            .from("blogs")
            .insert([payload])
            .select()
            .single();

        setLoading(false);

        if (error) {
            toast.error(error.message || "Error storing blog!");
            return;
        }

        toast.success("Blog stored successfully!");
        onCloseModal();
    };


    return (
        <Modal open={open} onClose={onCloseModal}>
            <Box sx={{
                ...style, overflowY: 'auto', "&::-webkit-scrollbar": {
                    height: "6px",
                    width: '6px',
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1",
                    borderRadius: "20px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: COLORS.primary,
                    borderRadius: "20px",
                },
            }} component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Header */}
                <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{title}</Typography>
                    <IconButton sx={{ color: COLORS.black }} onClick={onCloseModal}>
                        <Close />
                    </IconButton>
                </Box>

                <Box sx={{ display: { md: 'flex', sm: 'flex', xs: 'block' }, width: '100%', height: { md: '95%', sm: '95%', xs: 400 }, gap: 1 }}>
                    {/* -------- Image Upload Box -------- */}
                    <Box
                        sx={{
                            borderRadius: 2,
                            border: "1px solid lightGray",
                            overflow: "hidden",
                            position: "relative",
                            width: '100%',
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
                            sx={{ width: "100%", height: '100%', objectFit: "cover" }}
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

                    <Box sx={{ width: '100%' }}>
                        {/* ---------------- Main Category Input ---------------- */}
                        <CustomInput
                            label="Title"
                            placeholder="Enter your blog title"
                            register={register("title")}
                        />
                        <CustomInput
                            label="Card Category"
                            type="select"
                            placeholder="Select category"
                            register={register("blogCategory")}
                            // error={errors.cardCategory?.message}
                            options={[
                                { label: "Birthday Cards", value: "Birthday Cards" },
                                { label: "Birthday Gift", value: "Birthday Gift" },
                                { label: "Kids Birthday Cards", value: "Kids Birthday Cards" },
                                { label: "Kids Birthday Gift", value: "Kids Birthday Gift" },
                                { label: "Letter box", value: "Letter box" },
                                { label: "Under £30", value: "Under £30" },
                                { label: "Under £60", value: "Under £60" },
                            ]}
                        />
                        <CustomInput
                            label="Description 1"
                            placeholder="Enter your shot description"
                            register={register("shortDescription")}
                        />
                        <CustomInput
                            label="Description 2"
                            placeholder="Enter your long description"
                            register={register("longDescription")}
                            multiline
                        />
                        {/* Buttons */}
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                            <LandingButton
                                title="Cancel"
                                variant="outlined"
                                width="250px"
                                personal
                                onClick={onCloseModal}
                            />
                            <LandingButton
                                title="Add Categories"
                                width="250px"
                                personal
                                type="submit"
                                loading={loading}
                            />
                        </Box>
                    </Box>
                </Box>



            </Box>
        </Modal>
    );
};

export default BlogsModal;

const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { md: 900, sm: 700, xs: "95%" },
    height: { md: 600, sm: 500, xs: '300' },
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "8px",
    p: 2,
    textAlign: "center",
    overflowY: "auto"
};
