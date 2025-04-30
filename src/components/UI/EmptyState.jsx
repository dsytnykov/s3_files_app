export const EmptyState = ({ message, subMessage, icon = "folder-open" }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <h3 className="empty-state-message">{message}</h3>
      {subMessage && <p className="empty-state-sub-message">{subMessage}</p>}
    </div>
  );
};

export default EmptyState;
