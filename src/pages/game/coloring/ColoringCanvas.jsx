// ColoringGame.jsx — bổ sung Sticker + Chia sẻ tranh
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

// ⭐ MỚI — thư viện sticker để bé trang trí lên tranh
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
  const workspaceRef = useRef(null); // ⭐ MỚI — để tính vị trí thả sticker

  const [selectedOutline, setSelectedOutline] = useState(OUTLINES[0]);
  const [brushColor, setBrushColor] = useState(PALETTE[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value);
  const [tool, setTool] = useState("brush");

  // ⭐ MỚI — danh sách sticker đã đặt lên tranh: { id, emoji, x, y }
  const [placedStickers, setPlacedStickers] = useState([]);
  const [activeSticker, setActiveSticker] = useState(null); // sticker đang chờ đặt

  // ⭐ MỚI — modal "Khoe tranh"
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
    setPlacedStickers([]); // ⭐ đổi hình thì xoá luôn sticker cũ
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

  // ⭐ MỚI — bấm vào 1 sticker trong khay, rồi chạm vào canvas để đặt nó
  const handlePickSticker = (sticker) => {
    setActiveSticker((cur) => (cur?.id === sticker.id ? null : sticker));
  };

  const handleWorkspaceClick = (e) => {
    if (!activeSticker) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // % để responsive
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPlacedStickers((prev) => [
      ...prev,
      { uid: `${activeSticker.id}-${Date.now()}`, emoji: activeSticker.emoji, x, y },
    ]);
  };

  const handleRemoveSticker = (uid) => {
    setPlacedStickers((prev) => prev.filter((s) => s.uid !== uid));
  };

  const handleSave = async () => {
    if (!user) {
      setSaveMessage("Đăng nhập để lưu tranh vào tài khoản nhé!");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      const imageData = canvasRef.current.exportDataURL();
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

  // ⭐ MỚI — tạo ảnh "khoe tranh": ghép canvas + sticker + khung + tên bé vào 1 ảnh PNG
  const handleShare = () => {
    const baseCanvas = canvasRef.current?.getCanvasElement?.();
    if (!baseCanvas) {
      setSaveMessage("Chưa thể tạo ảnh chia sẻ lúc này.");
      return;
    }

    const exportCanvas = document.createElement("canvas");
    const PADDING = 40;
    const FOOTER_HEIGHT = 70;
    exportCanvas.width = baseCanvas.width + PADDING * 2;
    exportCanvas.height = baseCanvas.height + PADDING * 2 + FOOTER_HEIGHT;
    const ctx = exportCanvas.getContext("2d");

    // Khung nền
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.strokeStyle = "#3EC6FF";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, exportCanvas.width - 8, exportCanvas.height - 8);

    // Vẽ tranh gốc vào giữa khung
    ctx.drawImage(baseCanvas, PADDING, PADDING);

    // Vẽ sticker theo đúng vị trí % đã đặt
    placedStickers.forEach((s) => {
      const x = (s.x / 100) * baseCanvas.width + PADDING;
      const y = (s.y / 100) * baseCanvas.height + PADDING;
      ctx.font = "32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.emoji, x, y);
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
          />
          <svg
            className="coloring-outline-overlay"
            viewBox={selectedOutline.viewBox}
            dangerouslySetInnerHTML={{ __html: selectedOutline.svg }}
          />

          {/* ⭐ MỚI — lớp hiển thị sticker đã đặt */}
          <div className="coloring-stickers-layer">
            {placedStickers.map((s) => (
              <button
                key={s.uid}
                type="button"
                className="placed-sticker"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
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
                  className={`palette-swatch ${brushColor === color && tool === "brush" ? "palette-swatch--active" : ""}`}
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

          {/* ⭐ MỚI — khay sticker */}
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
              className={`tool-btn ${tool === "eraser" ? "tool-btn--active" : ""}`}
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
            {/* ⭐ MỚI — nút khoe tranh */}
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

      {/* ⭐ MỚI — modal khoe tranh */}
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