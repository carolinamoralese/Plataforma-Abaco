import { Barrasuperior, Navbar } from "../Components/Navbar/Index";
import Group from "../assets/Group.png";

export function HomeInfo() {
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
    top: "160%",
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

  return (
    <>
      <Barrasuperior />
      <Navbar />
      <div
        style={homeStyle}
        className="relative mt-5 flex flex-col items-center ml-40"
      >
        <div className="flex justify-center">
          <div style={textStyle}>
            <p className="text-1">
              USUARIOS:
              <ol className="list-decimal pl-6 mt-4">
                <li>Usuario revisor Logística</li>
                <li>Usuario Contabilidad</li>
                <li>Usuario Representante legal (fiscal)</li>
                <li>Usuario de seguimiento</li>
                <li>Usuario de revisiones</li>
              </ol>
              <p className="mt-4">FLUJO CONSTANCIA DE DONACIÓN:</p>
              <p className="ml-6 mt-4">
                Visto bueno del revisor de logística, pasa a firma.
              </p>
              <p className="ml-6">
                Si el revisor logístico no da el visto bueno, la constancia será
                denegada y se generará nuevamente desde la base de datos.
              </p>
              <p className="ml-6 mt-4">
                Si alguno de los proveedores deniega su visto bueno el
                certificado será denegado y se generará nuevamente desde la base
                de datos.
              </p>
              <p className="mt-4">FLUJO CERTIFICADOS:</p>
              <p className="ml-6 mt-4">
                Se firman cerca de 100 certificados al mes.
              </p>
              <p className="ml-6 mt-4">Certificado de Donación / dinero</p>
              <p className="pl-6">
                Revisor logístico, revisor de contabilidad y revisor fiscal
              </p>
              <p className="ml-6 mt-4">
                Certificado de donación / especie uno a uno
              </p>
              <p className="pl-6">
                Revisor logístico, revisor de contabilidad y revisor fiscal
              </p>
              <p className="ml-6 mt-4">
                Cada uno da su visto bueno, en ese orden de tal forma que hasta
                que el logístico no dé su visto bueno, al revisor de
                contabilidad no se le habilita la opción y hasta que este no dé
                su visto bueno, al revisor fiscal no se le habilita esta
                posibilidad.
              </p>
              <p className="ml-6 mt-4">
                Si alguno de los proveedores deniega su visto bueno el
                certificado será denegado y se generará nuevamente desde la base
                de datos.
              </p>
              <ul className="list-disc pl-6 mt-4">
                <li className="ml-6 mt-4">
                  Los revisores deben recibir un correo diario si tienen
                  revisiones pendientes, conteniendo un resumen de las
                  revisiones pendientes por cada tipo de certificado.
                </li>
                <li className="ml-6 mt-4">
                  Los revisores deben acceder a una lista de certificados
                  pendientes de aprobar para su fase y tener la opción de
                  aprobar o rechazar el certificado, usando el API
                  proporcionado; deben enviar la respuesta con un método POST.
                  Si el usuario ha rechazado una constancia o un certificado, le
                  debe salir una ventana para escribir el motivo por el cual fue
                  rechazado. Cambiar mensaje por, ¿está seguro que desea
                  rechazar este certificado (Rechazar / Cancelar) o está seguro
                  que desea aprobar este certificado (Aprobar / Cancelar)?
                </li>
                <li className="ml-6 mt-4">
                  Si un revisor rechaza un certificado, debe justificar sus
                  razones y/o indicar las correcciones necesarias.
                </li>
              </ul>
              <p className="ml-6 mt-4">
                <span className="font-bold">Usuario de seguimiento</span> (tener
                formas de filtrar y consultar la información de manera ágil para
                hacer reportes mensuales)
              </p>
              <p className="ml-6">
                Seguimiento a todos los certificados - conoce el número de
                certificados rechazados y sus causas - visualizar los
                certificados aprobados (número, empresa, facturas y valor).
              </p>
              <p className="ml-6 mt-4">
                <span className="font-bold">Usuario de revisiones </span>{" "}
                (logística, certificados y contabilidad)
              </p>
              <p className="ml-6">
                Seguimiento de cuáles certificados ya dio su aprobación y cuáles
                están en espera de ser aprobados o cuáles fueron rechazados por
                contabilidad o revisoría fiscal.
              </p>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
