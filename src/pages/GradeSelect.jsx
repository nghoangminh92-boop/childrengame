import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GradeSelect = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();   // ⭐ đổi setUser -> updateUser

  const grades = [1, 2, 3, 4, 5];

  const handleSelect = (g) => {
    updateUser({ grade: g });         // ⭐ chỉ cần patch, không cần spread user thủ công
    navigate("/subjects");
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