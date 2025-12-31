import { Box } from "@mui/material";
import { useMemo, useRef, useState, useEffect } from "react";
import CustomInput from "../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../components/LandingButton/LandingButton";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabase/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMINS_DASHBOARD } from "../../../../constant/route";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesFromDB } from "../../../../source/source";
import { useSlide1 } from "../../../../context/Slide1Context";
import { useSlide2 } from "../../../../context/Slide2Context";
import { useSlide3 } from "../../../../context/Slide3Context";
import { useSlide4 } from "../../../../context/Slide4Context";
import {
  applyPolygonLayoutToContexts,
  buildPolygonLayout,
  captureNodeToPng,
  // hasAnyDesignV2,
  // isMeaningfulPolygonLayout,
  pickPolygonLayout,
} from "../../../../lib/polygon";
import Slide1PreviewBox from "./FirstSlidePreview/FirstSlidePreview";

type FormValue = {
  cardname: string;
  cardcategory: string;
  subCategory?: string;
  subSubCategory?: string;
  sku: string;
  actualprice?: string;
  a4price?: string;
  a5price?: string;
  usletter?: string;
  saleprice?: string;
  salea4price?: string;
  salea5price?: string;
  saleusletter?: string;
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
  a4price?: string;
  a5price?: string;
  usletter?: string;
  salePrice?: string;
  salea4price?: string;
  salea5price?: string;
  saleusletter?: string;
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

  polyganLayout?: any;
};

type Props = { editProduct?: EditFormValue };


