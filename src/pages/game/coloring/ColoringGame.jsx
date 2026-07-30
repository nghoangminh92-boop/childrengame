import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import ColoringCanvas from "./ColoringCanvas.jsx";
import { OUTLINES, CATEGORIES } from "../../../api/outlines.js";
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

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOutline, setSelectedOutline] = useState(OUTLINES[0] || {});
  const [brushColor, setBrushColor] = useState(PALETTE[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value);
  const [tool, setTool] = useState("brush");

  const [placedStickers, setPlacedStickers] = useState([]);
  const [activeSticker, setActiveSticker] = useState(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImage, setShareImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const safeOutlines = Array.isArray(OUTLINES) ? OUTLINES : [];
  const safeCategories = Array.isArray(CATEGORIES) ? CATEGORIES : [];

  const filteredOutlines =
    selectedCategory === "all"
      ? safeOutlines
      : safeOutlines.filter((item) => item.category === selectedCategory);

  const handleSelectOutline = (outline) => {
    if (!outline || outline.id === selectedOutline?.id) return;
    setSelectedOutline(outline);
    canvasRef.current?.clear?.();
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
      // Bỏ qua lỗi kết nối không quan trọng
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [user]);

  const handlePickSticker = (sticker) => {
    setActiveSticker((cur) => (cur?.id === sticker.id ? null : sticker));
  };

  const handleWorkspaceClick = (e) => {
    if (!activeSticker || !workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();

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

  // Hàm xuất Base64 đã khắc phục lỗi ảnh trắng/rỗng
  const generateFullImageDataURL = () => {
    return new Promise((resolve) => {
      const baseCanvas = canvasRef.current?.getCanvasElement?.();
      if (!baseCanvas) return resolve(null);

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = CANVAS_SIZE;
      exportCanvas.height = CANVAS_SIZE;
      const ctx = exportCanvas.getContext("2d");

      // Fill nền trắng chống ảnh bị trong suốt/đen
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Vẽ cọ
      ctx.drawImage(baseCanvas, 0, 0);

      // Chuẩn hóa chuỗi SVG
      let rawSvg = selectedOutline.svg || "";
      if (!rawSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
        rawSvg = rawSvg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const img = new Image();
      const encodedSvg = encodeURIComponent(rawSvg);

      img.onload = () => {
        // Vẽ viền
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Vẽ sticker
        placedStickers.forEach((s) => {
          ctx.font = "32px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(s.emoji, s.x, s.y);
        });

        resolve(exportCanvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        resolve(baseCanvas.toDataURL("image/png"));
      };

      img.src = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
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
      const imageData = await generateFullImageDataURL();

      await api.post("/coloring", {
        title: selectedOutline.title || "Tranh tô màu",
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

  const handleShare = async () => {
    const baseCanvas = canvasRef.current?.getCanvasElement?.();
    if (!baseCanvas) {
      setSaveMessage("Chưa thể tạo ảnh chia sẻ lúc này.");
      return;
    }

    const PADDING = 40;
    const FOOTER_HEIGHT = 70;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = CANVAS_SIZE + PADDING * 2;
    exportCanvas.height = CANVAS_SIZE + PADDING * 2 + FOOTER_HEIGHT;
    const ctx = exportCanvas.getContext("2d");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.strokeStyle = "#3EC6FF";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, exportCanvas.width - 8, exportCanvas.height - 8);

    ctx.drawImage(baseCanvas, PADDING, PADDING);

    let rawSvg = selectedOutline.svg || "";
    if (!rawSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
      rawSvg = rawSvg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const img = new Image();
    const encodedSvg = encodeURIComponent(rawSvg);

    img.onload = () => {
      ctx.drawImage(img, PADDING, PADDING, CANVAS_SIZE, CANVAS_SIZE);

      placedStickers.forEach((s) => {
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, s.x + PADDING, s.y + PADDING);
      });

      ctx.fillStyle = "#1B2A4A";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `🎨 ${selectedOutline.title || "Tranh tô màu"} — Tác phẩm của ${user?.name || "bé"}`,
        exportCanvas.width / 2,
        exportCanvas.height - FOOTER_HEIGHT / 2
      );

      setShareImage(exportCanvas.toDataURL("image/png"));
      setShowShareModal(true);
    };

    img.onerror = () => {
      setShareImage(baseCanvas.toDataURL("image/png"));
      setShowShareModal(true);
    };

    img.src = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
  };

  const handleDownloadShare = () => {
    if (!shareImage) return;
    const link = document.createElement("a");
    link.href = shareImage;
    link.download = `${selectedOutline.title || "tranh"}-tranh-cua-be.png`;
    link.click();
  };

  return (
    <section className="coloring-page">
      <h1 className="coloring-title">🎨 Sáng Tạo Màu Sắc</h1>
      <p className="coloring-subtitle">Chọn một hình rồi thoả sức tô màu theo ý thích của bé!</p>

      <div className="category-tabs">
        <button
          type="button"
          className={`tool-btn ${selectedCategory === "all" ? "tool-btn--active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          🌟 Tất cả
        </button>
        {safeCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`tool-btn ${selectedCategory === cat.id ? "tool-btn--active" : ""}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="outline-picker" role="tablist">
        {filteredOutlines.map((outline) => (
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
            disabled={Boolean(activeSticker)}
          />
          {selectedOutline.svg && (
            <svg
              className="coloring-outline-overlay"
              viewBox={selectedOutline.viewBox || "0 0 400 400"}
              dangerouslySetInnerHTML={{ __html: selectedOutline.svg }}
            />
          )}

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
                  <span className="brush-size-dot" style={{ width: size.value * 0.6, height: size.value * 0.6 }} />
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
                >
                  {s.emoji}
                </button>
              ))}
            </div>
            {activeSticker && <p className="sticker-hint">Chạm vào tranh để đặt sticker ✨</p>}
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
            <button type="button" className="tool-btn" onClick={() => canvasRef.current?.undo?.()}>
              ↩️ Hoàn tác
            </button>
            <button
              type="button"
              className="tool-btn"
              onClick={() => {
                canvasRef.current?.clear?.();
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
          <h2>Tranh của bé</h2>
          {galleryLoading ? (
            <p>Đang tải...</p>
          ) : gallery.length === 0 ? (
            <p>Chưa có tranh nào được lưu.</p>
          ) : (
            <div className="coloring-gallery-grid">
              {gallery.map((item) => (
                <div key={item._id} className="gallery-item">
                  <div className="gallery-item-thumb">
                    <img src={item.imageData} alt={item.title} />
                  </div>
                  <span>{item.title}</span>
                  <button
                    type="button"
                    className="gallery-item-delete"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                  >
                    {deletingId === item._id ? "..." : "🗑️ Xoá"}
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