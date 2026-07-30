import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const ColoringCanvas = forwardRef(
  ({ width = 400, height = 400, brushColor = "#f87171", brushSize = 16, tool = "brush", disabled = false }, ref) => {
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const historyRef = useRef([]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (historyRef.current.length === 0) {
        saveState();
      }
    }, []);

    const saveState = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(imageData);

      if (historyRef.current.length > 20) {
        historyRef.current.shift();
      }
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        historyRef.current = [];
        saveState();
      },
      undo: () => {
        const canvas = canvasRef.current;
        if (!canvas || historyRef.current.length <= 1) return;

        historyRef.current.pop();
        const previousState = historyRef.current[historyRef.current.length - 1];
        const ctx = canvas.getContext("2d");
        ctx.putImageData(previousState, 0, 0);
      },
      getCanvasElement: () => canvasRef.current,
      exportDataURL: () => canvasRef.current?.toDataURL("image/png") || "",
    }));

    // Tính chính xác tọa độ kể cả khi canvas bị thu nhỏ trên Mobile
    const getCoordinates = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = (e) => {
      if (disabled) return;
      isDrawingRef.current = true;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const { x, y } = getCoordinates(e);

      ctx.beginPath();
      ctx.moveTo(x, y);

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = brushSize * 1.5;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
      }

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const draw = (e) => {
      if (!isDrawingRef.current || disabled) return;
      
      // Ngăn chặn cuộn màn hình điện thoại khi tô màu
      if (e.cancelable) e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const { x, y } = getCoordinates(e);

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      saveState();
    };

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="coloring-canvas-base"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    );
  }
);

ColoringCanvas.displayName = "ColoringCanvas";

export default ColoringCanvas;