import { VARIABLES_ENTORNO } from "../../env";

export const obtenerCertificados = () => {
  let parametros = new URLSearchParams({
    authKey: VARIABLES_ENTORNO.REACT_APP_KEY_OBTENER_CERTIFICADOS,
  });
  return fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_OBTENER_CERTIFICADOS + "?" + parametros,
    { method: "POST" }
  )
    .then((respuesta) => respuesta.json())
    .catch((error) => {
      throw error.mensaje;
    });
};

export const obtenerConstancias = () => {
  let parametros = new URLSearchParams({
    key: VARIABLES_ENTORNO.REACT_APP_KEY_OBTENER_CONSTANCIAS,
  });
  return fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_OBTENER_CONSTANCIAS + "?" + parametros,
    { method: "POST" }
  )
    .then((respuesta) => respuesta.json())
    .catch((error) => {
      throw error.mensaje;
    });
};

export const obtenerConstancia = (Hoja_No) => {
  let parametros = new URLSearchParams({
    key: VARIABLES_ENTORNO.REACT_APP_KEY_OBTENER_CONSTANCIA,
    Hoja_No,
  });
  return fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_OBTENER_CONSTANCIA + "?" + parametros,
    { method: "POST" }
  )
    .then((respuesta) => respuesta.json())
    .catch((error) => {
      throw error.mensaje;
    });
};

export const obtenerCertificado = (Hoja_No) => {
  let parametros = new URLSearchParams({
    key: VARIABLES_ENTORNO.REACT_APP_KEY_OBTENER_CERTIFICADO,
    Hoja_No,
  });
  return fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_OBTENER_CERTIFICADO + "?" + parametros,
    { method: "POST" }
  )
    .then((respuesta) => respuesta.json())

    .catch((error) => {
      throw error.mensaje;
    });
};

export const modificarEstadoCertificadoLogistica = async (
  nuevoEstado,
  consecutivo,
  correo,
  motivoRechazo = ""
) => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    authKey:
      VARIABLES_ENTORNO.REACT_APP_AUTHKEY_MODIFICAR_ESTADOS_CERTIFICADOS_LOGISTICA,
    consecutivo,
    dataToAdd: nuevoEstado,
    dataToAdd2: correo,
    dataToAdd3: motivoRechazo,
  });

  return await fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_MODIFICAR_ESTADOS_CERTIFICADOS_LOGISTICA +
      "?" +
      parametros,
    opciones
  )
    .then((respuesta) => respuesta)
    .catch((error) => {
      throw error.mensaje;
    });
};

export const modificarEstadoCertificadoContabilidad = async (
  nuevoEstado,
  consecutivo,
  correo,
  motivoRechazo = ""
) => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    authKey:
      VARIABLES_ENTORNO.REACT_APP_AUTHKEY_MODIFICAR_ESTADOS_CERTIFICADOS_CONTABILIDAD,
    dataToAdd: nuevoEstado,
    consecutivo,
    dataToAdd2: correo,
    dataToAdd3: motivoRechazo,
  });
  return await fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_MODIFICAR_ESTADOS_CERTIFICADOS_CONTABILIDAD +
      "?" +
      parametros,
    opciones
  )
    .then((respuesta) => respuesta)
    .catch((error) => {
      throw error.mensaje;
    });
};

export const modificarEstadoCertificadoRevisorFiscal = async (
  nuevoEstado,
  consecutivo,
  correo,
  motivoRechazo = ""
) => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    authKey:
      VARIABLES_ENTORNO.REACT_APP_AUTHKEY_MODIFICAR_ESTADOS_CERTIFICADOS_REVISOR_FISCAL,
    dataToAdd: nuevoEstado,
    consecutivo,
    dataToAdd2: correo,
    dataToAdd3: motivoRechazo,
  });
  return await fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_MODIFICAR_ESTADOS_CERTIFICADOS_REVISOR_FISCAL +
      "?" +
      parametros,
    opciones
  )
    .then((respuesta) => respuesta)
    .catch((error) => {
      throw error.mensaje;
    });
};

