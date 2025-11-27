import { Box, Typography } from "@mui/material";
import CustomInput from "../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../components/LandingButton/LandingButton";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabase/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../../constant/route";
import { useCardEditor } from "../../../../context/AdminEditorContext";
import * as htmlToImage from "html-to-image";


const shapes = [
  { id: "square", label: "Square", path: "inset(0% 0% 0% 0%)" },
  {
    id: "triangle",
    label: "Triangle",
    path: "polygon(50% 0%, 0% 100%, 100% 100%)",
  },
  {
    id: "trapezoid",
    label: "Trapezoid",
    path: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
  },
  {
    id: "parallelogram",
    label: "Parallelogram",
    path: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
  },
  {
    id: "rhombus",
    label: "Rhombus",
    path: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  },
  {
    id: "pentagon",
    label: "Pentagon",
    path: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
  },
  {
    id: "hexagon",
    label: "Hexagon",
    path: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  },
  {
    id: "heptagon",
    label: "Heptagon",
    path: "polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)",
  },
  {
    id: "octagon",
    label: "Octagon",
    path: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
  },
  {
    id: "nonagon",
    label: "Nonagon",
    path: "polygon(50% 0%, 85% 15%, 100% 45%, 90% 80%, 60% 100%, 40% 100%, 10% 80%, 0% 45%, 15% 15%)",
  },
  {
    id: "decagon",
    label: "Decagon",
    path: "polygon(50% 0%, 80% 10%, 100% 35%, 100% 65%, 80% 90%, 50% 100%, 20% 90%, 0% 65%, 0% 35%, 20% 10%)",
  },
  {
    id: "bevel",
    label: "Bevel",
    path: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)",
  },
  {
    id: "rabbet",
    label: "Rabbet",
    path: "polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)",
  },
  {
    id: "star",
    label: "Star",
    path: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  },
  {
    id: "cross",
    label: "Cross",
    path: "polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)",
  },
  {
    id: "message",
    label: "Message",
    path: "polygon(0% 0%, 100% 0%, 100% 80%, 60% 80%, 50% 100%, 40% 80%, 0% 80%)",
  },
  {
    id: "close",
    label: "Close",
    path: "polygon(20% 0%, 50% 30%, 80% 0%, 100% 20%, 70% 50%, 100% 80%, 80% 100%, 50% 70%, 20% 100%, 0% 80%, 30% 50%, 0% 20%)",
  },
  {
    id: "frame",
    label: "Frame",
    path: "polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)",
  },
  {
    id: "inset",
    label: "Inset",
    path: "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)",
  },
  {
    id: "custom-polygon",
    label: "Custom Polygon",
    path: "polygon(50% 0%, 100% 25%, 80% 100%, 20% 100%, 0% 25%)",
  },
  { id: "circle", label: "Circle", path: "circle(50% at 50% 50%)" },
  { id: "ellipse", label: "Ellipse", path: "ellipse(45% 35% at 50% 50%)" },
];

type FormValue = {
  cardName: string;
  cardCategory: string;
  sku: string;
  actualPrice: string;
  salePrice: string;
  description: string;
  cardImage: FileList;
  polygon_shape: string;
};

type EditFormValue = {
  cardName: string;
  cardCategory: string;
  sku: string;
  actualPrice: string;
  salePrice: string;
  description: string;
  imageUrl: FileList | string;
  polygon_shape: string;
  polyganLayout: string;
  lastpageImageUrl: string;
  lastMessage: string;
};

type Props = {
  editProduct?: EditFormValue;
};

