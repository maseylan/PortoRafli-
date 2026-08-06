"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BASE_CAMERA, CAMERA_CONFIG, FOCUS_POINTS } from "../../config/sceneConfig";

const tmpPos = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const fwd = new THREE.Vector3();

/**
 * Camera rig sinematik (pola growon.kr):
 * - diam di base frame, parallax pointer sangat kecil
 * - saat objek diklik → dive-in dolly ke FOCUS_POINTS objek tersebut
 * - kembali ke base saat focus dilepas (panel ditutup)
 * - mobile: kamera mundur agar objek tetap dalam frame
 */
export function CameraRig({
  focusId,
  reducedMotion,
}: {
  focusId: string | null;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const parallax = useRef({ x: 0, y: 0 });
  const mobile = useRef(false);
  const current = useRef({
    pos: new THREE.Vector3(...BASE_CAMERA.position),
    target: new THREE.Vector3(...BASE_CAMERA.target),
  });

  useEffect(() => {
    const check = () => {
      mobile.current = window.matchMedia("(max-width: 767px)").matches;
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useFrame((state, delta) => {
    // Tentukan target posisi & lookAt (base atau dive point)
    const focus = focusId ? FOCUS_POINTS[focusId] : null;
    if (focus) {
      tmpTarget.set(...focus.target);
      fwd.copy(tmpTarget).sub(camera.position).normalize();
      // berhenti `depth` unit di depan target (arah kamera → objek)
      tmpPos.copy(tmpTarget).addScaledVector(fwd, -focus.depth);
      tmpPos.y += focus.liftY;
    } else {
      tmpPos.set(...BASE_CAMERA.position);
      tmpTarget.set(...BASE_CAMERA.target);
    }

    // Mobile: mundur dari target agar objek tetap dalam frame
    if (mobile.current) {
      tmpPos.sub(tmpTarget).multiplyScalar(1.5).add(tmpTarget);
    }

    // Smooth damp
    const t = Math.min(1, delta * CAMERA_CONFIG.lerpSpeed);
    current.current.pos.lerp(tmpPos, t);
    current.current.target.lerp(tmpTarget, t);

    if (!reducedMotion) {
      parallax.current.x = THREE.MathUtils.lerp(
        parallax.current.x,
        state.pointer.x * CAMERA_CONFIG.parallaxFactor,
        Math.min(1, delta * 2.5)
      );
      parallax.current.y = THREE.MathUtils.lerp(
        parallax.current.y,
        state.pointer.y * CAMERA_CONFIG.parallaxFactor,
        Math.min(1, delta * 2.5)
      );
    }

    camera.position.set(
      current.current.pos.x + parallax.current.x,
      current.current.pos.y - parallax.current.y,
      current.current.pos.z
    );
    camera.lookAt(current.current.target);
  });

  return null;
}
