import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Barrasuperior } from "../Components/Navbar/index";
import { ref, getStorage, uploadBytes } from "firebase/storage";
import PdfGenerator from "../Utilities/PDFGenerator";
import Group from "../assets/Group.png";
import { CreateButton } from "../Components/Button/Button";
import {
  modificarEstadoCertificadoLogistica,
  obtenerCertificado,
  obtenerConstancia,
} from "../servicios/servicios";
import { modificarEstadoCertificadoContabilidad } from "../servicios/servicios";
import { modificarEstadoCertificadoRevisorFiscal } from "../servicios/servicios";
import { modificarEstadoConstanciaLogistica } from "../servicios/servicios";
import { modificarEstadoCertificadoAdministrador } from "../servicios/servicios";
import { modificarEstadoConstanciaAdministrador } from "../servicios/servicios";
import { anularCertificado } from "../servicios/servicios";
import { useParams } from "react-router";
import PopUp from "../Components/PopUp";
import { FaFileInvoiceDollar } from "react-icons/fa";
import Swal from "sweetalert2";
import InformationPopup from "../Components/InformationPopUp";

export function PdfView() {
  const navigate = useNavigate();
  const [pdfData, setPdfData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [
    mostrarMensajeActualizandoDocumento,
    setMostrarMensajeActualizandoDocumento,
  ] = useState(false);
  const params = useParams();
  const rolUsuario = localStorage.getItem("usuarioRol");
  const [mostrarBotones, setMostrarBotones] = useState(false);
  const [infoDocumento, setInfoDocumento] = useState(null);
  const [mostrarBotonAnular, setMostrarBotonAnular] = useState(false);
  const [mostrarBotonReiniar, setMostrarBotonReiniar] = useState(true);
  const [urlToRedirect, setUrlToRedirect] = useState("/home");
  const [firmaFiscalDocumento, setFirmaFiscalDocumento] = useState(null);
  const rolUsuariologistica = "R_Logistica";
  const rolUsuarioCotabilidad = "R_Contabilidad";
  const rolUsuarioRevisorFiscal = "R_Fiscal";
  const rolUsuarioAnulador = "R_Anulado";
  const rolUsuarioAdministrador = "R_Administrativa";
  const userEmail = localStorage.getItem("userEmail");
  const [pdfBlob, setPdfBlob] = useState(null);

  const showPDF = (pdfBlob) => {
    setPdfData(URL.createObjectURL(pdfBlob));
  };
  const aceptar = "SI";
  const rechazar = "NO";

  let tipoDocumento;

  if (typeof params.certificados_consecutivo !== "undefined") {
    tipoDocumento = "certificado";
  } else if (typeof params.constancias_consecutivo !== "undefined") {
    tipoDocumento = "constancia";
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (typeof params.certificados_consecutivo !== "undefined") {
          const documento = await obtenerCertificado(
            params.certificados_consecutivo
          );
          // const documento = await documentos.find(
          //   (doc) => doc["Hoja_No"] == params.certificados_consecutivo
          // );

          setInfoDocumento(documento);
          setUrlToRedirect(
            `/pdf-view/certificados/${params.certificados_consecutivo}`
          );
          if (
            rolUsuario == "Administracion" &&
            documento[rolUsuarioAdministrador].toUpperCase() === ""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Logistica" &&
            documento[rolUsuarioAdministrador].toUpperCase() === "SI" &&
            documento[rolUsuariologistica] === ""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Contabilidad" &&
            documento[rolUsuarioAdministrador].toUpperCase() === "SI" &&
            documento[rolUsuariologistica].toUpperCase() === "SI" &&
            documento[rolUsuarioCotabilidad] === ""
          ) {
            setMostrarBotones(true);
          } else if (
            rolUsuario == "Fiscal" &&
            documento[rolUsuarioAdministrador].toUpperCase() === "SI" &&
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
            setMostrarBotonReiniar(false);
          } else if (
            rolUsuario == "Administracion" &&
            documento[rolUsuarioAdministrador].toUpperCase() === "SI" &&
            documento[rolUsuariologistica].toUpperCase() === "SI" &&
            documento[rolUsuarioCotabilidad].toUpperCase() === "SI" &&
            documento[rolUsuarioRevisorFiscal].toUpperCase() === "SI"
          ) {
            setMostrarBotonAnular(true);
          }
        } else if (typeof params.constancias_consecutivo !== "undefined") {
          const documento = await obtenerConstancia(
            params.constancias_consecutivo
          );

          setInfoDocumento(documento);
          setUrlToRedirect(
            `/pdf-view/constancias/${params.constancias_consecutivo}`
          );
          if (
            rolUsuario == "Administracion" &&
            documento[rolUsuarioAdministrador] === ""
          ) {
            setMostrarBotones(true);
          } else if (
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

  // FUNCION PARA GUARDAR EN FIRESTORAGE
  const uploadPDFToFirebaseStorage = async (
    pdfBlob,
    nit,
    tipoDocumento,
    consecutivo,
    rol
  ) => {
    try {
      const fechaActual = new Date();

      let año = fechaActual.getFullYear();
      let mes = fechaActual.getMonth() + 1;
      let día = fechaActual.getDate();

      let horaUTC = fechaActual.getUTCHours();
      let minutosUTC = fechaActual.getUTCMinutes();

      const desfaseHorario = 5;
      horaUTC -= desfaseHorario;

      if (horaUTC < 0) {
        horaUTC += 24;
        día -= 1;
        if (día < 1) {
          mes -= 1;
          if (mes < 1) {
            mes = 12;
            año -= 1;
            día = new Date(año, mes, 0).getDate();
          } else {
            día = new Date(año, mes, 0).getDate();
          }
        }
      }


      let periodo = "AM";
      if (horaUTC >= 12) {
        periodo = "PM";
        if (horaUTC > 12) {
          horaUTC -= 12;
        }
      }
      if (horaUTC === 0) {
        horaUTC = 12; 

      mes = mes < 10 ? "0" + mes : mes;
      día = día < 10 ? "0" + día : día;
      horaUTC = horaUTC < 10 ? "0" + horaUTC : horaUTC;
      minutosUTC = minutosUTC < 10 ? "0" + minutosUTC : minutosUTC;

      const formatoAAAAMMDDHHmm = `${año}${mes}${día}_${horaUTC}:${minutosUTC}_${periodo}`;

      const storage = getStorage();

      nit = String(nit).replace(/[^a-zA-Z0-9]/g, "");

      const rutaArchivo = `pdfs/${nit}/${tipoDocumento}s/historico/${consecutivo}/${consecutivo}_${formatoAAAAMMDDHHmm}_${rol}.pdf`;
      const storageRef = ref(storage, rutaArchivo);
      await uploadBytes(storageRef, pdfBlob);
    } catch (error) {
      console.info(
        "Error al subir el PDF histórico a Firebase Storage:",
        error
      );
    }
  };

  const actualizarFirmaFiscal = (signatureImage) => {
    setFirmaFiscalDocumento(signatureImage);
  };

  const actualizarPdfBlob = (pdfBlob) => {
    setPdfBlob(pdfBlob);
  };

  const anularDocumento = async (consecutivo, email, motivoAnulacion) => {
    await anularCertificado("SI", consecutivo, email, motivoAnulacion);
  };

  async function cambiarEstadoDocumento(nuevoEstado, rolDelUsuario) {
    setMostrarMensajeActualizandoDocumento(true);
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

          const handleRechazo = async () => {
            if (typeof params.certificados_consecutivo !== "undefined") {
              if (rolDelUsuario == "Logistica") {
                await modificarEstadoCertificadoLogistica(
                  nuevoEstado,
                  params.certificados_consecutivo,
                  userEmail,
                  motivoRechazo
                );
              } else if (rolDelUsuario == "Contabilidad") {
                await modificarEstadoCertificadoContabilidad(
                  nuevoEstado,
                  params.certificados_consecutivo,
                  userEmail,
                  motivoRechazo
                );
              } else if (rolDelUsuario == "Fiscal") {
                await modificarEstadoCertificadoRevisorFiscal(
                  nuevoEstado,
                  params.certificados_consecutivo,
                  userEmail,
                  motivoRechazo
                );
              }
            } else if (typeof params.constancias_consecutivo !== "undefined") {
              await modificarEstadoConstanciaLogistica(
                nuevoEstado,
                params.constancias_consecutivo,
                userEmail,
                motivoRechazo
              );
            }
            setMostrarMensajeActualizandoDocumento(false);
            setIsPopupOpen(true);
          };
          handleRechazo();
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

          const handleAnulacion = async () => {
            if (typeof params.certificados_consecutivo !== "undefined") {
              if (rolDelUsuario == "Administracion") {
                localStorage.setItem("shouldGeneratePDF", "true");
                setMostrarMensajeActualizandoDocumento(true);
                setIsPopupOpen(false);
                await anularDocumento(
                  params.certificados_consecutivo,
                  userEmail,
                  motivoAnulacion
                );
              }
            }
            setMostrarMensajeActualizandoDocumento(false);
            setIsPopupOpen(true);
          };
          handleAnulacion();
        }
      });
    } else {
      // esta condicion es para aceptar los documentos
      if (typeof params.certificados_consecutivo !== "undefined") {
        if (rolDelUsuario == "Logistica") {
          await modificarEstadoCertificadoLogistica(
            nuevoEstado,
            params.certificados_consecutivo,
            userEmail
          );
          await uploadPDFToFirebaseStorage(
            pdfBlob,
            infoDocumento["NIT"],
            tipoDocumento,
            infoDocumento["Consecutivo"],
            rolDelUsuario
          );
        } else if (rolDelUsuario == "Contabilidad") {
          await modificarEstadoCertificadoContabilidad(
            nuevoEstado,
            params.certificados_consecutivo,
            userEmail
          );
          await uploadPDFToFirebaseStorage(
            pdfBlob,
            infoDocumento["NIT"],
            tipoDocumento,
            infoDocumento["Consecutivo"],
            rolDelUsuario
          );
        } else if (rolDelUsuario == "Fiscal") {
          localStorage.setItem("shouldGeneratePDF", "true");
          //await cargarFirmaFiscal(firmaFiscalDocumento);
          await modificarEstadoCertificadoRevisorFiscal(
            nuevoEstado,
            params.certificados_consecutivo,
            userEmail
          );
        } else if (rolDelUsuario == "Administracion") {
          await modificarEstadoCertificadoAdministrador(
            nuevoEstado,
            params.certificados_consecutivo,
            userEmail
          );
        }
      } else if (typeof params.constancias_consecutivo !== "undefined") {
        if (rolDelUsuario == "Administracion") {
          await modificarEstadoConstanciaAdministrador(
            nuevoEstado,
            params.constancias_consecutivo,
            userEmail
          );
        } else if (rolDelUsuario == "Logistica") {
          localStorage.setItem("shouldGeneratePDF", "true");
          await modificarEstadoConstanciaLogistica(
            nuevoEstado,
            params.constancias_consecutivo,
            userEmail
          );
        }
      }
      setMostrarMensajeActualizandoDocumento(false);
      setIsPopupOpen(true);
    }
  }

  const reiniciarDocumento = async () => {
    if (rolUsuario !== "Administracion") {
      console.info(
        "Solo los usurios administradores pueden reiniciar los documentos."
      );
      return;
    }

    setMostrarMensajeActualizandoDocumento(true);
    setIsPopupOpen(false);

    if (typeof params.certificados_consecutivo !== "undefined") {
      await modificarEstadoCertificadoLogistica(
        "",
        params.certificados_consecutivo,
        userEmail
      );

      await modificarEstadoCertificadoContabilidad(
        "",
        params.certificados_consecutivo,
        userEmail
      );

      await modificarEstadoCertificadoRevisorFiscal(
        "",
        params.certificados_consecutivo,
        userEmail
      );

      await modificarEstadoCertificadoAdministrador(
        "",
        params.certificados_consecutivo,
        userEmail
      );
    } else if (typeof params.constancias_consecutivo !== "undefined") {
      await modificarEstadoConstanciaLogistica(
        "",
        params.constancias_consecutivo,
        userEmail
      );
      await modificarEstadoConstanciaAdministrador(
        "",
        params.constancias_consecutivo,
        userEmail
      );
    }
    localStorage.setItem("shouldGeneratePDF", "true");
    setMostrarMensajeActualizandoDocumento(false);
    setIsPopupOpen(true);
  };

  const homeStyle = {
    backgroundImage: `url(${Group})`,
    backgroundSize: "80% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "700px",
    position: "absolute",
    margin: "10%",
    padding: "0",
    paddingRight: "10%",
  };

  return (
    <>
      <Barrasuperior />
      <Navbar />

      <div
        style={homeStyle}
        className="relative mt-5 flex flex-col items-center ml-40"
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <iframe
            title="PDF Viewer"
            src={pdfData}
            width="800"
            height="600"
            frameBorder="0"
          />
          <div
            style={{
              position: "absolute",
              top: 50,
              right: "-180px",
              zIndex: 1,
            }}
          >
            {tipoDocumento == "certificado" && (
              <div style={{ textAlign: "center" }}>
                <FaFileInvoiceDollar
                  size={80}
                  color="white"
                  style={{
                    backgroundColor: "black",
                    borderRadius: "30%",
                    padding: "10px",
                    cursor: "pointer",
                    marginLeft: "20%",
                  }}
                  onClick={() => {
                    window.open(infoDocumento.link_insumos, "_blank");
                  }}
                />
                <p style={{ marginTop: "10px", color: "black" }}>
                  Visualizar Facturas
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <PdfGenerator
            onDataGenerated={showPDF}
            infoDocumento={infoDocumento}
            actualizarFirmaFiscal={actualizarFirmaFiscal}
            actualizarPdfBlob={actualizarPdfBlob}
          />{" "}
          {/* Generar PDF */}
        </div>

        {mostrarBotones && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {rolUsuario != "Administracion" && rolUsuario != "Fiscal" && (
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

            {firmaFiscalDocumento && rolUsuario == "Fiscal" && (
              <div className="mr-4 mb-4">
                <CreateButton
                  colorClass="bg-verde-claro w-150 h-10"
                  selected={false}
                  onClick={() => cambiarEstadoDocumento(aceptar, rolUsuario)}
                  text="Aceptar"
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
        {mostrarBotonAnular && rolUsuario == "Administracion" && (
          <div className="mr-4 mb-4">
            <CreateButton
              colorClass="bg-naranja w-150 h-10"
              selected={false}
              onClick={() => cambiarEstadoDocumento("ANULAR", rolUsuario)}
              text="Anular"
            ></CreateButton>
          </div>
        )}

        {mostrarBotonReiniar && rolUsuario == "Administracion" && (
          <div className="mr-4 mb-4">
            <CreateButton
              colorClass="bg-amarillo w-150 h-10"
              selected={false}
              onClick={() => reiniciarDocumento()}
              text="Reiniciar"
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

        {mostrarMensajeActualizandoDocumento && (
          <InformationPopup
            isOpen={mostrarMensajeActualizandoDocumento}
            message="Actualizando documento ..."
          />
        )}
      </div>
    </>
  );
}
