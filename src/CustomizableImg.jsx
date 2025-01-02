import React, { useState, useEffect, useRef } from "react";

const CustomizableImage = ({
  src,
  alt,
  initialX,
  initialY,
  initialRotation,
  width,
  minWidth,
  aspectRatio = "3/4",
  zIndex = 10,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const baseWidth = 600; // Base width for scaling calculations

      // Calculate new scale
      const newScale = Math.min(1, Math.max(0.92, containerWidth / baseWidth));
      setScale(newScale);

      // Adjust position based on scale to maintain relative distances
      const xAdjustment = (1 - newScale) * 50; // 50 is an arbitrary value for adjustment strength
      const yAdjustment = (1 - newScale) * 30; // 30 is an arbitrary value for adjustment strength

      setPosition({
        x: initialX - xAdjustment,
        y: initialY - yAdjustment,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener("resize", handleResize);
  }, [initialX, initialY]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        right: `${position.x}%`,
        top: `${position.y}%`,
        transform: `rotate(${initialRotation}deg) scale(${scale})`,
        width,
        minWidth,
        transformOrigin: "center center",
        transition: "transform 0.2s ease, right 0.2s ease, top 0.2s ease",
        zIndex,
      }}
      className="will-change-transform"
    >
      <div
        style={{
          aspectRatio,
          position: "relative",
          width: "100%",
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default CustomizableImage;
