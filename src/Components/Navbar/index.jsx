import { auth } from '../../firebase'
import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom'
import logoColor from "../../assets/logocolor.png";
import cosecha from "../../assets/EDITABL-PLATAFORMA-10.png";
import hoja from "../../assets/hoja.png";
import './index.css'

export const  Barrasuperior = () => {
  const navigate = useNavigate()
  const userEmail = localStorage.getItem('userEmail');
  const userRol = localStorage.getItem('usuarioRol');

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('usuarioRol');
        navigate('/')
      })
      .catch((error) => {
        console.error('Error al cerrar sesión', error);
      });
  };

  
  return (
    <div className="barrasuperior">
      <img className="cosecha" src={cosecha} alt="LogoCosecha" />
      <div className="texto--plataforma--logo">
      <img className="logo-color" src={logoColor} alt="LogoColor" />
        <div className="barra--lateral--texto--abaco">
          <p className="text-2">Plataforma   <br />
ABACO</p>
        </div>
      </div>
      <div className="nombre--roldeusuario">
        <div className="imagenperfil">
          <div className="frame-1-8-5-7">
            <p className="text-3">􀉩</p>
          </div>
        </div>
        <div className="nombre--tipodeusuario">
          <p className="text-4">Bienvenido, {userEmail}</p>
          <p className="text-4">{userRol}</p>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </div>
    </div>
  )
}
export const Navbar = () => {
  const activeStyle = "bg-amarillo text-white rounded-r-full w-60 h-8"; 
  
return (
<nav className="fixed left-0 mt-0 w-72 h-[90%] shadow-xl space-y-12 z-10">
    <ul>
      <li className="mt-12">
      <NavLink 
              to="/home"
              className={({ isActive }) => (isActive ? `flex items-center ${activeStyle}` : undefined)}
            >
              <div className="flex items-center">
                <img className="w-10 ml-8 mr-4" src={hoja} alt="hoja" />
                Inicio
              </div>
            </NavLink> 
      </li>
    </ul>
    <ul>
      <li>
        <NavLink to="/records"
              className={({ isActive }) => (isActive ? `flex items-center ${activeStyle}` : undefined)}
              >
                <div className="flex items-center">
                  <img className="w-10 ml-8 mr-4" src={hoja} alt="hoja" />
                  Constancias
                </div>
              </NavLink> 
      </li>
    </ul>
    <ul>
      <li>
        <NavLink to="/certificates"
              className={({ isActive }) => (isActive ? `flex items-center ${activeStyle}` : undefined)}
              >
                <div className="flex items-center">
                  <img className="w-10 ml-8 mr-4" src={hoja} alt="hoja" />
                  Certificados
                </div>
              </NavLink> 
      </li>
    </ul>
    <ul>
      <li>
        <NavLink to="/indicators"
              className={({ isActive }) => (isActive ? `flex items-center ${activeStyle}` : undefined)}
              >
                <div className="flex items-center">
                  <img className="w-10 ml-8 mr-4" src={hoja} alt="hoja" />
                  Rendimientos
                </div>
              </NavLink> 
      </li>
    </ul>
  </nav>
  
);
};
