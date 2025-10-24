// src/context/AdminCardEditorContext.tsx
import React, { createContext, useContext, useState } from "react";

type FormDataType = {
  cardName?: string;
  cardCategory?: string;
  sku?: string;
  actualPrice?: string;
  salePrice?: string;
  description?: string;
  cardImage?: string;
  layout_type?: "isMultipleLayout" | "isShapeLayout" | null;
};

type ElementType = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src?: string | null;
};

type TextElementType = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
};

type AdminCardEditorContextType = {
  formData: FormDataType | null;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType | null>>;
  selectedShapeImage: string | null;
  setSelectedShapeImage: React.Dispatch<React.SetStateAction<string | null>>;
  uploadedShapeImage: string | null;
  setUploadedShapeImage: React.Dispatch<React.SetStateAction<string | null>>;
  elements: ElementType[];
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>;
  textElements: TextElementType[];
  setTextElements: React.Dispatch<React.SetStateAction<TextElementType[]>>;
  resetEditor?:any
};

const AdminCardEditorContext = createContext<AdminCardEditorContextType | undefined>(
  undefined
);

export const AdminCardEditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState<FormDataType | null>(null);
  const [selectedShapeImage, setSelectedShapeImage] = useState<string | null>(null);
  const [uploadedShapeImage, setUploadedShapeImage] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementType[]>([]);
  const [textElements, setTextElements] = useState<TextElementType[]>([]);

  
  // ✅ Add a reset function
  const resetEditor = () => {
    setElements([]);
    setTextElements([]);
    setUploadedShapeImage(null);
    setSelectedShapeImage(null);
    setFormData(null);
  };

  return (
    <AdminCardEditorContext.Provider
      value={{
        formData,
        setFormData,
        selectedShapeImage,
        setSelectedShapeImage,
        uploadedShapeImage,
        setUploadedShapeImage,
        elements,
        setElements,
        textElements,
        setTextElements,
        resetEditor
      }}
    >
      {children}
    </AdminCardEditorContext.Provider>
  );
};

export const useCardEditor = () => {
  const context = useContext(AdminCardEditorContext);
  if (!context) throw new Error("useCardEditor must be used inside AdminCardEditorProvider");
  return context;
};