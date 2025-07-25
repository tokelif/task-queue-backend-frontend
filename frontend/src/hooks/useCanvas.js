import { useState, useEffect } from "react";

export function useCanvas() {
  const [canvasRef, setCanvasRef] = useState(null);
  useEffect(() => {
    if (canvasRef) {
      const ctx = canvasRef.getContext("2d");
      ctx.fillStyle = "rgba(0, 123, 255, 0.5)";
      ctx.fillRect(50, 50, 100, 100);
    }
  }, [canvasRef]);
  return setCanvasRef;
}
