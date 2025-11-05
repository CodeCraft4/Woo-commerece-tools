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

interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Slide1ContextType {
  activeIndex1: number;
  setActiveIndex1: React.Dispatch<React.SetStateAction<number>>;
  title1: string;
  setTitle1: React.Dispatch<React.SetStateAction<string>>;
  activePopup1: string | null;
  setActivePopup1: React.Dispatch<React.SetStateAction<string | null>>;
  selectedImg1: number[];
  setSelectedImage1: React.Dispatch<React.SetStateAction<number[]>>;
  showOneTextRightSideBox1: boolean;
  setShowOneTextRightSideBox1: React.Dispatch<React.SetStateAction<boolean>>;
  oneTextValue1: string;
  setOneTextValue1: React.Dispatch<React.SetStateAction<string>>;
  multipleTextValue1: boolean;
  setMultipleTextValue1: React.Dispatch<React.SetStateAction<boolean>>;

  // Layout selection
  selectedLayout1: "blank" | "oneText" | "multipleText";
  setSelectedLayout1: React.Dispatch<
    React.SetStateAction<"blank" | "oneText" | "multipleText">
  >;

  // Global defaults (for new text elements)
  fontSize1: number;
  setFontSize1: React.Dispatch<React.SetStateAction<number>>;
  fontWeight1: number;
  setFontWeight1: React.Dispatch<React.SetStateAction<number>>;
  textAlign1: "start" | "center" | "end";
  verticalAlign1?: "top" | "center" | "bottom";
  setVerticalAlign1: React.Dispatch<
    React.SetStateAction<"top" | "center" | "bottom">
  >;
  setTextAlign1: React.Dispatch<
    React.SetStateAction<"start" | "center" | "end">
  >;
  fontColor1: string;
  setFontColor1: React.Dispatch<React.SetStateAction<string>>;
  fontFamily1: string;
  setFontFamily1: React.Dispatch<React.SetStateAction<string>>;
  rotation1: number;
  setRotation1: React.Dispatch<React.SetStateAction<number>>;

  // Individual text elements management
  textElements1: TextElement[];
  setTextElements1: React.Dispatch<React.SetStateAction<TextElement[]>>;
  selectedTextId1: string | null;
  setSelectedTextId1: React.Dispatch<React.SetStateAction<string | null>>;

  // Legacy support
  texts1: string[] | any[];
  setTexts1: React.Dispatch<React.SetStateAction<any[]>>;
  editingIndex1: number | null;
  setEditingIndex1: React.Dispatch<React.SetStateAction<number | null>>;

  images1: { id: number; src: string }[];
  setImages1: React.Dispatch<
    React.SetStateAction<{ id: number; src: string }[]>
  >;
  video1: File[] | null;
  setVideo1: React.Dispatch<React.SetStateAction<File[] | null>>;
  audio1: File[] | null;
  setAudio1: React.Dispatch<React.SetStateAction<File[] | null>>;
  tips1: boolean;
  setTips1: React.Dispatch<React.SetStateAction<boolean>>;
  upload1: boolean;
  setUpload1: React.Dispatch<React.SetStateAction<boolean>>;
  duration1: number | null;
  setDuration1: React.Dispatch<React.SetStateAction<number | null>>;
  isAIimage?: boolean;
  setIsAIimage?: React.Dispatch<React.SetStateAction<boolean | any>>;
  selectedAIimageUrl1: string | null;
  setSelectedAIimageUrl1: React.Dispatch<React.SetStateAction<string | null>>;

  selectedPreviewImage1?: string | null;
  setSelectedPreviewImage1?: React.Dispatch<
    React.SetStateAction<string | null>
  >;

  draggableImages1: DraggableImage[];
  setDraggableImages1: React.Dispatch<React.SetStateAction<DraggableImage[]>>;

  qrPosition1: DraggableQR;
  setQrPosition1: React.Dispatch<React.SetStateAction<DraggableQR>>;
  qrAudioPosition1: DraggableAudioQR;
  setQrAudioPosition1: React.Dispatch<React.SetStateAction<DraggableAudioQR>>;

  aimage1: ImagePosition;
  setAIImage1: React.Dispatch<React.SetStateAction<ImagePosition>>;

  // New properties for position and size
  textPositions1: Position[];
  setTextPositions1: React.Dispatch<React.SetStateAction<Position[]>>;
  textSizes1: Size[];
  setTextSizes1: React.Dispatch<React.SetStateAction<Size[]>>;

  lineHeight1: number;
  setLineHeight1: React.Dispatch<React.SetStateAction<number>>;
  letterSpacing1: number;
  setLetterSpacing1: React.Dispatch<React.SetStateAction<number>>;


  imagePositions1: Record<number, Position>; // keyed by image id
  setImagePositions1: React.Dispatch<
    React.SetStateAction<Record<number, Position>>
  >;
  imageSizes1: Record<number, Size>; // keyed by image id
  setImageSizes1: React.Dispatch<React.SetStateAction<Record<number, Size>>>;
  poster1: string | null;
  setPoster1: React.Dispatch<React.SetStateAction<string | null>>;
  selectedVideoUrl1: string | null;
  setSelectedVideoUrl1: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedAudioUrl1: React.Dispatch<React.SetStateAction<string | null>>;
  selectedAudioUrl1: string | null;

  // Slide state management
  isSlideActive1: boolean;
  setIsSlideActive1: React.Dispatch<React.SetStateAction<boolean>>;
  slide1DataStore?: any[];

  isEditable1: boolean; // NEW: To control edit/view mode
  setIsEditable1: React.Dispatch<React.SetStateAction<boolean>>;

  // For Sticker
  selectedStickers: StickerItem[];
  addSticker: (
    sticker: Omit<StickerItem, "x" | "y" | "width" | "height" | "zIndex">
  ) => void;
  updateSticker: (index: number, data: Partial<StickerItem>) => void;
  removeSticker: (index: number) => void;

  // Layout with uploaded images for preview
  layout1: any;
  setLayout1: React.Dispatch<React.SetStateAction<any>>;
}

