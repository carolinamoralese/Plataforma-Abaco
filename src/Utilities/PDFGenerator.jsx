import { useEffect } from "react";
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
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function PdfGenerator({ onDataGenerated }) {
  const params = useParams();
  const navigate = useNavigate();
  const rolUsuariologistica = "R_Logistica";
  const rolUsuarioCotabilidad = "R_Contabilidad";
  const rolUsuarioRevisorFiscal = "R_Fiscal";
  const infoDocumento = JSON.parse(localStorage.getItem("infoDocumento"));

  const uploadPDFToFirebaseStorage = async (
    pdfBlob,
    nit,
    tipoDocumento,
    consecutivo
  ) => {
    try {
      const storage = getStorage();

      const rutaArchivo = `pdfs/${nit}/${tipoDocumento}s/consecutivo_No_${consecutivo}.pdf`;
      const storageRef = ref(storage, rutaArchivo);
      await uploadBytes(storageRef, pdfBlob);
    } catch (error) {
      console.error("Error al subir el PDF a Firebase Storage:", error);
    }
  };

  const generatePDF = (data, infoDocumento, tipoDocumento, itemsFactura) => {
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
              if (indice === array.length - 1) {
                costoTotal += item["Costo Total"];
                dynamicTable.table.body.push([
                  item["Nro Factura"],
                  item["Fecha Factura"],
                  item["Desc Articulo"],
                  item["Costo Total"].toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  }),
                ]);
              } else {
                dynamicTable.table.body.push([
                  item["Nro Factura"],
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

      const pdfDoc = pdfMake.createPdf(documentDefinition);

      pdfDoc.getBlob((pdfBlob) => {
        onDataGenerated(pdfBlob);
        uploadPDFToFirebaseStorage(
          pdfBlob,
          infoDocumento["NIT"],
          tipoDocumento,
          documento["hoja_No"]
        );
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
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

    fetchData();
  }, []);
}

PdfGenerator.propTypes = {
  onDataGenerated: PropTypes.func.isRequired,
};

export default PdfGenerator;