const NewCardsForm = ({ editProduct }: Props) => {
  const slide1 = useSlide1();
  const slide2 = useSlide2();
  const slide3 = useSlide3();
  const slide4 = useSlide4();

  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as any) || {};
  const { id, product, formData, mode } = navState;

  const isEditMode = Boolean(id) || mode === "edit";
  const toFloat = (v: any) => (v === "" || v == null ? undefined : parseFloat(String(v)));

  // ✅ Always prefer most-recent: navState -> formData -> product
  const editLayout = useMemo(() => {
    return pickPolygonLayout(
      navState?.polygonlayout,
      navState?.polyganLayout,
      formData?.polygonlayout,
      formData?.polyganLayout,
      product?.polygonlayout,
      product?.polyganLayout
    );
  }, [
    navState?.polygonlayout,
    navState?.polyganLayout,
    formData?.polygonlayout,
    formData?.polyganLayout,
    product?.polygonlayout,
    product?.polyganLayout,
  ]);

  const [loading, setLoading] = useState(false); // Save & Publish
  const [editLoading, setEditLoading] = useState(false); // Edit/Update Layout (2 sec)

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
    () =>
      categories.find(
        (c) => (c?.name ?? "").trim().toLowerCase() === "cards"
      ) || null,
    [categories]
  );

  const categoryOptions = useMemo(
    () => (cardsRow ? [{ label: "Cards", value: "Cards" }] : []),
    [cardsRow]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
    setValue,
    getValues,
  } = useForm<FormValue>({
    defaultValues: {
      cardname: "",
      cardcategory: "Cards",
      subCategory: "",
      subSubCategory: "",
      sku: "",
      actualprice: "",
      a4price: "",
      a5price: "",
      usletter: "",
      saleprice: "",
      salea4price: "",
      salea5price: "",
      saleusletter: "",
      description: "",
      polygon_shape: "",
    },
  });

  const normalizedEdit = useMemo(() => {
    const src = editProduct ?? {};
    const fd = formData ?? product ?? {};
    return {
      cardname: (src.cardname ??
        src.cardName ??
        fd.cardname ??
        fd.cardName ??
        "") as string,
      cardcategory: "Cards",
      sku: (src.sku ?? fd.sku ?? "") as string,
      actualprice: (src.actualprice ??
        src.actualPrice ??
        fd.actualprice ??
        fd.actualPrice ??
        "") as any,
      a4price: (src.a4price ??
        fd.a4price ??
        src.actualprice ??
        src.actualPrice ??
        fd.actualprice ??
        fd.actualPrice ??
        "") as any,
      a5price: (src.a5price ??
        fd.a5price ??
        src.actualprice ??
        src.actualPrice ??
        fd.actualprice ??
        fd.actualPrice ??
        "") as any,
      usletter: (src.usletter ??
        fd.usletter ??
        src.actualprice ??
        src.actualPrice ??
        fd.actualprice ??
        fd.actualPrice ??
        "") as any,
      saleprice: (src.saleprice ??
        src.salePrice ??
        fd.saleprice ??
        fd.salePrice ??
        "") as any,
      salea4price: (src.salea4price ?? fd.salea4price ?? "") as any,
      salea5price: (src.salea5price ?? fd.salea5price ?? "") as any,
      saleusletter: (src.saleusletter ?? fd.saleusletter ?? "") as any,
      description: (src.description ?? fd.description ?? "") as string,
      polygon_shape: (src.polygon_shape ?? fd.polygon_shape ?? "") as string,
      subCategory: (src.subCategory ??
        (src as any).subcategory ??
        fd.subCategory ??
        (fd as any).subcategory ??
        "") as string,
      subSubCategory: (src.subSubCategory ??
        (src as any).sub_subcategory ??
        fd.subSubCategory ??
        (fd as any).sub_subcategory ??
        "") as string,
    } as any;
  }, [editProduct, formData, product]);

  useEffect(() => {
    reset(normalizedEdit);
  }, [normalizedEdit, reset]);

  useEffect(() => {
    if (cardsRow) setValue("cardcategory", "Cards", { shouldValidate: true });
  }, [cardsRow, setValue]);

  const selectedSubCategory = watch("subCategory");

  const subCategoryOptions = useMemo(() => {
    if (!cardsRow) return [];
    return (cardsRow.subcategories ?? []).map((sub) => ({
      label: sub,
      value: sub,
    }));
  }, [cardsRow]);

  const subSubCategoryOptions = useMemo(() => {
    if (!cardsRow || !selectedSubCategory) return [];
    const list = cardsRow.sub_subcategories?.[selectedSubCategory] ?? [];
    return list.map((name) => ({ label: name, value: name }));
  }, [cardsRow, selectedSubCategory]);

  const previewRef = useRef<HTMLDivElement>(null);

  // ✅ hydrate when meaningful layout arrives
  useEffect(() => {
    applyPolygonLayoutToContexts(editLayout, slide1, slide2, slide3, slide4);
  }, [editLayout]);

  // AddNewCards page
  const handleEditLayout = async () => {
    if (editLoading) return;
    setEditLoading(true);

    // await sleep(300);

    // ✅ snapshot of current form (so nothing is lost)
    const formSnapshot = getValues();

    // ✅ send latest layout
    const layoutNow = buildPolygonLayout(slide1, slide2, slide3, slide4);
    const designToSend = pickPolygonLayout(layoutNow, editLayout) ?? null;

    // ⚠️ setLoading false BEFORE navigate (component unmount ho jata hai)
    setEditLoading(false);

    navigate(ADMINS_DASHBOARD.ADMIN_EDITOR, {
      state: {
        mode: id ? "edit" : "create",
        id,
        design: designToSend,
        formData: formSnapshot,
      },
    });
  };


  const onSubmit = async (data: FormValue) => {
    try {
      setLoading(true);

      const layoutNow = buildPolygonLayout(slide1, slide2, slide3, slide4, { onlySelectedImages: true });
      const polygonlayout = pickPolygonLayout(layoutNow, editLayout) ?? {};

      let imageurl: string | null = null;
      if (previewRef.current) {
        try {
          imageurl = await captureNodeToPng(previewRef.current, "#ffffff");
        } catch {
          imageurl = null;
        }
      }

      const payload = {
        cardname: data.cardname,
        cardcategory: "Cards",
        sku: String(data.sku),
        description: data.description,
        subCategory: data.subCategory ?? null,
        subSubCategory: data.subSubCategory ?? null,
        polygon_shape: "",
        polygonlayout,
        lastmessage: "",
        imageurl,
        lastpageimageurl: null,
        actualprice: data.actualprice,
        a4price: data.a4price,
        a5price: data.a5price,
        usletter: data.usletter,
        saleprice: data.saleprice,
        salea4price: data.salea4price,
        salea5price: data.salea5price,
        saleusletter: data.saleusletter,
      };

      if (payload.actualprice == null)
        throw new Error("Actual Price is required");

      if (id) {
        const { error } = await supabase
          .from("cards")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        toast.success("Card updated successfully!");
        reset()
        slide1.resetSlide1State?.();
        slide2.resetSlide2State?.();
        slide3.resetSlide3State?.();
        slide4.resetSlide4State?.();
      } else {
        const { error } = await supabase.from("cards").insert([payload]);
        if (error) throw error;
        toast.success("Card saved successfully!");
        reset()
        slide1.resetSlide1State?.();
        slide2.resetSlide2State?.();
        slide3.resetSlide3State?.();
        slide4.resetSlide4State?.();
      }
    } catch (err: any) {
      toast.error("Failed to save card: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
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
        {/* Left — Preview (Slide-1 ONLY) */}
        <Box
          ref={previewRef}
          sx={{
            width: { md: "500px", sm: "400px", xs: "100%" },
            height: { md: "700px", sm: "600px", xs: 400 },
            position: "relative",
            overflow: "hidden",
            borderRadius: "12px",
            boxShadow: "3px 5px 8px rgba(0,0,0,0.25)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <Slide1PreviewBox width={500} height={700} scale={1} />
        </Box>

        {/* Right — Form */}
        <Box
          component="form"
          sx={{
            width: { md: "500px", sm: "500px", xs: "100%" },
            mt: { md: 0, sm: 0, xs: 3 },
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <CustomInput
            label="Card Name"
            placeholder="Enter your card name"
            defaultValue=""
            register={register("cardname", {
              required: "Card Name is required",
            })}
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
                onChange={(e) =>
                  field.onChange((e.target as HTMLInputElement).value)
                }
                error={errors.cardcategory?.message}
                options={categoryOptions}
              />
            )}
          />

          <Controller
            name="subCategory"
            control={control}
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
                onChange={(e) =>
                  field.onChange((e.target as HTMLInputElement).value)
                }
                error={errors.subCategory?.message}
                options={subCategoryOptions}
              />
            )}
          />

          <Controller
            name="subSubCategory"
            control={control}
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
                onChange={(e) =>
                  field.onChange((e.target as HTMLInputElement).value)
                }
                error={errors.subSubCategory?.message}
                options={subSubCategoryOptions}
              />
            )}
          />

          <CustomInput
            label="SKU"
            placeholder="Enter your SKU"
            defaultValue=""
            register={register("sku", { required: "SKU is required" })}
            error={errors.sku?.message}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <CustomInput
              label="Actual Price"
              placeholder="Actual price"
              defaultValue=""
              type="number"
              register={register("actualprice", { required: "Actual Price is required", setValueAs: toFloat, })}
              error={errors.actualprice?.message}
            />
            <CustomInput
              label="A4 Price"
              placeholder="A4 price" defaultValue=""
              type="number"
              register={register("a4price", { required: "A4 Price is required", setValueAs: toFloat, })}
              error={errors.a4price?.message}
            />
            <CustomInput
              label="A5 Price"
              placeholder="A5 price" defaultValue=""
              type="number"
              register={register("a5price", { required: "A5 Price is required", setValueAs: toFloat, })}
              error={errors.a5price?.message}
            />
            <CustomInput
              label="US Letter" placeholder="US Letter" defaultValue=""
              type="number"
              register={register("usletter", { required: "US Letter Price is required", setValueAs: toFloat, })}
              error={errors.usletter?.message}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <CustomInput
              label="Sale Price"
              placeholder="Sale price"
              type="number"
              defaultValue=""
              register={register("saleprice", { setValueAs: toFloat })}
              error={errors.saleprice?.message}
            />
            <CustomInput
              label="Sale A4 Price"
              placeholder="A4 Price"
              type="number"
              defaultValue=""
              register={register("salea4price", { setValueAs: toFloat })}
              error={errors.salea4price?.message}
            />
            <CustomInput
              label="Sale A5 Price"
              placeholder="A5 Price"
              type="number"
              defaultValue=""
              register={register("salea5price", { setValueAs: toFloat })}
              error={errors.salea5price?.message}
            />
            <CustomInput
              label="Sale US Letter"
              placeholder="US Letter"
              type="number"
              defaultValue=""
              register={register("saleusletter", { setValueAs: toFloat })}
              error={errors.saleusletter?.message}
            />
          </Box>

          <CustomInput
            label="Card description"
            placeholder="Enter your description"
            defaultValue=""
            register={register("description", {
              required: "Description is required",
            })}
            error={errors.description?.message}
            multiline
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
              title={isEditMode ? "Update Layout" : "Edit Layout"}
              personal
              width="200px"
              onClick={handleEditLayout}
              loading={editLoading}
            />
            <LandingButton
              title={isEditMode ? "Update & Publish" : "Save & Publish"}
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
