import { Box, Typography } from "@mui/material";
import CustomInput from "../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../components/LandingButton/LandingButton";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabase/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../../constant/route";
import { useCardEditor } from "../../../../context/AdminEditorContext";
import * as htmlToImage from "html-to-image";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesFromDB } from "../../../../source/source";

type FormValue = {
  cardname: string;
  cardcategory: string;
  subCategory?: string;
  subSubCategory?: string;
  sku: string;
  actualprice?: string;
  saleprice?: string;
  description: string;
  cardImage: FileList;
  polygon_shape: string;
};

type CategoryRow = {
  id: string;
  name: string;
  subcategories: string[];
  sub_subcategories: Record<string, string[]>;
};

type EditFormValue = {
  cardName?: string;
  cardCategory?: string;
  sku?: string;
  actualPrice?: string;
  salePrice?: string;
  description?: string;
  imageUrl?: string;
  polygon_shape?: string;
  polygonlayout?: any;
  subCategory?: string;
  subSubCategory?: string;
  lastpageImageUrl?: string;
  lastMessage?: string;
  cardname?: string;
  cardcategory?: string;
  actualprice?: string;
  saleprice?: string;
  imageurl?: string;
  lastpageimageurl?: string;
  lastmessage?: string;
};

type Props = { editProduct?: EditFormValue };

