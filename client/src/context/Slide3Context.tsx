import React, { createContext, useContext, useEffect, useState } from "react";

const fontColors = [
  "#000000",
  "#FF0000",
  "#008000",
  "#0000FF",
  "#FFA500",
  "#800080",
  "#00FFFF",
  "#FFC0CB",
  "#808080",
  "#FFD700",
];

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface TextElement {
  id: string;
  value: string;
  fontSize: number;
  fontWeight: number;
  fontColor: string;
  fontFamily: string;
  textAlign: "top" | "center" | "end";
  rotation: number;
  zIndex: number;
  position: Position;
  size: Size;
  isEditing?: boolean;
  verticalAlign?: "top" | "center" | "bottom";
}

interface DraggableImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}
interface DraggableQR {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex?: number;
}

interface StickerItem {
  id: string;
  sticker: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation:number
}

interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Slide3ContextType {
  activeIndex3: number;
  setActiveIndex3: React.Dispatch<React.SetStateAction<number>>;
  title3: string;
  setTitle3: React.Dispatch<React.SetStateAction<string>>;
  activePopup3: string | null;
  setActivePopup3: React.Dispatch<React.SetStateAction<string | null>>;
  selectedImg3: number[];
  setSelectedImage3: React.Dispatch<React.SetStateAction<number[]>>;
  showOneTextRightSideBox3: boolean;
  setShowOneTextRightSideBox3: React.Dispatch<React.SetStateAction<boolean>>;
  oneTextValue3: string;
  setOneTextValue3: React.Dispatch<React.SetStateAction<string>>;
  multipleTextValue3: boolean;
  setMultipleTextValue3: React.Dispatch<React.SetStateAction<boolean>>;

  aimage3: ImagePosition;
  setAIImage3: React.Dispatch<React.SetStateAction<ImagePosition>>;

  // Layout selection
  selectedLayout3: "blank" | "oneText" | "multipleText";
  setSelectedLayout3: React.Dispatch<
    React.SetStateAction<"blank" | "oneText" | "multipleText">
  >;

  // Global defaults (for new text elements)
  fontSize3: number;
  setFontSize3: React.Dispatch<React.SetStateAction<number>>;
  fontWeight3: number;
  setFontWeight3: React.Dispatch<React.SetStateAction<number>>;
  textAlign3: "start" | "center" | "end";
  verticalAlign3?: "top" | "center" | "bottom";
  setVerticalAlign3: React.Dispatch<
    React.SetStateAction<"top" | "center" | "bottom">
  >;
  setTextAlign3: React.Dispatch<
    React.SetStateAction<"start" | "center" | "end">
  >;
  fontColor3: string;
  setFontColor3: React.Dispatch<React.SetStateAction<string>>;
  fontFamily3: string;
  setFontFamily3: React.Dispatch<React.SetStateAction<string>>;
  rotation3: number;
  setRotation3: React.Dispatch<React.SetStateAction<number>>;

  // Individual text elements management
  textElements3: TextElement[];
  setTextElements3: React.Dispatch<React.SetStateAction<TextElement[]>>;
  selectedTextId3: string | null;
  setSelectedTextId3: React.Dispatch<React.SetStateAction<string | null>>;

  // Legacy support
  texts3: string[] | any[];
  setTexts3: React.Dispatch<React.SetStateAction<any[]>>;
  editingIndex3: number | null;
  setEditingIndex3: React.Dispatch<React.SetStateAction<number | null>>;

  images3: { id: number; src: string }[];
  setImages3: React.Dispatch<
    React.SetStateAction<{ id: number; src: string }[]>
  >;
  video3: File[] | null;
  setVideo3: React.Dispatch<React.SetStateAction<File[] | null>>;
  audio3: File[] | null;
  setAudio3: React.Dispatch<React.SetStateAction<File[] | null>>;
  tips3: boolean;
  setTips3: React.Dispatch<React.SetStateAction<boolean>>;
  upload3: boolean;
  setUpload3: React.Dispatch<React.SetStateAction<boolean>>;
  duration3: number | null;
  setDuration3: React.Dispatch<React.SetStateAction<number | null>>;
  isAIimage3?: boolean;
  setIsAIimage3?: React.Dispatch<React.SetStateAction<boolean | any>>;
  selectedAIimageUrl3: string | null;
  setSelectedAIimageUrl3: React.Dispatch<React.SetStateAction<string | null>>;

  selectedPreviewImage3?: string | null;
  setSelectedPreviewImage3?: React.Dispatch<
    React.SetStateAction<string | null>
  >;

  draggableImages3: DraggableImage[];
  setDraggableImages3: React.Dispatch<React.SetStateAction<DraggableImage[]>>;

  qrPosition3: DraggableQR;
  setQrPosition3: React.Dispatch<React.SetStateAction<DraggableQR>>;
  // New properties for position and size
  textPositions3: Position[];
  setTextPositions3: React.Dispatch<React.SetStateAction<Position[]>>;
  textSizes3: Size[];
  setTextSizes3: React.Dispatch<React.SetStateAction<Size[]>>;
  imagePositions3: Record<number, Position>; // keyed by image id
  setImagePositions3: React.Dispatch<
    React.SetStateAction<Record<number, Position>>
  >;
  setSelectedAudioUrl3: React.Dispatch<React.SetStateAction<string | null>>;
  selectedAudioUrl3: string | null;
  qrAudioPosition3: DraggableQR;
  setQrAudioPosition3: React.Dispatch<React.SetStateAction<DraggableQR>>;

  imageSizes3: Record<number, Size>; // keyed by image id
  setImageSizes3: React.Dispatch<React.SetStateAction<Record<number, Size>>>;
  poster3: string | null;
  setPoster3: React.Dispatch<React.SetStateAction<string | null>>;
  selectedVideoUrl3: string | null;
  setSelectedVideoUrl3: React.Dispatch<React.SetStateAction<string | null>>;

  // Slide state management
  isSlideActive3: boolean;
  setIsSlideActive3: React.Dispatch<React.SetStateAction<boolean>>;
  slide3DataStore3?: any[];

  isEditable3: boolean; // NEW: To control edit/view mode
  setIsEditable3: React.Dispatch<React.SetStateAction<boolean>>;

  // For Sticker
  selectedStickers3: StickerItem[];
  addSticker3: (
    sticker: Omit<StickerItem, "x" | "y" | "width" | "height" | "zIndex">
  ) => void;
  updateSticker3: (index: number, data: Partial<StickerItem>) => void;
  removeSticker3: (index: number) => void;
}

