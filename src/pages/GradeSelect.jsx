import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./GradeSelect.css";

const GradeSelect = () => {
  const navigate = useNavigate();
  const { subject } = useParams();       // ⭐ lấy subject từ URL
  const { updateUser } = useAuth();

  const grades = [1, 2, 3, 4, 5];

  const handleSelect = (g) => {
    updateUser({ grade: g });
    navigate(`/map/${subject}/${g}`);    // ⭐ đi tiếp tới Level Map
  };

  return (
    <section className="grade-select">
      <h1>Chọn lớp của bạn 🎓</h1>

      <div className="grade-grid">
        {grades.map((g) => (
          <button key={g} className="grade-btn" onClick={() => handleSelect(g)}>
            Lớp {g}
          </button>
        ))}
      </div>
    </section>
  );
};

export default GradeSelect;