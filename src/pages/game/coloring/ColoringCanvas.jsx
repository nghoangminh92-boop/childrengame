import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const ColoringCanvas = forwardRef(
  ({ width = 400, height = 400, brushColor = "#f87171", brushSize = 16, tool = "brush", disabled = false }, ref) => {
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const historyRef = useRef([]); // Lưu lịch sử vẽ để Undo

    // Khởi tạo và lưu trạng thái ban đầu (canvas trắng)
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // Cấu hình nét vẽ mượt
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Lưu frame trắng ban đầu nếu history rỗng
      if (historyRef.current.length === 0) {
        saveState();
      }
    }, []);

    // Lưu trạng thái canvas vào lịch sử
    const saveState = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(imageData);

      // Giới hạn tối đa 20 bước hoàn tác để tránh tốn bộ nhớ
      if (historyRef.current.length > 20) {
        historyRef.current.shift();
      }
    };

    // Bộc lộ các hàm public cho component cha (ColoringGame) gọi qua ref
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
        
        // Bỏ trạng thái hiện tại
        historyRef.current.pop();
        // Lấy lại trạng thái trước đó
        const previousState = historyRef.current[historyRef.current.length - 1];
        const ctx = canvas.getContext("2d");
        ctx.putImageData(previousState, 0, 0);
      },
      getCanvasElement: () => canvasRef.current,
      exportDataURL: () => canvasRef.current?.toDataURL("image/png") || "",
    }));

    // Tính tọa độ điểm chạm/chuột chính xác theo canvas
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

      // Vẽ chấm tròn đơn lẻ tại điểm bắt đầu
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const draw = (e) => {
      if (!isDrawingRef.current || disabled) return;
      e.preventDefault(); // Tránh cuộn trang trên thiết bị di động
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const { x, y } = getCoordinates(e);

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      saveState(); // Lưu lại nét vẽ sau khi thả chuột/tay
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