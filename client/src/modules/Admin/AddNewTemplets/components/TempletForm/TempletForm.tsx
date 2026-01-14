// path: src/pages/admin/.../TempletForm.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesFromDB } from "../../../../../source/source";
import CustomInput from "../../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { useCategoriesEditorState, type PublishMeta } from "../../../../../context/CategoriesEditorContext";
import * as htmlToImage from "html-to-image";
import { ADMINS_DASHBOARD } from "../../../../../constant/route";

type SizeKey =
    | "A5"
    | "A4"
    | "A3"
    | "US_LETTER"
    | "HALF_US_LETTER"
    | "US_TABLOID"
    | "MUG_WRAP_11OZ"
    | "COASTER_95";

type PricingMap = Partial<Record<SizeKey, string>>;

type FormValue = {
    cardname: string;
    cardcategory: string;
    subCategory?: string;
    subSubCategory?: string;
    sku: string;

    // legacy (kept for compatibility)
    actualprice?: string;
    a4price?: string;
    a5price?: string;
    usletter?: string;
    saleprice?: string;
    salea4price?: string;
    salea5price?: string;
    saleusletter?: string;

    // UI-only maps
    pricing: PricingMap;
    salePricing: PricingMap;

    description: string;
    cardImage?: FileList;
    polygon_shape: string;
};

type PricingFieldPath = `pricing.${SizeKey}`;
type SalePricingFieldPath = `salePricing.${SizeKey}`;

type CategoryRow = {
    id: string;
    name: string;
    subcategories: string[];
    sub_subcategories: Record<string, string[]>;
};

type SizeDef = { key: SizeKey; label: string; helper?: string };
type CategoryPricingConfig = { title?: string; note?: string; sizes: SizeDef[] };

type EditProductLike = Partial<FormValue> & {
    a3price?: string;
    halfusletter?: string;
    ustabloid?: string;
    salea3price?: string;
    salehalfusletter?: string;
    saleustabloid?: string;
};

type Option = { label: string; value: string };

const normalizeNumberInput = (v: unknown) =>
    typeof v === "string" ? v.replace(/,/g, "").trim() : String(v ?? "").trim();

const toTextNumberOrEmpty = (v?: string) => {
    const raw = normalizeNumberInput(v);
    if (!raw) return "";
    const n = Number(raw);
    return Number.isFinite(n) ? String(n) : "";
};

// const chunk = <T,>(arr: T[], size: number) => {
//     const out: T[][] = [];
//     for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//     return out;
// };

const SIZES: Record<SizeKey, SizeDef> = {
    A5: { key: "A5", label: "A5" },
    A4: { key: "A4", label: "A4" },
    A3: { key: "A3", label: "A3" },
    US_LETTER: { key: "US_LETTER", label: "US Letter" },
    HALF_US_LETTER: { key: "HALF_US_LETTER", label: "Half US Letter" },
    US_TABLOID: { key: "US_TABLOID", label: "US Tabloid" },
    MUG_WRAP_11OZ: { key: "MUG_WRAP_11OZ", label: " (11oz mug)" },
    COASTER_95: { key: "COASTER_95", label: "(×2 coasters)" },
};

