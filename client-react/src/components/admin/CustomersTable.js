import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import Icons from '../../styles/Icons';
import Loader from '../../components/shared/Loader';
import { CustomNoRowsOverlay, dateFormatter } from '../../helpers/TableHelpers';

export default function CustomersTable({ customers, editCustomer, saveLoading }) {
  return (
    <>      
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid 
          editMode="row"
          columns={
            [
              { 
                field: 'actions',
                width: 50,
                sortable: false,
                filterable: false,
                type: 'actions',
                renderCell: (cellValues) => {
                  return (
                    <IconButton
                      variant="outlined"
                      color='success'
                      size='large'
                      disabled={saveLoading}
                      onClick={() => {
                        editCustomer(cellValues);
                      }}
                    >
                      {saveLoading ? <Loader height={24} width={24} /> : <Icons.SaveIcon />}
                    </IconButton>
                  )
                }
              },
              { field: 'id', headerName: 'Id', description: 'Customers unique ID.', width: 70, cellClassName: 'non-editable-header', type: 'number', editable: false }, 
              { field: 'userName', headerName: 'Username', description: 'Customers username.', width: 200, cellClassName: 'non-editable-header', editable: false }, 
              { field: 'email', headerName: 'Email', description: 'Customers email-address.', width: 250, cellClassName: 'editable-header', editable: true }, 
              { field: 'phone1', headerName: 'Phone 1', description: 'Customers first phone number.', width: 150, cellClassName: 'editable-header', editable: true }, 
              { field: 'phone2', headerName: 'Phone 2', description: 'Customers second phone number.', width: 150, cellClassName: 'editable-header', editable: true },
              { 
                field: 'createdAtUtc', 
                headerName: 'Created', 
                description: 'Date when customer was created', 
                width: 160, 
                type: 'date',
                renderCell: (cell) => {
                  return dateFormatter(cell.value)
                },
                headerClassName: 'non-editable-header',
                cellClassName: 'non-editable-header'
              }, 
              { 
                field: 'updatedAtUtc', 
                headerName: 'Updated', 
                description: 'Date when customer was last updated', 
                width: 160, 
                type: 'date',
                renderCell: (cell) => {
                  return dateFormatter(cell.value)
                },
                headerClassName: 'non-editable-header',
                cellClassName: 'non-editable-header'
              }
            ]
          }
          rows={customers}
          components={{ 
            Toolbar: GridToolbar,
            NoRowsOverlay: CustomNoRowsOverlay,
            NoResultsOverlay: CustomNoRowsOverlay
          }} />
      </div>
    </>
  );
}