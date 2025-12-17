import { useMemo, useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesFromDB } from "../../../../../source/source";
import CustomInput from "../../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { useCategoriesEditorState, type PublishMeta } from "../../../../../context/CategoriesEditorContext";
import * as htmlToImage from "html-to-image";

/* ========= Types ========= */

type FormValue = {
    cardname: string;
    cardcategory: string;
    subCategory?: string;
    subSubCategory?: string;
    sku: string;
    actualprice?: string | number;
    saleprice?: string | number;
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

type NavState = {
    imgUrl?: string;
    product?: EditFormValue;
};

type Props = { editProduct?: EditFormValue };

/* ========= Component ========= */

const TempletForm = ({ editProduct }: Props) => {
    const location = useLocation();
    const { saveDesign } = useCategoriesEditorState();

    const { imgUrl: stateImgUrl } = (location.state || {}) as NavState;

    // Left preview (we’ll capture this box)
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(stateImgUrl);
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
            saleprice: "",
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
            actualprice?: number | string;
            saleprice?: number | string;
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
            saleprice: product.saleprice != null ? String(product.saleprice) : "",
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
        // capture the exact LeftBox as PNG data URL
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
            cardname: data.cardname,
            cardcategory: data.cardcategory,
            subCategory: data.subCategory,
            subSubCategory: data.subSubCategory,
            actualprice:
                data.actualprice !== "" && data.actualprice !== undefined
                    ? Number(data.actualprice)
                    : undefined,
            saleprice:
                data.saleprice !== "" && data.saleprice !== undefined
                    ? Number(data.saleprice)
                    : undefined,
            description: data.description,
            sku: data.sku,
            imgUrl: captured ?? previewUrl ?? undefined,
        };

        await saveDesign(meta);
        reset();
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
                {/* Left — Preview (captured on submit) */}
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
                        backgroundColor: "#fff",
                    }}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {previewUrl ? (
                        <Box
                            component="img"
                            src={previewUrl}
                            alt="First slide preview"
                            sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                    ) : (
                        <Box sx={{ color: "#999" }}>No preview available</Box>
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
                        <LandingButton
                            title={`${editProduct ? "Update & Publish" : "Save & Publish"}`}
                            personal
                            variant="outlined"
                            width="250px"
                            type="submit"
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default TempletForm;