const getPricingConfig = (categoryName?: string): CategoryPricingConfig => {
    const name = (categoryName ?? "").trim().toLowerCase();

    if (name.includes("invite")) {
        return {
            title: "Prices by Size",
            note: "Invite sizing options are unique.",
            sizes: [
                { ...SIZES.A5, helper: "2 per A4 sheet" },
                { ...SIZES.A4, helper: "1 per A4 sheet" },
                { ...SIZES.HALF_US_LETTER, helper: "2 per US Letter sheet" },
                { ...SIZES.US_LETTER, helper: "1 per US Letter sheet" },
            ],
        };
    }

    if (name.includes("clothing")) return { title: "Prices by Size", sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER, SIZES.US_TABLOID] };
    if (name.includes("mug")) return { title: "Prices by Size", sizes: [SIZES.MUG_WRAP_11OZ] };
    if (name.includes("coaster")) return { title: "Prices by Size", sizes: [SIZES.COASTER_95] };
    if (name.includes("sticker")) return { title: "Prices by Size", sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER] };
    if (name.includes("notebook")) return { title: "Prices by Size", sizes: [SIZES.A5, SIZES.A4, SIZES.HALF_US_LETTER, SIZES.US_LETTER] };
    if (name.includes("wall art")) return { title: "Prices by Size", sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER, SIZES.US_TABLOID] };
    if (name.includes("photo art")) return { title: "Prices by Size", sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER, SIZES.US_TABLOID] };
    if (name.includes("bag")) return { title: "Prices by Size", sizes: [SIZES.A4, SIZES.A3, SIZES.US_LETTER, SIZES.US_TABLOID] };

    // Default: Cards
    return {
        title: "Prices by Size",
        sizes: [
            SIZES.A5,
            SIZES.A4,
            SIZES.HALF_US_LETTER,
            SIZES.US_LETTER,
            { ...SIZES.US_TABLOID, helper: "Folded half: 11 × 8.5 in" },
        ],
    };
};

const getNestedError = (errors: FieldErrors<FormValue>, path: string): string | undefined => {
    const parts = path.split(".");
    let cur: any = errors;
    for (const p of parts) {
        if (!cur) return undefined;
        cur = cur[p];
    }
    return cur?.message as string | undefined;
};

