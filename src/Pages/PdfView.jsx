import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import Swal from "sweetalert2";

export function PdfView() {
  const navigate = useNavigate();
  const [pdfData, setPdfData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const params = useParams();
  const rolUsuario = localStorage.getItem("usuarioRol");
  const [mostrarBotones, setMostrarBotones] = useState(false);
  const rolUsuariologistica = "R_Logistica";
  const rolUsuarioCotabilidad = "R_Contabilidad";
  const rolUsuarioRevisorFiscal = "R_Fiscal";
  const userEmail = localStorage.getItem("userEmail");

  const showPDF = (pdfBlob) => {
    setPdfData(URL.createObjectURL(pdfBlob));
  };
  const aceptar = "SI";
  const rechazar = "NO";

  const fetchData = async () => {
    try {
      if (typeof params.certificados_consecutivo !== "undefined") {
        const documentos = await obtenerCertificados();
        const documento = documentos.find(
          (doc) => doc["Hoja_No"] == params.certificados_consecutivo
        );
        localStorage.setItem("infoDocumento", JSON.stringify(documento));
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
          (doc) => doc["Hoja_No"] == params.constancias_consecutivo
        );
        localStorage.setItem("infoDocumento", JSON.stringify(documento));
        if (
          rolUsuario == "Logistica" &&
          documento[rolUsuariologistica] === ""
        ) {
          setMostrarBotones(true);
        }
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  if (userEmail) {
    fetchData();
  } else {
    navigate("/");
  }

  function cambiarEstadoDocumento(nuevoEstado, rolDelUsuario) {
    if (nuevoEstado === rechazar) {
      Swal.fire({
        title: "Motivo de rechazo",
        input: "textarea",
        inputLabel: "Por favor, ingrese el motivo de rechazo",
        inputPlaceholder: "Escribe aquí...",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Enviar",
        inputValidator: (value) => {
          if (!value) {
            return "¡Debes ingresar un motivo!";
          }
        },
        customClass: {
          confirmButton: "bg-verde-claro rounded-3xl p-2 font-bold text-m w-32", 
          cancelButton: "bg-gris-claro rounded-3xl p-2 font-bold text-m ml-4 w-32", 
        },

        didRender: (popup) => {
          const confirmButton = popup.querySelector(".swal2-confirm");
          const cancelButton = popup.querySelector(".swal2-cancel");
    
          confirmButton.classList.remove("swal2-styled");
          cancelButton.classList.remove("swal2-styled");
        },

      }).then((result) => {
        if (result.isConfirmed) {
          const motivoRechazo = result.value;
          console.log("Motivo de rechazo:", motivoRechazo);
          
          if (typeof params.certificados_consecutivo !== "undefined") {
            if (rolDelUsuario == "Logistica") {
              modificarEstadoCertificadoLogistica(
                nuevoEstado,
                params.certificados_consecutivo,
                userEmail,
                motivoRechazo
              );
            } else if (rolDelUsuario == "Contabilidad") {
              modificarEstadoCertificadoContabilidad(
                nuevoEstado,
                params.certificados_consecutivo,
                userEmail,
                motivoRechazo
              );
            } else if (rolDelUsuario == "Fiscal") {
              modificarEstadoCertificadoRevisorFiscal(
                nuevoEstado,
                params.certificados_consecutivo,
                userEmail,
                motivoRechazo
              );
            }
          } else if (typeof params.constancias_consecutivo !== "undefined") {
            modificarEstadoConstanciaLogistica(
              nuevoEstado,
              params.constancias_consecutivo,
              userEmail,
              motivoRechazo
            );
          }
          
          setIsPopupOpen(true);
        }
      });
    } else {
      if (typeof params.certificados_consecutivo !== "undefined") {
        if (rolDelUsuario == "Logistica") {
          modificarEstadoCertificadoLogistica(
            nuevoEstado,
            params.certificados_consecutivo,
            userEmail
          );
        } else if (rolDelUsuario == "Contabilidad") {
          modificarEstadoCertificadoContabilidad(
            nuevoEstado,
            params.certificados_consecutivo,
            userEmail
          );
        } else if (rolDelUsuario == "Fiscal") {
          modificarEstadoCertificadoRevisorFiscal(
            nuevoEstado,
            params.certificados_consecutivo,
            userEmail
          );
        }
      } else if (typeof params.constancias_consecutivo !== "undefined") {
        modificarEstadoConstanciaLogistica(
          nuevoEstado,
          params.constancias_consecutivo,
          userEmail
        );
      }
      setIsPopupOpen(true);
    }
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
        {mostrarBotones && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {/* <div className="mr-4 mb-4">
              <CreateButton
                colorClass="bg-naranja w-150 h-10"
                onClick={() => window.location.reload()}
                text="Actualizar"
              />
            </div> */}
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
          </div>
        )}

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
