import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const ColoringCanvas = forwardRef(
  (
    {
      width = 400,
      height = 400,
      brushColor = "#f87171",
      brushSize = 16,
      tool = "brush",
      disabled = false,
      maxHistory = 20,
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef(null);
    const historyRef = useRef([]);

    // Lưu giữ props mới nhất cho các listener
    const propsRef = useRef({ brushColor, brushSize, tool, disabled });
    useEffect(() => {
      propsRef.current = { brushColor, brushSize, tool, disabled };
    }, [brushColor, brushSize, tool, disabled]);

    // Lưu trạng thái canvas để hoàn tác (Undo)
    const saveState = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      historyRef.current.push(imageData);
      if (historyRef.current.length > maxHistory) {
        historyRef.current.shift();
      }
    };

    // Thiết lập canvas ban đầu
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

    // Expose các phương thức điều khiển cho component cha
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

      /**
       * Xuất ảnh Data URL có chứa ĐẦY ĐỦ:
       * 1. Nét vẽ của người dùng
       * 2. Hình viền SVG (nếu có)
       * 3. Tất cả các Sticker đã dán
       */
      exportDataURL: async ({
        stickers = [],
        outlineUrl = null,
        type = "image/png",
        quality = 1.0,
      } = {}) => {
        const canvas = canvasRef.current;
        if (!canvas) return "";

        // 1. Tạo Canvas tạm để không ảnh hưởng đến màn hình đang vẽ
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");

        // Tô nền trắng cho canvas khi xuất ảnh
        tempCtx.fillStyle = "#ffffff";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // 2. Vẽ nét người dùng đã tô từ canvas chính
        tempCtx.drawImage(canvas, 0, 0);

        // 3. Vẽ hình viền SVG đè lên (nếu có truyền vào)
        if (outlineUrl) {
          await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
              resolve();
            };
            img.onerror = () => resolve(); // Bỏ qua nếu lỗi nạp ảnh
            img.src = outlineUrl;
          });
        }

        // 4. Vẽ các Sticker đã dán
        stickers.forEach((sticker) => {
          tempCtx.font = `${sticker.size || 32}px sans-serif`;
          tempCtx.textAlign = "center";
          tempCtx.textBaseline = "middle";

          // Quy đổi tọa độ % (nếu có) sang tọa độ px thực tế của canvas
          const posX = (sticker.x / 100) * tempCanvas.width;
          const posY = (sticker.y / 100) * tempCanvas.height;

          tempCtx.fillText(sticker.emoji, posX, posY);
        });

        return tempCanvas.toDataURL(type, quality);
      },
    }));

    const getCoordinates = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const setupContextStyle = (ctx) => {
      const { tool, brushColor, brushSize } = propsRef.current;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = brushSize * 1.5;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
      }
    };

    // Đăng ký Pointer Events cho thao tác vẽ
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handlePointerDown = (e) => {
        if (propsRef.current.disabled) return;

        canvas.setPointerCapture(e.pointerId);

        const coords = getCoordinates(e);
        isDrawingRef.current = true;
        lastPointRef.current = coords;

        const ctx = canvas.getContext("2d");
        setupContextStyle(ctx);

        // Vẽ điểm chấm tròn nhỏ khi chạm/click đơn
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, ctx.lineWidth / 2, 0, Math.PI * 2);
        if (propsRef.current.tool === "eraser") {
          ctx.fill();
        } else {
          ctx.fillStyle = propsRef.current.brushColor;
          ctx.fill();
        }
      };

      const handlePointerMove = (e) => {
        if (!isDrawingRef.current || propsRef.current.disabled) return;

        const coords = getCoordinates(e);
        const lastPoint = lastPointRef.current;
        if (!lastPoint) return;

        const ctx = canvas.getContext("2d");
        setupContextStyle(ctx);

        // Nội suy đường cong mượt khi di chuyển nhanh
        const midPoint = {
          x: lastPoint.x + (coords.x - lastPoint.x) / 2,
          y: lastPoint.y + (coords.y - lastPoint.y) / 2,
        };

        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midPoint.x, midPoint.y);
        ctx.stroke();

        lastPointRef.current = coords;
      };

      const handlePointerUp = (e) => {
        if (!isDrawingRef.current) return;

        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }

        isDrawingRef.current = false;
        lastPointRef.current = null;
        saveState();
      };

      canvas.addEventListener("pointerdown", handlePointerDown);
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerup", handlePointerUp);
      canvas.addEventListener("pointercancel", handlePointerUp);

      return () => {
        canvas.removeEventListener("pointerdown", handlePointerDown);
        canvas.removeEventListener("pointermove", handlePointerMove);
        canvas.removeEventListener("pointerup", handlePointerUp);
        canvas.removeEventListener("pointercancel", handlePointerUp);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="coloring-canvas-base"
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />
    );
  }
);

ColoringCanvas.displayName = "ColoringCanvas";

export default ColoringCanvas;