const TempletForm = () => {
    const { saveDesign, loading, setLoading, resetState } = useCategoriesEditorState();
    const navigate = useNavigate();
    const location = useLocation();
    const navState = location.state as any;

    const mode: string | undefined = navState?.mode;
    const templateId: string | undefined = navState?.id ?? undefined;
    const prevImg: string | undefined = navState?.imgUrl ?? undefined;
    const isEditMode = mode === "edit" || !!templateId;

    const [rawStoresState, setRawStoresState] = useState<any>(null);

    useEffect(() => {
        const rs = navState?.rawStores;
        if (!rs) return;

        const normalized =
            typeof rs === "string"
                ? (() => {
                    try {
                        return JSON.parse(rs);
                    } catch {
                        return null;
                    }
                })()
                : rs;

        setRawStoresState(normalized);
    }, [navState?.rawStores]);

    const rawStores = rawStoresState;

    const previewRef = useRef<HTMLDivElement | null>(null);
    const [previewUrl] = useState<string | undefined>(undefined);

    const didPrefillRef = useRef(false);

    useEffect(() => {
        didPrefillRef.current = false;
    }, [templateId]);

    const {
        data: categories = [],
        isLoading: isLoadingCats,
        isError: isErrorCats,
    } = useQuery<CategoryRow[]>({
        queryKey: ["categories"],
        queryFn: fetchAllCategoriesFromDB,
        staleTime: 1000 * 60 * 30,
    });

    const categoryOptions: Option[] = useMemo(
        () =>
            categories
                .map((c) => (c?.name ?? "").trim())
                .filter(Boolean)
                .map((name) => ({ label: name, value: name })),
        [categories]
    );

    const categoryOptionsWithEmpty: Option[] = useMemo(
        () => [{ label: "Select category", value: "" }, ...categoryOptions],
        [categoryOptions]
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

            pricing: {},
            salePricing: {},

            description: "",
            polygon_shape: "",
        },
    });

    const { product } = (location.state || {}) as { product?: EditProductLike };

    const selectedCategoryName = watch("cardcategory");
    const selectedSubCategory = watch("subCategory");

    const pricingConfig = useMemo(() => getPricingConfig(selectedCategoryName), [selectedCategoryName]);
    const sizes = pricingConfig.sizes;

    // const perRow = useMemo(() => {
    //     const hasTabloid = sizes.some((s) => s.key === "US_TABLOID");
    //     return hasTabloid && sizes.length >= 5 ? 5 : 4;
    // }, [sizes]);

    // const sizeChunks = useMemo(() => chunk(sizes, perRow), [sizes, perRow]);

    // ✅ Prefill ONLY ONCE (prevents category snapping back)
    useEffect(() => {
        if (!product) return;
        if (didPrefillRef.current) return;
        didPrefillRef.current = true;

        const productConfig = getPricingConfig(product.cardcategory);
        const productSizes = productConfig.sizes;
        const hasA5 = productSizes.some((s) => s.key === "A5");
        const hasA3 = productSizes.some((s) => s.key === "A3");

        const incomingPricing: PricingMap = {};
        const incomingSalePricing: PricingMap = {};

        if ((product as any).pricing && typeof (product as any).pricing === "object") {
            for (const [k, v] of Object.entries((product as any).pricing)) incomingPricing[k as SizeKey] = v != null ? String(v) : "";
        }
        if ((product as any).salePricing && typeof (product as any).salePricing === "object") {
            for (const [k, v] of Object.entries((product as any).salePricing)) incomingSalePricing[k as SizeKey] = v != null ? String(v) : "";
        }

        // DB fallback
        if (!incomingPricing.A4 && product.a4price != null) incomingPricing.A4 = String(product.a4price);
        if (!incomingPricing.US_LETTER && product.usletter != null) incomingPricing.US_LETTER = String(product.usletter);
        if (!incomingPricing.A3 && product.a3price != null) incomingPricing.A3 = String(product.a3price);
        if (!incomingPricing.HALF_US_LETTER && product.halfusletter != null) incomingPricing.HALF_US_LETTER = String(product.halfusletter);
        if (!incomingPricing.US_TABLOID && product.ustabloid != null) incomingPricing.US_TABLOID = String(product.ustabloid);

        // legacy a5price ambiguity
        if (!incomingPricing.A5 && hasA5 && product.a5price != null) incomingPricing.A5 = String(product.a5price);
        if (!incomingPricing.A3 && hasA3 && product.a3price == null && product.a5price != null) incomingPricing.A3 = String(product.a5price);

        if (!incomingSalePricing.A4 && product.salea4price != null) incomingSalePricing.A4 = String(product.salea4price);
        if (!incomingSalePricing.US_LETTER && product.saleusletter != null) incomingSalePricing.US_LETTER = String(product.saleusletter);
        if (!incomingSalePricing.A3 && product.salea3price != null) incomingSalePricing.A3 = String(product.salea3price);
        if (!incomingSalePricing.HALF_US_LETTER && product.salehalfusletter != null) incomingSalePricing.HALF_US_LETTER = String(product.salehalfusletter);
        if (!incomingSalePricing.US_TABLOID && product.saleustabloid != null) incomingSalePricing.US_TABLOID = String(product.saleustabloid);

        if (!incomingSalePricing.A5 && hasA5 && product.salea5price != null) incomingSalePricing.A5 = String(product.salea5price);
        if (!incomingSalePricing.A3 && hasA3 && product.salea3price == null && product.salea5price != null) incomingSalePricing.A3 = String(product.salea5price);

        reset({
            cardname: product.cardname ?? "",
            cardcategory: product.cardcategory ?? "",
            subCategory: product.subCategory ?? "",
            subSubCategory: product.subSubCategory ?? "",
            sku: product.sku ?? "",
            description: product.description ?? "",
            polygon_shape: "",

            actualprice: product.actualprice ?? "",
            a4price: product.a4price ?? "",
            a5price: product.a5price ?? "",
            usletter: product.usletter ?? "",
            saleprice: product.saleprice ?? "",
            salea4price: product.salea4price ?? "",
            salea5price: product.salea5price ?? "",
            saleusletter: product.saleusletter ?? "",

            pricing: incomingPricing,
            salePricing: incomingSalePricing,
        });
    }, [product, reset]);

    const selectedCategory = useMemo(
        () => categories.find((c) => c.name === selectedCategoryName),
        [categories, selectedCategoryName]
    );

    const subCategoryOptions: Option[] = useMemo(() => {
        if (!selectedCategory?.subcategories) return [{ label: "Select sub category", value: "" }];
        return [{ label: "Select sub category", value: "" }, ...selectedCategory.subcategories.map((sub) => ({ label: sub, value: sub }))];
    }, [selectedCategory]);

    const subSubCategoryOptions: Option[] = useMemo(() => {
        if (!selectedCategory || !selectedSubCategory) return [{ label: "Select sub-sub category", value: "" }];
        const map = selectedCategory.sub_subcategories || {};
        const list = map[selectedSubCategory] || [];
        return [{ label: "Select sub-sub category", value: "" }, ...list.map((name) => ({ label: name, value: name }))];
    }, [selectedCategory, selectedSubCategory]);

    // Clear sub/subSub when invalid after category changes
    useEffect(() => {
        const sub = watch("subCategory") || "";
        const subsub = watch("subSubCategory") || "";
        const validSub = !!selectedCategory?.subcategories?.includes(sub);

        if (!validSub) {
            setValue("subCategory", "");
            setValue("subSubCategory", "");
            return;
        }

        const validSubSub = !!(selectedCategory?.sub_subcategories?.[sub] ?? []).includes(subsub);
        if (!validSubSub) setValue("subSubCategory", "");
    }, [selectedCategoryName, selectedCategory, setValue, watch]);

    useEffect(() => {
        const subsub = watch("subSubCategory") || "";
        const list = selectedCategory?.sub_subcategories?.[selectedSubCategory || ""] ?? [];
        if (!list.includes(subsub)) setValue("subSubCategory", "");
    }, [selectedSubCategory, selectedCategory, setValue, watch]);

    // Ensure keys exist
    useEffect(() => {
        for (const s of sizes) {
            const p = `pricing.${s.key}` as PricingFieldPath;
            const sp = `salePricing.${s.key}` as SalePricingFieldPath;
            if (getValues(p) === undefined) setValue(p, "");
            if (getValues(sp) === undefined) setValue(sp, "");
        }
    }, [sizes, getValues, setValue]);

    // legacy sync for old columns
    const pricing = watch("pricing");
    const salePricing = watch("salePricing");

    useEffect(() => {
        const hasA5 = sizes.some((s) => s.key === "A5");
        const hasA3 = sizes.some((s) => s.key === "A3");
        const firstKey = sizes[0]?.key;

        const nextActual = (firstKey ? pricing?.[firstKey] : "") ?? "";
        if ((getValues("actualprice") ?? "") !== nextActual) setValue("actualprice", nextActual);

        const nextSale = (firstKey ? salePricing?.[firstKey] : "") ?? "";
        if ((getValues("saleprice") ?? "") !== nextSale) setValue("saleprice", nextSale);

        if ((getValues("a4price") ?? "") !== (pricing?.A4 ?? "")) setValue("a4price", (pricing?.A4 ?? "") as any);
        if ((getValues("usletter") ?? "") !== (pricing?.US_LETTER ?? "")) setValue("usletter", (pricing?.US_LETTER ?? "") as any);

        const legacyA5Slot = hasA5 ? (pricing?.A5 ?? "") : hasA3 ? (pricing?.A3 ?? "") : "";
        if ((getValues("a5price") ?? "") !== legacyA5Slot) setValue("a5price", legacyA5Slot as any);

        if ((getValues("salea4price") ?? "") !== (salePricing?.A4 ?? "")) setValue("salea4price", (salePricing?.A4 ?? "") as any);
        if ((getValues("saleusletter") ?? "") !== (salePricing?.US_LETTER ?? "")) setValue("saleusletter", (salePricing?.US_LETTER ?? "") as any);

        const legacySaleA5Slot = hasA5 ? (salePricing?.A5 ?? "") : hasA3 ? (salePricing?.A3 ?? "") : "";
        if ((getValues("salea5price") ?? "") !== legacySaleA5Slot) setValue("salea5price", legacySaleA5Slot as any);
    }, [sizes, getValues, pricing, salePricing, setValue]);

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

        const hasA5 = sizes.some((s) => s.key === "A5");
        const hasA3 = sizes.some((s) => s.key === "A3");
        const firstKey = sizes[0]?.key;

        const legacyA5Slot = hasA5 ? data.pricing?.A5 : hasA3 ? data.pricing?.A3 : "";
        const legacySaleA5Slot = hasA5 ? data.salePricing?.A5 : hasA3 ? data.salePricing?.A3 : "";

        const meta: PublishMeta = {
            id: templateId,
            mode,

            cardname: data.cardname,
            cardcategory: data.cardcategory,
            subCategory: data.subCategory,
            subSubCategory: data.subSubCategory,

            // legacy DB columns
            actualprice: toTextNumberOrEmpty(firstKey ? data.pricing?.[firstKey] : ""),
            a4price: toTextNumberOrEmpty(data.pricing?.A4),
            a5price: toTextNumberOrEmpty(legacyA5Slot),
            usletter: toTextNumberOrEmpty(data.pricing?.US_LETTER),

            saleprice: toTextNumberOrEmpty(firstKey ? data.salePricing?.[firstKey] : ""),
            salea4price: toTextNumberOrEmpty(data.salePricing?.A4),
            salea5price: toTextNumberOrEmpty(legacySaleA5Slot),
            saleusletter: toTextNumberOrEmpty(data.salePricing?.US_LETTER),

            // NEW DB columns
            a3price: toTextNumberOrEmpty(data.pricing?.A3),
            halfusletter: toTextNumberOrEmpty(data.pricing?.HALF_US_LETTER),
            ustabloid: toTextNumberOrEmpty(data.pricing?.US_TABLOID),

            salea3price: toTextNumberOrEmpty(data.salePricing?.A3),
            salehalfusletter: toTextNumberOrEmpty(data.salePricing?.HALF_US_LETTER),
            saleustabloid: toTextNumberOrEmpty(data.salePricing?.US_TABLOID),

            description: data.description,
            sku: data.sku,
            imgUrl: captured ?? previewUrl,
        };

        await saveDesign(meta);
        setLoading(false);
        resetState()
        reset();
    };

    const mmToPx = (mm: number) => (mm / 25.4) * 96;

    function coverScale(cardPxW: number, cardPxH: number, boxW: number, boxH: number) {
        const scale = Math.max(boxW / cardPxW, boxH / cardPxH);
        const w = cardPxW * scale;
        const h = cardPxH * scale;
        const offsetX = (boxW - w) / 2;
        const offsetY = (boxH - h) / 2;
        return { scale, w, h, offsetX, offsetY };
    }


    const cols = 4;

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
                {/* Left Preview */}
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
                    {prevImg ? (
                        <Box component={"img"} src={`${prevImg}`} sx={{ width: "100%", height: "100%", objectFit: "fill" }} />
                    ) : (
                        <>
                            {rawStores ? (
                                (() => {
                                    const firstSlide = rawStores.slides?.[0];
                                    if (!firstSlide) return <Box sx={{ color: "#999", p: 2 }}>No slide data</Box>;

                                    const slideTextElements =
                                        rawStores.textElements?.filter((te: any) => te.slideId === firstSlide.id) || [];
                                    const slideImageElements =
                                        rawStores.imageElements?.filter((ie: any) => ie.slideId === firstSlide.id) || [];
                                    const slideBg = rawStores.slideBg?.[firstSlide.id] || null;

                                    const baseW = rawStores.config?.fitCanvas?.width ?? mmToPx(rawStores.config?.mmWidth ?? 210);
                                    const baseH = rawStores.config?.fitCanvas?.height ?? mmToPx(rawStores.config?.mmHeight ?? 297);

                                    const boxW = 500;
                                    const boxH = 700;
                                    const { scale, w, h, offsetX, offsetY } = coverScale(baseW, baseH, boxW, boxH);

                                    return (
                                        <Box sx={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
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

                                                {slideTextElements.map((txt: any) => (
                                                    <Typography
                                                        key={txt.id}
                                                        sx={{
                                                            position: "absolute",
                                                            top: txt.y * scale,
                                                            left: txt.x * scale,
                                                            width: txt.width * scale,
                                                            fontSize: (txt.fontSize ?? 16) * scale,
                                                            fontFamily: txt.fontFamily,
                                                            color: txt.color,
                                                            fontWeight: txt.bold ? 700 : 400,
                                                            fontStyle: txt.italic ? "italic" : "normal",
                                                            textAlign: txt.align as any,
                                                            whiteSpace: "pre-wrap",
                                                        }}
                                                    >
                                                        {txt.text}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    );
                                })()
                            ) : (
                                <Box sx={{ color: "#999", p: 2 }}>No preview available</Box>
                            )}
                        </>
                    )}
                </Box>

                {/* Right Form */}
                <Box
                    component="form"
                    sx={{ width: { md: "500px", sm: "500px", xs: "100%" }, mt: { md: 0, sm: 0, xs: 3 } }}
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <CustomInput
                        label="Title"
                        placeholder="Enter template title"
                        defaultValue=""
                        register={register("cardname", { required: "Title is required" })}
                        error={errors.cardname?.message}
                    />

                    <Controller
                        name="cardcategory"
                        control={control}
                        rules={{ required: "Category is required" }}
                        render={({ field }) => (
                            <CustomInput
                                label="Category"
                                type="select"
                                placeholder={
                                    isLoadingCats ? "Loading categories..." : isErrorCats ? "Failed to load categories" : "Select category"
                                }
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange((e.target as any).value)}
                                error={errors.cardcategory?.message}
                                options={categoryOptionsWithEmpty}
                            />
                        )}
                    />

                    <Controller
                        name="subCategory"
                        control={control}
                        rules={{ required: subCategoryOptions.length > 1 ? "Sub category is required" : false }}
                        render={({ field }) => (
                            <CustomInput
                                label="Sub Category"
                                type="select"
                                placeholder={
                                    !watch("cardcategory")
                                        ? "Select main category first"
                                        : subCategoryOptions.length <= 1
                                            ? "No sub categories"
                                            : "Select sub category"
                                }
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange((e.target as any).value)}
                                error={errors.subCategory?.message}
                                options={subCategoryOptions}
                            />
                        )}
                    />

                    <Controller
                        name="subSubCategory"
                        control={control}
                        rules={{ required: subSubCategoryOptions.length > 1 ? "Sub-sub category is required" : false }}
                        render={({ field }) => (
                            <CustomInput
                                label="Sub Sub Category"
                                type="select"
                                placeholder={
                                    !watch("subCategory")
                                        ? "Select sub category first"
                                        : subSubCategoryOptions.length <= 1
                                            ? "No sub-sub categories"
                                            : "Select sub-sub category"
                                }
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange((e.target as any).value)}
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

                    {/* Pricing */}
                    <Box sx={{ mt: 2, mb: 1 }}>
                        {/* <Typography sx={{ fontWeight: 800 }}>{pricingConfig.title ?? "Prices by Size"}</Typography> */}
                        {pricingConfig.note ? (
                            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>{pricingConfig.note}</Typography>
                        ) : null}
                    </Box>

                    <Typography sx={{ fontWeight: 700, mb: 0.8 }}>Actual Prices</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1 }}>
                        {sizes.map((s) => (
                            <CustomInput
                                key={`pricing-${s.key}`}
                                label={s.label}
                                placeholder="0"
                                defaultValue=""
                                register={register(`pricing.${s.key}` as PricingFieldPath, { required: !isEditMode ? "Required" : false })}
                                error={getNestedError(errors, `pricing.${s.key}`)}
                            />
                        ))}
                    </Box>

                    <Typography sx={{ fontWeight: 700, mb: 0.8, mt: 2 }}>Sale Prices</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1 }}>
                        {sizes.map((s) => (
                            <CustomInput
                                key={`salePricing-${s.key}`}
                                label={s.label}
                                placeholder="0"
                                defaultValue=""
                                register={register(`salePricing.${s.key}` as SalePricingFieldPath)}
                                error={getNestedError(errors, `salePricing.${s.key}`)}
                            />
                        ))}
                    </Box>

                    <CustomInput
                        label="Description"
                        placeholder="Enter description"
                        defaultValue=""
                        register={register("description", { required: "Description is required" })}
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
