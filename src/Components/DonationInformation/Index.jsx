// import React from "react";
// import { MDBDataTableV5 } from "mdbreact";

// export function DonationInformation({ documentos, tipoDocumento }) {
//   documentos.map((documento) => {
//     let ruta = "/pdf-view/" + tipoDocumento + "/" + documento.Consecutivo
//     documento.accion = <a href={ruta}>Ver</a>;

//     if(documento.Nota_Anulado != undefined && documento.Nota_Anulado !== ""){
//       documento.Observaciones = documento.Nota_Anulado
//     }else if(documento.Nota_Logistica != undefined && documento.Nota_Logistica !== ""){
//       documento.Observaciones = documento.Nota_Logistica
//     }else if(documento.Nota_logistica != undefined && documento.Nota_logistica !== ""){
//       documento.Observaciones = documento.Nota_logistica
//     }else if(documento.Nota_Contabilidad != undefined && documento.Nota_Contabilidad !== ""){
//       documento.Observaciones = documento.Nota_Contabilidad
//     }else if(documento.Nota_Fiscal != undefined && documento.Nota_Fiscal !== ""){
//       documento.Observaciones = documento.Nota_Fiscal
//     }else{
//       documento.Observaciones = ""
//     }

//     return documento;
//   });

//   const data = {
//     columns: [
//       {
//         label: "Fecha",
//         field: "Fecha Expedición",
//         sort: "asc",
//         width: 200,
//       },
//       {
//         label: "No. de constancia",
//         field: "Consecutivo",
//         sort: "asc",
//         width: 270,
//       },
//       {
//         label: "Empresa",
//         field: "Empresa",
//         sort: "asc",
//         width: 300,
//       },
//       {
//         label: "Concepto",
//         field: "Tipo_Certificado",
//         sort: "asc",
//         width: 100,
//       },
//       {
//         label: "Acción",
//         field: "accion",
//         sort: "asc",
//         width: 100,
//       },
//       {
//         label: "Observaciones",
//         field: "Observaciones",
//         sort: "asc",
//         width: 150,
//       },
//     ],
//     rows: documentos,
//   };

//   return (
//     <div className="mt-8 bg-blanco">
//       <MDBDataTableV5 striped bordered small data={data} />
//     </div>
//   )
// }

import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import './Index.css'; 

export function DonationInformation({ documentos, tipoDocumento }) {
  documentos.map((documento) => {
    let ruta = "/pdf-view/" + tipoDocumento + "/" + documento.Consecutivo;
    documento.accion = <a href={ruta}>Ver</a>;

    if (documento.Nota_Anulado != undefined && documento.Nota_Anulado !== "") {
      documento.Observaciones = documento.Nota_Anulado;
    } else if (
      documento.Nota_Logistica != undefined &&
      documento.Nota_Logistica !== ""
    ) {
      documento.Observaciones = documento.Nota_Logistica;
    } else if (
      documento.Nota_logistica != undefined &&
      documento.Nota_logistica !== ""
    ) {
      documento.Observaciones = documento.Nota_logistica;
    } else if (
      documento.Nota_Contabilidad != undefined &&
      documento.Nota_Contabilidad !== ""
    ) {
      documento.Observaciones = documento.Nota_Contabilidad;
    } else if (
      documento.Nota_Fiscal != undefined &&
      documento.Nota_Fiscal !== ""
    ) {
      documento.Observaciones = documento.Nota_Fiscal;
    } else {
      documento.Observaciones = "";
    }

    return documento;
  });

  
  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        accessorKey: "Fecha Expedición",
        header: "Fecha",
        size: 200,
        enableColumnFilter:true,
        enableGlobalFilter: false
      },
      {
        accessorKey: "Consecutivo",
        header: "No. de constancia",
        size: 270,
        enableColumnFilter:true,
      },
      {
        accessorKey: "Empresa",
        header: "Empresa",
        size: 300,
        enableColumnFilter:true,
        enableGlobalFilter: false
      },
      {
        accessorKey: "Tipo_Certificado",
        header: "Concepto",
        size: 100,
        enableColumnFilter:false,
        enableGlobalFilter: false
      },
      {
        accessorKey: "accion",
        header: "Acción",
        size: 100,
        enableColumnFilter:false,
        enableGlobalFilter: false
      },
      {
        accessorKey: "Observaciones",
        header: "Observaciones",
        size: 150,
        enableColumnFilter:false,
        enableGlobalFilter: false
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data:documentos, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    initialState: { pagination: { pageSize: 100, pageIndex: 0 }  }
  });

  return <div><MaterialReactTable table={table} /></div>;
}
