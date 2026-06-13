import "./Card.css";

const Card = ({ title, value, icon, color = "primary" }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-info">
        <p className="stat-card-title">{title}</p>
        <h3 className="stat-card-value">{value}</h3>
      </div>
    </div>
  );
};

export default Card;