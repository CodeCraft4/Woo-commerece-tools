import { useMemo, useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesFromDB } from "../../../../../source/source";
import CustomInput from "../../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { useCategoriesEditorState, type PublishMeta } from "../../../../../context/CategoriesEditorContext";
import * as htmlToImage from "html-to-image";
import { ADMINS_DASHBOARD } from "../../../../../constant/route";

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
    cardImage?: FileList;
    polygon_shape: string;
};

type CategoryRow = {
    id: string;
    name: string;
    subcategories: string[];
    sub_subcategories: Record<string, string[]>;
};

type EditFormValue = Partial<FormValue> & {
    imageUrl?: string;
    lastpageImageUrl?: string;
    lastMessage?: string;
    polygonlayout?: any;
};

type Props = { editProduct?: EditFormValue };

/* ========= Component ========= */

const TempletForm = ({ editProduct }: Props) => {
    const { saveDesign, loading, setLoading } = useCategoriesEditorState();
    const navigate = useNavigate()

    const location = useLocation();
    const navState = location.state as any;

    const mode = navState?.mode;
    const templateId = navState?.id;
    const prevImg = navState?.imgUrl
    const isEditMode = mode === "edit" || !!templateId;


    const [rawStoresState, setRawStoresState] = useState<any>(null);

    useEffect(() => {
        const rs = navState?.rawStores;
        if (!rs) return;

        // normalize
        const normalized =
            typeof rs === "string"
                ? (() => { try { return JSON.parse(rs); } catch { return null; } })()
                : rs;

        setRawStoresState(normalized);
    }, [navState?.rawStores]);

    // ✅ use this everywhere
    const rawStores = rawStoresState;



    // Left preview (we’ll capture this box)
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();
    console.log(setPreviewUrl)
    // categories
    const {
        data: categories = [],
        isLoading: isLoadingCats,
        isError: isErrorCats,
    } = useQuery<CategoryRow[]>({
        queryKey: ["categories"],
        queryFn: fetchAllCategoriesFromDB,
        staleTime: 1000 * 60 * 30,
    });



    const categoryOptions = useMemo(
        () =>
            categories
                .map((c) => (c?.name ?? "").trim())
                .filter(Boolean)
                .map((name) => ({ label: name, value: name })),
        [categories]
    );

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
            cardcategory: "",
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

    const { product } = (location.state || {}) as {
        imgUrl?: string;
        product?: {
            cardname?: string;
            cardcategory?: string;
            subCategory?: string;
            subSubCategory?: string;
            sku?: string;
            actualprice?: string;
            a4price?: string;
            a5price?: string;
            usletter?: string;
            saleprice?: string;
            salea4price?: string;
            salea5price?: string;
            saleusletter?: string;
            description?: string;
        };
    };

    // 1) PREFILL on mount (or when product changes)
    useEffect(() => {
        if (!product) return;
        reset({
            cardname: product.cardname ?? "",
            cardcategory: product.cardcategory ?? "",
            subCategory: product.subCategory ?? "",
            subSubCategory: product.subSubCategory ?? "",
            sku: product.sku ?? "",
            actualprice: product.actualprice != null ? String(product.actualprice) : "",
            a4price: product.a4price != null ? String(product.a4price) : "",
            a5price: product.a5price != null ? String(product.a5price) : "",
            usletter: product.usletter != null ? String(product.usletter) : "",
            saleprice: product.saleprice != null ? String(product.saleprice) : "",
            salea4price: product.salea4price != null ? String(product.salea4price) : "",
            salea5price: product.salea5price != null ? String(product.salea5price) : "",
            saleusletter: product.saleusletter != null ? String(product.saleusletter) : "",
            description: product.description ?? "",
            polygon_shape: "",
        });
    }, [product, reset]);
    // dependent selects
    const selectedCategoryName = watch("cardcategory");
    const selectedSubCategory = watch("subCategory");

    const selectedCategory = useMemo(
        () => categories.find((c) => c.name === selectedCategoryName),
        [categories, selectedCategoryName]
    );

    const subCategoryOptions = useMemo(() => {
        if (!selectedCategory?.subcategories) return [];
        return selectedCategory.subcategories.map((sub) => ({ label: sub, value: sub }));
    }, [selectedCategory]);

    const subSubCategoryOptions = useMemo(() => {
        if (!selectedCategory || !selectedSubCategory) return [];
        const map = selectedCategory.sub_subcategories || {};
        const list = map[selectedSubCategory] || [];
        return list.map((name) => ({ label: name, value: name }));
    }, [selectedCategory, selectedSubCategory]);

    // Clear sub/subSub on main changes
    useEffect(() => {
        const sub = watch("subCategory") || "";
        const subsub = watch("subSubCategory") || "";

        const validSub = !!selectedCategory?.subcategories?.includes(sub);
        if (!validSub) {
            setValue("subCategory", "");
            setValue("subSubCategory", "");
            return;
        }

        // If sub is still valid, ensure subSub is valid too
        const validSubSub = !!(selectedCategory?.sub_subcategories?.[sub] ?? []).includes(subsub);
        if (!validSubSub) {
            setValue("subSubCategory", "");
        }
    }, [selectedCategoryName, selectedCategory, setValue, watch]);

    useEffect(() => {
        const subsub = watch("subSubCategory") || "";
        const list = (selectedCategory?.sub_subcategories?.[selectedSubCategory || ""] ?? []);
        const valid = list.includes(subsub);
        if (!valid) setValue("subSubCategory", "");
    }, [selectedSubCategory, selectedCategory, setValue, watch]);

    // Submit
    const onSubmit = async (data: FormValue) => {
        setLoading(true);

        let captured: string | null = null;
        if (previewRef.current) {
            try {
                captured = await htmlToImage.toPng(previewRef.current, {
                    pixelRatio: 2,
                    backgroundColor: "#ffffff",
                    style: { transform: "none" },
                });
            } catch (e) {
                console.error("LeftBox capture failed:", e);
            }
        }

        const meta: PublishMeta = {
            id: templateId,     // ✅ pass id
            mode,
            cardname: data.cardname,
            cardcategory: data.cardcategory,
            subCategory: data.subCategory,
            subSubCategory: data.subSubCategory,
            actualprice: data.actualprice || "",
            a4price: data.a4price || "",
            a5price: data.a5price || "",
            usletter: data.usletter || "",
            saleprice: data.saleprice || "",
            salea4price: data.salea4price || "",
            salea5price: data.salea5price || "",
            saleusletter: data.saleusletter || "",
            description: data.description,
            sku: data.sku,
            imgUrl: captured ?? previewUrl,
        };
        await saveDesign(meta);
        setLoading(false);
        reset()
    };

    const mmToPx = (mm: number) => (mm / 25.4) * 96;

    function coverScale(cardPxW: number, cardPxH: number, boxW: number, boxH: number) {
        const scale = Math.max(boxW / cardPxW, boxH / cardPxH); // ✅ cover
        const w = cardPxW * scale;
        const h = cardPxH * scale;
        const offsetX = (boxW - w) / 2;
        const offsetY = (boxH - h) / 2;
        return { scale, w, h, offsetX, offsetY };
    }

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
                <Box
                    ref={previewRef}
                    sx={{
                        width: { md: "500px", sm: "400px", xs: "100%" },
                        height: { md: "700px", sm: "600px", xs: 400 },
                        borderRadius: "12px",
                        boxShadow: "3px 5px 8px gray",
                        position: "relative",
                        overflow: "hidden",
                        backgroundColor: "#fff",
                        p: 0,
                    }}
                >
                    {
                        prevImg ? <>
                            <Box component={'img'} src={`${prevImg}`} sx={{ width: '100%', height: '100%', objectFit: 'fill' }} />
                        </> : <>
                            {rawStores ? (() => {
                                const firstSlide = rawStores.slides?.[0];
                                if (!firstSlide) return <Box sx={{ color: "#999", p: 2 }}>No slide data</Box>;

                                const slideTextElements =
                                    rawStores.textElements?.filter((te: any) => te.slideId === firstSlide.id) || [];
                                const slideImageElements =
                                    rawStores.imageElements?.filter((ie: any) => ie.slideId === firstSlide.id) || [];
                                const slideBg = rawStores.slideBg?.[firstSlide.id] || null;

                                const baseW =
                                    rawStores.config?.fitCanvas?.width ??
                                    mmToPx(rawStores.config?.mmWidth ?? 210);

                                const baseH =
                                    rawStores.config?.fitCanvas?.height ??
                                    mmToPx(rawStores.config?.mmHeight ?? 297);

                                // ✅ 2) preview box size (match your left box)
                                const boxW = 500;
                                const boxH = 700;
                                // ✅ 3) cover scale (base canvas covers box)
                                const { scale, w, h, offsetX, offsetY } = coverScale(baseW, baseH, boxW, boxH);

                                return (
                                    <Box sx={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
                                        {/* This is the scaled "card" canvas */}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                left: offsetX,
                                                top: offsetY,
                                                width: `${w}`,
                                                height: `${h}`,
                                                backgroundColor: slideBg?.color || "#cc2727ff",
                                            }}
                                        >
                                            {/* Background image */}
                                            {slideBg?.image && (
                                                <Box
                                                    component="img"
                                                    src={slideBg.image}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                    }}
                                                />
                                            )}

                                            {/* Images (scaled positions) */}
                                            {slideImageElements.map((img: any) => (
                                                <Box
                                                    key={img.id}
                                                    component="img"
                                                    src={img.src}
                                                    sx={{
                                                        position: "absolute",
                                                        top: img.y * scale,
                                                        left: img.x * scale,
                                                        width: img.width * scale,
                                                        height: img.height * scale,
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ))}

                                            {/* Text (scaled positions + font) */}
                                            {slideTextElements.map((txt: any) => (
                                                <Typography
                                                    key={txt.id}
                                                    sx={{
                                                        position: "absolute",
                                                        top: txt.y * scale,
                                                        left: txt.x * scale,
                                                        width: txt.width * scale,
                                                        // height: txt.height * scale,
                                                        fontSize: (txt.fontSize ?? 16) * scale,
                                                        fontFamily: txt.fontFamily,
                                                        color: txt.color,
                                                        fontWeight: txt.bold ? 700 : 400,
                                                        fontStyle: txt.italic ? "italic" : "normal",
                                                        textAlign: txt.align as any,
                                                        // overflow: "hidden",
                                                        whiteSpace: "pre-wrap",
                                                        // lineHeight: 1.2,
                                                    }}
                                                >
                                                    {txt.text}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                );
                            })() : (
                                <Box sx={{ color: "#999", p: 2 }}>No preview available</Box>
                            )}
                        </>
                    }

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
                        rules={{ required: !editProduct ? "Category is required" : false }}
                        render={({ field }) => (
                            <CustomInput
                                label="Card Category"
                                type="select"
                                placeholder={
                                    isLoadingCats
                                        ? "Loading categories..."
                                        : isErrorCats
                                            ? "Failed to load categories"
                                            : "Select category"
                                }
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                                error={errors.cardcategory?.message}
                                options={categoryOptions}
                            />
                        )}
                    />

                    <Controller
                        name="subCategory"
                        control={control}
                        rules={{ required: subCategoryOptions.length > 0 && !editProduct ? "Sub category is required" : false }}
                        render={({ field }) => (
                            <CustomInput
                                label="Sub Category"
                                type="select"
                                placeholder={
                                    !watch("cardcategory")
                                        ? "Select main category first"
                                        : subCategoryOptions.length === 0
                                            ? "No sub categories"
                                            : "Select sub category"
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
                        rules={{ required: subSubCategoryOptions.length > 0 && !editProduct ? "Sub-sub category is required" : false }}
                        render={({ field }) => (
                            <CustomInput
                                label="Sub Sub Category"
                                type="select"
                                placeholder={
                                    !watch("subCategory")
                                        ? "Select sub category first"
                                        : subSubCategoryOptions.length === 0
                                            ? "No sub-sub categories"
                                            : "Select sub-sub category"
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

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                        <CustomInput
                            label="Actual Price"
                            placeholder="Enter your actual price"
                            defaultValue=""
                            register={register("actualprice", {
                                required: !editProduct ? "Actual Price is required" : false,
                            })}
                            error={errors.actualprice?.message}
                        />
                        <CustomInput
                            label="A4 Price"
                            placeholder="A4 price"
                            defaultValue=""
                            register={register("a4price", {
                                required: !editProduct ? "Actual Price is required" : false,
                            })}
                            error={errors.a4price?.message}
                        />
                        <CustomInput
                            label="A5 Price"
                            placeholder="A5 price"
                            defaultValue=""
                            register={register("a5price", {
                                required: !editProduct ? "Actual Price is required" : false,
                            })}
                            error={errors.a5price?.message}
                        />
                        <CustomInput
                            label="US Letter"
                            placeholder="US letter"
                            defaultValue=""
                            register={register("usletter", {
                                required: !editProduct ? "Actual Price is required" : false,
                            })}
                            error={errors.usletter?.message}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                        <CustomInput
                            label="Sale Price"
                            placeholder="Enter your sale price"
                            defaultValue=""
                            register={register("saleprice", {
                                required: false,
                            })}
                            error={errors.saleprice?.message}
                        />
                        <CustomInput
                            label="Sale A4 Price"
                            placeholder="Sale A4 price"
                            defaultValue=""
                            register={register("salea4price", {
                                required: false,
                            })}
                            error={errors.salea4price?.message}
                        />
                        <CustomInput
                            label="Sale A5 Price"
                            placeholder="Sale A5 Price"
                            defaultValue=""
                            register={register("salea5price", {
                                required: false,
                            })}
                            error={errors.salea5price?.message}
                        />
                        <CustomInput
                            label="US Letter"
                            placeholder="US letter"
                            defaultValue=""
                            register={register("saleusletter", {
                                required: false,
                            })}
                            error={errors.saleusletter?.message}
                        />
                    </Box>

                    <CustomInput
                        label="Card description"
                        placeholder="Enter your description"
                        defaultValue=""
                        register={register("description", { required: !editProduct ? "Description is required" : false })}
                        error={errors.description?.message}
                        multiline
                    />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                        <LandingButton
                            title={isEditMode ? "Update templet" : "Edit templet"}
                            personal
                            width="200px"
                            type="button"
                            onClick={() =>
                                navigate(ADMINS_DASHBOARD.ADMIN_CATEGORIES_EDITOR, {
                                    state: {
                                        mode: isEditMode ? "edit" : "create",
                                        id: templateId ?? null,
                                        product: watch(),
                                        rawStores: rawStoresState,
                                    },
                                })
                            }
                        />

                        <LandingButton
                            title={isEditMode ? "Update & Publish" : "Save & Publish"}
                            personal
                            variant="outlined"
                            width="200px"
                            type="submit"
                            loading={loading}
                        />

                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default TempletForm;
