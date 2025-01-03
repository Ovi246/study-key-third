import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const CustomizableImage = ({
  src,
  alt,
  initialX,
  initialY,
  initialRotation,
  width,
  minWidth,
  aspectRatio = "4/3",
  zIndex = 10,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const baseWidth = 1000;
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        const mobileScale = Math.min(
          0.8,
          Math.max(0.5, containerWidth / baseWidth)
        );
        setScale(mobileScale);

        setPosition({
          x: initialX * 0.95,
          y: initialY * 0.9,
        });
      } else {
        const desktopScale = Math.min(
          1.1,
          Math.max(0.95, containerWidth / baseWidth)
        );
        setScale(desktopScale);

        setPosition({
          x: initialX,
          y: initialY,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [initialX, initialY]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="group"
      style={{
        position: "absolute",
        right: `${position.x}%`,
        top: `${position.y}%`,
        transform: `rotate(${initialRotation}deg) scale(${scale})`,
        width: typeof width === "string" ? width : `${width}%`,
        minWidth: window.innerWidth < 768 ? "260px" : minWidth,
        maxWidth: window.innerWidth < 768 ? "320px" : "600px",
        transformOrigin: "center center",
        transition: "all 0.3s ease",
        zIndex,
      }}
    >
      <div
        style={{
          aspectRatio,
          position: "relative",
          width: "100%",
          overflow: "hidden",
          borderRadius: "0.5rem",
        }}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-lg"
          style={{
            filter: "brightness(1.02) contrast(1.05)",
          }}
          whileHover={{
            scale: window.innerWidth < 768 ? 1.02 : 1.05,
            transition: { duration: 0.2 },
          }}
          drag
          dragConstraints={containerRef}
          dragElastic={0.1}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
};

export default CustomizableImage;