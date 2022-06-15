import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import Icons from '../../styles/Icons';
import Loader from '../../components/shared/Loader';
import { CustomNoRowsOverlay } from '../../helpers/TableHelpers';

export default function UsersTable({ users, deleteUser, editUser, saveLoading }) {
  return (
    <>      
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid 
          editMode="row"
          columns={
            [
              { 
                field: 'actions', 
                width: 100,
                sortable: false,
                filterable: false,
                type: 'actions',
                renderCell: (cellValues) => {
                  return (
                    <>
                      <IconButton
                        variant="outlined"
                        color='error'
                        size='large'
                        disabled={saveLoading}
                        onClick={() => {
                          deleteUser(cellValues);
                        }}
                      >
                        {saveLoading ? <Loader height={24} width={24} /> : <Icons.DeleteIcon />}
                      </IconButton>
                      <IconButton
                        variant="outlined"
                        color='success'
                        size='large'
                        disabled={saveLoading}
                        onClick={() => {
                          editUser(cellValues);
                        }}
                      >
                        {saveLoading ? <Loader height={24} width={24} /> : <Icons.SaveIcon />}
                      </IconButton>
                    </>
                  )
                }
              },
              { field: 'id', headerName: 'Id', description: 'Users unique ID.', width: 350, cellClassName: 'non-editable-header' }, 
              { field: 'userName', headerName: 'Username', description: 'Users username.', width: 180, editable: true, cellClassName: 'editable-header' }, 
              { field: 'fullName', headerName: 'Name', description: 'Users full name.', width: 180, editable: true, cellClassName: 'editable-header' }, 
              { field: 'email', headerName: 'Email', description: 'Users Email-address.', width: 220, editable: true, cellClassName: 'editable-header' }, 
              { field: 'phoneNumber', headerName: 'Phone', description: 'Users phone number.', width: 180, editable: true, cellClassName: 'editable-header' }, 
              { 
                field: 'roles', 
                headerName: 'Roles', 
                description: 'Users roles', 
                width: 160,
                renderCell: (params) => {
                  return (
                    params.row.roles.map(role => (
                      `${role}`
                    ))
                  )
                },
                cellClassName: 'non-editable-header'
              }
            ]
          }
          rows={users}
          components={{ 
            Toolbar: GridToolbar,
            NoRowsOverlay: CustomNoRowsOverlay,
            NoResultsOverlay: CustomNoRowsOverlay
          }} />
      </div>
    </>
  );
}