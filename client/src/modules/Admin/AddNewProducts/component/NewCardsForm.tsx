import { Box, LinearProgress, Typography } from "@mui/material";
import CustomInput from "../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../components/LandingButton/LandingButton";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabase/supabase";

type FormValue = {
  cardName: string;
  cardCategory: string;
  sku: string;
  actualPrice: string;
  salePrice: string;
  description: string;
  cardImage: FileList;
};

type EditFormValue = {
  card_name: string;
  card_category: string;
  sku: string;
  actual_price: string;
  sale_price: string;
  description: string;
  image_url: FileList;
};

type Props = {
  editProduct?: EditFormValue;
};

const NewCardsForm = (props: Props) => {
  const { editProduct } = props;

  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormValue>();

  const cardImageFiles = watch("cardImage");
  const isImageMissing = !image && !cardImageFiles?.length;

  const handleImageUpload = (file: File) => {
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);

          const reader = new FileReader();
          reader.onloadend = () => {
            setImage(reader.result as string);
            setLoading(false);
          };
          reader.readAsDataURL(file);

          return 100;
        }
        return old + 10;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const onSubmit = async (data: FormValue) => {
    const finalImage = image || editProduct?.image_url;

    if (!finalImage) {
      toast.error("Please upload a card image!");
      return;
    }

    try {
      setLoading(true);
      if (editProduct) {
        const { error } = await supabase
          .from("cards")
          .update({
            card_name: data.cardName,
            card_category: data.cardCategory,
            sku: data.sku,
            actual_price: Number(data.actualPrice),
            sale_price: Number(data.salePrice),
            description: data.description,
            image_url: finalImage,
          })
          .eq("sku", editProduct.sku);

        if (error) throw error;
        toast.success("Card updated successfully!");
      } else {
        const { error } = await supabase.from("cards").insert([
          {
            card_name: data.cardName,
            card_category: data.cardCategory,
            sku: data.sku,
            actual_price: Number(data.actualPrice),
            sale_price: Number(data.salePrice),
            description: data.description,
            image_url: finalImage,
          },
        ]);
        if (error) throw error;
        toast.success("Card saved successfully!");
      }

      setImage(null);
      reset();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save card: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 3 }}>
      <Box
        sx={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          width: "100%",
          height: "auto",
          overflow: "hidden",
          mt: 2,
        }}
      >
        {/* LEFT BOX (Image Upload) */}
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            width: { md: "50%" },
            // Add error border style for image upload container
            border: `1px solid ${
              isImageMissing && errors.cardImage ? "red" : "lightGray"
            }`,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            cursor: "pointer",
            bgcolor: "#eeedecff",
          }}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {/* Hidden file input */}
          <input
            type="file"
            id="fileInput"
            hidden
            accept="image/*"
            {...register("cardImage", { required: !editProduct ? "Card image is required" : false })}
            onChange={handleFileSelect}
          />

          {loading ? (
            <Box sx={{ width: "80%" }}>
              <Typography sx={{ mb: 1, fontSize: 14, color: "black" }}>
                Uploading... {progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "#ffe0b2",
                  "& .MuiLinearProgress-bar": { backgroundColor: "black" },
                }}
              />
            </Box>
          ) : image || editProduct?.image_url ? (
            <Box
              component="img"
              src={`${image || editProduct?.image_url}`}
              alt="Uploaded"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                m: "auto",
                alignItems: "center",
              }}
            >
              <Box
                component={"img"}
                src="/assets/icons/gallery.png"
                sx={{ width: 150, height: 150 }}
              />
              <Typography sx={{ color: "gray", fontSize: 16 }}>
                Drag & Drop or Click to Upload
              </Typography>
            </Box>
          )}

          {/* Image Error Message */}
          {isImageMissing && errors.cardImage && (
            <Typography
              sx={{
                position: "absolute",
                bottom: 10,
                fontSize: 14,
                color: "red",
              }}
            >
              {errors.cardImage.message}
            </Typography>
          )}
        </Box>
        <Box
          component={"form"}
          sx={{ width: { md: "50%" } }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Re-enabled error prop for visibility */}
          <CustomInput
            label="Card Name"
            placeholder="Enter your card name"
            defaultValue={editProduct?.card_name || ""}
            register={register("cardName", {
              required: !editProduct ? "Card Name is required" : false,
            })}
            error={errors.cardName?.message}
          />
          <CustomInput
            label="Card Category"
            type="select"
            placeholder="Select category"
            register={register("cardCategory", {
              required: !editProduct ? "Category is required" : false,
            })}
            error={errors.cardCategory?.message}
            defaultValue={editProduct?.card_category || ""}
            options={[
              { label: "Invites", value: "Invites" },
              { label: "Mugs", value: "Mugs" },
              { label: "Coasters", value: "Coasters" },
              { label: "Stickers", value: "Stickers" },
              { label: "Stationary", value: "Stationary" },
              { label: "wall Art", value: "wall Art" },
              { label: "Photo Art", value: "Photo Art" },
              { label: "Tshirts", value: "Tshirts" },
              { label: "Hoodies", value: "Hoodies" },
              { label: "Leaflets & Flyers", value: "Leaflets & Flyers" },
              { label: "Business Cards", value: "Business Cards" },
            ]}
          />
          <CustomInput
            label="SKU"
            placeholder="Enter your SKU"
            defaultValue={editProduct?.sku || ""}
            register={register("sku", { required: !editProduct ? "SKU is required" : false })}
            error={errors.sku?.message}
          />
          <CustomInput
            label="Actual Price "
            placeholder="Enter your actual price"
            defaultValue={editProduct?.actual_price || ""}
            type="number"
            register={register("actualPrice", {
              required: !editProduct ? "Actual Price is required" : false,
              valueAsNumber: true,
              min: { value: 0.01, message: "Price must be greater than zero" },
            })}
            error={errors.actualPrice?.message}
          />
          <CustomInput
            label="Sale Price"
            placeholder="Enter your sale price"
            defaultValue={editProduct?.sale_price || ""}
            type="number"
            register={register("salePrice", {
              required: false,
              valueAsNumber: true,
              min: { value: 0.01, message: "Price must be greater than zero" },
            })}
            error={errors.salePrice?.message}
          />
          <CustomInput
            label="Card description"
            placeholder="Enter your description"
            defaultValue={editProduct?.description || ""}
            register={register("description", {
              required: !editProduct ? "Description is required" : false,
            })}
            error={errors.description?.message}
            multiline
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              mt: 2,
            }}
          >
            <LandingButton
              title={`${editProduct ? "Update & Publish" : "Save & Publish"}`}
              personal
              variant="outlined"
              width="250px"
              type="submit"
              loading={loading}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NewCardsForm;
