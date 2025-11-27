import { useState } from "react";
import { Close, UploadFileOutlined } from "@mui/icons-material";
import {
    Box,
    Chip,
    IconButton,
    Modal,
    TextField,
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

const CategoryModal = (props: ModalType) => {
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

    // ---------------- Sub Categories / Chips ----------------
    const [chipInput, setChipInput] = useState("");
    const [chips, setChips] = useState<string[]>([]);

    const handleChipEnter = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!chipInput.trim()) return;

            setChips((prev) => [...prev, chipInput.trim()]);
            setValue("subCategories", [...chips, chipInput.trim()]);
            setChipInput("");
        }
    };

    const deleteChip = (chip: string) => {
        const updated = chips.filter((c) => c !== chip);
        setChips(updated);
        setValue("subCategories", updated);
    };

    // ---------------- Submit Form ----------------
    const onSubmit = async (data: any) => {
        setLoading(true);

        const payload = {
            ...data,
            subCategories: chips,
            image: imagePreview,
        };


        const { data: category, error } = await supabase
            .from("categories")
            .insert([
                {
                    name: payload.category,
                    image_base64: payload.image,
                    subcategories: payload.subCategories,
                }
            ])
            .select()
            .single();

        setLoading(false);

        if (error || !category) {
            toast.error("Category stored successfully!");
            return;
        }
        toast.success("Category stored successfully!");
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
                        border: "1px solid lightGray",
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
                        sx={{ width: "100%", height: 250, objectFit: "cover" }}
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
                    label="Category"
                    placeholder="Enter Your Main Categories"
                    register={register("category")}
                />

                {/* SUB CATEGORY INPUT BOX */}
                <Typography sx={{ textAlign: 'start', fontSize: '14px', fontWeight: 700 }}>Sub Category</Typography>
                <Box
                    sx={{
                        border: "1px solid #d0d0d0",
                        borderRadius: "12px",
                        padding: "8px",
                        minHeight: "auto",
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        cursor: "text",
                    }}
                    onClick={() => document.getElementById("chip-input-field")?.focus()}
                >
                    {/* Chips */}
                    {chips.map((chip) => (
                        <Chip
                            key={chip}
                            label={chip}
                            onDelete={() => deleteChip(chip)}
                            sx={{
                                bgcolor: COLORS.seconday,
                                color: "#000",
                                borderRadius: "8px",
                            }}
                        />
                    ))}

                    {/* Input field without border */}
                    <TextField
                        id="chip-input-field"
                        variant="standard"
                        placeholder={chips.length === 0 ? "Type & press Enter" : ""}
                        value={chipInput}
                        onChange={(e) => setChipInput(e.target.value)}
                        multiline
                        rows={5}
                        onKeyDown={handleChipEnter}
                        InputProps={{
                            disableUnderline: true, // <-- no border
                            style: { paddingTop: 3, fontSize: 14 },
                        }}
                        sx={{ flexGrow: 1, minWidth: "120px" }}
                    />
                </Box>


                <br />

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
        </Modal>
    );
};

export default CategoryModal;

const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { md: 600, sm: 600, xs: "95%" },
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
