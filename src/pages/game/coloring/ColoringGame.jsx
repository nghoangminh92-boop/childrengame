// ColoringGame.jsx
import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios.js";   
import { useAuth } from "../../../context/AuthContext.jsx";
import ColoringCanvas from "./ColoringCanvas.jsx";
import { OUTLINES, CATEGORIES } from "../../../api/outlines.js"; // ⭐ BỔ SUNG CATEGORIES  
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

  // ⭐ BỔ SUNG — Quản lý danh sách hình (để hỗ trợ thêm hình mới) & Category được chọn
  const [outlinesList, setOutlinesList] = useState(OUTLINES);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selectedOutline, setSelectedOutline] = useState(OUTLINES[0]);
  const [brushColor, setBrushColor] = useState(PALETTE[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value);
  const [tool, setTool] = useState("brush"); // "brush" | "eraser"

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // ⭐ MỚI — theo dõi tranh đang xoá

  // ⭐ BỔ SUNG — State cho Modal Thêm Tranh Mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("animal");
  const [newEmoji, setNewEmoji] = useState("🎨");
  const [newSvgCode, setNewSvgCode] = useState("");

  // ⭐ BỔ SUNG — Lọc hình theo danh mục
  const filteredOutlines =
    selectedCategory === "all"
      ? outlinesList
      : outlinesList.filter((item) => item.category === selectedCategory);

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

  // ⭐ BỔ SUNG — Xử lý khi nhấn lưu bức tranh mới
  const handleAddNewOutline = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSvgCode.trim()) return;

    let formattedSvg = newSvgCode.trim();
    if (!formattedSvg.includes("<g")) {
      formattedSvg = `<g fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${formattedSvg}</g>`;
    }

    const newItem = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      thumbnail: newEmoji || "🎨",
      category: newCategory,
      viewBox: "0 0 400 400",
      svg: formattedSvg,
    };

    setOutlinesList((prev) => [newItem, ...prev]);
    setSelectedOutline(newItem);
    setShowAddModal(false);
    setNewTitle("");
    setNewSvgCode("");
  };

  return (
    <section className="coloring-page">
      <h1 className="coloring-title">🎨 Sáng Tạo Màu Sắc</h1>
      <p className="coloring-subtitle">Chọn một hình rồi thoả sức tô màu theo ý thích của bé!</p>

      {/* ⭐ BỔ SUNG — Nút mở Modal thêm tranh */}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <button
          type="button"
          className="tool-btn"
          style={{ background: "#ff9800", color: "#fff", border: "none" }}
          onClick={() => setShowAddModal(true)}
        >
          ➕ Thêm hình vẽ mới
        </button>
      </div>

      {/* ⭐ BỔ SUNG — Thanh lọc danh mục (Tabs) */}
      {CATEGORIES && (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`tool-btn ${selectedCategory === "all" ? "tool-btn--active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            🌟 Tất cả
          </button>
          {CATEGORIES.map((cat) => (
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
      )}

      {/* ===== Chọn hình ===== */}
      <div className="outline-picker" role="tablist" aria-label="Chọn hình để tô">
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

      {/* ⭐ BỔ SUNG — Modal Form Thêm Tranh Mới */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleAddNewOutline} style={{ background: "#fff", padding: "20px", borderRadius: "12px", width: "350px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <h3 style={{ margin: 0 }}>➕ Thêm Bức Tranh Mới</h3>
            <label style={{ fontSize: "14px" }}>
              Tên tranh:
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required style={{ width: "100%", padding: "6px", marginTop: "4px" }} />
            </label>
            <label style={{ fontSize: "14px" }}>
              Emoji:
              <input type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} style={{ width: "100%", padding: "6px", marginTop: "4px" }} />
            </label>
            {CATEGORIES && (
              <label style={{ fontSize: "14px" }}>
                Danh mục:
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ width: "100%", padding: "6px", marginTop: "4px" }}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
              </label>
            )}
            <label style={{ fontSize: "14px" }}>
              Mã SVG (Nội dung nét vẽ):
              <textarea rows={4} value={newSvgCode} onChange={(e) => setNewSvgCode(e.target.value)} required placeholder='Ví dụ: <circle cx="200" cy="200" r="100" />' style={{ width: "100%", padding: "6px", marginTop: "4px" }} />
            </label>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" }}>
              <button type="button" className="tool-btn" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button type="submit" className="btn-primary">Lưu hình</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default ColoringGame;