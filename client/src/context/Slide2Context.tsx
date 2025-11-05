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
  rotation: number;
}

interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Slide2ContextType {
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  activePopup: string | null;
  setActivePopup: React.Dispatch<React.SetStateAction<string | null>>;
  selectedImg: number[];
  setSelectedImage: React.Dispatch<React.SetStateAction<number[]>>;
  showOneTextRightSideBox: boolean;
  setShowOneTextRightSideBox: React.Dispatch<React.SetStateAction<boolean>>;
  oneTextValue: string;
  setOneTextValue: React.Dispatch<React.SetStateAction<string>>;
  multipleTextValue: boolean;
  setMultipleTextValue: React.Dispatch<React.SetStateAction<boolean>>;

  lineHeight2: number;
  setLineHeight2: React.Dispatch<React.SetStateAction<number>>;
  letterSpacing2: number;
  setLetterSpacing2: React.Dispatch<React.SetStateAction<number>>;

  // Layout selection
  selectedLayout: "blank" | "oneText" | "multipleText";
  setSelectedLayout: React.Dispatch<
    React.SetStateAction<"blank" | "oneText" | "multipleText">
  >;

  // Global defaults (for new text elements)
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  fontWeight: number;
  setFontWeight: React.Dispatch<React.SetStateAction<number>>;
  textAlign: "start" | "center" | "end";
  verticalAlign?: "top" | "center" | "bottom";
  setVerticalAlign: React.Dispatch<
    React.SetStateAction<"top" | "center" | "bottom">
  >;
  setTextAlign: React.Dispatch<
    React.SetStateAction<"start" | "center" | "end">
  >;
  fontColor: string;
  setFontColor: React.Dispatch<React.SetStateAction<string>>;
  fontFamily: string;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  defaultFontSize: number;
  setDefaultFontSize: React.Dispatch<React.SetStateAction<number>>;
  defaultFontWeight: number;
  setDefaultFontWeight: React.Dispatch<React.SetStateAction<number>>;
  defaultFontColor: string;
  setDefaultFontColor: React.Dispatch<React.SetStateAction<string>>;
  defaultFontFamily: string;
  setDefaultFontFamily: React.Dispatch<React.SetStateAction<string>>;
  defaultTextAlign: "start" | "center" | "end";
  setDefaultTextAlign: React.Dispatch<
    React.SetStateAction<"start" | "center" | "end">
  >;
  defaultVerticalAlign: "top" | "center" | "bottom";
  setDefaultVerticalAlign: React.Dispatch<
    React.SetStateAction<"top" | "center" | "bottom">
  >;
  defaultRotation: number;
  setDefaultRotation: React.Dispatch<React.SetStateAction<number>>;

  // Individual text elements management
  textElements: TextElement[];
  setTextElements: React.Dispatch<React.SetStateAction<TextElement[]>>;
  selectedTextId: string | null;
  setSelectedTextId: React.Dispatch<React.SetStateAction<string | null>>;

  // Legacy support
  texts: string[] | any[];
  setTexts: React.Dispatch<React.SetStateAction<any[]>>;
  editingIndex: number | null;
  setEditingIndex: React.Dispatch<React.SetStateAction<number | null>>;

  images: { id: number; src: string }[];
  setImages: React.Dispatch<
    React.SetStateAction<{ id: number; src: string }[]>
  >;
  video: File[] | null;
  setVideo: React.Dispatch<React.SetStateAction<File[] | null>>;
  audio: File[] | null;
  setAudio: React.Dispatch<React.SetStateAction<File[] | null>>;
  tips: boolean;
  setTips: React.Dispatch<React.SetStateAction<boolean>>;
  upload: boolean;
  setUpload: React.Dispatch<React.SetStateAction<boolean>>;
  duration: number | null;
  setDuration: React.Dispatch<React.SetStateAction<number | null>>;
  isAIimage2?: boolean;
  setIsAIimage2?: React.Dispatch<React.SetStateAction<boolean | any>>;
  selectedAIimageUrl2: string | null;
  setSelectedAIimageUrl2: React.Dispatch<React.SetStateAction<string | null>>;

  aimage2: ImagePosition;
  setAIImage2: React.Dispatch<React.SetStateAction<ImagePosition>>;

  selectedPreviewImage?: string | null;
  setSelectedPreviewImage?: React.Dispatch<React.SetStateAction<string | null>>;

  draggableImages: DraggableImage[];
  setDraggableImages: React.Dispatch<React.SetStateAction<DraggableImage[]>>;

  qrPosition: DraggableQR;
  setQrPosition: React.Dispatch<React.SetStateAction<DraggableQR>>;
  qrAudioPosition: DraggableAudioQR;
  setQrAudioPosition: React.Dispatch<React.SetStateAction<DraggableAudioQR>>;

  // New properties for position and size
  textPositions: Position[];
  setTextPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  textSizes: Size[];
  setTextSizes: React.Dispatch<React.SetStateAction<Size[]>>;
  imagePositions: Record<number, Position>; // keyed by image id
  setImagePositions: React.Dispatch<
    React.SetStateAction<Record<number, Position>>
  >;
  imageSizes: Record<number, Size>; // keyed by image id
  setImageSizes: React.Dispatch<React.SetStateAction<Record<number, Size>>>;
  poster: string | null;
  setPoster: React.Dispatch<React.SetStateAction<string | null>>;
  selectedVideoUrl: string | null;
  setSelectedVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedAudioUrl: React.Dispatch<React.SetStateAction<string | null>>;
  selectedAudioUrl: string | null;

  // Slide state management
  isSlideActive: boolean;
  setIsSlideActive: React.Dispatch<React.SetStateAction<boolean>>;
  slide2DataStore?: any[];

  isEditable: boolean; // NEW: To control edit/view mode
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>;

  // For Sticker
  selectedStickers2: StickerItem[];
  addSticker2: (
    sticker: Omit<StickerItem, "x" | "y" | "width" | "height" | "zIndex">
  ) => void;
  updateSticker2: (index: number, data: Partial<StickerItem>) => void;
  removeSticker2: (index: number) => void;
}

