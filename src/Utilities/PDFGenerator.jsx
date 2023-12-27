import { useEffect, useState } from "react";
import * as pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import PropTypes from "prop-types";
import htmlToPdfmake from "html-to-pdfmake";
import { useNavigate } from "react-router-dom";
import {
  AbacoLogobase64,
  firmaRepresentanteLegal,
  firmaRevisorFiscal,
} from "./utilities";
import { obtenerDetalleFactura } from "../servicios/servicios";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { useParams } from "react-router";
import { VARIABLES_ENTORNO } from "../../env";
import pdfFonts from "./vfs_fonts";
import { gapi } from "gapi-script";
import { FaSpinner } from "react-icons/fa";

pdfMake.vfs = pdfFonts;

function PdfGenerator({ onDataGenerated, infoDocumento }) {
  const params = useParams();
  const navigate = useNavigate();
  const rolUsuariologistica = "R_Logistica";
  const rolUsuarioCotabilidad = "R_Contabilidad";
  const rolUsuarioRevisorFiscal = "R_Fiscal";
  const rolUsuarioAnular = "R_Anulado";
  const [cargandoDocumento, setCargandoDocumento] = useState(true);
  const rolUsuario = localStorage.getItem("usuarioRol");

  const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  ];
  const SCOPES = "https://www.googleapis.com/auth/drive";

  const uploadPDFToDrive = async (
    pdfBlob,
    nit,
    tipoDocumento,
    consecutivo,
    estadoDocumento
  ) => {
    const fileName = `${tipoDocumento}_No_${consecutivo}.pdf`;

    tipoDocumento =
      tipoDocumento.charAt(0).toUpperCase() + tipoDocumento.slice(1) + "s";

    const folderPath = ["Documentos", tipoDocumento, nit, estadoDocumento];

    await loadDriveClient();

    await sleep(8000);

    const folders = folderPath;
    let parentFolderId = null;

    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      const existingFolder = await checkIfFolderExists(folder, parentFolderId);

      console.log("existingFolder: ", existingFolder);

      if (existingFolder) {
        // La carpeta ya existe, actualiza el parentFolderId para la próxima iteración
        parentFolderId = existingFolder.id;
      } else {
        // La carpeta no existe, créala y actualiza el parentFolderId para la próxima iteración
        const newFolderId = await createFolder(folder, parentFolderId);
        console.log("newFolderId: ", newFolderId);
        parentFolderId = newFolderId;
      }
    }
    checkIfFileExistsInGoogleDrive(fileName, parentFolderId)
      .then(function (existingFile) {
        if (existingFile) {
          console.log("El archivo ya existe en Google Drive:", existingFile);
          return;
        } else {
          var fileMetadata = {
            name: fileName,
            parents: [parentFolderId],
          };

          var boundary = "-------314159265358979323846";
          var delimiter = "\r\n--" + boundary + "\r\n";
          var close_delim = "\r\n--" + boundary + "--";

          var metadata =
            delimiter +
            "Content-Type: application/json\r\n\r\n" +
            JSON.stringify(fileMetadata);

          var fileReader = new FileReader();
          fileReader.onload = function (event) {
            var base64Data = event.target.result.split(",")[1];

            var multipartRequestBody =
              metadata +
              delimiter +
              "Content-Type: application/pdf\r\n" +
              "Content-Transfer-Encoding: base64\r\n" +
              "\r\n" +
              base64Data +
              close_delim;

            var request = window.gapi.client.request({
              path: "/upload/drive/v3/files",
              method: "POST",
              params: {
                uploadType: "multipart",
              },
              headers: {
                "Content-Type": "multipart/related; boundary=" + boundary,
              },
              body: multipartRequestBody,
            });

            request.execute(function (response) {
              console.log("Archivo subido:", response);
            });
          };

          fileReader.readAsDataURL(pdfBlob);
        }
      })
      .catch(function (error) {
        console.error("Error al verificar la existencia del archivo:", error);
      });
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function loadDriveClient() {
    try {
      await new Promise((resolve, reject) => {
        window.gapi.load("client:auth2", async () => {
          window.gapi.client.init({
            apiKey: VARIABLES_ENTORNO.REACT_APP_GOOGLE_API_KEY,
            client_id: VARIABLES_ENTORNO.REACT_APP_GOOGLE_CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
          });

          resolve(window.gapi.client.load("drive", "v3"));
        });
      });
      console.log("API de Google Drive cargada correctamente");
    } catch (error) {
      console.error("Error al cargar la API de Google Drive:", error);
      throw error;
    }
  }

  async function checkIfFolderExists(folderName, parentFolderId) {
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    if (parentFolderId != null) {
      query = `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    }

    const response = await window.gapi.client.drive.files.list({
      q: query,
      fields: "files(id, name)",
    });

    if (response && response.result && response.result.files) {
      const folders = response.result.files;
      if (folders.length > 0) {
        return folders[0]; // Devuelve la primera carpeta encontrada
      } else {
        return null; // La carpeta no existe en el folder específico
      }
    } else {
      throw new Error(
        "La respuesta no tiene la estructura esperada o está vacía"
      );
    }
  }

  // Función para crear una carpeta en Google Drive
  async function createFolder(folderName, parentFolderId) {
    return new Promise(function (resolve, reject) {
      var fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      };
      if (parentFolderId) {
        fileMetadata["parents"] = [parentFolderId];
      }

      window.gapi.client.drive.files
        .create({
          resource: fileMetadata,
          fields: "id",
        })
        .then(function (response) {
          resolve(response.result.id);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  function checkIfFileExistsInGoogleDrive(fileName, folderId) {
    return new Promise(function (resolve, reject) {
      if (gapi.client.drive) {
        gapi.client.drive.files
          .list({
            q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
            fields: "files(id, name)",
          })
          .then(function (response) {
            const files = response.result.files;
            if (files && files.length > 0) {
              resolve(files[0]);
            } else {
              resolve(null);
            }
          })
          .catch(function (error) {
            reject(error);
          });
      } else {
        setTimeout(() => {
          checkIfFileExistsInGoogleDrive(fileName, folderId)
            .then((response) => resolve(response))
            .catch((error) => reject(error));
        }, 1000); // Retry after 1 second if gapi.client.drive is not yet available
      }
    });
  }

  // const uploadPDFToFirebaseStorage = async (
  //   pdfBlob,
  //   nit,
  //   tipoDocumento,
  //   consecutivo
  // ) => {
  //   try {
  //     const storage = getStorage();

  //     const rutaArchivo = `pdfs/${nit}/${tipoDocumento}s/consecutivo_No_${consecutivo}.pdf`;
  //     const storageRef = ref(storage, rutaArchivo);
  //     await uploadBytes(storageRef, pdfBlob);
  //   } catch (error) {
  //     console.error("Error al subir el PDF a Firebase Storage:", error);
  //   }
  // };

  const generatePDF = (data, infoDocumento, tipoDocumento, itemsFactura) => {
    if (infoDocumento == null) {
      return;
    }

    if (data && Array.isArray(data) && data.length > 0) {
      let documento;
      if (typeof params.certificados_consecutivo !== "undefined") {
        documento = data.filter(
          (documento) => documento["hoja_No"] == params.certificados_consecutivo
        );
      } else if (typeof params.constancias_consecutivo !== "undefined") {
        documento = data.filter(
          (documento) => documento["hoja_No"] == params.constancias_consecutivo
        );
      }

      documento = documento[0];

      if (documento === undefined) {
        navigate("/");
      }

      let content = [];

      content.push({
        image: AbacoLogobase64,
        width: 150,
        height: 54.5,
        alignment: "center",
        margin: [0, -40, 0, 20],
      });

      documento.titulos.forEach((titulo) => {
        content.push({
          text: htmlToPdfmake(titulo + "<br><br>"),
          style: "header",
        });
      });

      documento.topParagraphs.forEach((paragraph) => {
        content.push({
          text: htmlToPdfmake(paragraph + "<br><br>"),
          style: "contenido",
        });
      });

      if (documento.bottomParagraphs) {
        if (
          itemsFactura.length > 0 &&
          itemsFactura[0]["Costo Total"] === "N/A"
        ) {
          const dynamicTable = {
            table: {
              widths: ["20%", "20%", "40%", "20%"],
              body: [],
            },
          };

          dynamicTable.table.body.push([
            { text: "Nro Factura", style: "tableHeader" },
            { text: "Fecha Factura", style: "tableHeader" },
            { text: "Desc Articulo", style: "tableHeader" },
            { text: "Costo Unitario", style: "tableHeader" },
          ]);

          itemsFactura.forEach((item) => {
            dynamicTable.table.body.push([
              item["Nro Factura"],
              item["Fecha Factura"],
              item["Desc Articulo"],
              item["Costo Unitario"].toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              }),
            ]);
          });

          const costoTotal = itemsFactura.reduce(
            (total, objeto) => total + objeto["Costo Unitario"],
            0
          );

          dynamicTable.table.body.push([
            "Total",
            "",
            "",
            costoTotal.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            }),
          ]);

          content.push(dynamicTable);

          content.push({ text: "\n\n", fontSize: 20 });
        } else if (
          itemsFactura.length > 0 &&
          itemsFactura[0]["Costo Unitario"] === "N/A"
        ) {
          const facturasAgrupadas = itemsFactura.reduce(
            (acumulador, objeto) => {
              const factura = objeto["Nro Factura"];
              if (!acumulador[factura]) {
                acumulador[factura] = [];
              }
              acumulador[factura].push(objeto);
              return acumulador;
            },
            {}
          );

          const arraysFacturasAgrupadas = Object.values(facturasAgrupadas);

          const dynamicTable = {
            table: {
              widths: ["20%", "20%", "40%", "20%"],
              body: [],
            },
            //layout: "noBorders",
          };

          dynamicTable.table.body.push([
            { text: "Nro Factura", style: "tableHeader" },
            { text: "Fecha Factura", style: "tableHeader" },
            { text: "Desc Articulo", style: "tableHeader" },
            { text: "Costo Total", style: "tableHeader" },
          ]);

          let costoTotal = 0;

          arraysFacturasAgrupadas.forEach((itemsFactura) => {
            itemsFactura.forEach((item, indice, array) => {
              //const posicionMitad = Math.floor(array.length / 2);
              if (indice === 0) {
                costoTotal += item["Costo Total"];

                dynamicTable.table.body.push([
                  item["Nro Factura"],
                  item["Fecha Factura"],
                  item["Desc Articulo"],
                  {
                    text: item["Costo Total"].toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    }),
                  },
                ]);
              } else {
                dynamicTable.table.body.push([
                  "",
                  item["Fecha Factura"],
                  item["Desc Articulo"],
                  "",
                ]);
              }
            });
          });

          dynamicTable.table.body.push([
            "Total",
            "",
            "",
            costoTotal.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            }),
          ]);

          content.push(dynamicTable);

          content.push({ text: "\n\n", fontSize: 20 });
        }

        if (
          documento.bottomParagraphs !== undefined &&
          documento.bottomParagraphs > 0
        ) {
          documento.bottomParagraphs.forEach((paragraph) => {
            content.push({
              text: htmlToPdfmake("<br></br>" + paragraph + "<br></br>"),
              style: "contenido",
            });
          });
        }
      }

      if (tipoDocumento == "certificado") {
        if (
          infoDocumento[rolUsuariologistica].toUpperCase() === "SI" &&
          infoDocumento[rolUsuarioCotabilidad].toUpperCase() === "SI" &&
          infoDocumento[rolUsuarioRevisorFiscal].toUpperCase() === "SI"
        ) {
          content.push({
            table: {
              widths: ["60%", "40%"],
              body: [
                [
                  {
                    image: firmaRepresentanteLegal,
                    fit: [70, 50],
                  },
                  {
                    image: firmaRevisorFiscal,
                    fit: [70, 50],
                  },
                ],
              ],
            },
            layout: "noBorders",
          });
        }
      } else if (tipoDocumento == "constancia") {
        if (infoDocumento[rolUsuariologistica].toUpperCase() === "SI") {
          content.push({
            image: firmaRepresentanteLegal,
            fit: [70, 50],
            alignment: "left",
          });
        }
      }

      if (documento.representanteLegal && documento.revisorFiscal) {
        content.push({
          text: htmlToPdfmake(
            '<p style="text-align: left; font-size: 12pt;"><b>' +
              documento.representanteLegal +
              '</b></p><p style="text-align: right; font-size: 12pt; "><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
              documento.revisorFiscal.nombre +
              "</b></p>"
          ),
        });
      } else {
        content.push({
          text: htmlToPdfmake(
            '<p style="text-align: left; font-size: 12pt;"><b>' +
              documento.representanteLegal.nombre
          ),
        });
        content.push({
          text: htmlToPdfmake(
            '<p style="text-align: left; font-size: 10pt;">' +
              documento.representanteLegal.cargo
          ),
        });
      }

      if (documento.representanteLegal && documento.revisorFiscal) {
        content.push({
          text: htmlToPdfmake(
            '<p style="text-align: left; font-size: 10pt;">Representante legal</p><p style="text-align: right; font-size: 10pt; ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Revisor fiscal</p>'
          ),
        });

        content.push({
          text: htmlToPdfmake(
            '<p style="text-align: left; font-size: 10pt; color:white;">representante legal;</p><p style="text-align: right; font-size: 10pt;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tarjeta profesional No' +
              documento.revisorFiscal.tarjeta +
              "</p>"
          ),
        });

        content.push({
          text: htmlToPdfmake(
            '<p style="text-align: left; font-size: 10pt; color:white;">representante legal;</p><p style="text-align: right; font-size: 10pt;">&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Designado por: ' +
              documento.revisorFiscal.designatedBy +
              "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
              "<br></br><br></br></p>"
          ),
        });
      }
      content.push({
        text: htmlToPdfmake(
          "<br></br><br></br><br></br>Elaboró" + documento.elaborated
        ),
        style: "informacionRevisado",
      });
      content.push({
        text: "Aprobó" + documento.approved,
        style: "informacionRevisado",
      });

      if (tipoDocumento !== "constancia") {
        content.push({
          text: htmlToPdfmake(
            "Revisó" + documento.revised + "<br></br><br></br>"
          ),
          style: "informacionRevisado",
        });
      }

      const documentDefinition = {
        content,
        styles: {
          header: {
            fontSize: 12,
            alignment: "center",
          },
          contenido: {
            fontSize: 10,
            alignment: "justify",
          },
          firmas: {
            display: "flex",
            alignment: "justify",
          },

          firmaRepresentante: {
            fontSize: 12,
            bold: true,
            alignment: "left",
          },
          firmaRevisor: {
            fontSize: 12,
            bold: true,
            alignment: "right",
          },
          datosFirmaRevisor: {
            fontSize: 10,
            alignment: "right",
          },
          informacionRevisado: {
            fontSize: 8,
          },
          imagenFirmas: {
            border: "hidden",
          },
          footer: {
            fontSize: 10,
            bold: true,
            alignment: "center",
            margin: [20, -10, 20, 20],
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            alignment: "left",
          },
        },
        footer: function (paginaActual, paginaSiguiente) {
          return {
            columns: [
              {
                text:
                  documento.address[0] +
                  "\n" +
                  "Telefono: " +
                  documento.address[1] +
                  "\n" +
                  documento.address[2],
                fontSize: 8,
                alignment: "left",
                margin: [20, 8, 0, 0],
              },
              {
                text:
                  "\nPágina " +
                  paginaActual.toString() +
                  " de " +
                  paginaSiguiente,
                fontSize: 8,
                bold: true,
                alignment: "center",
                margin: [0, 8, 0, 0],
              },
              {
                text: documento.contacto[0] + "\n" + documento.contacto[1],
                fontSize: 8,
                alignment: "right",
                margin: [0, 8, 20, 0],
              },
            ],
            style: "footer",
          };
        },
      };

      if (
        tipoDocumento == "certificado" &&
        infoDocumento[rolUsuarioAnular].toUpperCase() === "SI"
      ) {
        documentDefinition["watermark"] = {
          text: "ANULADO",
          color: "red",
          opacity: 0.1,
          bold: true,
          italics: false,
        };
      }

      const pdfDoc = pdfMake.createPdf(documentDefinition);

      setCargandoDocumento(true);

      pdfDoc.getBlob((pdfBlob) => {
        onDataGenerated(pdfBlob);
        // uploadPDFToFirebaseStorage(
        //   pdfBlob,
        //   infoDocumento["NIT"],
        //   tipoDocumento,
        //   documento["hoja_No"]
        // );
        setCargandoDocumento(false);

        if (
          tipoDocumento == "certificado" &&
          infoDocumento[rolUsuarioAnular].toUpperCase() === "SI" &&
          rolUsuario == "Administracion"
        ) {
          uploadPDFToDrive(
            pdfBlob,
            infoDocumento["NIT"],
            tipoDocumento,
            documento["hoja_No"],
            "Anulados"
          );
        } else if (
          tipoDocumento == "certificado" &&
          infoDocumento[rolUsuariologistica].toUpperCase() === "SI" &&
          infoDocumento[rolUsuarioCotabilidad].toUpperCase() === "SI" &&
          infoDocumento[rolUsuarioRevisorFiscal].toUpperCase() === "SI" &&
          rolUsuario == "Fiscal"
        ) {
          uploadPDFToDrive(
            pdfBlob,
            infoDocumento["NIT"],
            tipoDocumento,
            documento["hoja_No"],
            "Firmados"
          );
        } else if (
          tipoDocumento == "constancia" &&
          infoDocumento[rolUsuariologistica].toUpperCase() === "SI" &&
          rolUsuario == "Logistica"
        ) {
          uploadPDFToDrive(
            pdfBlob,
            infoDocumento["NIT"],
            tipoDocumento,
            documento["hoja_No"],
            "Firmados"
          );
        }
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        //const infoDocumento = JSON.parse(localStorage.getItem("infoDocumento"));

        if (typeof params.certificados_consecutivo !== "undefined") {
          let opciones = {
            method: "POST",
          };
          let parametros = new URLSearchParams({
            authKey:
              VARIABLES_ENTORNO.REACT_APP_AUTHKEY_CERTIFICADOS_INFORMACION,
          });

          const respuestaDatos = await fetch(
            VARIABLES_ENTORNO.REACT_APP_URL_OBTENER_CERTIFICADOS_INFORMACION +
              "?" +
              parametros,
            opciones
          );
          if (!respuestaDatos.ok) {
            throw new Error("Error en la solicitud");
          }
          const jsonData = await respuestaDatos.json();

          const itemsFactura = await obtenerDetalleFactura();
          let items;

          /* Quitar esta validación cuando se ajustes las apis
             y la información este acorde en todas
             cuando se visualice el documento 97, se va a mostrar
             el detalle de la factura del documento 263
             Para hacer pruebas mostrando la tabla costo total
          */
          if (params.certificados_consecutivo == 97) {
            // 263 detalle de factura de otro documento, solo para hacer pruebas
            items = itemsFactura.filter((item) => item["Hoja No. "] == 263);
          } else {
            items = itemsFactura.filter(
              (item) => item["Hoja No. "] == params.certificados_consecutivo
            );
          }

          generatePDF(jsonData, infoDocumento, "certificado", items);
        } else if (typeof params.constancias_consecutivo !== "undefined") {
          let opciones = {
            method: "POST",
          };
          let parametros = new URLSearchParams({
            key: VARIABLES_ENTORNO.REACT_APP_AUTHKEY_CONSTANCIAS_INFORMACION,
          });
          const respuestaDatos = await fetch(
            VARIABLES_ENTORNO.REACT_APP_URL_OBTENER_CONSTANCIAS_INFORMACION +
              "?" +
              parametros,
            opciones
          );
          if (!respuestaDatos.ok) {
            throw new Error("Error en la solicitud ");
          }
          const jsonData = await respuestaDatos.json();

          generatePDF(jsonData, infoDocumento, "constancia");
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData(infoDocumento);
  }, [infoDocumento]);

  return (
    <div>
      {cargandoDocumento ? (
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
          Cargando el documento PDF
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
}

PdfGenerator.propTypes = {
  onDataGenerated: PropTypes.func.isRequired,
  infoDocumento: PropTypes.object,
};

export default PdfGenerator;
