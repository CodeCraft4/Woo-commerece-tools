import { Box, Typography } from "@mui/material";
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
import QrGenerator from "../../../../components/QR-code/Qrcode";
import { buildPolygonLayout, captureNodeToPng } from "../../../../lib/polygon";

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
  // legacy snake-case keys tolerated if coming from older rows
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
  // const {
  //   elements, textElements, stickerElements,
  //   midLeftElements, midLeftTextElements, midLeftStickerElements,
  //   midRightElements, midRightTextElements, midRightStickerElements,
  //   lastElements, lastTextElements, lastStickerElements,
  //   lastSlideImage, lastSlideMessage,
  //   uploadedShapeImage, selectedShapeImage,
  //   setFormData,
  //   setStickerElements, setTextElements,
  //   setSelectedShapeImage, setUploadedShapeImage,
  //   setLastElements, setLastTextElements,
  //   resetEditor
  // } = useCardEditor();

  // All contexts (we store all of them into polygonLayout)
  const slide1 = useSlide1();
  const slide2 = useSlide2();
  const slide3 = useSlide3();
  const slide4 = useSlide4();

  const { resetSlide1State } = useSlide1()
  const { resetSlide2State } = useSlide2()
  const { resetSlide3State } = useSlide3()
  const { resetSlide4State } = useSlide4()

  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = (location.state as any) || {};


  // ===== Categories (only “Cards”) =====
  const { data: categories = [], isLoading: isLoadingCats, isError: isErrorCats } =
    useQuery<CategoryRow[]>({
      queryKey: ["categories"],
      queryFn: fetchAllCategoriesFromDB,
      staleTime: 1000 * 60 * 30,
    });

  const cardsRow = useMemo(
    () => categories.find(c => (c?.name ?? "").trim().toLowerCase() === "cards") || null,
    [categories]
  );

  const categoryOptions = useMemo(
    () => (cardsRow ? [{ label: "Cards", value: "Cards" }] : []),
    [cardsRow]
  );

  // ===== Form =====
  const {
    register, handleSubmit, formState: { errors }, watch, reset, control, setValue,
  } = useForm<FormValue>({
    defaultValues: {
      cardname: "",
      cardcategory: "Cards",
      subCategory: "",
      subSubCategory: "",
      sku: "",
      actualprice: "",
      saleprice: "",
      description: "",
      polygon_shape: "",
    },
  });

  const normalizedEdit = useMemo(() => {
    const src = editProduct ?? {};
    const fd = formData ?? {};
    return {
      cardname: (src.cardname ?? src.cardName ?? fd.cardname ?? fd.cardName ?? "") as string,
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

  useEffect(() => { reset(normalizedEdit); }, [normalizedEdit, reset]);

  useEffect(() => {
    if (cardsRow) setValue("cardcategory", "Cards", { shouldValidate: true });
  }, [cardsRow, setValue]);

  const selectedCategoryName = watch("cardcategory");
  const selectedSubCategory = watch("subCategory");

  const subCategoryOptions = useMemo(() => {
    if (!cardsRow) return [];
    return (cardsRow.subcategories ?? []).map(sub => ({ label: sub, value: sub }));
  }, [cardsRow]);

  const subSubCategoryOptions = useMemo(() => {
    if (!cardsRow || !selectedSubCategory) return [];
    const list = cardsRow.sub_subcategories?.[selectedSubCategory] ?? [];
    return list.map(name => ({ label: name, value: name }));
  }, [cardsRow, selectedSubCategory]);

  useEffect(() => {
    const sub = (watch("subCategory") || "") as string;
    const validSub = !!(cardsRow?.subcategories ?? []).includes(sub);
    if (!validSub) {
      setValue("subCategory", "");
      setValue("subSubCategory", "");
    } else {
      const subsub = (watch("subSubCategory") || "") as string;
      const validSubSub = !!(cardsRow?.sub_subcategories?.[sub] ?? []).includes(subsub);
      if (!validSubSub) setValue("subSubCategory", "");
    }
  }, [selectedCategoryName, cardsRow, setValue, watch]);

  // ===== Left preview (Slide1 visible) capture ref =====
  const previewRef = useRef<HTMLDivElement>(null);

  const handleEditLayout = () => {
    // const formDataNow = watch();
    // setFormData({
    //   cardName: formDataNow.cardname,
    //   cardCategory: "Cards",
    //   sku: formDataNow.sku,
    //   actualPrice: formDataNow.actualprice,
    //   salePrice: formDataNow.saleprice,
    //   description: formDataNow.description,
    //   cardImage: `${image || (editProduct?.imageUrl as string) || null}`,
    //   layout_type:
    //     elements.length > 0 ? "isMultipleLayout" : selectedShapeImage ? "isShapeLayout" : null,
    // });

    navigate(ADMINS_DASHBOARD.ADMIN_EDITOR);
  };

  // ======= SUBMIT: ONLY CAPTURE SLIDE-1, STORE ALL CONTEXTS =======
  const onSubmit = async (data: FormValue) => {
    try {
      setLoading(true);

      // 1) Build polygonLayout from ALL 4 contexts
      const polygonLayout = buildPolygonLayout(slide1, slide2, slide3, slide4);

      // 2) Capture Slide-1 ONLY
      let imageurl: string | null = null;
      if (previewRef.current) {
        try {
          imageurl = await captureNodeToPng(previewRef.current, "#ffffff");
        } catch {
          imageurl = null;
        }
      }

      // 3) Payload matches your camelCase DB schema
      const payload = {
        cardname: data.cardname,
        cardcategory: "Cards",
        sku: data.sku,
        actualprice: Number(data.actualprice),
        saleprice: data.saleprice ? Number(data.saleprice) : null,
        description: data.description,
        subCategory: data.subCategory || null,
        subSubCategory: data.subSubCategory || null,
        imageurl: imageurl,
        lastpageimageurl: null,
        polygon_shape: "",
        polygonlayout: polygonLayout,
        lastmessage: "",
      };

      if (editProduct?.sku) {
        const { error } = await supabase.from("cards").update(payload).eq("sku", String(editProduct.sku));
        if (error) throw error;
        toast.success("Card updated successfully!");
      } else {
        const { error } = await supabase.from("cards").insert([payload]);
        if (error) throw error;
        toast.success("Card saved successfully!");
      }

    } catch (err: any) {
      toast.error("Failed to save card: " + err.message);
    } finally {
      setLoading(false);
    }
    reset();
    resetSlide1State()
    resetSlide2State()
    resetSlide3State()
    resetSlide4State()
  };

  // ======== Slide-1 visible preview (exact editor look, static) ========
  // Uses your existing state variables from slide1 context (already imported above)
  const {
    bgImage1, bgColor1,
    showOneTextRightSideBox1, oneTextValue1,
    fontSize1, fontWeight1, fontColor1, fontFamily1, textAlign1, verticalAlign1, rotation1, lineHeight1, letterSpacing1,
    multipleTextValue1, texts1,
    textElements1,
    draggableImages1, selectedImg1,
    selectedStickers1,
    selectedVideoUrl1,
    selectedAudioUrl1,
    isAIimage1, aimage1, selectedAIimageUrl1,
  } = slide1;

  const renderOneText = () => (
    <Box sx={{
      position: "absolute", inset: 0, display: "flex",
      justifyContent: verticalAlign1 === "top" ? "flex-start" : verticalAlign1 === "bottom" ? "flex-end" : "center",
      alignItems: textAlign1 === "start" ? "flex-start" : textAlign1 === "end" ? "flex-end" : "center", px: 2,
    }}>
      <Typography sx={{
        fontSize: fontSize1, fontWeight: fontWeight1, color: fontColor1, fontFamily: fontFamily1,
        textAlign: textAlign1 as any, transform: `rotate(${rotation1 || 0}deg)`,
        lineHeight: lineHeight1, letterSpacing: letterSpacing1, whiteSpace: "pre-wrap", wordBreak: "break-word", width: "100%",
      }}>
        {oneTextValue1}
      </Typography>
    </Box>
  );

  const renderMultipleText = () => (
    <>
      {texts1?.map((t: any, i: number) => (
        <Box key={i} sx={{
          position: "absolute", left: t.x ?? 0, top: t.y ?? i * 220,
          width: t.width ?? "100%", height: t.height ?? 210, display: "flex",
          alignItems: t.verticalAlign === "top" ? "flex-start" : t.verticalAlign === "bottom" ? "flex-end" : "center",
          justifyContent: t.textAlign === "left" ? "flex-start" : t.textAlign === "right" ? "flex-end" : "center",
          px: 1, zIndex: t.zIndex ?? 50,
        }}>
          <Typography sx={{
            fontSize: t.fontSize1 ?? t.fontSize, fontWeight: t.fontWeight1 ?? t.fontWeight,
            color: t.fontColor1 ?? t.fontColor, fontFamily: t.fontFamily1 ?? t.fontFamily,
            textAlign: (t.textAlign ?? "center") as any, lineHeight: t.lineHeight ?? 1.4,
            letterSpacing: t.letterSpacing ?? 0, width: "100%", whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {t.value}
          </Typography>
        </Box>
      ))}
    </>
  );

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
            backgroundColor: bgImage1 ? "transparent" : bgColor1 ?? "#fff",
            backgroundImage: bgImage1 ? `url(${bgImage1})` : "none",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
          onDrop={(e) => { e.preventDefault(); }}
          onDragOver={(e) => e.preventDefault()}
        >
          {showOneTextRightSideBox1 && renderOneText()}
          {multipleTextValue1 && renderMultipleText()}

          {Array.isArray(textElements1) && textElements1.map((t: any) => (
            <Box key={t.id} sx={{
              position: "absolute",
              left: t.position?.x, top: t.position?.y,
              width: t.size?.width, height: t.size?.height,
              display: "flex",
              alignItems: t.verticalAlign === "top" ? "flex-start" : t.verticalAlign === "bottom" ? "flex-end" : "center",
              justifyContent: t.textAlign === "start" ? "flex-start" : t.textAlign === "end" ? "flex-end" : "center",
              transform: `rotate(${t.rotation || 0}deg)`,
              transformOrigin: "center",
              zIndex: t.zIndex ?? 2000,
            }}>
              <Typography sx={{
                width: "100%", height: "100%",
                fontSize: t.fontSize, fontWeight: t.fontWeight, color: t.fontColor || "#000",
                fontFamily: t.fontFamily || "Roboto",
                textAlign: t.textAlign === "start" ? "left" : t.textAlign === "end" ? "right" : "center",
                lineHeight: t.lineHeight || 1.5,
                letterSpacing: typeof t.letterSpacing === "number" ? `${t.letterSpacing}px` : "0px",
                overflow: "hidden", whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {t.value}
              </Typography>
            </Box>
          ))}

          {Array.isArray(draggableImages1) &&
            draggableImages1
              .filter((img: any) => (Array.isArray(selectedImg1) ? selectedImg1.includes(img.id) : true))
              .map((img: any) => (
                <Box key={img.id} sx={{
                  position: "absolute", left: img.x, top: img.y, width: img.width, height: img.height,
                  transform: `rotate(${img.rotation || 0}deg)`, transformOrigin: "center",
                  zIndex: img.zIndex ?? 1, overflow: "hidden", borderRadius: 1,
                }}>
                  <img
                    src={img.src} alt=""
                    style={{ width: "100%", height: "100%", objectFit: "fill", filter: img.filter || "none", clipPath: img.shapePath || "none", display: "block" }}
                  />
                </Box>
              ))}

          {Array.isArray(selectedStickers1) &&
            selectedStickers1.map((st: any, i: number) => (
              <Box key={st.id ?? `st-${i}`} sx={{
                position: "absolute", left: st.x, top: st.y, width: st.width, height: st.height,
                transform: `rotate(${st.rotation || 0}deg)`, transformOrigin: "center", zIndex: st.zIndex ?? 1,
              }}>
                <Box component="img" src={st.sticker} alt="" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </Box>
            ))}

          {selectedVideoUrl1 && (
            <Box sx={{
              position: "absolute", top: slide1.qrPosition1.y, left: slide1.qrPosition1.x,
              width: 400, height: 180, display: "flex", justifyContent: "center", alignItems: "flex-end", textAlign: "center",
              zIndex: slide1.qrPosition1.zIndex || 1,
            }}>
              <Box component="img" src="/assets/images/video-qr-tips.png" sx={{ width: 350, height: 200, objectFit: "fill", borderRadius: "6px" }} />
              <Box sx={{ position: "absolute", top: 33, height: 10, width: 15, left: 28, borderRadius: 2 }}>
                <QrGenerator url={slide1.qrPosition1.url || selectedVideoUrl1} size={Math.min(68, 70)} />
              </Box>
              <a href={`${selectedVideoUrl1}`} target="_blank" rel="noopener noreferrer">
                <Typography sx={{ position: "absolute", top: 60, right: 40, zIndex: 99, color: "black", fontSize: "10px", width: "105px" }}>
                  {`${selectedVideoUrl1.slice(0, 20)}.....`}
                </Typography>
              </a>
            </Box>
          )}

          {selectedAudioUrl1 && (
            <Box sx={{
              position: "absolute", top: slide1.qrAudioPosition1.y, left: slide1.qrAudioPosition1.x,
              width: 400, height: 180, display: "flex", justifyContent: "center", alignItems: "flex-end", textAlign: "center",
              zIndex: slide1.qrAudioPosition1.zIndex || 1,
            }}>
              <Box component="img" src="/assets/images/audio-qr-tips.png" sx={{ width: 350, height: 200, objectFit: "fill", borderRadius: "6px" }} />
              <Box sx={{ position: "absolute", top: 33, height: 10, width: 15, left: 28, borderRadius: 2 }}>
                <QrGenerator url={slide1.qrAudioPosition1.url || selectedAudioUrl1} size={Math.min(68, 70)} />
              </Box>
              <a href={`${selectedAudioUrl1}`} target="_blank" rel="noopener noreferrer">
                <Typography sx={{ position: "absolute", top: 60, right: 40, zIndex: 99, color: "black", fontSize: "10px", width: "105px" }}>
                  {`${selectedAudioUrl1.slice(0, 20)}.....`}
                </Typography>
              </a>
            </Box>
          )}

          {isAIimage1 && (
            <Box sx={{
              position: "absolute", left: aimage1?.x ?? 0, top: aimage1?.y ?? 0,
              width: aimage1?.width ?? 200, height: aimage1?.height ?? 200, zIndex: 10, overflow: "hidden", borderRadius: 1,
            }}>
              <Box component="img" src={String(selectedAIimageUrl1 || "")} alt="AI" sx={{ width: "100%", height: "100%", objectFit: "fill" }} />
            </Box>
          )}
        </Box>

        {/* Right — Form */}
        <Box component="form" sx={{ width: { md: "500px", sm: "500px", xs: "100%" }, mt: { md: 0, sm: 0, xs: 3 } }} onSubmit={handleSubmit(onSubmit)}>
          <CustomInput label="Card Name" placeholder="Enter your card name" defaultValue="" register={register("cardname", { required: !editProduct ? "Card Name is required" : false })} error={errors.cardname?.message} />
          <Controller name="cardcategory" control={control} render={({ field }) => (
            <CustomInput label="Card Category" type="select"
              placeholder={isLoadingCats ? "Loading categories..." : isErrorCats ? "Failed to load categories" : "Cards"}
              value={field.value || "Cards"} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} error={errors.cardcategory?.message}
              options={categoryOptions} />
          )} />
          <Controller name="subCategory" control={control} rules={{ required: false }} render={({ field }) => (
            <CustomInput label="Sub Category" type="select"
              placeholder={subCategoryOptions.length === 0 ? "No sub categories" : "Select sub category (optional)"}
              value={field.value ?? ""} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
              error={errors.subCategory?.message} options={subCategoryOptions} />
          )} />
          <Controller name="subSubCategory" control={control} rules={{ required: false }} render={({ field }) => (
            <CustomInput label="Sub Sub Category" type="select"
              placeholder={!watch("subCategory") ? "Select sub category first (optional)" : subSubCategoryOptions.length === 0 ? "No sub-sub categories" : "Select sub-sub category (optional)"}
              value={field.value ?? ""} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
              error={errors.subSubCategory?.message} options={subSubCategoryOptions} />
          )} />
          <CustomInput label="SKU" placeholder="Enter your SKU" defaultValue="" register={register("sku", { required: !editProduct ? "SKU is required" : false })} error={errors.sku?.message} />
          <CustomInput label="Actual Price" placeholder="Enter your actual price" defaultValue="" type="number"
            register={register("actualprice", { required: !editProduct ? "Actual Price is required" : false, valueAsNumber: true, min: { value: 0.01, message: "Price must be greater than zero" } })}
            error={errors.actualprice?.message} />
          <CustomInput label="Sale Price" placeholder="Enter your sale price" type="number" defaultValue=""
            register={register("saleprice", { required: false, valueAsNumber: true, min: { value: 0.01, message: "Price must be greater than zero" } })}
            error={errors.saleprice?.message} />
          <CustomInput label="Card description" placeholder="Enter your description" defaultValue=""
            register={register("description", { required: !editProduct ? "Description is required" : false })}
            error={errors.description?.message} multiline />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            {
              editProduct ? null : <LandingButton title={"Edit Layout"} personal width="200px" onClick={handleEditLayout} />
            }

            <LandingButton title={`${editProduct ? "Update & Publish" : "Save & Publish"}`} personal variant="outlined" width="250px" type="submit" loading={loading} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NewCardsForm;
