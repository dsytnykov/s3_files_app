export const Spinner = ({ size = "medium" }) => {
  return (
    <div className={`spinner ${size}`}>
      <div className="bounce1"></div>
      <div className="bounce2"></div>
      <div className="bounce3"></div>
    </div>
  );
};

export default Spinner;