const Slide2Context = createContext<Slide2ContextType | undefined>(undefined);

export const Slide2Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [title, setTitle] = useState("Happy Birthday");
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [selectedImg, setSelectedImage] = useState<number[]>([]);
  const [showOneTextRightSideBox, setShowOneTextRightSideBox] = useState(false);
  const [oneTextValue, setOneTextValue] = useState("");
  const [multipleTextValue, setMultipleTextValue] = useState(false);

  // Layout selection
  const [selectedLayout, setSelectedLayout] = useState<
    "blank" | "oneText" | "multipleText"
  >("blank");
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
  const [selectedAIimageUrl2, setSelectedAIimageUrl2] = useState<string | null>(
    null
  );
  const [isAIimage2, setIsAIimage2] = useState<boolean>(false);

  const [selectedPreviewImage, setSelectedPreviewImage] = useState<
    string | null
  >(null);

  // Image Resizing.
  const [draggableImages, setDraggableImages] = useState<DraggableImage[]>([]);

  // QR Resizing and Moving
  const [qrPosition, setQrPosition] = useState<DraggableQR>({
    id: "qr1",
    url: "",
    x: 20,
    y: 10,
    width: 59,
    height: 105,
    rotation: 0,
    zIndex: 1000,
  });

  const [qrAudioPosition, setQrAudioPosition] = useState<DraggableAudioQR>({
    id: "qr2",
    url: "",
    x: 20,
    y: 10,
    width: 59,
    height: 1055,
    rotation: 0,
    zIndex: 1000,
  });

  const [aimage2, setAIImage2] = useState<ImagePosition>({
    x: 30,
    y: 30,
    width: 300,
    height: 400,
    // zindex: 1000,
  });

  // Global defaults (for new text elements)
  const [fontSize, setFontSize] = useState(20);
  const [fontWeight, setFontWeight] = useState(400);
  const [textAlign, setTextAlign] = useState<"start" | "center" | "end">(
    "start"
  );
  const [verticalAlign, setVerticalAlign] = useState<
    "top" | "center" | "bottom"
  >("top");
  const [fontFamily, setFontFamily] = useState("Roboto");
  const [fontColor, setFontColor] = useState(fontColors[0]);
  const [rotation, setRotation] = useState(0);

  // Individual text elements management
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);



  // Legacy support
  const [texts, setTexts] = useState([
    {
      value: "",
      fontSize: 20,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
      textAlign: "center",
    },
    {
      value: "",
      fontSize: 20,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
      textAlign: "center",
    },
    {
      value: "",
      fontSize: 20,
      fontWeight: 400,
      fontColor: "#000000",
      fontFamily: "Roboto",
      verticalAlign: "center",
      textAlign: "center",
    },
  ]);

  const [lineHeight2, setLineHeight2] = useState(1.5);
  const [letterSpacing2, setLetterSpacing2] = useState(0);


  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [images, setImages] = useState<{ id: number; src: string }[]>([]);
  const [video, setVideo] = useState<File[] | null>(null);
  const [audio, setAudio] = useState<File[] | null>(null);
  const [tips, setTips] = useState(false);
  const [upload, setUpload] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [poster, setPoster] = useState<string | null>(null);

  // New states for position and size
  const [textPositions, setTextPositions] = useState<Position[]>(
    texts.map(() => ({ x: 0, y: 0 }))
  );
  const [textSizes, setTextSizes] = useState<Size[]>(
    texts.map(() => ({ width: 100, height: 30 }))
  );

  // For images, use an object keyed by image id for quick lookup
  const [imagePositions, setImagePositions] = useState<
    Record<number, Position>
  >({});
  const [imageSizes, setImageSizes] = useState<Record<number, Size>>({});

  // Slide state management
  const [isSlideActive, setIsSlideActive] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

  const [slide2DataStore, setSlide2DataStore] = useState<any[]>([]);

  const [selectedStickers2, setSelectedStickers2] = useState<StickerItem[]>([]);

  const addSticker2 = (
    sticker: Omit<
      StickerItem,
      "x" | "y" | "width" | "height" | "zIndex" | "rotation"
    >
  ) => {
    setSelectedStickers2((prev) => {
      const isFirstSticker = prev.length === 0;
      const newSticker: StickerItem = {
        ...sticker,
        x: isFirstSticker ? 30 : 30 + prev.length * 20,
        y: isFirstSticker ? 30 : 30 + prev.length * 20,
        width: isFirstSticker ? 120 : 100,
        height: isFirstSticker ? 120 : 100,
        zIndex: prev.length + 2,
        rotation: 0,
      };
      const updated = [...prev, newSticker];
      return updated;
    });
  };

  const updateSticker2 = (index: number, data: Partial<StickerItem>) => {
    setSelectedStickers2((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...data } : item))
    );
  };

  const removeSticker2 = (index: number) => {
    setSelectedStickers2((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };

  // ✅ LOG ALL CHANGES LIVE
  useEffect(() => {
    setSlide2DataStore([
      activeIndex,
      title,
      selectedLayout,
      oneTextValue,
      multipleTextValue,
      textElements,
      texts,
      fontSize,
      fontWeight,
      fontColor,
      fontFamily,
      textAlign,
      verticalAlign,
      rotation,
      images,
      imagePositions,
      imageSizes,
      video,
      audio,
      duration,
      poster,
      isSlideActive,
      selectedPreviewImage,
      setSelectedPreviewImage,
    ]);
  }, [
    activeIndex,
    title,
    selectedLayout,
    oneTextValue,
    multipleTextValue,
    textElements,
    texts,
    fontSize,
    fontWeight,
    fontColor,
    fontFamily,
    textAlign,
    verticalAlign,
    rotation,
    images,
    imagePositions,
    imageSizes,
    video,
    audio,
    duration,
    poster,
    isSlideActive,
    selectedPreviewImage,
    setSelectedPreviewImage,

    lineHeight2,
    setLineHeight2,
    letterSpacing2,
    setLetterSpacing2,
  ]);

  return (
    <Slide2Context.Provider
      value={{
        activeIndex,
        setActiveIndex,
        title,
        setTitle,
        activePopup,
        setActivePopup,
        selectedImg,
        setSelectedImage,
        showOneTextRightSideBox,
        setShowOneTextRightSideBox,
        oneTextValue,
        setOneTextValue,
        multipleTextValue,
        setMultipleTextValue,
        defaultFontColor: fontColors[0],
        setDefaultFontColor: () => { },
        defaultFontSize: 20,
        setDefaultFontSize: () => { },
        defaultFontWeight: 400,
        setDefaultFontWeight: () => { },
        defaultFontFamily: "Roboto",
        setDefaultFontFamily: () => { },
        defaultTextAlign: "start",
        setDefaultTextAlign: () => { },
        defaultVerticalAlign: "top",
        setDefaultVerticalAlign: () => { },
        defaultRotation: 0,
        setDefaultRotation: () => { },

        // Layout selection
        selectedLayout,
        setSelectedLayout,

        // Global defaults
        fontSize,
        setFontSize,
        fontWeight,
        setFontWeight,
        textAlign,
        setTextAlign,
        fontColor,
        setFontColor,
        fontFamily,
        setFontFamily,
        rotation,
        setRotation,

        // Individual text elements management
        textElements,
        setTextElements,
        selectedTextId,
        setSelectedTextId,

        // Legacy support
        texts,
        setTexts,
        editingIndex,
        setEditingIndex,

        images,
        setImages,

        addSticker2,
        selectedStickers2,
        updateSticker2,
        removeSticker2,

        selectedPreviewImage,
        setSelectedPreviewImage,
        draggableImages,
        setDraggableImages,

        video,
        setVideo,
        audio,
        setAudio,

        aimage2,
        setAIImage2,

        tips,
        setTips,
        upload,
        setUpload,
        duration,
        setDuration,
        selectedVideoUrl,
        setSelectedVideoUrl,
        selectedAudioUrl,
        setSelectedAudioUrl,
        qrPosition,
        setQrPosition,
        qrAudioPosition,
        setQrAudioPosition,

        // New values
        textPositions,
        setTextPositions,
        textSizes,
        setTextSizes,


        lineHeight2,
        setLineHeight2,
        letterSpacing2,
        setLetterSpacing2,



        imagePositions,
        setImagePositions,
        imageSizes,
        setImageSizes,
        poster,
        setPoster,
        isAIimage2,
        setIsAIimage2,
        setSelectedAIimageUrl2,
        selectedAIimageUrl2,

        // Slide state management
        isSlideActive,
        setIsSlideActive,
        isEditable,
        setIsEditable,
        verticalAlign,
        setVerticalAlign,

        slide2DataStore,
      }}
    >
      {children}
    </Slide2Context.Provider>
  );
};

export const useSlide2 = () => {
  const context = useContext(Slide2Context);
  if (!context) {
    throw new Error("useWishCard must be used within a WishCardProvider");
  }
  return context;
};
