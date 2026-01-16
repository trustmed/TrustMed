"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useTransform,
  useSpring,
  useMotionValue,
  useScroll,
} from "framer-motion";
import { HeroText } from "../landing/hero-text";

// --- Utility ---
// function cn(...inputs: ClassValue[]) {
//     return twMerge(clsx(inputs));
// }

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
  src: string;
  index: number;
  target: {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    opacity: number;
  };
}

// --- FlipCard Component ---
const IMG_WIDTH = 60; // Reduced from 100
const IMG_HEIGHT = 85; // Reduced from 140

function FlipCard({ src, index, target }: FlipCardProps) {
  return (
    <motion.div
      // Smoothly animate to the coordinates defined by the parent
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 40,
        damping: 15,
      }}
      // Initial style
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d", // Essential for the 3D hover effect
        perspective: "1000px",
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={src}
            alt={`hero-${index}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-900 flex flex-col items-center justify-center p-4 border border-gray-700"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">
              View
            </p>
            <p className="text-xs font-medium text-white">Details</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 4500; // Virtual scroll range extended for BentoGrid

// Unsplash Images
const IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=300&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80",
  "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=300&q=80",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80",
  "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80",
  "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=300&q=80",
];

// Helper for linear interpolation
const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

export default function IntroAnimation({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Container Size (Use innerRef to measure the sticky window) ---
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!innerRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(innerRef.current);

    // Initial set
    setContainerSize({
      width: innerRef.current.offsetWidth,
      height: innerRef.current.offsetHeight,
    });

    return () => observer.disconnect();
  }, []);

  // --- Sticky Scroll Logic ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map 0-1 progress to our virtual scroll range (0 to 4500)
  const virtualScroll = useTransform(scrollYProgress, [0, 1], [0, MAX_SCROLL]);
  // No need for smoothScroll with useScroll as native scroll is smooth enough,
  // but we can keep spring smoothing for animations if desired.
  // Actually, keeping the springs makes it feel decoupled from scroll.
  // Let's keep the existing structure but feed it the transformed value.

  // 1. Morph Progress: 0 (Circle) -> 1 (Bottom Arc)
  // Happens between scroll 0 and 600
  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

  // 2. Scroll Rotation (Shuffling): Starts after morph (e.g., > 600)
  // Rotates the bottom arc as user continues scrolling
  const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, {
    stiffness: 40,
    damping: 20,
  });

  // 3. BentoGrid Fade In: Starts after rotation (e.g., > 3000)
  const bentoOpacity = useTransform(virtualScroll, [3000, 3800], [0, 1]);
  const smoothBentoOpacity = useSpring(bentoOpacity, {
    stiffness: 40,
    damping: 20,
  });

  // Inverse for image fade out
  // NOTE: We can use the same motion value or transform
  const imageOpacity = useTransform(virtualScroll, [3000, 3500], [1, 0]);
  const smoothImageOpacity = useSpring(imageOpacity, {
    stiffness: 40,
    damping: 20,
  });

  // --- Mouse Parallax ---
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const container = innerRef.current; // Attach to inner sticky container
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;

      // Normalize -1 to 1
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      // Move +/- 100px
      mouseX.set(normalizedX * 100);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // --- Intro Sequence ---
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("line"), 500);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // --- Random Scatter Positions ---
  // --- Random Scatter Positions ---
  const [scatterPositions, setScatterPositions] = useState<
    { x: number; y: number; rotation: number; scale: number; opacity: number }[]
  >([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setScatterPositions(
      IMAGES.map(() => ({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      }))
    );
  }, []);

  // --- Render Loop (Manual Calculation for Morph) ---
  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
    const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
    const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
    return () => {
      unsubscribeMorph();
      unsubscribeRotate();
      unsubscribeParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  // Hook up bento/image opacity to state for manual calc loop
  const [imageOpacityValue, setImageOpacityValue] = useState(1);
  const [shouldRenderChildren, setShouldRenderChildren] = useState(false);

  useEffect(() => {
    const unsubscribe = smoothImageOpacity.on("change", setImageOpacityValue);
    const unsubscribeScroll = virtualScroll.on("change", (latest) => {
      if (latest > 2500) {
        setShouldRenderChildren(true);
      } else if (latest < 2400) {
        setShouldRenderChildren(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeScroll();
    };
  }, [smoothImageOpacity, virtualScroll]);

  // --- Content Opacity ---
  // Fade in content when arc is formed (morphValue > 0.8)
  // Fade in content when arc is formed (morphValue > 0.8)
  // Removed fade OUT content when Bento/Stats appears to keep text visible
  const contentFadeIn = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  // const contentFadeOut = useTransform(smoothBentoOpacity, [0, 0.5], [1, 0]);
  const contentOpacity = useTransform(
    () => contentFadeIn.get() // * contentFadeOut.get()
  ); // Combine

  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  return (
    // Outer Track (TALL)
    <div ref={containerRef} className="relative w-full h-[500vh]">
      {/* Inner Sticky Window (Visual Viewport) */}
      <div
        ref={innerRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-background"
      >
        {/* Container */}
        <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">
          {/* Intro Text (Fades out) */}
          <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2">
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 1 }}
              className="text-2xl font-medium tracking-tight text-gray-800 md:text-4xl"
            >
              The future is built on AI.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 0.5 - morphValue }
                  : { opacity: 0 }
              }
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-4 text-xs font-bold tracking-[0.2em] text-gray-500"
            >
              SCROLL TO EXPLORE
            </motion.p>
          </div>

          {/* Arc Active Content (Fades in) */}
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="absolute top-[10%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4 w-full"
          >
            <div className="pointer-events-auto">
              <HeroText />
            </div>
          </motion.div>

          {/* BentoGrid/Stats (Fades in at the end) */}
          <motion.div
            style={{ opacity: smoothBentoOpacity, pointerEvents: "auto" }}
            className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pb-8"
          >
            <div className="w-full h-auto">
              {shouldRenderChildren && children}
            </div>
          </motion.div>

          {/* Main Container */}
          <div className="relative flex items-center justify-center w-full h-full">
            {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
              // --- Calculate Target State ---
              let target: {
                x: number;
                y: number;
                rotation: number;
                scale: number;
                opacity: number;
              };

              // 1. Intro Phases (Scatter -> Line)
              if (introPhase === "scatter") {
                target = scatterPositions[i];
              } else if (introPhase === "line") {
                const lineSpacing = 70; // Adjusted for smaller images (60px width + 10px gap)
                const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                const lineX = i * lineSpacing - lineTotalWidth / 2;
                target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
              } else {
                // 2. Circle Phase & Morph Logic

                // Responsive Calculations
                const isMobile = containerSize.width < 768;
                const minDimension = Math.min(
                  containerSize.width,
                  containerSize.height
                );

                // A. Calculate Circle Position
                const circleRadius = Math.min(minDimension * 0.35, 350);

                const circleAngle = (i / TOTAL_IMAGES) * 360;
                const circleRad = (circleAngle * Math.PI) / 180;
                const circlePos = {
                  x: Math.cos(circleRad) * circleRadius,
                  y: Math.sin(circleRad) * circleRadius,
                  rotation: circleAngle + 90,
                };

                // B. Calculate Bottom Arc Position
                // "Rainbow" Arch: Convex up. Center is highest point.

                // Radius:
                const baseRadius = Math.min(
                  containerSize.width,
                  containerSize.height * 1.5
                );
                const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);

                // Position:
                const arcApexY =
                  containerSize.height * (isMobile ? 0.35 : 0.25);
                const arcCenterY = arcApexY + arcRadius;

                // Spread angle:
                const spreadAngle = isMobile ? 100 : 130;
                const startAngle = -90 - spreadAngle / 2;
                const step = spreadAngle / (TOTAL_IMAGES - 1);

                // Apply Scroll Rotation (Shuffle) with Bounds
                // We want to clamp rotation so images don't disappear.
                // Map scroll range [600, 3000] to a limited rotation range.
                // Range: [-spreadAngle/2, spreadAngle/2] keeps them roughly in view.
                // We map 0 -> 1 (progress of scroll loop) to this range.

                // Note: rotateValue comes from smoothScrollRotate which maps [600, 3000] -> [0, 360]
                // We need to adjust that mapping in the hook above, OR adjust it here.
                // Better to adjust it here relative to the spread.

                // Let's interpret rotateValue (0 to 360) as a progress 0 to 1
                const scrollProgress = Math.min(
                  Math.max(rotateValue / 360, 0),
                  1
                );

                // Calculate bounded rotation:
                // Move from 0 (centered) to -spreadAngle (all the way left) or similar.
                // Let's allow scrolling through the list.
                // Total sweep needed to see all items if we start at one end?
                // If we start centered, we can go +/- spreadAngle/2.

                // User wants to "stop on the last image".
                // Let's map scroll to: 0 -> -spreadAngle (shifts items left)
                const maxRotation = spreadAngle * 0.8; // Don't go all the way, keep last item visible
                const boundedRotation = -scrollProgress * maxRotation;

                const currentArcAngle = startAngle + i * step + boundedRotation;
                const arcRad = (currentArcAngle * Math.PI) / 180;

                const arcPos = {
                  x: Math.cos(arcRad) * arcRadius + parallaxValue,
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: currentArcAngle + 90,
                  scale: isMobile ? 1.4 : 1.8, // Increased scale for active state
                };

                // C. Interpolate (Morph)
                target = {
                  x: lerp(circlePos.x, arcPos.x, morphValue),
                  y: lerp(circlePos.y, arcPos.y, morphValue),
                  rotation: lerp(
                    circlePos.rotation,
                    arcPos.rotation,
                    morphValue
                  ),
                  scale: lerp(1, arcPos.scale, morphValue),
                  opacity: imageOpacityValue, // Use opacity from scroll
                };
              }

              return (
                <FlipCard
                  key={src}
                  src={src}
                  index={i}
                  target={
                    target || {
                      x: 0,
                      y: 0,
                      rotation: 0,
                      scale: 0.6,
                      opacity: 0,
                    }
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
