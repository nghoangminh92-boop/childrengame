import { Link, useParams } from "react-router-dom";

const ModeSelect = () => {
  const { subject, grade, level } = useParams();   // ⭐ thêm grade

  return (
    <section style={{ textAlign: "center", marginTop: 40 }}>
      <h1>Chọn chế độ chơi</h1>

      <div style={{ marginTop: 24 }}>
        <Link
          to={`/play/${subject}/${grade}/${level}`}
          className="btn btn-primary"
          style={{ marginRight: 12 }}
        >
          🎓 Chế độ Quiz truyền thống
        </Link>

        <Link
          to={`/runner/${subject}/${grade}/${level}`}
          className="btn btn-outline"
        >
          🏃‍♂️ Chế độ Runner
        </Link>
      </div>
    </section>
  );
};

export default ModeSelect;