const Slide1Context = createContext<Slide1ContextType | undefined>(undefined);

export const Slide1Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeIndex1, setActiveIndex1] = useState(0);
  const [title1, setTitle1] = useState("Happy Birthday");
  const [activePopup1, setActivePopup1] = useState<string | null>(null);
  const [selectedImg1, setSelectedImage1] = useState<number[]>([]);
  const [showOneTextRightSideBox1, setShowOneTextRightSideBox1] =
    useState(false);
  const [oneTextValue1, setOneTextValue1] = useState("");
  const [multipleTextValue1, setMultipleTextValue1] = useState(false);

  // Layout selection
  const [selectedLayout1, setSelectedLayout1] = useState<
    "blank" | "oneText" | "multipleText"
  >("blank");
  const [selectedVideoUrl1, setSelectedVideoUrl1] = useState<string | null>(
    null
  );
  const [selectedAudioUrl1, setSelectedAudioUrl1] = useState<string | null>(
    null
  );
  const [selectedAIimageUrl1, setSelectedAIimageUrl1] = useState<string | null>(
    null
  );

  // Sticker Selection
  const [selectedStickers, setSelectedStickers] = useState<StickerItem[]>([]);

  const [isAIimage, setIsAIimage] = useState<boolean>(false);
  const [selectedPreviewImage1, setSelectedPreviewImage1] = useState<
    string | null
  >(null);

  // Image Resizing.
  const [draggableImages1, setDraggableImages1] = useState<DraggableImage[]>(
    []
  );

  // QR Resizing and Moving
  const [qrPosition1, setQrPosition1] = useState<DraggableQR>({
    id: "qr1",
    url: "",
    x: 0,
    y: 0,
    width: 59,
    height: 105,
    rotation: 0,
    zIndex: 9999,
  });

  const [qrAudioPosition1, setQrAudioPosition1] = useState<DraggableAudioQR>({
    id: "qr2",
    url: "",
    x: 0,
    y: 0,
    width: 59,
    height: 105,
    rotation: 0,
    zIndex: 9999,
  });

  const [aimage1, setAIImage1] = useState<ImagePosition>({
    x: 30,
    y: 30,
    width: 300,
    height: 400,
    // zindex: 1000,
  });

  // Global defaults (for new text elements)
  const [fontSize1, setFontSize1] = useState(20);
  const [fontWeight1, setFontWeight1] = useState(400);
  const [textAlign1, setTextAlign1] = useState<"start" | "center" | "end">(
    "start"
  );
  const [verticalAlign1, setVerticalAlign1] = useState<
    "top" | "center" | "bottom"
  >("top");
  const [fontFamily1, setFontFamily1] = useState("Roboto");
  const [fontColor1, setFontColor1] = useState(fontColors[0]);
  const [rotation1, setRotation1] = useState(0);

  // Individual text elements management
  const [textElements1, setTextElements1] = useState<TextElement[]>([]);
  const [selectedTextId1, setSelectedTextId1] = useState<string | null>(null);

  // Legacy support
  const [texts1, setTexts1] = useState([
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

  const [lineHeight1, setLineHeight1] = useState(1.5);
  const [letterSpacing1, setLetterSpacing1] = useState(0);


  const [editingIndex1, setEditingIndex1] = useState<number | null>(null);

  const [images1, setImages1] = useState<{ id: number; src: string }[]>([]);
  const [video1, setVideo1] = useState<File[] | null>(null);
  const [audio1, setAudio1] = useState<File[] | null>(null);
  const [tips1, setTips1] = useState(false);
  const [upload1, setUpload1] = useState(false);
  const [duration1, setDuration1] = useState<number | null>(null);
  const [poster1, setPoster1] = useState<string | null>(null);

  // New states for position and size
  const [textPositions1, setTextPositions1] = useState<Position[]>(
    texts1.map(() => ({ x: 0, y: 0 }))
  );
  const [textSizes1, setTextSizes1] = useState<Size[]>(
    texts1.map(() => ({ width: 100, height: 30 }))
  );

  // For images, use an object keyed by image id for quick lookup
  const [imagePositions1, setImagePositions1] = useState<
    Record<number, Position>
  >({});
  const [imageSizes1, setImageSizes1] = useState<Record<number, Size>>({});

  // Slide state management
  const [isSlideActive1, setIsSlideActive1] = useState(false);
  const [isEditable1, setIsEditable1] = useState(true);

  const [slide1DataStore, setSlide1DataStore] = useState<any[]>([]);

  // Layout with uploaded images for preview
  const [layout1, setLayout1] = useState<any>(null);

  const addSticker = (
    sticker: Omit<
      StickerItem,
      "x" | "y" | "width" | "height" | "zIndex" | "rotation"
    >
  ) => {
    setSelectedStickers((prev) => {
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

  const updateSticker = (index: number, data: Partial<StickerItem>) => {
    setSelectedStickers((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...data } : item))
    );
  };

  const removeSticker = (index: number) => {
    setSelectedStickers((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };

  // ✅ LOG ALL CHANGES LIVE
  useEffect(() => {
    setSlide1DataStore([
      activeIndex1,
      title1,
      selectedLayout1,
      oneTextValue1,
      multipleTextValue1,
      textElements1,
      texts1,
      fontSize1,
      fontWeight1,
      fontColor1,
      fontFamily1,
      textAlign1,
      verticalAlign1,
      rotation1,
      images1,
      imagePositions1,
      imageSizes1,
      video1,
      audio1,
      duration1,
      poster1,
      isSlideActive1,
      selectedPreviewImage1,
      setSelectedPreviewImage1,
      layout1,

      lineHeight1,
      setLineHeight1,
      letterSpacing1,
      setLetterSpacing1,
    ]);
  }, [
    activeIndex1,
    title1,
    selectedLayout1,
    oneTextValue1,
    multipleTextValue1,
    textElements1,
    texts1,
    fontSize1,
    fontWeight1,
    fontColor1,
    fontFamily1,
    textAlign1,
    verticalAlign1,
    rotation1,
    images1,
    imagePositions1,
    imageSizes1,
    video1,
    audio1,
    duration1,
    poster1,
    isSlideActive1,
    selectedPreviewImage1,
    setSelectedPreviewImage1,
    layout1,

    lineHeight1,
    setLineHeight1,
    letterSpacing1,
    setLetterSpacing1,
  ]);

  return (
    <Slide1Context.Provider
      value={{
        activeIndex1,
        setActiveIndex1,
        title1,
        setTitle1,
        activePopup1,
        setActivePopup1,
        selectedImg1,
        setSelectedImage1,
        showOneTextRightSideBox1,
        setShowOneTextRightSideBox1,
        oneTextValue1,
        setOneTextValue1,
        multipleTextValue1,
        setMultipleTextValue1,
        addSticker,
        selectedStickers,
        updateSticker,
        // Layout selection
        selectedLayout1,
        setSelectedLayout1,

        // Global defaults
        fontSize1,
        setFontSize1,
        fontWeight1,
        setFontWeight1,
        textAlign1,
        setTextAlign1,
        fontColor1,
        setFontColor1,
        fontFamily1,
        setFontFamily1,
        rotation1,
        setRotation1,

        // Individual text elements management
        textElements1,
        setTextElements1,
        selectedTextId1,
        setSelectedTextId1,

        // Legacy support
        texts1,
        setTexts1,
        editingIndex1,
        setEditingIndex1,

        lineHeight1,
        setLineHeight1,
        letterSpacing1,
        setLetterSpacing1,

        images1,
        setImages1,

        selectedPreviewImage1,
        setSelectedPreviewImage1,
        draggableImages1,
        setDraggableImages1,

        video1,
        setVideo1,
        audio1,
        setAudio1,

        tips1,
        setTips1,
        upload1,
        setUpload1,
        duration1,
        setDuration1,
        selectedVideoUrl1,
        setSelectedVideoUrl1,
        selectedAudioUrl1,
        setSelectedAudioUrl1,
        qrPosition1,
        setQrPosition1,
        qrAudioPosition1,
        setQrAudioPosition1,

        aimage1,
        setAIImage1,

        // New values
        textPositions1,
        setTextPositions1,
        textSizes1,
        setTextSizes1,
        imagePositions1,
        setImagePositions1,
        imageSizes1,
        setImageSizes1,
        poster1,
        setPoster1,
        isAIimage,
        setIsAIimage,
        selectedAIimageUrl1,
        setSelectedAIimageUrl1,
        removeSticker,

        // Slide state management
        isSlideActive1,
        setIsSlideActive1,
        isEditable1,
        setIsEditable1,
        verticalAlign1,
        setVerticalAlign1,

        slide1DataStore,

        layout1,
        setLayout1,
      }}
    >
      {children}
    </Slide1Context.Provider>
  );
};

export const useSlide1 = () => {
  const context = useContext(Slide1Context);
  if (!context) {
    throw new Error("useWishCard must be used within a WishCardProvider");
  }
  return context;
};
