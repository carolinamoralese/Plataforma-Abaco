import { useEffect, useState } from "react";
import * as pdfMake from "pdfmake/build/pdfmake";
import 'pdfmake/build/vfs_fonts';
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

pdfMake.vfs = pdfFonts

function PdfGenerator({ onDataGenerated, infoDocumento }) {
  const params = useParams();
  const navigate = useNavigate();
  const rolUsuariologistica = "R_Logistica";
  const rolUsuarioCotabilidad = "R_Contabilidad";
  const rolUsuarioRevisorFiscal = "R_Fiscal";
  const rolUsuarioAnular = "R_Anulado";
  const [cargandoDocumento, setCargandoDocumento] = useState(true);


  const uploadPDFToDrive = async (
    pdfBlob,
    nit,
    tipoDocumento,
    consecutivo
  ) => {
    const CLIENT_ID = '436408748390-s4omgsu7kic68ekiffb2fnt5oock1ocn';
    const API_KEY = 'AIzaSyAsJmyUSN5peI0E8UN7er79DPKF1pllelc';
    const DISCOVERY_DOCS = 'https://www.googleapis.com/discovery/v1/apis/dirve/v3/rest';
    const SCOPES = 'https://www.googleapis.com/auth/drive'

  //   function start() {
  //     gapi.client.init({
  //       clientId: CLIENT_ID,
  //       scope: SCOPES,
  //     });
  //   }

  

  // gapi.load('client:auth2', start);
    
    // let client_drive = window.google.auth2({
    //   apiKey: API_KEY,
    //   clientId: CLIENT_ID,
    //   discoveryDocs: DISCOVERY_DOCS,
    //   scopes:SCOPES
    // }).then(function(){
    //   console.log("pepa")
    // })

    // window.gapi.client.load('auth2', function () {
    //   var auth2 = window.gapi.auth2.init({
    //     client_id: CLIENT_ID // Reemplaza con tu ID de cliente
    //   });
  
    //   // Aquí puedes realizar más operaciones después de la inicialización
    // });

    // let access_token = window.gapi.auth.getToken().access_token;
    // let request = window.gapi.client.request({
    //   'path': 'drive/v2/files',
    //   'method': 'POST',
    //   'headers': {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer ' + access_token,
    //   },
    //   'body': {
    //     'title': 'Backup Folder',
    //     'mimeType': 'application/vnd.google-apps.folder'
    //   }
    // });

    // request.execute(function(response){
    //   console.log(response.id)
    // })

    // gapi.load('client:auth2', () => {
    //   gapi.client.init({
    //     client_id: '436408748390-s4omgsu7kic68ekiffb2fnt5oock1ocn',
    //     scope: SCOPES,
    //   }).then((auth2) => {
    //     // Aquí la autenticación se ha inicializado correctamente
    //     // Puedes obtener el token de acceso cuando sea necesario
    //     console.log("auth2: ", auth2)
    //     const accessToken = auth2.currentUser.get().getAuthResponse().access_token;
    //     console.log('Token de acceso:', accessToken);

    //     var metadata = {
    //       'name': 'sampleName', // Filename at Google Drive
    //       'mimeType': 'application/pdf', // mimeType at Google Drive
    //       'parents': ['### folder ID ###'], // Folder ID at Google Drive
    //     };
    
    //     //var accessToken = window.gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
    //     var form = new FormData();
    //     form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    //     form.append('file', pdfBlob);
    
    //     var xhr = new XMLHttpRequest();
    //     xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
    //     xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    //     xhr.responseType = 'json';
    //     xhr.onload = () => {
    //         console.log(xhr.response.id); // Retrieve uploaded file ID.
    //     };
    //     xhr.send(form);
    //   }).catch((error) => {
    //     console.error('Error al inicializar la API de autenticación de Google:', error);
    //   });
    // });


    // gapi.load('client:auth2', () => {
    //   gapi.client.init({
    //     apiKey: API_KEY,
    //     client_id: '436408748390-s4omgsu7kic68ekiffb2fnt5oock1ocn',
    //     discoveryDocs: DISCOVERY_DOCS,
    //     scope: SCOPES,
    //   }).then(() => {
    //     console.log("Autenticación inicializada correctamente")
    //     gapi.auth2.getAuthInstance().signIn();
    //     const auth2 = gapi.auth2.getAuthInstance();
    //     console.log('auth2:', auth2);
    //     if (auth2) {
    //       const user = auth2.currentUser.get();
    //       if (user) {
    //         console.log('user:', user.getAuthResponse(true));
    //         const accessToken = user.getAuthResponse(true);
    //         console.log('Token de acceso:', gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true));
    //       } else {
    //         console.error('No se pudo obtener el usuario actual');
    //       }
    //     } else {
    //       console.error('No se pudo obtener la instancia de autenticación');
    //     }
    //   }).catch((error) => {
    //     console.error('Error al inicializar la autenticación:', error);
    //   });
    // });


    gapi.load('client:auth2', () => {
      gapi.client.init({
        //apiKey: API_KEY,
        client_id: '436408748390-s4omgsu7kic68ekiffb2fnt5oock1ocn',
        //discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        console.log("Autenticación inicializada correctamente")
        gapi.auth2.getAuthInstance().signIn().then(() => {
          const auth2 = gapi.auth2.getAuthInstance();
          console.log('auth2:', auth2);
          console.log("access_token:", auth2.currentUser.get().getAuthResponse(true).access_token)

          var metadata = {
            'name': 'sampleName.pdf', // Filename at Google Drive
            'mimeType': 'application/pdf', // mimeType at Google Drive
            'parents': [''], // Folder ID at Google Drive
          };
      
          var accessToken = auth2.currentUser.get().getAuthResponse(true).access_token; // Here gapi is used for retrieving the access token.
          var metadataString = JSON.stringify(metadata);
          var metadataBlob = new Blob([metadataString], { contentType: 'application/json' });
          var form = new FormData();
          form.append("metadata", metadataBlob);
          form.append('name', 'sampleName.pdf');
          form.append('mimeType', 'application/pdf');
          form.append('data', pdfBlob, {
            filename: "sampleName.pdf",
            contentType: "application/pdf",
          });
      
          fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media&q=(mimeType="application/pdf")', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'mimeType': 'application/pdf',
            },
            body: form,
          }).then(response => response.json())
            .then(data => {
              console.log('Archivo subido:', data);
            }).catch(error => {
              console.error('Error al cargar el archivo:', error);
            });

          
        }).catch((error) => {
          console.error('Error al iniciar sesión:', error);
        });
      }).catch((error) => {
        console.error('Error al inicializar la autenticación:', error);
      });
    });

    
  };



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

    if (infoDocumento == null){
      return
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

      if (tipoDocumento == "certificado" && infoDocumento[rolUsuarioAnular].toUpperCase() === "SI") {
        documentDefinition["watermark"] = {text: 'ANULADO', color: 'red', opacity: 0.1, bold: true, italics: false}
      }

      const pdfDoc = pdfMake.createPdf(documentDefinition);

      setCargandoDocumento(true)

      pdfDoc.getBlob((pdfBlob) => {
        onDataGenerated(pdfBlob);
        uploadPDFToFirebaseStorage(
          pdfBlob,
          infoDocumento["NIT"],
          tipoDocumento,
          documento["hoja_No"]
        );
        uploadPDFToDrive(
          pdfBlob,
          infoDocumento["NIT"],
          tipoDocumento,
          documento["hoja_No"]
        )
        setCargandoDocumento(false)
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
      Generando el PDF
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