const NewCardsForm = (props: Props) => {
  const { editProduct } = props;

  const {
    uploadedShapeImage,
    selectedShapeImage,
    elements,
    textElements,
    setFormData,
    resetEditor,
    stickerElements,
  } = useCardEditor();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Access formData from navigation state
  const { formData } = location.state || {};
  const initialElements =
    formData?.elements ||
    (editProduct?.polyganLayout
      ? JSON.parse(editProduct.polyganLayout).elements
      : []) ||
    [];
  const initialTextElements =
    formData?.textElements ||
    (editProduct?.polyganLayout
      ? JSON.parse(editProduct.polyganLayout).textElements
      : []) ||
    [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormValue>({
    defaultValues: {
      cardName: editProduct?.cardName || formData?.cardName || "",
      cardCategory: editProduct?.cardCategory || formData?.cardCategory || "",
      sku: editProduct?.sku || formData?.sku || "",
      actualPrice: editProduct?.actualPrice || formData?.actualprice || "",
      salePrice: editProduct?.salePrice || formData?.salePrice || "",
      description: editProduct?.description || formData?.description || "",
      polygon_shape: editProduct?.polygon_shape || selectedShapeImage || "",
    },
  });

  const cardImageFiles = watch("cardImage");
  const isImageMissing =
    !image &&
    !cardImageFiles?.length &&
    !uploadedShapeImage &&
    initialElements.length === 0;

  const handleImageUpload = (file: File) => {
    if (!file) return;
    setLoading(true);
    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);
    setLoading(false);
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

  const handleEditLayout = () => {
    const formData = watch();
    setFormData({
      cardName: formData.cardName,
      cardCategory: formData.cardCategory,
      sku: formData.sku,
      actualPrice: formData.actualPrice,
      salePrice: formData.salePrice,
      description: formData.description,
      cardImage: `${image || editProduct?.imageUrl || null}`,
      layout_type:
        elements.length > 0
          ? "isMultipleLayout"
          : selectedShapeImage
            ? "isShapeLayout"
            : null,
    });

    navigate(ADMINS_DASHBOARD.ADMIN_EDITOR, {
      state: {
        formData: {
          ...formData,
          cardImage: image || editProduct?.imageUrl || null,
          elements,
          textElements,
        },
      },
    });
  };

  const onSubmit = async (data: FormValue) => {
    const finalImage = image || editProduct?.imageUrl || uploadedShapeImage || stickerElements;
    if (!finalImage && initialElements.length === 0 || stickerElements.length === 0) {
      toast.error("Please upload at least one card image!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Capture screenshot of the card preview
      let capturedImageUrl = null;
      if (previewRef.current) {
        try {
          const dataUrl = await htmlToImage.toPng(previewRef.current, {
            quality: 0.95,
            cacheBust: true,
          });
          capturedImageUrl = dataUrl;
          console.log("✅ Card captured image URL:", dataUrl);
        } catch (err) {
          console.warn("⚠️ Failed to capture image:", err);
        }
      }

      // Prepare layout data as an object of elements and textElements
      const layoutData = {
        elements: initialElements.map((el: any) => ({
          id: el.id,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          src: el.src,
        })),
        textElements: initialTextElements.map((te: any) => ({
          id: te.id,
          x: te.x,
          y: te.y,
          width: te.width,
          height: te.height,
          text: te.text,
          bold: te.bold,
          italic: te.italic,
          fontSize: te.fontSize,
          fontFamily: te.fontFamily,
          color: te.color,
        })),
        stickers: stickerElements.map((st) => ({
          id: st.id,
          sticker: st.sticker,
          x: st.x,
          y: st.y,
          width: st.width,
          height: st.height,
          zIndex: st.zIndex
        }))
      };

      const cardPayload = {
        cardName: data.cardName,
        cardCategory: data.cardCategory,
        sku: data.sku,
        actualPrice: Number(data.actualPrice),
        salePrice: Number(data.salePrice) || null,
        description: data.description,
        imageUrl: capturedImageUrl || initialElements[initialElements.length - 1]?.src || null,
        polygon_shape: selectedShapeImage || data.polygon_shape || null,
        polygonLayout: layoutData, // Store the layout data directly as JSON
        lastpageImageUrl: capturedImageUrl || initialElements[initialElements.length - 1]?.src || null,
        lastMessage:
          initialTextElements[initialTextElements.length - 1]?.text ||
          "",
      };

      if (editProduct) {
        const { error } = await supabase
          .from("cards")
          .update(cardPayload)
          .eq("sku", editProduct.sku);
        if (error) throw error;
        toast.success("Card updated successfully!");
      } else {
        const { error } = await supabase.from("cards").insert([cardPayload]);
        if (error) throw error;
        toast.success("Card saved successfully!");
      }

      setImage(null);

    } catch (err: any) {
      console.error("Error saving card:", err);
      toast.error("Failed to save card: " + err.message);
    } finally {
      setLoading(false);
    }
    reset();
    // Optionally reset context
    resetEditor()
  };

  // Combine react-hook-form ref and fileInputRef
  const setInputRef = (
    element: HTMLInputElement | null,
    rhfRef: React.Ref<HTMLInputElement>
  ) => {
    fileInputRef.current = element;
    if (typeof rhfRef === "function") {
      rhfRef(element);
    } else if (rhfRef) {
      (rhfRef as React.MutableRefObject<HTMLInputElement | null>).current =
        element;
    }
  };

  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <Box>
      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: 'block' },
          gap: "20px",
          justifyContent: "center",
          width: "100%",
          height: "auto",
          overflow: "hidden",
          mt: 2,
        }}
      >
        {/* Left Side - Display Editor Content */}
        <Box
          ref={previewRef}
          sx={{
            width: { md: "500px", sm: '400px', xs: '100%' },
            height: { md: "700px", sm: "600px", xs: 400 },
            borderRadius: "12px",
            boxShadow: "3px 5px 8px gray",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            border: `1px solid ${isImageMissing && errors.cardImage ? "red" : "lightgray"
              }`,
            cursor: "pointer",
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            id="fileInput"
            hidden
            accept="image/*"
            {...register("cardImage", {
              required:
                !editProduct && initialElements.length === 0 || stickerElements.length === 0
                  ? "Card image is required"
                  : false,
              onChange: handleFileSelect,
            })}
            ref={(e) => setInputRef(e, register("cardImage").ref)}
          />

          {initialElements.length > 0 || initialTextElements.length > 0 || stickerElements.length > 0 ? (
            <Box sx={{ width: '100%', height: '100%' }}>
              {/* Render Images */}
              {initialElements.map((el: any) => (
                <Box
                  key={el.id}
                  component="img"
                  src={el.src || "/assets/icons/gallery.png"}
                  sx={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.2)",
                    zIndex: 30,
                  }}
                />
              ))}
              {/* Render Text Elements */}
              {initialTextElements.map((te: any) => (
                <Typography
                  key={te.id}
                  sx={{
                    position: "absolute",
                    left: te.x,
                    top: te.y,
                    width: te.width,
                    height: te.height,
                    fontWeight: te.bold ? 700 : 400,
                    fontStyle: te.italic ? "italic" : "normal",
                    fontSize: te.fontSize,
                    fontFamily: te.fontFamily,
                    color: te.color,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.06)",
                    zIndex: 50,
                  }}
                >
                  {te.text || "Text"}
                </Typography>
              ))}

              {stickerElements.map((st) => (
                <Box key={st.id} sx={{ width: st.width, height: st.height, position: "absolute", left: st.x, top: st.y, zIndex: st.zIndex }}>
                  {/* Sticker Image */}
                  <Box
                    component="img"
                    src={st.sticker}
                    alt="sticker"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      pointerEvents: "none",
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : uploadedShapeImage || image || editProduct?.imageUrl ? (
            <Box
              component="img"
              src={`${uploadedShapeImage || image || editProduct?.imageUrl}`}
              alt="Uploaded"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                clipPath:
                  shapes.find((s) => s.path === selectedShapeImage)?.path ||
                  "none",
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
                component="img"
                src="/assets/icons/gallery.png"
                sx={{ width: 150, height: 150 }}
              />
              <Typography sx={{ color: "gray", fontSize: 16 }}>
                Drag & Drop or Click to Upload
              </Typography>
            </Box>
          )}

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

        {/* Right Side - Form */}
        <Box
          component="form"
          sx={{ width: { md: "500px", sm: "500px", xs: '100%' }, mt: { md: 0, sm: 0, xs: 3 } }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <CustomInput
            label="Card Name"
            placeholder="Enter your card name"
            defaultValue={editProduct?.cardName || formData?.cardName || ""}
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
            defaultValue={
              editProduct?.cardCategory || formData?.cardCategory || ""
            }
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
            label="SKU"
            placeholder="Enter your SKU"
            defaultValue={editProduct?.sku || formData?.sku || ""}
            register={register("sku", {
              required: !editProduct ? "SKU is required" : false,
            })}
            error={errors.sku?.message}
          />
          <CustomInput
            label="Actual Price"
            placeholder="Enter your actual price"
            defaultValue={
              editProduct?.actualPrice || formData?.actualPrice || ""
            }
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
            defaultValue={editProduct?.salePrice || formData?.salePrice || ""}
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
            defaultValue={
              editProduct?.description || formData?.description || ""
            }
            register={register("description", {
              required: !editProduct ? "Description is required" : false,
            })}
            error={errors.description?.message}
            multiline
          />
          <input
            type="hidden"
            {...register("polygon_shape")}
            value={selectedShapeImage || editProduct?.polygon_shape || ""}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
            }}
          >
            <LandingButton
              title="Edit Layout"
              personal
              width="200px"
              onClick={handleEditLayout}
            />
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
