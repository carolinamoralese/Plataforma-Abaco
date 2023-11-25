import { useState, useEffect } from "react";
import { Navbar, Barrasuperior } from "../Components/Navbar/Index";
import PdfGenerator from "../Utilities/PDFGenerator";
import Group from "../assets/Group.png";
import { CreateButton } from "../Components/Button/Button";
import { modificarEstadoCertificadoLogistica } from "../servicios/servicios";
import { modificarEstadoCertificadoContabilidad } from "../servicios/servicios";
import { modificarEstadoCertificadoRevisorFiscal } from "../servicios/servicios";
import { modificarEstadoConstanciaLogistica } from "../servicios/servicios";
import {
  obtenerCertificados,
  obtenerConstancias,
} from "../servicios/servicios";
import { useParams } from "react-router";
import PopUp from "../Components/PopUp";

export function PdfView() {
  const [pdfData, setPdfData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const params = useParams();
  const rolUsuario = localStorage.getItem("usuarioRol");
  const [mostrarBotones, setMostrarBotones] = useState(false);
  const rolUsuariologistica = "R_Logistica";
  const rolUsuarioCotabilidad = "R_Contabilidad";
  const rolUsuarioRevisorFiscal = "R_Fiscal";

  const showPDF = (pdfBlob) => {
    setPdfData(URL.createObjectURL(pdfBlob));
  };
  const aceptar = "SI";
  const rechazar = "NO";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (typeof params.certificados_consecutivo !== "undefined") {
          const documentos = await obtenerCertificados();
          const documento = documentos.find(
            (doc) => doc["Hoja No. "] == params.certificados_consecutivo
          );
          localStorage.setItem("infoDocumento", JSON.stringify(documento))
          if (
            rolUsuario == "Logistica" &&
            documento[rolUsuariologistica] === ""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Contabilidad" &&
            documento[rolUsuariologistica].toUpperCase() === "SI" &&
            documento[rolUsuarioCotabilidad] === ""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Fiscal" &&
            documento[rolUsuariologistica].toUpperCase() === "SI" &&
            documento[rolUsuarioCotabilidad].toUpperCase() === "SI" &&
            documento[rolUsuarioRevisorFiscal] === ""
          ) {
            setMostrarBotones(true);
          }
        } else if (typeof params.constancias_consecutivo !== "undefined") {
          const documentos = await obtenerConstancias();
          const documento = documentos.find(
            (doc) => doc[" Hoja_No"] == params.constancias_consecutivo
          );
            localStorage.setItem("infoDocumento", JSON.stringify(documento))
          if (
            rolUsuario == "Logistica" &&
            documento[rolUsuariologistica] === ""
          ) {
            console.log("pepis");
            setMostrarBotones(true);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  function cambiarEstadoDocumento(nuevoEstado, rolDelUsuario) {
    if (typeof params.certificados_consecutivo !== "undefined") {
      if (rolDelUsuario == "Logistica") {
        modificarEstadoCertificadoLogistica(
          nuevoEstado,
          params.certificados_consecutivo
        );
      } else if (rolDelUsuario == "Contabilidad") {
        modificarEstadoCertificadoContabilidad(
          nuevoEstado,
          params.certificados_consecutivo
        );
      } else if (rolDelUsuario == "Fiscal") {
        modificarEstadoCertificadoRevisorFiscal(
          nuevoEstado,
          params.certificados_consecutivo
        );
      }
    } else if (typeof params.constancias_consecutivo !== "undefined") {
      modificarEstadoConstanciaLogistica(
        nuevoEstado,
        params.constancias_consecutivo
      );
    }
    setIsPopupOpen(true);
  }

  const homeStyle = {
    backgroundImage: `url(${Group})`,
    backgroundSize: "80% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "400px",
    position: "relative",
    marginTop: "-30%",
  };

  return (
    <>
      <Barrasuperior />
      <Navbar />
      <div
        style={homeStyle}
        className="relative mt-5 flex flex-col items-center ml-40"
      >
        <div className="grid place-items-start">
          {pdfData && (
            <iframe
              title="PDF Viewer"
              src={pdfData}
              width="800"
              height="600"
              frameBorder="0"
            />
          )}
        </div>
    
          <div className="mt-4">
            <PdfGenerator onDataGenerated={showPDF} /> {/* Generar PDF */}
          </div>
          {mostrarBotones && (<div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div className="mr-4 mb-4">
              <CreateButton
                colorClass="bg-naranja w-150 h-10"
                onClick={() => window.location.reload()}
                text="Actualizar"
              />
            </div>
            <div className="mr-4 mb-4">
              <CreateButton
                colorClass="bg-verde-claro w-150 h-10"
                selected={false}
                onClick={() => cambiarEstadoDocumento(aceptar, rolUsuario)}
                text="Aceptar"
              ></CreateButton>
            </div>
            <div className="mr-4 mb-4">
              <CreateButton
                colorClass="bg-gris-claro w-150 h-10"
                selected={false}
                onClick={() => cambiarEstadoDocumento(rechazar, rolUsuario)}
                text="Rechazar"
              ></CreateButton>
            </div>
          </div>)}
          
     

        {isPopupOpen && (
          <PopUp
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            message="¡Se ha gestionado el documento!"
          />
        )}
      </div>
    </>
  );
}
