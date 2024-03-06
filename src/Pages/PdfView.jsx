import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Barrasuperior } from "../Components/Navbar/index";
import PdfGenerator from "../Utilities/PDFGenerator";
import Group from "../assets/Group.png";
import { CreateButton } from "../Components/Button/Button";
import { modificarEstadoCertificadoLogistica } from "../servicios/servicios";
import { modificarEstadoCertificadoContabilidad } from "../servicios/servicios";
import { modificarEstadoCertificadoRevisorFiscal } from "../servicios/servicios";
import { modificarEstadoConstanciaLogistica } from "../servicios/servicios";
import { modificarEstadoCertificadoAdministrador } from "../servicios/servicios";
import { anularCertificado } from "../servicios/servicios";
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
  const [infoDocumento, setInfoDocumento] = useState(null);
  const [mostrarBotonAnular, setMostrarBotonAnular] = useState(false)
  const [urlToRedirect, setUrlToRedirect] = useState("/home");
  const rolUsuariologistica = "R_Logistica";
  const rolUsuarioCotabilidad = "R_Contabilidad";
  const rolUsuarioRevisorFiscal = "R_Fiscal";
  const rolUsuarioAnulador = "R_Anulado";
  const rolUsuarioAdministrador = "R_Administrativa"
  const userEmail = localStorage.getItem("userEmail");

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
          const documento = await documentos.find(
            (doc) => doc["Hoja_No"] == params.certificados_consecutivo
          );

          setInfoDocumento(documento);
          setUrlToRedirect(
            `/pdf-view/certificados/${params.certificados_consecutivo}`
          );
          if (
            rolUsuario == "Administracion" &&
            documento[rolUsuarioAdministrador].toUpperCase() ===""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Logistica" &&
            documento[rolUsuarioAdministrador].toUpperCase() ==="SI" &&
            documento[rolUsuariologistica] === ""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Contabilidad" &&
            documento[rolUsuarioAdministrador].toUpperCase() ==="SI" &&
            documento[rolUsuariologistica].toUpperCase() === "SI" &&
            documento[rolUsuarioCotabilidad] === ""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Fiscal" &&
            documento[rolUsuarioAdministrador].toUpperCase() ==="SI" &&
            documento[rolUsuariologistica].toUpperCase() === "SI" &&
            documento[rolUsuarioCotabilidad].toUpperCase() === "SI" &&
            documento[rolUsuarioRevisorFiscal] === ""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Administracion" &&
            documento[rolUsuarioAnulador].toUpperCase() === "SI"
          ) {
            setMostrarBotones(false);
          } else if (
            rolUsuario == "Administracion" &&
            documento[rolUsuarioAdministrador].toUpperCase() ==="SI" &&
            documento[rolUsuariologistica].toUpperCase() === "SI" &&
            documento[rolUsuarioCotabilidad].toUpperCase() === "SI" &&
            documento[rolUsuarioRevisorFiscal].toUpperCase() === "SI"
          ) {
            setMostrarBotonAnular(true)
            //setMostrarBotones(true);
          }
        } else if (typeof params.constancias_consecutivo !== "undefined") {
          const documentos = await obtenerConstancias();
          const documento = documentos.find(
            (doc) => doc["Hoja_No"] == params.constancias_consecutivo
          );
          setInfoDocumento(documento);
          setUrlToRedirect(
            `/pdf-view/constancias/${params.constancias_consecutivo}`
          );
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
  }, []);

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
          cancelButton:
            "bg-gris-claro rounded-3xl p-2 font-bold text-m ml-4 w-32",
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
    } else if (nuevoEstado === "ANULAR") {
      Swal.fire({
        title: "Motivo de anulación",
        input: "textarea",
        inputLabel: "Por favor, ingrese el motivo de anulación",
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
          cancelButton:
            "bg-gris-claro rounded-3xl p-2 font-bold text-m ml-4 w-32",
        },

        didRender: (popup) => {
          const confirmButton = popup.querySelector(".swal2-confirm");
          const cancelButton = popup.querySelector(".swal2-cancel");

          confirmButton.classList.remove("swal2-styled");
          cancelButton.classList.remove("swal2-styled");
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const motivoAnulacion = result.value;
          console.log("Motivo de anulación:", motivoAnulacion);

          if (typeof params.certificados_consecutivo !== "undefined") {
            if (rolDelUsuario == "Administracion") {
              anularCertificado(
                "SI",
                params.certificados_consecutivo,
                userEmail,
                motivoAnulacion
              );
            }
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
        } else if(rolDelUsuario == "Administracion") {
          modificarEstadoCertificadoAdministrador(
            nuevoEstado,
            params.certificados_consecutivo,
            userEmail
          )
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
          <PdfGenerator
            onDataGenerated={showPDF}
            infoDocumento={infoDocumento}
          />{" "}
          {/* Generar PDF */}
        </div>
        {mostrarBotones && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {rolUsuario != "Administracion" && (
              <div className="mr-4 mb-4">
                <CreateButton
                  colorClass="bg-verde-claro w-150 h-10"
                  selected={false}
                  onClick={() => cambiarEstadoDocumento(aceptar, rolUsuario)}
                  text="Aceptar"
                ></CreateButton>
              </div>
            )}
             {rolUsuario != "Administracion" && (
              <div className="mr-4 mb-4">
                <CreateButton
                  colorClass="bg-gris-claro w-150 h-10"
                  selected={false}
                  onClick={() => cambiarEstadoDocumento(rechazar, rolUsuario)}
                  text="Rechazar"
                ></CreateButton>
              </div>
            )}


             {rolUsuario == "Administracion" && (
              <div className="mr-4 mb-4">
                <CreateButton
                colorClass="bg-verde-claro w-150 h-10"
                selected={false}
                onClick={() => cambiarEstadoDocumento(aceptar, rolUsuario)}
                text="Aceptar"
              ></CreateButton>
              </div>
            )} 

            
          </div>
        )}
        { mostrarBotonAnular && rolUsuario == "Administracion" && (
              <div className="mr-4 mb-4">
                <CreateButton
                  colorClass="bg-naranja w-150 h-10"
                  selected={false}
                  onClick={() => cambiarEstadoDocumento("ANULAR", rolUsuario)}
                  text="Anular"
                ></CreateButton>
              </div>
            )}

        {isPopupOpen && (
          <PopUp
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            message="¡Se ha gestionado el documento!"
            url={urlToRedirect}
          />
        )}
      </div>
    </>
  );
}
