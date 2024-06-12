import { NavLink } from "react-router-dom";
import { Barrasuperior, Navbar } from "../Components/Navbar/Index";
import Group from "../assets/Group.png";

export function Home() {
  const homeStyle = {
    backgroundImage: `url(${Group})`,
    backgroundSize: "80% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "80%",
    height: "400px",
    position: "relative",
    marginTop: "-30%",
  };

  const textStyle = {
    position: "absolute",
    top: "60%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "left",
    display: "flex",
    width: "80%",
    padding: "24px",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "32px",
  };

  const listItemStyle = {
    listStyle: "none",
  };

  const largeDotStyle = {
    fontSize: "24px",
    marginLeft: "10px",
  };

  return (
    <main className="flex flex-col">
      <Barrasuperior />
      <div>
        <Navbar />
        <div
          id="contenido"
          style={homeStyle}
          className="relative mt-5 flex flex-col items-center ml-40"
        >
          <div className="flex justify-center">
            <div style={textStyle}>
              <p className="text-2xl font-corporate-rounded text-gray-700">
                Certificados y constancias
              </p>
              <ul style={listItemStyle}>
                <li>
                  <strong>Constancias:</strong>
                </li>
                <ul>
                  <li>
                    <span style={largeDotStyle}>•</span> Logística
                  </li>
                </ul>
              </ul>
              <ul style={listItemStyle}>
                <li>
                  <strong>Certificados:</strong>
                </li>
                <ul>
                  <li>
                    <span style={largeDotStyle}>•</span> Logística
                  </li>
                  <li>
                    <span style={largeDotStyle}>•</span> Contabilidad
                  </li>
                  <li>
                    <span style={largeDotStyle}>•</span> Fiscal
                  </li>
                </ul>
              </ul>
              <p className="text-base text-gray-700">
                En el menú lateral, podrás consultar las constancias y
                certificados pendientes de revisar, por firmar y las aceptadas.
              </p>
              <p className="text-base text-blue-700">
                <NavLink to="/home-info" className="text-blue-600 underline">
                  Puedes leer más dando click aquí
                </NavLink>
              </p>
              <p className="text-base text-gray-700">
                En este video te contamos más de la emisión de constancias y
                certificados
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
