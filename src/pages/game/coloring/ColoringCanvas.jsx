// ColoringCanvas.jsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// ⭐ Canvas tô màu tự do (không giới hạn vùng). Dùng Pointer Events để hỗ trợ
// cả chuột, bút cảm ứng và ngón tay (mobile) bằng cùng một bộ handler.
//
// Expose ra ngoài qua ref: undo(), clear(), exportDataURL()
const ColoringCanvas = forwardRef(
  ({ brushColor = "#f87171", brushSize = 16, tool = "brush", width = 400, height = 400 }, ref) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef({ x: 0, y: 0 });
    // Ngăn xếp undo — lưu dataURL sau mỗi nét vẽ. Giới hạn 20 bước để
    // tránh phình bộ nhớ trên các máy yếu (đặc biệt là mobile).
    const historyRef = useRef([]);
    const MAX_HISTORY = 20;

    // ⭐ Khởi tạo canvas theo devicePixelRatio để nét vẽ không bị mờ/vỡ
    // trên màn hình Retina/mobile mật độ điểm ảnh cao.
    useEffect(() => {
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;

      // Lưu trạng thái trắng ban đầu để có thể undo về lúc mới bắt đầu
      historyRef.current = [canvas.toDataURL("image/png")];
    }, [width, height]);

    const getPointerPos = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handlePointerDown = (e) => {
      e.preventDefault();
      const ctx = ctxRef.current;
      const pos = getPointerPos(e);

      isDrawingRef.current = true;
      lastPointRef.current = pos;

      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;

      // Vẽ 1 chấm tròn ngay tại điểm chạm để dù chỉ tap nhẹ cũng có vệt màu
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = brushColor;
      if (tool !== "eraser") ctx.fill();

      canvasRef.current.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();

      const ctx = ctxRef.current;
      const pos = getPointerPos(e);

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastPointRef.current = pos;
    };

    const pushHistory = () => {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const history = historyRef.current;
      history.push(dataUrl);
      if (history.length > MAX_HISTORY) history.shift();
    };

    const handlePointerUp = (e) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      pushHistory();
      canvasRef.current.releasePointerCapture?.(e.pointerId);
    };

    useImperativeHandle(ref, () => ({
      undo() {
        const history = historyRef.current;
        if (history.length <= 1) return; // đã ở trạng thái ban đầu
        history.pop(); // bỏ bước hiện tại
        const previous = history[history.length - 1];
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        const img = new Image();
        img.onload = () => {
          const dpr = window.devicePixelRatio || 1;
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.restore();
          ctx.scale(dpr, dpr);
        };
        img.src = previous;
      },
      clear() {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        pushHistory();
      },
      exportDataURL() {
        return canvasRef.current.toDataURL("image/png");
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className="coloring-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    );
  }
);

ColoringCanvas.displayName = "ColoringCanvas";

export default ColoringCanvas;
