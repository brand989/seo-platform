import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, IconButton, Tooltip, Alert, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api';
import StatusChip from '../components/StatusChip';

export default function ProjectsList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setRows((data.list || []).map((r) => ({ ...r, id: r.Id })));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить проект?')) return;
    try {
      await deleteProject(id);
      setRows((prev) => prev.filter((r) => r.Id !== id));
    } catch (e) {
      alert('Ошибка при удалении: ' + e.message);
    }
  };

  const columns = [
    { field: 'title', headerName: 'Название', flex: 2, minWidth: 160 },
    { field: 'main_keyword', headerName: 'Основной ключ', flex: 2, minWidth: 160 },
    {
      field: 'CreatedAt', headerName: 'Дата', flex: 1, minWidth: 110,
      valueFormatter: (v) => v ? new Date(v).toLocaleDateString('ru') : '—',
    },
    {
      field: 'status', headerName: 'Статус', flex: 1, minWidth: 150,
      renderCell: ({ value }) => <StatusChip status={value} />,
    },
    {
      field: '_actions', headerName: '', width: 100, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Открыть">
            <IconButton size="small" onClick={() => navigate(`/projects/${row.Id}/result`)}>
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton size="small" color="error" onClick={() => handleDelete(row.Id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Проекты</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/projects/new')}>
          Создать проект
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {rows.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
          <Typography variant="h6" gutterBottom>Проектов пока нет</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>Создайте первый SEO-проект</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/projects/new')}>
            Создать проект
          </Button>
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          sx={{ bgcolor: 'white', borderRadius: 2 }}
          onRowClick={({ row }) => navigate(`/projects/${row.Id}/result`)}
        />
      )}
    </Box>
  );
}
