import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBackIos } from "@mui/icons-material";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { USER_ROUTES } from "../../../constant/route";
import { saveSlidesToIdb } from "../../../lib/idbSlides";
import toast from "react-hot-toast";
import {
  collectTemplateSlideFonts,
  renderTemplateSlideToCanvas,
  type TemplateSlide,
} from "../../../lib/templateSlideCanvas";
import {
  buildGoogleFontsUrls,
  ensureGoogleFontsLoaded,
  loadGoogleFontsOnce,
} from "../../../constant/googleFonts";

const MUG_URL = "/assets/modals/tea_cup.glb";

let container: HTMLDivElement | null;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let orbitControls: OrbitControls;
let colorSelector: HTMLInputElement | null;
let mesh: THREE.Mesh | undefined;
let decalGeometry: DecalGeometry | undefined;
let material:
  | THREE.MeshStandardMaterial
  | THREE.MeshPhysicalMaterial
  | THREE.MeshBasicMaterial
  | null = null;

let currentTextureUrl: string | null = null;
let currentTextureCanvas: HTMLCanvasElement | null = null;


const SRGB = (THREE as any).SRGBColorSpace ?? "srgb";

const createTextureFromCanvas = (canvas: HTMLCanvasElement) => {
  const texture = new THREE.CanvasTexture(canvas);
  if ((texture as any).encoding !== undefined) {
    (texture as any).encoding = SRGB;
  } else if ((texture as any).colorSpace !== undefined) {
    (texture as any).colorSpace = SRGB;
  }
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.offset.x = 1;
  texture.flipY = true;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const onWindowResize = () => {
  if (!container || !camera || !renderer) return;
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
};

const convertImageToTexture = (image: string): THREE.Texture => {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(image, (tex) => {
    const img = tex.image as HTMLImageElement;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    // Move design up by 10px for better mug alignment
    ctx.drawImage(img, 0, 5);
    ctx.restore();

    (tex as any).image = canvas;
    tex.needsUpdate = true;
    if ((tex as any).encoding !== undefined) {
      (tex as any).encoding = SRGB;
    } else if ((tex as any).colorSpace !== undefined) {
      (tex as any).colorSpace = SRGB;
    }
  });


  if ((texture as any).encoding !== undefined) {
    (texture as any).encoding = SRGB;
  } else if ((texture as any).colorSpace !== undefined) {
    (texture as any).colorSpace = SRGB;
  }

  return texture;
};

const mirrorCanvasForMug = (source: HTMLCanvasElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(source, 0, 5);
  ctx.restore();
  return canvas;
};

const init = () => {
  if (!container) return;

  scene = new THREE.Scene();

  console.log(mesh,)
  console.log(decalGeometry,)
  console.log(material,)

  camera = new THREE.PerspectiveCamera(
    20,
    container.offsetWidth / container.offsetHeight,
    1e-5,
    1e10
  );
  scene.add(camera);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.5);
  scene.add(hemi);

  // RIGHT side light
  const rightLight = new THREE.DirectionalLight(0xffffff, 2);
  rightLight.position.set(5, 3, 5); // x > 0 → from the right
  scene.add(rightLight);

  // LEFT side light
  const leftLight = new THREE.DirectionalLight(0xffffff, 1);
  leftLight.position.set(-5, 3, 5); // x < 0 → from the left
  scene.add(leftLight);

  // TOP light
  const topLight = new THREE.DirectionalLight(0xffffff, 1);
  topLight.position.set(0, 8, 0); // y > 0 → from above
  scene.add(topLight);

  const hemispheric = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  scene.add(hemispheric);

  [rightLight, leftLight, topLight].forEach((l) => {
    l.castShadow = true;
  });


  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
    alpha: false,
  });
  renderer.setClearColor(0xffffff, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  if ((renderer as any).outputEncoding !== undefined) {
    (renderer as any).outputEncoding = SRGB;
  } else if ((renderer as any).outputColorSpace !== undefined) {
    (renderer as any).outputColorSpace = SRGB;
  }

  container.appendChild(renderer.domElement);

  const loader = new GLTFLoader();
  const cameraPos = new THREE.Vector3(-0.2, 0.4, 1.4);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.07;
  orbitControls.rotateSpeed = 1.25;
  orbitControls.panSpeed = 1.25;
  orbitControls.screenSpacePanning = true;
  orbitControls.autoRotate = true;

  loader.load(
    MUG_URL,
    (gltf) => {
      const object = gltf.scene;

      const pmremGenerator = new THREE.PMREMGenerator(renderer as any);
      pmremGenerator.compileEquirectangularShader();

      object.updateMatrixWorld();
      const boundingBox = new THREE.Box3().setFromObject(object);
      const modelSizeVec3 = new THREE.Vector3();
      boundingBox.getSize(modelSizeVec3);
      const modelSize = modelSizeVec3.length();
      const modelCenter = new THREE.Vector3();
      boundingBox.getCenter(modelCenter);

      orbitControls.reset();
      orbitControls.maxDistance = modelSize * 50;

      object.position.x = -modelCenter.x;
      object.position.y = -modelCenter.y;
      object.position.z = -modelCenter.z;

      camera.position.copy(modelCenter);
      camera.position.x += modelSize * cameraPos.x;
      camera.position.y += modelSize * cameraPos.y;
      camera.position.z += modelSize * cameraPos.z;
      camera.near = modelSize / 100;
      camera.far = modelSize * 100;
      camera.updateProjectionMatrix();
      camera.lookAt(modelCenter);

      object.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;

        if (obj.name === "Mug_Porcelain_PBR001_0") {
          const baseMaterial =
            obj.material as
            | THREE.MeshStandardMaterial
            | THREE.MeshPhysicalMaterial
            | THREE.MeshBasicMaterial;

          material = baseMaterial;
          mesh = obj;

          const tex = currentTextureCanvas
            ? createTextureFromCanvas(currentTextureCanvas)
            : currentTextureUrl
            ? convertImageToTexture(currentTextureUrl)
            : null;

          if (tex) {
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            baseMaterial.map = tex;

            if ("color" in baseMaterial && baseMaterial.color instanceof THREE.Color) {
              baseMaterial.color.set(0xffffff);
            }

            baseMaterial.transparent = false;
            baseMaterial.alphaTest = 0;
            baseMaterial.opacity = 1;

            if (
              baseMaterial instanceof THREE.MeshStandardMaterial ||
              baseMaterial instanceof THREE.MeshPhysicalMaterial
            ) {
              baseMaterial.metalness = 0;
              baseMaterial.roughness = Math.min(
                1,
                Math.max(0, baseMaterial.roughness)
              );
            }

            baseMaterial.needsUpdate = true;
          }
        } else if (obj.name === "Mug_Porcelain_PBR002_0") {
          const mat = obj.material as THREE.MeshStandardMaterial;
          mat.color.set("white");
          mat.needsUpdate = true;

          if (colorSelector) {
            colorSelector.addEventListener("input", (event) => {
              const target = event.target as HTMLInputElement;
              mat.color.set(target.value);
              mat.needsUpdate = true;
            });
          }
        }
      });

      scene.add(object);
      onWindowResize();
    },
    undefined,
    (error) => {
      console.error("Error loading mug GLB:", error);
    }
  );
};

