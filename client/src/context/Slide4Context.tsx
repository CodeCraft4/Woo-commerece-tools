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
interface DraggableAudioQR {
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

interface Slide4ContextType {
  activeIndex4: number;
  setActiveIndex4: React.Dispatch<React.SetStateAction<number>>;
  title4: string;
  setTitle4: React.Dispatch<React.SetStateAction<string>>;
  activePopup4: string | null;
  setActivePopup4: React.Dispatch<React.SetStateAction<string | null>>;
  selectedImg4: number[];
  setSelectedImage4: React.Dispatch<React.SetStateAction<number[]>>;
  showOneTextRightSideBox4: boolean;
  setShowOneTextRightSideBox4: React.Dispatch<React.SetStateAction<boolean>>;
  oneTextValue4: string;
  setOneTextValue4: React.Dispatch<React.SetStateAction<string>>;
  multipleTextValue4: boolean;
  setMultipleTextValue4: React.Dispatch<React.SetStateAction<boolean>>;

  // Layout selection
  selectedLayout4: "blank" | "oneText" | "multipleText";
  setSelectedLayout4: React.Dispatch<
    React.SetStateAction<"blank" | "oneText" | "multipleText">
  >;

  // Global defaults (for new text elements)
  fontSize4: number;
  setFontSize4: React.Dispatch<React.SetStateAction<number>>;
  fontWeight4: number;
  setFontWeight4: React.Dispatch<React.SetStateAction<number>>;
  textAlign4: "start" | "center" | "end";
  verticalAlign4?: "top" | "center" | "bottom";
  setVerticalAlign4: React.Dispatch<
    React.SetStateAction<"top" | "center" | "bottom">
  >;
  setTextAlign4: React.Dispatch<
    React.SetStateAction<"start" | "center" | "end">
  >;
  fontColor4: string;
  setFontColor4: React.Dispatch<React.SetStateAction<string>>;
  fontFamily4: string;
  setFontFamily4: React.Dispatch<React.SetStateAction<string>>;
  rotation4: number;
  setRotation4: React.Dispatch<React.SetStateAction<number>>;

  // Individual text elements management
  textElements4: TextElement[];
  setTextElements4: React.Dispatch<React.SetStateAction<TextElement[]>>;
  selectedTextId4: string | null;
  setSelectedTextId4: React.Dispatch<React.SetStateAction<string | null>>;

  // Legacy support
  texts4: string[] | any[];
  setTexts4: React.Dispatch<React.SetStateAction<any[]>>;
  editingIndex4: number | null;
  setEditingIndex4: React.Dispatch<React.SetStateAction<number | null>>;

  images4: { id: number; src: string }[];
  setImages4: React.Dispatch<
    React.SetStateAction<{ id: number; src: string }[]>
  >;
  video4: File[] | null;
  setVideo4: React.Dispatch<React.SetStateAction<File[] | null>>;
  audio4: File[] | null;
  setAudio4: React.Dispatch<React.SetStateAction<File[] | null>>;
  tips4: boolean;
  setTips4: React.Dispatch<React.SetStateAction<boolean>>;
  upload4: boolean;
  setUpload4: React.Dispatch<React.SetStateAction<boolean>>;
  duration4: number | null;
  setDuration4: React.Dispatch<React.SetStateAction<number | null>>;

  selectedPreviewImage4?: string | null;
  setSelectedPreviewImage4?: React.Dispatch<
    React.SetStateAction<string | null>
  >;

  draggableImages4: DraggableImage[];
  setDraggableImages4: React.Dispatch<React.SetStateAction<DraggableImage[]>>;

  qrPosition4: DraggableQR;
  setQrPosition4: React.Dispatch<React.SetStateAction<DraggableQR>>;
  qrAudioPosition4: DraggableAudioQR;
  setQrAudioPosition4: React.Dispatch<React.SetStateAction<DraggableAudioQR>>;

  // New properties for position and size
  textPositions4: Position[];
  setTextPositions4: React.Dispatch<React.SetStateAction<Position[]>>;
  textSizes4: Size[];
  setTextSizes4: React.Dispatch<React.SetStateAction<Size[]>>;
  imagePositions4: Record<number, Position>; // keyed by image id
  setImagePositions4: React.Dispatch<
    React.SetStateAction<Record<number, Position>>
  >;
  imageSizes4: Record<number, Size>; // keyed by image id
  setImageSizes4: React.Dispatch<React.SetStateAction<Record<number, Size>>>;
  poster4: string | null;
  setPoster4: React.Dispatch<React.SetStateAction<string | null>>;
  selectedVideoUrl4: string | null;
  setSelectedVideoUrl4: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedAudioUrl4: React.Dispatch<React.SetStateAction<string | null>>;
  selectedAudioUrl4: string | null;
  isAIimage4?: boolean;
  setIsAIimage4?: React.Dispatch<React.SetStateAction<boolean | any>>;
  selectedAIimageUrl4: string | null;
  setSelectedAIimageUrl4: React.Dispatch<React.SetStateAction<string | null>>;

