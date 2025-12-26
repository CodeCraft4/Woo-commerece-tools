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


const SRGB = (THREE as any).sRGBEncoding ?? (THREE as any).SRGBColorSpace ?? "srgb";

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
    ctx.drawImage(img, 0, 40);
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

          if (currentTextureUrl) {
            const tex = convertImageToTexture(currentTextureUrl);
            tex.wrapS = THREE.RepeatWrapping;
            tex.repeat.x = -1;
            tex.offset.x = 1;
            tex.flipY = true;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            tex.needsUpdate = true;

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

async function flipImageHorizontallyToDataUrl(src: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = "anonymous"; // important if src is remote
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // optional white background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // flip
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL("image/png", 1);
}



const TempletEditorPreview: React.FC = () => {
  const { state } = useLocation() as {
    state?: { slides?: any[]; mugImage?: string };
  };
  const mugImageSrc: any = state?.mugImage ?? null;

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
    container = containerRef.current;
    colorSelector = colorRef.current;

    currentTextureUrl = mugImageSrc;

    init();
    animate();

    const resizeHandler = () => onWindowResize();
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      if (animationFrameId.current !== null)
        cancelAnimationFrame(animationFrameId.current);
      if (renderer) renderer.dispose();
      if (orbitControls) orbitControls.dispose();

      container = null;
      colorSelector = null;
      mesh = undefined;
      material = null;
    };
  }, [animate, mugImageSrc]);


  return (
    <>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3 }}>
        <Typography sx={{ p: 2, display: "flex", alignItems: "center", color: "blue", "&:hover": { textDecoration: "underline", cursor: "pointer" } }} onClick={() => navigate(-1)}>
          <ArrowBackIos fontSize="small" /> exit
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <LandingButton title="Add to basket" variant="outlined" />
          <LandingButton
            title="Download"
            loading={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const flipped = await flipImageHorizontallyToDataUrl(mugImageSrc);
                // ✅ store in "cache"
                const slidesObj = { slide1: flipped };
                sessionStorage.setItem("slides", JSON.stringify(slidesObj));
                navigate(USER_ROUTES.SUBSCRIPTION);
              } catch (e) {
                console.error(e);
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
