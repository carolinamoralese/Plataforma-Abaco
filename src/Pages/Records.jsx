import { useState, useEffect } from "react";
import { Barrasuperior } from "../Components/Navbar/index";
import { Navbar } from "../Components/Navbar/index";
import { CreateButton } from "../Components/Button/Button";
import { obtenerConstancias } from "../servicios/servicios";
import { DonationInformation } from "../Components/DonationInformation/Index";
import Group from "../assets/Group.png";
import { FaSyncAlt, FaSpinner } from "react-icons/fa";

export function Records() {
  const [selectedOption, setSelectedOption] = useState("Pendientes");
  const [documentos, setDocumentos] = useState([]);
  const [documentosFiltrados, setDocumentosFiltrados] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cargandoDocumentos, setCargandoDocumentos] = useState(true);
  const usuarioRol = localStorage.getItem("usuarioRol");
  const propiedadEmpresa = "Empresa";
  const rolUsuariologistica = "R_Logistica";

  const handleRefreshClick = () => {
    setIsUpdating(true);
    setForceUpdate((prev) => !prev);
  };

  useEffect(() => {
    obtenerConstancias()
      .then((documentos) => {
        setDocumentos(documentos);
        setIsUpdating(false);
        filtrarDocumentos(documentos, usuarioRol, "Pendientes").then(
          (documentosFiltrados) => setDocumentosFiltrados(documentosFiltrados),
          setCargandoDocumentos(false)
        );
      })
      .catch((error) => {
        console.error(error);
        setIsUpdating(false);
        setCargandoDocumentos(false);
      });
  }, [forceUpdate, isUpdating, usuarioRol]);

  function filtrarDocumentos(documentos, rolUsuario, estado) {
    return new Promise((resolve) => {
      let documentosFiltrados = documentos;

      documentosFiltrados = documentos.filter(
        (documento) => !["#N/A", ""].includes(documento[propiedadEmpresa])
      );

      if (rolUsuario == "Logistica") {
        if (estado == "Pendientes") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica] === ""
          );
        } else if (estado == "Aceptados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "SI"
          );
        } else if (estado == "Firmados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "SI"
          );
        } else if (estado == "Rechazados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "NO"
          );
        }
      }

      if (rolUsuario == "Contabilidad") {
        if (estado == "Pendientes") {
          documentosFiltrados = [];
        } else if (estado == "Aceptados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "SI"
          );
        } else if (estado == "Firmados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "SI"
          );
        } else if (estado == "Rechazados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "NO"
          );
        }
      }

      if (rolUsuario == "Fiscal") {
        if (estado == "Pendientes") {
          documentosFiltrados = [];
        } else if (estado == "Aceptados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "SI"
          );
        } else if (estado == "Firmados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "SI"
          );
        } else if (estado == "Rechazados") {
          documentosFiltrados = documentosFiltrados.filter(
            (documento) => documento[rolUsuariologistica].toUpperCase() === "NO"
          );
        }
      }
      documentosFiltrados = documentosFiltrados.map((documento) => {
        documento["Fecha Expedición"] = documento["Fecha de Expedición"];
        documento["EMPRESA "] = documento["Empresa"];
        return documento;
      });
      resolve(documentosFiltrados);
    });
  }

  const certificateStyle = {
    backgroundImage: `url(${Group})`,
    backgroundSize: "80% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "80%",
    marginTop: "-30%",
    height: "400px",
  };

  const handleButtonClick = (estadoDocumento) => {
    setSelectedOption(estadoDocumento);
    let promesaDocumentosFiltrados;
    promesaDocumentosFiltrados = filtrarDocumentos(
      documentos,
      usuarioRol,
      estadoDocumento
    );
    promesaDocumentosFiltrados.then((documentosFiltrados) =>
      setDocumentosFiltrados(documentosFiltrados)
    );
  };
  return (
    <div>
      <Barrasuperior />
      <Navbar />
      <div className="flex justify-end mr-10 mt-4 relative">
        <div className="mb-8 mr-10">
          <FaSyncAlt onClick={handleRefreshClick} size={30} />{" "}
          {isUpdating && (
            <div className="absolute top-0 left-0 right-0 flex items-center justify-center mt-2">
              <p className="bg-white rounded-lg p-2">Actualizando...</p>
            </div>
          )}
        </div>
      </div>
      <div
        style={certificateStyle}
        className="relative mt-5 flex flex-col items-center ml-40"
      >
        <div className="flex justify-center">
          <div className="mr-4">
            <CreateButton
              colorClass="bg-naranja h-20"
              selected={selectedOption === "Pendientes"}
              onClick={() => handleButtonClick("Pendientes")}
              text="Pendientes"
            ></CreateButton>
          </div>
          <div className="mr-4">
            <CreateButton
              colorClass="bg-verde-claro h-20"
              selected={selectedOption === "Aceptados"}
              onClick={() => handleButtonClick("Aceptados")}
              text="Aceptados"
            ></CreateButton>
          </div>
          <div className="mr-4">
            <CreateButton
              colorClass="bg-amarillo h-20"
              selected={selectedOption === "Firmados"}
              onClick={() => handleButtonClick("Firmados")}
              text="Firmados"
            ></CreateButton>
          </div>
          <div className="mr-4">
            <CreateButton
              colorClass="bg-gris-claro h-20"
              selected={selectedOption === "Rechazados"}
              onClick={() => handleButtonClick("Rechazados")}
              text="Rechazados"
            ></CreateButton>
          </div>
        </div>
        {cargandoDocumentos ? (
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginTop: "60px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaSpinner className="animate-spin" size={30} />
            Cargando documentos
          </div>
        ) : (
          <div>
            <DonationInformation
              documentos={documentosFiltrados}
              tipoDocumento={"constancias"}
            ></DonationInformation>
          </div>
        )}
      </div>
    </div>
  );
}