// captured image 
function captureMugPreviewJpg(): string | null {
  if (!renderer) return null;

  // ensure latest frame rendered
  renderer.render(scene, camera);

  const canvas = renderer.domElement as HTMLCanvasElement;
  return canvas.toDataURL("image/jpeg", 0.95);
}


const TempletEditorPreview: React.FC = () => {
  const { state } = useLocation() as {
    state?: {
      slides?: TemplateSlide[];
      mugImage?: string;
      config?: { mmWidth?: number; mmHeight?: number };
      canvasPx?: { w?: number; h?: number };
    };
  };
  const mugImageSrc: any = state?.mugImage ?? null;
  const [flatDesignImage, setFlatDesignImage] = useState<string | null>(mugImageSrc ?? null);
  const previewSlides = state?.slides ?? [];

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null);
  const colorRef = useRef<HTMLInputElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const animate = useCallback(() => {
    animationFrameId.current = requestAnimationFrame(animate);
    if (orbitControls && renderer && scene && camera) {
      orbitControls.update();
      renderer.render(scene, camera);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      container = containerRef.current;
      colorSelector = colorRef.current;

      currentTextureUrl = mugImageSrc;
      currentTextureCanvas = null;

      if (previewSlides.length) {
        const fonts = collectTemplateSlideFonts(previewSlides);
        if (fonts.length) {
          const urls = buildGoogleFontsUrls(fonts);
          loadGoogleFontsOnce(urls);
          await ensureGoogleFontsLoaded(urls);
        }
        if ((document as any)?.fonts?.ready) {
          try {
            await (document as any).fonts.ready;
          } catch {}
        }

        const baseWidth = Math.max(
          1,
          Number(state?.canvasPx?.w ?? state?.config?.mmWidth ?? 228),
        );
        const baseHeight = Math.max(
          1,
          Number(state?.canvasPx?.h ?? state?.config?.mmHeight ?? 88.9),
        );
        const flatCanvas = await renderTemplateSlideToCanvas(previewSlides[0], {
          width: baseWidth,
          height: baseHeight,
          pixelRatio: 3,
          backgroundColor: "#ffffff",
        });

        if (cancelled) return;
        const flatDataUrl = flatCanvas.toDataURL("image/png");
        setFlatDesignImage(flatDataUrl);
        currentTextureCanvas = mirrorCanvasForMug(flatCanvas);
        currentTextureUrl = flatDataUrl;
      }

      if (cancelled) return;
      init();
      animate();

      const resizeHandler = () => onWindowResize();
      window.addEventListener("resize", resizeHandler);

      return () => {
        window.removeEventListener("resize", resizeHandler);
      };
    };

    let detachResize: (() => void) | undefined;
    void boot().then((cleanup) => {
      detachResize = cleanup;
    });

    return () => {
      cancelled = true;
      detachResize?.();
      if (animationFrameId.current !== null)
        cancelAnimationFrame(animationFrameId.current);
      if (renderer) renderer.dispose();
      if (orbitControls) orbitControls.dispose();

      container = null;
      colorSelector = null;
      mesh = undefined;
      material = null;
      currentTextureCanvas = null;
    };
  }, [animate, mugImageSrc, previewSlides, state?.canvasPx?.h, state?.canvasPx?.w, state?.config?.mmHeight, state?.config?.mmWidth]);


  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3 }}>
        <Typography sx={{ p: 2, display: "flex", alignItems: "center", color: "blue", "&:hover": { textDecoration: "underline", cursor: "pointer" } }} onClick={() => navigate(-1)}>
          <ArrowBackIos fontSize="small" /> exit
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <LandingButton
            title="Download"
            loading={loading}
            onClick={async () => {
              setLoading(true);
              try {
                if (!renderer) throw new Error("Renderer not ready");

                // Capture current 3D preview as JPEG
                const mugPreview = captureMugPreviewJpg();
                if (!mugPreview && !flatDesignImage) throw new Error("Failed to capture mug preview");
                const slide1 = flatDesignImage || mugPreview || "";
                const payload = { slide1 };
                sessionStorage.removeItem("slides");
                // Keep checkout preview normal; PDF flow will mirror for mug category.
                sessionStorage.removeItem("slides_mirrored");
                sessionStorage.removeItem("slides_mirrored_category");
                void saveSlidesToIdb(payload);
                try {
                  localStorage.setItem("slides_backup", JSON.stringify(payload));
                } catch {}
                try {
                  (globalThis as any).__slidesCache = payload;
                } catch {}
                toast.success("Preview saved successfully!");
                navigate(USER_ROUTES.SUBSCRIPTION);
              } catch (err) {
                console.error("Download failed:", err);
                toast.error("Failed to prepare download. Try again.");
              } finally {
                setLoading(false);
              }
            }}
          />
        </Box>
      </Box>
      <div ref={containerRef} style={{ width: "100%", height: "90vh" }} />
      {/* <input
        type="color"
        ref={colorRef}
        defaultValue="white"
        style={{ position: "absolute", top: 20, right: 20 }}
      /> */}
    </>

  );
};

export default TempletEditorPreview;
