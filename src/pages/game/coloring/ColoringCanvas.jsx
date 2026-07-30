// ColoringGame.jsx — Đã sửa lỗi lem cọ, lệch sticker & vẽ SVG vào ảnh xuất
import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import ColoringCanvas from "./ColoringCanvas.jsx";
import { OUTLINES } from "../../../api/outlines.js";
import "./ColoringGame.css";

const PALETTE = [
  "#f87171", "#fb923c", "#fbbf24", "#facc15",
  "#a3e635", "#4ade80", "#34d399", "#22d3ee",
  "#60a5fa", "#818cf8", "#c084fc", "#f472b6",
];

const BRUSH_SIZES = [
  { label: "Nhỏ", value: 8 },
  { label: "Vừa", value: 16 },
  { label: "Lớn", value: 28 },
];

const STICKERS = [
  { id: "star", emoji: "⭐" },
  { id: "heart", emoji: "❤️" },
  { id: "smile", emoji: "😄" },
  { id: "flower", emoji: "🌸" },
  { id: "sun", emoji: "☀️" },
  { id: "sparkles", emoji: "✨" },
];

const CANVAS_SIZE = 400;

const ColoringGame = () => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const workspaceRef = useRef(null);

  const [selectedOutline, setSelectedOutline] = useState(OUTLINES[0]);
  const [brushColor, setBrushColor] = useState(PALETTE[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value);
  const [tool, setTool] = useState("brush");

  // Danh sách sticker: { uid, emoji, x, y } - x, y tính theo px gốc của Canvas (0->400)
  const [placedStickers, setPlacedStickers] = useState([]);
  const [activeSticker, setActiveSticker] = useState(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImage, setShareImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const handleSelectOutline = (outline) => {
    if (outline.id === selectedOutline.id) return;
    setSelectedOutline(outline);
    canvasRef.current?.clear();
    setPlacedStickers([]);
  };

  const fetchGallery = async () => {
    if (!user) {
      setGalleryLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/coloring/mine");
      setGallery(data || []);
    } catch (err) {
      // im lặng bỏ qua
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePickSticker = (sticker) => {
    setActiveSticker((cur) => (cur?.id === sticker.id ? null : sticker));
  };

  // Đặt sticker theo tọa độ thực tế của Canvas (0 -> CANVAS_SIZE)
  const handleWorkspaceClick = (e) => {
    if (!activeSticker || !workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    
    // Quy đổi tọa độ click màn hình sang tọa độ chuẩn (0 -> 400px)
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;

    setPlacedStickers((prev) => [
      ...prev,
      { uid: `${activeSticker.id}-${Date.now()}`, emoji: activeSticker.emoji, x, y },
    ]);
  };

  const handleRemoveSticker = (uid) => {
    setPlacedStickers((prev) => prev.filter((s) => s.uid !== uid));
  };

  // Hàm tổng hợp Canvas nét vẽ + SVG outline + Sticker thành 1 dataURL
  const generateFullImageDataURL = () => {
    return new Promise((resolve) => {
      const baseCanvas = canvasRef.current?.getCanvasElement?.();
      if (!baseCanvas) return resolve(null);

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = CANVAS_SIZE;
      exportCanvas.height = CANVAS_SIZE;
      const ctx = exportCanvas.getContext("2d");

      // 1. Vẽ màu cọ tô từ canvas gốc
      ctx.drawImage(baseCanvas, 0, 0);

      // 2. Vẽ viền SVG Outline đè lên
      const svgBlob = new Blob([selectedOutline.svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        URL.revokeObjectURL(url);

        // 3. Vẽ Sticker
        placedStickers.forEach((s) => {
          ctx.font = "32px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(s.emoji, s.x, s.y);
        });

        resolve(exportCanvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(baseCanvas.toDataURL("image/png"));
      };

      img.src = url;
    });
  };

  const handleSave = async () => {
    if (!user) {
      setSaveMessage("Đăng nhập để lưu tranh vào tài khoản nhé!");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      // Xuất ảnh chứa đầy đủ Màu tô + Viền SVG + Sticker
      const imageData = await generateFullImageDataURL();

      await api.post("/coloring", {
        title: selectedOutline.title,
        outlineId: selectedOutline.id,
        imageData,
      });
      setSaveMessage("Đã lưu tranh của bé! 🎉");
      fetchGallery();
    } catch (err) {
      setSaveMessage(err.response?.data?.message || "Không thể lưu tranh, thử lại nhé.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Xoá tranh này? Không thể hoàn tác.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await api.delete(`/coloring/${id}`);
      setGallery((prev) => prev.filter((item) => item._id !== id));
      setSaveMessage("Đã xoá tranh 🗑️");
    } catch (err) {
      setSaveMessage(err.response?.data?.message || "Không xoá được tranh, thử lại nhé.");
    } finally {
      setDeletingId(null);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  // Khoe tranh (tạo khung đẹp + tên bé + tải ảnh)
  const handleShare = async () => {
    const baseCanvas = canvasRef.current?.getCanvasElement?.();
    if (!baseCanvas) {
      setSaveMessage("Chưa thể tạo ảnh chia sẻ lúc này.");
      return;
    }

    const exportCanvas = document.createElement("canvas");
    const PADDING = 40;
    const FOOTER_HEIGHT = 70;
    exportCanvas.width = CANVAS_SIZE + PADDING * 2;
    exportCanvas.height = CANVAS_SIZE + PADDING * 2 + FOOTER_HEIGHT;
    const ctx = exportCanvas.getContext("2d");

    // Khung nền
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.strokeStyle = "#3EC6FF";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, exportCanvas.width - 8, exportCanvas.height - 8);

    // Vẽ nét cọ
    ctx.drawImage(baseCanvas, PADDING, PADDING);

    // Vẽ nét viền SVG
    const svgBlob = new Blob([selectedOutline.svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, PADDING, PADDING, CANVAS_SIZE, CANVAS_SIZE);
      URL.revokeObjectURL(url);

      // Vẽ Sticker
      placedStickers.forEach((s) => {
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, s.x + PADDING, s.y + PADDING);
      });

      // Chữ ký cuối tranh
      ctx.fillStyle = "#1B2A4A";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `🎨 ${selectedOutline.title} — Vẽ bởi ${user?.name || "bé"}`,
        exportCanvas.width / 2,
        exportCanvas.height - FOOTER_HEIGHT / 2
      );

      setShareImage(exportCanvas.toDataURL("image/png"));
      setShowShareModal(true);
    };

    img.src = url;
  };

  const handleDownloadShare = () => {
    if (!shareImage) return;
    const link = document.createElement("a");
    link.href = shareImage;
    link.download = `${selectedOutline.title}-tranh-cua-be.png`;
    link.click();
  };

  return (
    <section className="coloring-page">
      <h1 className="coloring-title">🎨 Sáng Tạo Màu Sắc</h1>
      <p className="coloring-subtitle">Chọn một hình rồi thoả sức tô màu theo ý thích của bé!</p>

      <div className="outline-picker" role="tablist" aria-label="Chọn hình để tô">
        {OUTLINES.map((outline) => (
          <button
            key={outline.id}
            type="button"
            role="tab"
            aria-selected={selectedOutline.id === outline.id}
            className={`outline-thumb ${selectedOutline.id === outline.id ? "outline-thumb--active" : ""}`}
            onClick={() => handleSelectOutline(outline)}
          >
            <span className="outline-thumb-emoji">{outline.thumbnail}</span>
            <span className="outline-thumb-label">{outline.title}</span>
          </button>
        ))}
      </div>

      <div className="coloring-workspace">
        <div
          ref={workspaceRef}
          className="coloring-canvas-wrap"
          onClick={handleWorkspaceClick}
          style={activeSticker ? { cursor: "crosshair" } : undefined}
        >
          <ColoringCanvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            brushColor={brushColor}
            brushSize={brushSize}
            tool={tool}
            disabled={Boolean(activeSticker)} // Tắt vẽ cọ khi đang chờ đặt sticker
          />
          <svg
            className="coloring-outline-overlay"
            viewBox={selectedOutline.viewBox}
            dangerouslySetInnerHTML={{ __html: selectedOutline.svg }}
          />

          {/* Lớp hiển thị sticker đã đặt */}
          <div className="coloring-stickers-layer" style={{ pointerEvents: activeSticker ? "none" : "auto" }}>
            {placedStickers.map((s) => (
              <button
                key={s.uid}
                type="button"
                className="placed-sticker"
                style={{
                  left: `${(s.x / CANVAS_SIZE) * 100}%`,
                  top: `${(s.y / CANVAS_SIZE) * 100}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSticker(s.uid);
                }}
                title="Chạm để gỡ sticker"
              >
                {s.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="coloring-toolbar">
          <div className="toolbar-group">
            <span className="toolbar-label">Màu sắc</span>
            <div className="palette-row">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`palette-swatch ${brushColor === color && tool === "brush" && !activeSticker ? "palette-swatch--active" : ""}`}
                  style={{ background: color }}
                  aria-label={`Chọn màu ${color}`}
                  onClick={() => {
                    setBrushColor(color);
                    setTool("brush");
                    setActiveSticker(null);
                  }}
                />
              ))}
              <label className="palette-swatch palette-swatch--custom">
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => {
                    setBrushColor(e.target.value);
                    setTool("brush");
                    setActiveSticker(null);
                  }}
                  aria-label="Chọn màu tuỳ chỉnh"
                />
              </label>
            </div>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Cỡ cọ</span>
            <div className="brush-size-row">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  className={`brush-size-btn ${brushSize === size.value ? "brush-size-btn--active" : ""}`}
                  onClick={() => setBrushSize(size.value)}
                >
                  <span
                    className="brush-size-dot"
                    style={{ width: size.value * 0.7, height: size.value * 0.7 }}
                  />
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Sticker trang trí</span>
            <div className="sticker-row">
              {STICKERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`sticker-btn ${activeSticker?.id === s.id ? "sticker-btn--active" : ""}`}
                  onClick={() => handlePickSticker(s)}
                  aria-label={`Sticker ${s.id}`}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
            {activeSticker && (
              <p className="sticker-hint">Chạm vào tranh để đặt sticker ✨</p>
            )}
          </div>

          <div className="toolbar-group toolbar-group--actions">
            <button
              type="button"
              className={`tool-btn ${tool === "eraser" && !activeSticker ? "tool-btn--active" : ""}`}
              onClick={() => {
                setTool((t) => (t === "eraser" ? "brush" : "eraser"));
                setActiveSticker(null);
              }}
            >
              🧽 Tẩy
            </button>
            <button type="button" className="tool-btn" onClick={() => canvasRef.current?.undo()}>
              ↩️ Hoàn tác
            </button>
            <button
              type="button"
              className="tool-btn"
              onClick={() => {
                canvasRef.current?.clear();
                setPlacedStickers([]);
              }}
            >
              🗑️ Xoá hết
            </button>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "💾 Lưu tranh"}
            </button>
            <button type="button" className="tool-btn tool-btn--share" onClick={handleShare}>
              📤 Khoe tranh
            </button>
          </div>

          {saveMessage && <p className="coloring-save-message">{saveMessage}</p>}
        </div>
      </div>

      {user && (
        <div className="coloring-gallery">
          <h2 className="coloring-gallery-title">Tranh của bé</h2>
          {galleryLoading ? (
            <p className="coloring-gallery-empty">Đang tải...</p>
          ) : gallery.length === 0 ? (
            <p className="coloring-gallery-empty">Chưa có tranh nào được lưu.</p>
          ) : (
            <div className="coloring-gallery-grid">
              {gallery.map((item) => (
                <div key={item._id} className="gallery-item">
                  <div className="gallery-item-thumb">
                    <img src={item.imageData} alt={item.title} />
                  </div>
                  <span className="gallery-item-title">{item.title}</span>
                  <button
                    type="button"
                    className="gallery-item-delete"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    aria-label={`Xoá tranh ${item.title}`}
                  >
                    {deletingId === item._id ? "Đang xoá..." : "🗑️ Xoá"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Tranh của bé đã sẵn sàng! 🎉</h2>
            {shareImage && <img src={shareImage} alt="Tranh hoàn thành" className="share-preview" />}
            <div className="share-modal-actions">
              <button type="button" className="btn-primary" onClick={handleDownloadShare}>
                ⬇️ Tải ảnh về
              </button>
              <button type="button" className="tool-btn" onClick={() => setShowShareModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ColoringGame;