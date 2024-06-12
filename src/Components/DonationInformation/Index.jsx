import { useRef } from "react";
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
        enableColumnFilter: true,
        enableGlobalFilter: false,
        grow: false,
      },
      {
        accessorKey: "Consecutivo",
        header: "No. de documento",
        enableColumnFilter: true,
        grow: false,
      },
      {
        accessorKey: "Empresa",
        header: "Empresa",
        enableColumnFilter: true,
        enableGlobalFilter: false,
        grow: false,
      },
      {
        accessorKey: "Tipo_Certificado",
        header: "Concepto",
        enableColumnFilter: false,
        enableGlobalFilter: false,
        grow: false,
      },
      {
        accessorKey: "accion",
        header: "Acción",
        enableColumnFilter: false,
        enableGlobalFilter: false,
        grow: false,
      },
      {
        accessorKey: "Observaciones",
        header: "Observaciones",
        enableColumnFilter: false,
        enableGlobalFilter: false,
        grow: false,
      },
      {
        accessorKey: "Factura",
        header: "N. de Factura",
        enableColumnFilter: true,
        enableGlobalFilter: false,
        grow: false,
      },
    ],
    []
  );
  const columnVirtualizerInstanceRef = useRef(null);

  const table = useMaterialReactTable({
    columns,
    data: documentos,
    columnVirtualizerInstanceRef,
    columnVirtualizerOptions: { overscan: 4 },
    defaultColumn: { minSize: 40, maxSize: 1000, size: 200 },
    muiTableContainerProps: { sx: { maxHeight: "600px", maxWidth: "1000px" } },
    muiTableBodyProps: {
      sx: {
        "& tr:nth-of-type(odd) > td": {
          backgroundColor: "#f5f5f5",
        },
      },
    },
    initialState: {
      pagination: { pageSize: 100, pageIndex: 0 },
      columnVisibility: { Factura: false },
    },
    enableStickyHeader: true,
    enableStickyFooter: true,
    layoutMode: "grid-no-grow",
    enableColumnVirtualization: true,
  });

  return (
    <div>
      <MaterialReactTable table={table} className="header-cell" />
    </div>
  );
}
