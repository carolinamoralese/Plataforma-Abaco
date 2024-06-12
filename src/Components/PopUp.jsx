import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Group from "../assets/Group.png";
import logoColor from "../assets/logocolor.png";

const popupStyle = {
  backgroundImage: `url(${Group})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
};

const logoStyle = {
  width: "100px",
};

function Popup({ isOpen, onClose, message, url = "/home" }) {
  const reloadPage = () => {
    window.location.reload(); // Recargar la página
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gris-oscuro bg-opacity-50">
      <div style={popupStyle} className="p-4 rounded shadow-md w-1/2">
        <div className="float-right">
          <img src={logoColor} alt="Logo" style={logoStyle} />
        </div>
        <p className="text-center text-4xl font-corporate-rounded text-gray-700">
          {message}
        </p>
        <div className="text-center mt-4">
          <NavLink to={url} onClick={url == "/home" ? "" : reloadPage}>
            <button
              onClick={onClose}
              className="bg-verde-claro hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl"
            >
              Ok
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

Popup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

export default Popup;