export const modificarEstadoCertificadoAdministrador = async (
  nuevoEstado,
  consecutivo,
  correo,
  motivoRechazo = ""
) => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    authKey:
      VARIABLES_ENTORNO.REACT_APP_AUTHKEY_MODIFICAR_ESTADOS_CERTIFICADOS_ADMINISTRADOR,
    dataToAdd: nuevoEstado,
    consecutivo,
    dataToAdd2: correo,
    dataToAdd3: motivoRechazo,
  });
  return await fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_MODIFICAR_ESTADOS_CERTIFICADOS_ADMINISTRADOR +
      "?" +
      parametros,
    opciones
  )
    .then((respuesta) => respuesta)
    .catch((error) => {
      throw error.mensaje;
    });
};

export const modificarEstadoConstanciaLogistica = async (
  nuevoEstado,
  consecutivo,
  correo,
  motivoRechazo = ""
) => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    authKey:
      VARIABLES_ENTORNO.REACT_APP_AUTHKEY_MODIFICAR_ESTADOS_CONSTANCIA_LOGISTICA,
    dataToAdd: nuevoEstado,
    consecutivo,
    dataToAdd2: correo,
    dataToAdd3: motivoRechazo,
  });
  return await fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_MODIFICAR_ESTADOS_CONSTANCIAS_LOGISTICA +
      "?" +
      parametros,
    opciones
  )
    .then((respuesta) => respuesta)
    .catch((error) => {
      throw error.mensaje;
    });
};

export const modificarEstadoConstanciaAdministrador = async (
  nuevoEstado,
  consecutivo,
  correo,
  motivoRechazo = ""
) => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    authKey:
      VARIABLES_ENTORNO.REACT_APP_AUTHKEY_MODIFICAR_ESTADOS_CONSTANCIA_ADMINISTRADOR,
    dataToAdd: nuevoEstado,
    consecutivo,
    dataToAdd2: correo,
    dataToAdd3: motivoRechazo,
  });
  return await fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_MODIFICAR_ESTADOS_CONSTANCIAS_ADMINISTRADOR +
      "?" +
      parametros,
    opciones
  )
    .then((respuesta) => respuesta)
    .catch((error) => {
      throw error.mensaje;
    });
};

export const obtenerUsuarios = () => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    key: VARIABLES_ENTORNO.REACT_APP_KEY_OBTENER_USUARIOS,
  });
  return fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_OBTENER_USUARIOS + "?" + parametros,
    opciones
  )
    .then((respuesta) => respuesta.json())
    .catch((error) => {
      throw error.mensaje;
    });
};

//uno a uno
export const obtenerDetalleFactura = () => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    key: VARIABLES_ENTORNO.REACT_APP_KEY_OBTENER_DETALLES_FACTURAS,
  });
  return fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_OBTENER_DETALLES_FACTURAS +
      "?" +
      parametros,
    opciones
  )
    .then((respuesta) => respuesta.json())
    .catch((error) => {
      throw error.mensaje;
    });
};

export const anularCertificado = async (
  nuevoEstado,
  consecutivo,
  correo,
  motivoAnulacion = ""
) => {
  let opciones = {
    method: "POST",
  };
  let parametros = new URLSearchParams({
    authKey: VARIABLES_ENTORNO.REACT_APP_AUTHKEY_ANULAR_CERTIFICADOS,
    dataToAdd: nuevoEstado,
    consecutivo,
    dataToAdd2: correo,
    dataToAdd3: motivoAnulacion,
  });
  return await fetch(
    VARIABLES_ENTORNO.REACT_APP_URL_ANULAR_CERTIFICADOS + "?" + parametros,
    opciones
  )
    .then((respuesta) => respuesta)
    .catch((error) => {
      throw error.mensaje;
    });
};
