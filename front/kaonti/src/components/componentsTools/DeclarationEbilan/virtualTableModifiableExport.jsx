import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { init } from '../../../../init';
import { IconButton, TableFooter } from '@mui/material';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import AddBoxIcon from '@mui/icons-material/AddBox';

const VirtualTableModifiableExport = ({ columns, rows, type, rowsCa }) => {
  const rowsBalance = type === 3 ? rowsCa : rows;
  const initial = init[0];
  const [openRowsCa, setOpenRowsCa] = useState({});

  const toogleRowCa = (compte) => {
    setOpenRowsCa(prev => ({
      ...prev,
      [compte]: !prev[compte]
    }));
  };

  const columnWidths = columns.reduce((acc, column) => {
    acc[column.id] = column.minWidth;
    return acc;
  }, {});

  const totalColumn = (rows, columnId) => {

    const total = rows.reduce((acc, item) => {
      const Value = parseFloat(item[columnId]) || 0;
      return acc + Value;
    }, 0);

    return total;
  };

  const groupedDataCa = rowsBalance.reduce((acc, row) => {
    const compte = row['compteLibelle.compte'];

    if (!acc[compte]) {
      acc[compte] = {
        ...row,
        lignes: [],
        mvtdebitanalytique: 0,
        mvtcreditanalytique: 0,
        soldedebitanalytique: 0,
        soldecreditanalytique: 0,
        sousTotal: 0
      };
    }

    const compteData = acc[compte];

    compteData.mvtdebitanalytique += parseFloat(row.mvtdebitanalytique) || 0;
    compteData.mvtcreditanalytique += parseFloat(row.mvtcreditanalytique) || 0;
    compteData.soldedebitanalytique += parseFloat(row.soldedebitanalytique) || 0;
    compteData.soldecreditanalytique += parseFloat(row.soldecreditanalytique) || 0;

    compteData.lignes.push(row);

    compteData.sousTotal =
      compteData.mvtdebitanalytique +
      compteData.mvtcreditanalytique +
      compteData.soldedebitanalytique +
      compteData.soldecreditanalytique;

    return acc;
  }, {});

  return (
    <TableContainer
      style={{
        display: 'inline-block',
        width: 'auto',
        overflowX: 'auto'
      }}
    >
      <Table sx={{ minWidth: 650, border: '1px solid #ddd', }} aria-label="simple table">
        <TableHead
          style={{
            backgroundColor: initial.theme,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <TableRow>
            {
              type === 3 && (
                <TableCell
                  align="center"
                  className="sticky-action"
                  sx={{
                    fontWeight: 'bold',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    fontSize: 15,
                    color: 'white',
                    backgroundColor: initial.theme,
                  }}
                >
                </TableCell>
              )
            }
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{
                  fontWeight: 'bold',
                  top: 5,
                  minWidth: column.minWidth,
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  borderRight: '1px solid #ddd',
                  borderLeft: '1px solid #ddd',
                  fontSize: 15,
                  color: 'white'
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {
          type === 3 ?
            <TableBody>
              {
                Object.values(groupedDataCa).map((group, key) => {

                  return (
                    <React.Fragment key={key}>
                      <TableRow
                        sx={{
                          position: "sticky",
                          top: 35,
                          zIndex: 2,
                          backgroundColor: "#f5f5f5"
                        }}
                      >
                        {
                          <>
                            <TableCell align="center"
                              style={{
                                paddingTop: '4px', paddingBottom: '4px', fontSize: '13px', position: "sticky", top: 35,
                              }}
                            >
                              <IconButton
                                onClick={() => toogleRowCa(group['compteLibelle.compte'])}
                                sx={{
                                  width: 20,
                                  height: 20,
                                }}
                                style={{
                                  textTransform: 'none',
                                  outline: 'none',
                                  color: 'white',
                                }}
                              >
                                {openRowsCa[group['compteLibelle.compte']] ? <IndeterminateCheckBoxIcon color='primary' /> : <AddBoxIcon color='primary' />}
                              </IconButton>
                            </TableCell>
                          </>
                        }

                        {columns.map((column) => {
                          if (!column.id) return null;
                          let value = group[column.id];

                          if (column.isnumber && (value === null || value === undefined)) {
                            value = 0;
                          }

                          if (['mvtdebitanalytique', 'mvtcreditanalytique', 'soldedebitanalytique', 'soldecreditanalytique', 'compteLibelle.compte'].includes(column.id)) {
                            return (
                              <TableCell key={column.id} align={column.align} style={{ paddingTop: '10px', paddingBottom: '10px', fontSize: '13px', position: "sticky", top: 35 }}>
                                {
                                  column.format && value !== null && value !== undefined
                                    ? typeof value === 'number'
                                      ? column.format(value)
                                      : value
                                    : value
                                }
                              </TableCell>
                            );
                          }
                          return <TableCell key={column.id} align={column.align} style={{ paddingTop: '4px', paddingBottom: '4px', fontSize: '13px', position: "sticky", top: 35 }}></TableCell>
                        })}
                      </TableRow>
                      {
                        openRowsCa[group['compteLibelle.compte']] && group.lignes.map((row, rKey) => (
                          <TableRow key={rKey}>
                            <TableCell />
                            <TableCell />
                            {columns
                              .filter(column => column.id !== 'compteLibelle.compte')
                              .map((column) => {
                                if (!column.id) return null;
                                let value = row[column.id];

                                if (column.isnumber && (value === null || value === undefined)) {
                                  value = 0;
                                }

                                return (
                                  <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ paddingTop: '4px', paddingBottom: '4px', fontSize: '13px' }}
                                  >
                                    {
                                      column.format && value !== null && value !== undefined
                                        ? typeof value === 'number'
                                          ? column.format(value)
                                          : value
                                        : value
                                    }
                                  </TableCell>
                                )
                              })}
                          </TableRow>
                        ))
                      }
                    </React.Fragment>
                  )
                })
              }
            </TableBody>
            :
            <TableBody>
              {rowsBalance.map((row) => {

                return (
                  <TableRow hover
                    role="checkbox" tabIndex={-1} key={row.id}
                    style={{ height: '20px' }}

                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{
                            paddingTop: '5px',
                            paddingBottom: '5px',
                            fontSize: 15,
                          }}
                        >
                          {
                            column.format && value
                              ? typeof value === 'number'
                                ? column.format(value)
                                : value
                              : value
                          }
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
        }

        <TableFooter
          style={{
            backgroundColor: '#89A8B2',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <TableRow>
            {
              type === 3 && (
                <TableCell
                  align="center"
                  className="sticky-action"
                  sx={{
                    fontWeight: 'bold',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    fontSize: 15,
                    color: 'white',
                  }}
                >
                </TableCell>
              )
            }
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{
                  fontWeight: 'bold',
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  borderTop: '1px solid #ddd',
                  minWidth: columnWidths[column.id],
                  fontSize: 15
                }}
              >
                {
                  column.id === "EcritureLib" || column.id === "libelle"
                    ? "Total"
                    : column.isnumber
                      ? totalColumn(rowsBalance, column.id).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : ""
                }
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

export default VirtualTableModifiableExport;