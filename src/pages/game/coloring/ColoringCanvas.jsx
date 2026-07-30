import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const ColoringCanvas = forwardRef(
  ({ width = 400, height = 400, brushColor = "#f87171", brushSize = 16, tool = "brush", disabled = false }, ref) => {
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const historyRef = useRef([]);

    // Keep latest prop values available inside the native touch listeners
    // below without needing to re-attach them on every render.
    const propsRef = useRef({ brushColor, brushSize, tool, disabled });
    useEffect(() => {
      propsRef.current = { brushColor, brushSize, tool, disabled };
    }, [brushColor, brushSize, tool, disabled]);

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

    const getCoordinates = (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const beginStroke = (x, y) => {
      const { disabled, tool, brushColor, brushSize } = propsRef.current;
      if (disabled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      isDrawingRef.current = true;
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

    const continueStroke = (x, y) => {
      if (!isDrawingRef.current || propsRef.current.disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const endStroke = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      saveState();
    };

    // --- Mouse (desktop) ---
    const handleMouseDown = (e) => {
      const { x, y } = getCoordinates(e.clientX, e.clientY);
      beginStroke(x, y);
    };
    const handleMouseMove = (e) => {
      const { x, y } = getCoordinates(e.clientX, e.clientY);
      continueStroke(x, y);
    };
    const handleMouseUp = () => endStroke();
    const handleMouseLeave = () => endStroke();

    // --- Touch (mobile) ---
    // Attached as native listeners with { passive: false } so that
    // preventDefault() actually stops the page from scrolling while the
    // child is drawing. React's synthetic touch handlers are passive by
    // default in most browsers, which silently breaks this.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const onTouchStart = (e) => {
        if (e.touches.length === 0) return;
        e.preventDefault();
        const touch = e.touches[0];
        const { x, y } = getCoordinates(touch.clientX, touch.clientY);
        beginStroke(x, y);
      };

      const onTouchMove = (e) => {
        if (e.touches.length === 0) return;
        e.preventDefault();
        const touch = e.touches[0];
        const { x, y } = getCoordinates(touch.clientX, touch.clientY);
        continueStroke(x, y);
      };

      const onTouchEnd = (e) => {
        e.preventDefault();
        endStroke();
      };

      canvas.addEventListener("touchstart", onTouchStart, { passive: false });
      canvas.addEventListener("touchmove", onTouchMove, { passive: false });
      canvas.addEventListener("touchend", onTouchEnd, { passive: false });
      canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });

      return () => {
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
        canvas.removeEventListener("touchcancel", onTouchEnd);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="coloring-canvas-base"
        style={{ touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    );
  }
);

ColoringCanvas.displayName = "ColoringCanvas";

export default ColoringCanvas;