const NewCardsForm = ({ editProduct }: Props) => {

  console.log(editProduct,'edit form 4slide card')

  const {
    elements, textElements, stickerElements,
    midLeftElements, midLeftTextElements, midLeftStickerElements,
    midRightElements, midRightTextElements, midRightStickerElements,
    lastElements, lastTextElements, lastStickerElements,
    lastSlideImage, lastSlideMessage,
    uploadedShapeImage, selectedShapeImage,
    setFormData,
    setStickerElements, setTextElements,
    setSelectedShapeImage, setUploadedShapeImage,
    setLastElements, setLastTextElements,
    resetEditor
  } = useCardEditor();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = (location.state as any) || {};

  // ========= Categories (only “Cards”) =========
  const {
    data: categories = [],
    isLoading: isLoadingCats,
    isError: isErrorCats,
  } = useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: fetchAllCategoriesFromDB,
    staleTime: 1000 * 60 * 30,
  });

  const cardsRow = useMemo(
    () => categories.find(c => (c?.name ?? "").trim().toLowerCase() === "cards") || null,
    [categories]
  );

  // The select shows only “Cards” as an option
  const categoryOptions = useMemo(
    () => (cardsRow ? [{ label: "Cards", value: "Cards" }] : []),
    [cardsRow]
  );

  // ========= Form =========
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
    setValue,
  } = useForm<FormValue>({
    defaultValues: {
      cardname: "",
      cardcategory: "Cards", // default to Cards
      subCategory: "",
      subSubCategory: "",
      sku: "",
      actualprice: "",
      saleprice: "",
      description: "",
      polygon_shape: "",
    },
  });

  // normalize edit defaults (only for inputs)
  const normalizedEdit = useMemo(() => {
    const src = editProduct ?? {};
    const fd = formData ?? {};
    return {
      cardname: (src.cardname ?? src.cardName ?? fd.cardname ?? fd.cardName ?? "") as string,
      // force category = Cards, but keep existing if it already is "Cards"
      cardcategory: "Cards",
      sku: (src.sku ?? fd.sku ?? "") as string,
      actualprice: (src.actualprice ?? src.actualPrice ?? fd.actualprice ?? fd.actualPrice ?? "") as string | number,
      saleprice: (src.saleprice ?? src.salePrice ?? fd.saleprice ?? fd.salePrice ?? "") as string | number,
      description: (src.description ?? fd.description ?? "") as string,
      polygon_shape: (src.polygon_shape ?? fd.polygon_shape ?? "") as string,
      subCategory: (src.subCategory ?? (src as any).subcategory ?? (fd as any).subCategory ?? (fd as any).subcategory ?? "") as string,
      subSubCategory: (src.subSubCategory ?? (src as any).sub_subcategory ?? (fd as any).subSubCategory ?? (fd as any).sub_subcategory ?? "") as string,
    } as FormValue;
  }, [editProduct, formData]);

  useEffect(() => {
    reset(normalizedEdit);
  }, [normalizedEdit, reset]);

  // Make sure category is “Cards” once categories are fetched
  useEffect(() => {
    if (cardsRow) {
      setValue("cardcategory", "Cards", { shouldValidate: true });
    }
  }, [cardsRow, setValue]);

  const selectedCategoryName = watch("cardcategory"); // should always be "Cards"
  const selectedSubCategory = watch("subCategory");

  // Build subcat/sub-sub from the Cards row only
  const subCategoryOptions = useMemo(() => {
    if (!cardsRow) return [];
    return (cardsRow.subcategories ?? []).map((sub) => ({ label: sub, value: sub }));
  }, [cardsRow]);

  const subSubCategoryOptions = useMemo(() => {
    if (!cardsRow || !selectedSubCategory) return [];
    const list = cardsRow.sub_subcategories?.[selectedSubCategory] ?? [];
    return list.map((name) => ({ label: name, value: name }));
  }, [cardsRow, selectedSubCategory]);

  // Since sub categories are optional now, we only clear subSub if the chosen sub becomes invalid
  useEffect(() => {
    const sub = (watch("subCategory") || "") as string;
    const stillValidSub = !!(cardsRow?.subcategories ?? []).includes(sub);
    if (!stillValidSub) {
      setValue("subCategory", "");
      setValue("subSubCategory", "");
    } else {
      const subsub = (watch("subSubCategory") || "") as string;
      const stillValidSubSub = !!(cardsRow?.sub_subcategories?.[sub] ?? []).includes(subsub);
      if (!stillValidSubSub) setValue("subSubCategory", "");
    }
  }, [selectedCategoryName, cardsRow, setValue, watch]);

  // ========== Preview ==========
  const previewRef = useRef<HTMLDivElement>(null);
  const isImageMissing = !image && !uploadedShapeImage && elements.length === 0;

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

  const handleEditLayout = () => {
    const formDataNow = watch();
    setFormData({
      cardName: formDataNow.cardname,
      cardCategory: "Cards",
      sku: formDataNow.sku,
      actualPrice: formDataNow.actualprice,
      salePrice: formDataNow.saleprice,
      description: formDataNow.description,
      cardImage: `${image || (editProduct?.imageUrl as string) || null}`,
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
          ...formDataNow,
          cardcategory: "Cards",
          cardImage: image || (editProduct?.imageUrl as string) || null,
          elements,
          textElements,
        },
      },
    });
  };

  // Build one JSON payload with ALL slides
  const buildLayoutPayload = () => ({
    first: {
      elements: elements.map((el) => ({
        id: el.id, x: el.x, y: el.y, width: el.width, height: el.height, src: el.src,
      })),
      textElements: textElements.map((te) => ({
        id: te.id, x: te.x, y: te.y, width: te.width, height: te.height,
        text: te.text, bold: !!te.bold, italic: !!te.italic,
        fontSize: te.fontSize, fontFamily: te.fontFamily, color: te.color,
      })),
      stickers: stickerElements.map((st) => ({
        id: st.id, sticker: st.sticker, x: st.x, y: st.y, width: st.width, height: st.height, zIndex: st.zIndex,
      })),
    },
    main: {
      left: { elements: midLeftElements, textElements: midLeftTextElements, stickers: midLeftStickerElements },
      right: { elements: midRightElements, textElements: midRightTextElements, stickers: midRightStickerElements },
    },
    last: {
      elements: lastElements, textElements: lastTextElements, stickers: lastStickerElements,
      lastSlideImage, lastSlideMessage,
    },
  });

  const onSubmit = async (data: FormValue) => {
    try {
      setLoading(true);

      // Snapshot of FIRST SLIDE only → to PNG for thumbnail
      let capturedimageurl: string | null = null;
      if (previewRef.current) {
        try {
          const dataUrl = await htmlToImage.toPng(previewRef.current, { quality: 0.95, cacheBust: true });
          capturedimageurl = dataUrl;
        } catch {
          /* best-effort */
        }
      }

      const polygonlayout = buildLayoutPayload();

      const cardPayload = {
        cardname: data.cardname,
        cardcategory: "Cards", // locked
        sku: data.sku,
        actualprice: Number(data.actualprice),
        saleprice: Number(data.saleprice) || null,
        description: data.description,

        // OPTIONAL now:
        subCategory: data.subCategory || null,
        subSubCategory: data.subSubCategory || null,

        imageurl: capturedimageurl || null,
        lastpageimageurl: capturedimageurl || null,

        polygon_shape: selectedShapeImage || (data.polygon_shape as string) || null,
        polygonlayout,
        lastmessage: lastSlideMessage || "",
      };

      if (editProduct?.sku) {
        const { error } = await supabase.from("cards").update(cardPayload).eq("sku", String(editProduct.sku));
        if (error) throw error;
        toast.success("Card updated successfully!");
      } else {
        const { error } = await supabase.from("cards").insert([cardPayload]);
        if (error) throw error;
        toast.success("Card saved successfully!");
      }

      setImage(null);
    } catch (err: any) {
      toast.error("Failed to save card: " + err.message);
    } finally {
      setLoading(false);
    }

    // Optional: clear editor after save
    setStickerElements([]);
    setTextElements([]);
    setSelectedShapeImage(null);
    setLastElements([]);
    setLastTextElements([]);
    setUploadedShapeImage(null);
    resetEditor();
    reset();
    setImage(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: "block" },
          gap: "20px",
          justifyContent: "center",
          width: "100%",
          height: "auto",
          overflow: "hidden",
          mt: 2,
        }}
      >
        {/* Left — Preview (ONLY FirstSlide slices) */}
        <Box
          ref={previewRef}
          sx={{
            width: { md: "500px", sm: "400px", xs: "100%" },
            height: { md: "700px", sm: "600px", xs: 400 },
            borderRadius: "12px",
            boxShadow: "3px 5px 8px gray",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            border: `1px solid ${isImageMissing && (errors as any).cardImage ? "red" : "lightgray"}`,
            backgroundColor: "#fff",
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {elements.length > 0 || textElements.length > 0 || stickerElements.length > 0 ? (
            <Box sx={{ width: "100%", height: "100%" }}>
              {elements.map((el) => (
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

              {textElements.map((te) => (
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
                <Box
                  key={st.id}
                  sx={{
                    width: st.width,
                    height: st.height,
                    position: "absolute",
                    left: st.x,
                    top: st.y,
                    zIndex: st.zIndex,
                  }}
                >
                  <Box
                    component="img"
                    src={st.sticker}
                    alt="sticker"
                    sx={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                  />
                </Box>
              ))}
            </Box>
          ) : editProduct ? (
            <Box
              component="img"
              src={editProduct?.imageUrl || editProduct?.lastpageimageurl || "/assets/icons/gallery.png"}
              alt="Uploaded"
              sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }}
            />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", m: "auto", alignItems: "center" }}>
              <Box component="img" src="/assets/icons/gallery.png" sx={{ width: 150, height: 150 }} />
            </Box>
          )}
        </Box>

        {/* Right — Form */}
        <Box
          component="form"
          sx={{ width: { md: "500px", sm: "500px", xs: "100%" }, mt: { md: 0, sm: 0, xs: 3 } }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <CustomInput
            label="Card Name"
            placeholder="Enter your card name"
            defaultValue=""
            register={register("cardname", { required: !editProduct ? "Card Name is required" : false })}
            error={errors.cardname?.message}
          />

          <Controller
            name="cardcategory"
            control={control}
            render={({ field }) => (
              <CustomInput
                label="Card Category"
                type="select"
                placeholder={
                  isLoadingCats
                    ? "Loading categories..."
                    : isErrorCats
                      ? "Failed to load categories"
                      : "Cards"
                }
                value={field.value || "Cards"}
                onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                error={errors.cardcategory?.message}
                options={categoryOptions}
              />
            )}
          />

          <Controller
            name="subCategory"
            control={control}
            rules={{ required: false }}  // OPTIONAL
            render={({ field }) => (
              <CustomInput
                label="Sub Category"
                type="select"
                placeholder={
                  subCategoryOptions.length === 0
                    ? "No sub categories"
                    : "Select sub category (optional)"
                }
                value={field.value ?? ""}
                onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                error={errors.subCategory?.message}
                options={subCategoryOptions}
              />
            )}
          />

          <Controller
            name="subSubCategory"
            control={control}
            rules={{ required: false }} // OPTIONAL
            render={({ field }) => (
              <CustomInput
                label="Sub Sub Category"
                type="select"
                placeholder={
                  !watch("subCategory")
                    ? "Select sub category first (optional)"
                    : subSubCategoryOptions.length === 0
                      ? "No sub-sub categories"
                      : "Select sub-sub category (optional)"
                }
                value={field.value ?? ""}
                onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                error={errors.subSubCategory?.message}
                options={subSubCategoryOptions}
              />
            )}
          />

          <CustomInput
            label="SKU"
            placeholder="Enter your SKU"
            defaultValue=""
            register={register("sku", { required: !editProduct ? "SKU is required" : false })}
            error={errors.sku?.message}
          />
          <CustomInput
            label="Actual Price"
            placeholder="Enter your actual price"
            defaultValue=""
            type="number"
            register={register("actualprice", {
              required: !editProduct ? "Actual Price is required" : false,
              valueAsNumber: true,
              min: { value: 0.01, message: "Price must be greater than zero" },
            })}
            error={errors.actualprice?.message}
          />
          <CustomInput
            label="Sale Price"
            placeholder="Enter your sale price"
            type="number"
            defaultValue=""
            register={register("saleprice", {
              required: false,
              valueAsNumber: true,
              min: { value: 0.01, message: "Price must be greater than zero" },
            })}
            error={errors.saleprice?.message}
          />
          <CustomInput
            label="Card description"
            placeholder="Enter your description"
            defaultValue=""
            register={register("description", { required: !editProduct ? "Description is required" : false })}
            error={errors.description?.message}
            multiline
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <LandingButton title={editProduct ? "Update Layout" : "Edit Layout"} personal width="200px" onClick={handleEditLayout} />
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
