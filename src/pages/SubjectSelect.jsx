import { useNavigate } from "react-router-dom";

const SubjectSelect = () => {
  const navigate = useNavigate();

  return (
    <section className="subject-select">
      <h1>Chọn môn học 🎓</h1>

      <div className="subject-grid">
        <button onClick={() => navigate("/grade/math")}>Toán học 🧮</button>
        <button onClick={() => navigate("/grade/english")}>Tiếng Anh 🔤</button>
      </div>
    </section>
  );
};

export default SubjectSelect;