const Slide3Context = createContext<Slide3ContextType | undefined>(undefined);

export const Slide3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeIndex3, setActiveIndex3] = useState(0);
  const [title3, setTitle3] = useState("Happy Birthday");
  const [activePopup3, setActivePopup3] = useState<string | null>(null);
  const [selectedImg3, setSelectedImage3] = useState<number[]>([]);
  const [showOneTextRightSideBox3, setShowOneTextRightSideBox3] =
    useState(false);
  const [oneTextValue3, setOneTextValue3] = useState("");
  const [multipleTextValue3, setMultipleTextValue3] = useState(false);

  // Layout selection
  const [selectedLayout3, setSelectedLayout3] = useState<
    "blank" | "oneText" | "multipleText"
  >("blank");
  const [selectedVideoUrl3, setSelectedVideoUrl3] = useState<string | null>(
    null
  );
  const [selectedAudioUrl3, setSelectedAudioUrl3] = useState<string | null>(
    null
  );
  const [selectedPreviewImage3, setSelectedPreviewImage3] = useState<
    string | null
  >(null);

  const [selectedAIimageUrl3, setSelectedAIimageUrl3] = useState<string | null>(
    null
  );
  const [isAIimage3, setIsAIimage3] = useState<boolean>(false);

  // Sticker Selection
  const [selectedStickers3, setSelectedStickers3] = useState<StickerItem[]>([]);

  // Image Resizing.
  const [draggableImages3, setDraggableImages3] = useState<DraggableImage[]>(
    []
  );

  // QR Resizing and Moving
  const [qrPosition3, setQrPosition3] = useState<DraggableQR>({
    id: "qr1",
    url: "",
    x: 20,
    y: 10,
    width: 85,
    height: 105,
    rotation: 0,
    zIndex: 1000,
  });
  const [qrAudioPosition3, setQrAudioPosition3] = useState<DraggableQR>({
    id: "qr2",
    url: "",
    x: 20,
    y: 10,
    width: 85,
    height: 105,
    rotation: 0,
    zIndex: 1000,
  });

  const [aimage3, setAIImage3] = useState<ImagePosition>({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
    // zindex: 1000,
  });

  // Global defaults (for new text elements)
  const [fontSize3, setFontSize3] = useState(20);
  const [fontWeight3, setFontWeight3] = useState(400);
  const [textAlign3, setTextAlign3] = useState<"start" | "center" | "end">(
    "start"
  );
  const [verticalAlign3, setVerticalAlign3] = useState<
    "top" | "center" | "bottom"
  >("top");
  const [fontFamily3, setFontFamily3] = useState("Roboto");
  const [fontColor3, setFontColor3] = useState(fontColors[0]);
  const [rotation3, setRotation3] = useState(0);

  // Individual text elements management
  const [textElements3, setTextElements3] = useState<TextElement[]>([]);
  const [selectedTextId3, setSelectedTextId3] = useState<string | null>(null);

  // Legacy support
  const [texts3, setTexts3] = useState([
    {
      value: "",
      fontSize: 30,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
    },
    {
      value: "",
      fontSize: 30,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
    },
    {
      value: "",
      fontSize: 30,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
    },
  ]);

  const [editingIndex3, setEditingIndex3] = useState<number | null>(null);

  const [images3, setImages3] = useState<{ id: number; src: string }[]>([]);
  const [video3, setVideo3] = useState<File[] | null>(null);
  const [audio3, setAudio3] = useState<File[] | null>(null);
  const [tips3, setTips3] = useState(false);
  const [upload3, setUpload3] = useState(false);
  const [duration3, setDuration3] = useState<number | null>(null);
  const [poster3, setPoster3] = useState<string | null>(null);

  // New states for position and size
  const [textPositions3, setTextPositions3] = useState<Position[]>(
    texts3.map(() => ({ x: 0, y: 0 }))
  );
  const [textSizes3, setTextSizes3] = useState<Size[]>(
    texts3.map(() => ({ width: 100, height: 30 }))
  );

  // For images, use an object keyed by image id for quick lookup
  const [imagePositions3, setImagePositions3] = useState<
    Record<number, Position>
  >({});
  const [imageSizes3, setImageSizes3] = useState<Record<number, Size>>({});

  // Slide state management
  const [isSlideActive3, setIsSlideActive3] = useState(false);
  const [isEditable3, setIsEditable3] = useState(true);

  const [slide3DataStore3, setSlide3DataStore3] = useState<any[]>([]);

 const addSticker3 = (
    sticker: Omit<StickerItem, "x" | "y" | "width" | "height" | "zIndex" | "rotation">
  ) => {
    setSelectedStickers3((prev) => {
      const newSticker: StickerItem = {
        ...sticker,
        x: 0 + prev.length * 10,
        y: 0 + prev.length * 10,
        width: 100,
        height: 100,
        zIndex: prev.length + 2,
        rotation: 0,
      };
      const updated = [...prev, newSticker];
      return updated;
    });
  };

  const updateSticker3 = (index: number, data: Partial<StickerItem>) => {
    setSelectedStickers3((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...data } : item))
    );
  };

  const removeSticker3 = (index: number) => {
    setSelectedStickers3((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };

  // ✅ LOG ALL CHANGES LIVE
  useEffect(() => {
    setSlide3DataStore3([
      activeIndex3,
      title3,
      selectedLayout3,
      oneTextValue3,
      multipleTextValue3,
      textElements3,
      texts3,
      fontSize3,
      fontWeight3,
      fontColor3,
      fontFamily3,
      textAlign3,
      verticalAlign3,
      rotation3,
      images3,
      imagePositions3,
      imageSizes3,
      video3,
      duration3,
      poster3,
      isSlideActive3,
      selectedPreviewImage3,
      setSelectedPreviewImage3,
    ]);
  }, [
    activeIndex3,
    title3,
    selectedLayout3,
    oneTextValue3,
    multipleTextValue3,
    textElements3,
    texts3,
    fontSize3,
    fontWeight3,
    fontColor3,
    fontFamily3,
    textAlign3,
    verticalAlign3,
    rotation3,
    images3,
    imagePositions3,
    imageSizes3,
    video3,
    duration3,
    poster3,
    isSlideActive3,
    selectedPreviewImage3,
    setSelectedPreviewImage3,
  ]);

  return (
    <Slide3Context.Provider
      value={{
        activeIndex3,
        setActiveIndex3,
        title3,
        setTitle3,
        activePopup3,
        setActivePopup3,
        selectedImg3,
        setSelectedImage3,
        showOneTextRightSideBox3,
        setShowOneTextRightSideBox3,
        oneTextValue3,
        setOneTextValue3,
        multipleTextValue3,
        setMultipleTextValue3,

        // Layout selection
        selectedLayout3,
        setSelectedLayout3,

        // Global defaults
        fontSize3,
        setFontSize3,
        fontWeight3,
        setFontWeight3,
        textAlign3,
        setTextAlign3,
        fontColor3,
        setFontColor3,
        fontFamily3,
        setFontFamily3,
        rotation3,
        setRotation3,

        // Individual text elements management
        textElements3,
        setTextElements3,
        selectedTextId3,
        setSelectedTextId3,

        // Legacy support
        texts3,
        setTexts3,
        editingIndex3,
        setEditingIndex3,

        images3,
        setImages3,
        addSticker3,
        selectedStickers3,
        updateSticker3,
        removeSticker3,

        selectedPreviewImage3,
        setSelectedPreviewImage3,
        draggableImages3,
        setDraggableImages3,

        video3,
        setVideo3,
        audio3,
        setAudio3,

        aimage3,
        setAIImage3,

        tips3,
        setTips3,
        upload3,
        setUpload3,
        duration3,
        setDuration3,
        selectedVideoUrl3,
        setSelectedVideoUrl3,
        selectedAudioUrl3,
        setSelectedAudioUrl3,
        qrPosition3,
        setQrPosition3,
        qrAudioPosition3,
        setQrAudioPosition3,
        isAIimage3,
        setIsAIimage3,
        setSelectedAIimageUrl3,
        selectedAIimageUrl3,

        // New values
        textPositions3,
        setTextPositions3,
        textSizes3,
        setTextSizes3,
        imagePositions3,
        setImagePositions3,
        imageSizes3,
        setImageSizes3,
        poster3,
        setPoster3,

        // Slide state management
        isSlideActive3,
        setIsSlideActive3,
        isEditable3,
        setIsEditable3,
        verticalAlign3,
        setVerticalAlign3,

        slide3DataStore3,
      }}
    >
      {children}
    </Slide3Context.Provider>
  );
};

export const useSlide3 = () => {
  const context = useContext(Slide3Context);
  if (!context) {
    throw new Error("useWishCard must be used within a WishCardProvider");
  }
  return context;
};
