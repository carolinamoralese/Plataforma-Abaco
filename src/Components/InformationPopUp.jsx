import PropTypes from "prop-types";
import Group from "../assets/Group.png";
import logoColor from "../assets/logocolor.png";
import { FaSpinner } from "react-icons/fa";

const popupStyle = {
  backgroundImage: `url(${Group})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
};

const logoStyle = {
  width: "100px",
};

function InformationPopup({ isOpen, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gris-oscuro bg-opacity-50">
      <div style={popupStyle} className="p-4 rounded shadow-md w-1/2">
      <div className="float-left">
          
        </div>
        <div className="float-right">
          <img src={logoColor} alt="Logo" style={logoStyle} />
        </div>
        <div>
        <p className="text-center text-3xl font-corporate-rounded text-gray-700 mt-9">
          {message} 
        </p> 
        </div>
      
      </div>
    </div>
  );
}

InformationPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
};

export default InformationPopup;