  // Slide state management
  isSlideActive4: boolean;
  setIsSlideActive4: React.Dispatch<React.SetStateAction<boolean>>;
  slide4DataStore?: any[];

  aimage4: ImagePosition;
  setAIImage4: React.Dispatch<React.SetStateAction<ImagePosition>>;

  isEditable4: boolean; // NEW: To control edit/view mode
  setIsEditable4: React.Dispatch<React.SetStateAction<boolean>>;

  // For Sticker
  selectedStickers4: StickerItem[];
  addSticker4: (
    sticker: Omit<StickerItem, "x" | "y" | "width" | "height" | "zIndex">
  ) => void;
  updateSticker4: (index: number, data: Partial<StickerItem>) => void;
  removeSticker4: (index: number) => void;
}

const Slide4Context = createContext<Slide4ContextType | undefined>(undefined);

export const Slide4Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeIndex4, setActiveIndex4] = useState(0);
  const [title4, setTitle4] = useState("Happy Birthday");
  const [activePopup4, setActivePopup4] = useState<string | null>(null);
  const [selectedImg4, setSelectedImage4] = useState<number[]>([]);
  const [showOneTextRightSideBox4, setShowOneTextRightSideBox4] =
    useState(false);
  const [oneTextValue4, setOneTextValue4] = useState("");
  const [multipleTextValue4, setMultipleTextValue4] = useState(false);

  // Layout selection
  const [selectedLayout4, setSelectedLayout4] = useState<
    "blank" | "oneText" | "multipleText"
  >("blank");
  const [selectedVideoUrl4, setSelectedVideoUrl4] = useState<string | null>(
    null
  );
  const [selectedAudioUrl4, setSelectedAudioUrl4] = useState<string | null>(
    null
  );
  const [selectedPreviewImage4, setSelectedPreviewImage4] = useState<
    string | null
  >(null);

  // Image Resizing.
  const [draggableImages4, setDraggableImages4] = useState<DraggableImage[]>(
    []
  );

  // QR Resizing and Moving
  const [qrPosition4, setQrPosition4] = useState<DraggableQR>({
    id: "qr4",
    url: "",
    x: 20,
    y: 10,
    width: 85,
    height: 105,
    rotation: 0,
    zIndex: 4000,
  });

  const [qrAudioPosition4, setQrAudioPosition4] = useState<DraggableAudioQR>({
    id: "qr2",
    url: "",
    x: 20,
    y: 10,
    width: 85,
    height: 105,
    rotation: 0,
    zIndex: 4000,
  });

  const [aimage4, setAIImage4] = useState<ImagePosition>({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
    // zindex: 1000,
  });

  // Global defaults (for new text elements)
  const [fontSize4, setFontSize4] = useState(20);
  const [fontWeight4, setFontWeight4] = useState(400);
  const [textAlign4, setTextAlign4] = useState<"start" | "center" | "end">(
    "start"
  );
  const [verticalAlign4, setVerticalAlign4] = useState<
    "top" | "center" | "bottom"
  >("top");
  const [fontFamily4, setFontFamily4] = useState("Roboto");
  const [fontColor4, setFontColor4] = useState(fontColors[0]);
  const [rotation4, setRotation4] = useState(0);

  // Individual text elements management
  const [textElements4, setTextElements4] = useState<TextElement[]>([]);
  const [selectedTextId4, setSelectedTextId4] = useState<string | null>(null);

  // Legacy support
  const [texts4, setTexts4] = useState([
    {
      value: "",
      fontSize: 20,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
    },
    {
      value: "",
      fontSize: 20,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
    },
    {
      value: "",
      fontSize: 20,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
    },
  ]);

  const [editingIndex4, setEditingIndex4] = useState<number | null>(null);

  const [images4, setImages4] = useState<{ id: number; src: string }[]>([]);
  const [video4, setVideo4] = useState<File[] | null>(null);
  const [audio4, setAudio4] = useState<File[] | null>(null);
  const [tips4, setTips4] = useState(false);
  const [upload4, setUpload4] = useState(false);
  const [duration4, setDuration4] = useState<number | null>(null);
  const [poster4, setPoster4] = useState<string | null>(null);

  const [selectedAIimageUrl4, setSelectedAIimageUrl4] = useState<string | null>(
    null
  );
  const [isAIimage4, setIsAIimage4] = useState<boolean>(false);

  const [selectedStickers4, setSelectedStickers4] = useState<StickerItem[]>([]);

  // New states for position and size
  const [textPositions4, setTextPositions4] = useState<Position[]>(
    texts4.map(() => ({ x: 0, y: 0 }))
  );
  const [textSizes4, setTextSizes4] = useState<Size[]>(
    texts4.map(() => ({ width: 400, height: 30 }))
  );

  // For images, use an object keyed by image id for quick lookup
  const [imagePositions4, setImagePositions4] = useState<
    Record<number, Position>
  >({});
  const [imageSizes4, setImageSizes4] = useState<Record<number, Size>>({});

  // Slide state management
  const [isSlideActive4, setIsSlideActive4] = useState(false);
  const [isEditable4, setIsEditable4] = useState(true);

  const [slide4DataStore, setSlide4DataStore] = useState<any[]>([]);

   const addSticker4 = (
    sticker: Omit<StickerItem, "x" | "y" | "width" | "height" | "zIndex" | "rotation">
  ) => {
    setSelectedStickers4((prev) => {
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

  const updateSticker4 = (index: number, data: Partial<StickerItem>) => {
    setSelectedStickers4((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...data } : item))
    );
  };

  const removeSticker4 = (index: number) => {
    setSelectedStickers4((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };

  // ✅ LOG ALL CHANGES LIVE
  useEffect(() => {
    setSlide4DataStore([
      activeIndex4,
      title4,
      selectedLayout4,
      oneTextValue4,
      multipleTextValue4,
      textElements4,
      texts4,
      fontSize4,
      fontWeight4,
      fontColor4,
      fontFamily4,
      textAlign4,
      verticalAlign4,
      rotation4,
      images4,
      imagePositions4,
      imageSizes4,
      video4,
      audio4,
      duration4,
      poster4,
      isSlideActive4,
      selectedPreviewImage4,
      setSelectedPreviewImage4,
    ]);
  }, [
    activeIndex4,
    title4,
    selectedLayout4,
    oneTextValue4,
    multipleTextValue4,
    textElements4,
    texts4,
    fontSize4,
    fontWeight4,
    fontColor4,
    fontFamily4,
    textAlign4,
    verticalAlign4,
    rotation4,
    images4,
    imagePositions4,
    imageSizes4,
    video4,
    audio4,
    duration4,
    poster4,
    isSlideActive4,
    selectedPreviewImage4,
    setSelectedPreviewImage4,
  ]);

  return (
    <Slide4Context.Provider
      value={{
        activeIndex4,
        setActiveIndex4,
        title4,
        setTitle4,
        activePopup4,
        setActivePopup4,
        selectedImg4,
        setSelectedImage4,
        showOneTextRightSideBox4,
        setShowOneTextRightSideBox4,
        oneTextValue4,
        setOneTextValue4,
        multipleTextValue4,
        setMultipleTextValue4,

        // Layout selection
        selectedLayout4,
        setSelectedLayout4,

        // Global defaults
        fontSize4,
        setFontSize4,
        fontWeight4,
        setFontWeight4,
        textAlign4,
        setTextAlign4,
        fontColor4,
        setFontColor4,
        fontFamily4,
        setFontFamily4,
        rotation4,
        setRotation4,

        // Individual text elements management
        textElements4,
        setTextElements4,
        selectedTextId4,
        setSelectedTextId4,

        // Legacy support
        texts4,
        setTexts4,
        editingIndex4,
        setEditingIndex4,

        images4,
        setImages4,
        aimage4,
        setAIImage4,

        selectedPreviewImage4,
        setSelectedPreviewImage4,
        draggableImages4,
        setDraggableImages4,
        isAIimage4,
        setIsAIimage4,
        setSelectedAIimageUrl4,
        selectedAIimageUrl4,

        video4,
        setVideo4,
        audio4,
        setAudio4,

        addSticker4,
        selectedStickers4,
        updateSticker4,
        removeSticker4,

        tips4,
        setTips4,
        upload4,
        setUpload4,
        duration4,
        setDuration4,
        selectedVideoUrl4,
        setSelectedVideoUrl4,
        selectedAudioUrl4,
        setSelectedAudioUrl4,
        qrPosition4,
        setQrPosition4,
        qrAudioPosition4,
        setQrAudioPosition4,

        // New values
        textPositions4,
        setTextPositions4,
        textSizes4,
        setTextSizes4,
        imagePositions4,
        setImagePositions4,
        imageSizes4,
        setImageSizes4,
        poster4,
        setPoster4,

        // Slide state management
        isSlideActive4,
        setIsSlideActive4,
        isEditable4,
        setIsEditable4,
        verticalAlign4,
        setVerticalAlign4,

        slide4DataStore,
      }}
    >
      {children}
    </Slide4Context.Provider>
  );
};

export const useSlide4 = () => {
  const context = useContext(Slide4Context);
  if (!context) {
    throw new Error("useWishCard must be used within a WishCardProvider");
  }
  return context;
};
