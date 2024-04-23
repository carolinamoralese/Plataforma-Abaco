import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";



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


  const columns = useMemo(
    () => [
      {
        accessorKey: "Fecha Expedición",
        header: "Fecha",
        size: 180,
        enableColumnFilter: true,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "Consecutivo",
        header: "No. de documento",
        size: 150,
        enableColumnFilter: true,
      },
      {
        accessorKey: "Empresa",
        header: "Empresa",
        size: 250,
        enableColumnFilter: true,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "Tipo_Certificado",
        header: "Concepto",
        size: 100,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "accion",
        header: "Acción",
        size: 50,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "Observaciones",
        header: "Observaciones",
        size: 150,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: documentos,
    muiTableContainerProps : { sx : { maxHeight : '600px' } },
    muiTableBodyProps: {
      // sx: {
      //   //stripe the rows, make odd rows a darker color
      //   '& td:nth-of-type(odd)': {
      //     backgroundColor: '#f5f5f5',
      //   },
      // },
      sx: {
        //stripe the rows, make odd rows a darker color
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: '#f5f5f5',
        },
      },
    },
    initialState: { pagination: { pageSize: 100, pageIndex: 0 }},
    enableStickyHeader: true,
    enableStickyFooter: true,
   // muiTableContainerProps: { sx: { maxHeight: '600px' } },
    

  });

  return (
    <div>
      <MaterialReactTable table={table} />
    </div>
  );
}
