// ColoringGame.jsx
import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios.js";   
import { useAuth } from "../../../context/AuthContext.jsx";
import ColoringCanvas from "./ColoringCanvas.jsx";
import { OUTLINES }  from "../../../api/outlines.js";  
import "./ColoringGame.css";

// ⭐ Bảng màu chính — 12 màu tươi sáng phù hợp trẻ em, cộng thêm ô
// color-picker tuỳ chỉnh ở cuối.
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

const CANVAS_SIZE = 400;

const ColoringGame = () => {
  const { user } = useAuth();
  const canvasRef = useRef(null);

  const [selectedOutline, setSelectedOutline] = useState(OUTLINES[0]);
  const [brushColor, setBrushColor] = useState(PALETTE[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value);
  const [tool, setTool] = useState("brush"); // "brush" | "eraser"

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // ⭐ MỚI — theo dõi tranh đang xoá

  // ⭐ Đổi hình sẽ xoá canvas hiện tại (tránh nhầm nét vẽ cũ chồng lên hình mới)
  const handleSelectOutline = (outline) => {
    if (outline.id === selectedOutline.id) return;
    setSelectedOutline(outline);
    canvasRef.current?.clear();
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
      // im lặng bỏ qua — gallery không tải được không nên chặn việc tô màu
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  // ⭐ MỚI — xoá 1 tranh trong gallery
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

  return (
    <section className="coloring-page">
      <h1 className="coloring-title">🎨 Sáng Tạo Màu Sắc</h1>
      <p className="coloring-subtitle">Chọn một hình rồi thoả sức tô màu theo ý thích của bé!</p>

      {/* ===== Chọn hình ===== */}
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

      {/* ===== Khu vực tô màu ===== */}
      <div className="coloring-workspace">
        <div className="coloring-canvas-wrap" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
          <ColoringCanvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            brushColor={brushColor}
            brushSize={brushSize}
            tool={tool}
          />
          {/* Lớp nét viền — pointer-events none để không chặn thao tác vẽ,
              đè lên trên canvas để nét đen luôn hiển thị rõ trong lúc tô. */}
          <svg
            className="coloring-outline-overlay"
            viewBox={selectedOutline.viewBox}
            dangerouslySetInnerHTML={{ __html: selectedOutline.svg }}
          />
        </div>

        {/* ===== Toolbar ===== */}
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

          <div className="toolbar-group toolbar-group--actions">
            <button
              type="button"
              className={`tool-btn ${tool === "eraser" ? "tool-btn--active" : ""}`}
              onClick={() => setTool((t) => (t === "eraser" ? "brush" : "eraser"))}
            >
              🧽 Tẩy
            </button>
            <button type="button" className="tool-btn" onClick={() => canvasRef.current?.undo()}>
              ↩️ Hoàn tác
            </button>
            <button type="button" className="tool-btn" onClick={() => canvasRef.current?.clear()}>
              🗑️ Xoá hết
            </button>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "💾 Lưu tranh"}
            </button>
          </div>

          {saveMessage && <p className="coloring-save-message">{saveMessage}</p>}
        </div>
      </div>

      {/* ===== Gallery tranh đã lưu ===== */}
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
    </section>
  );
};

export default ColoringGame;