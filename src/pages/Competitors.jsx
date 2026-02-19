import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Checkbox, FormControlLabel,
  Button, Grid, LinearProgress, Alert, Chip, CircularProgress,
  Divider, Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, generateTZ, getProjectStatus } from '../api';

const MAX_SELECTED = 7;

function CompetitorCard({ item, checked, disabled, onChange }) {
  const domain = (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })();
  return (
    <Card
      variant="outlined"
      sx={{
        cursor: 'pointer',
        borderColor: checked ? 'primary.main' : 'divider',
        bgcolor: checked ? 'primary.50' : 'white',
        transition: 'all 0.15s',
        '&:hover': { borderColor: 'primary.light' },
      }}
      onClick={() => !disabled && onChange(!checked)}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={checked}
            disabled={disabled && !checked}
            onChange={(e) => onChange(e.target.checked)}
            size="small"
            sx={{ mt: -0.5, p: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{item.title || domain}</Typography>
            <Link href={item.url} target="_blank" rel="noreferrer" variant="caption"
              color="primary" onClick={(e) => e.stopPropagation()} noWrap sx={{ display: 'block' }}>
              {domain}
            </Link>
            {item.snippet && (
              <Typography variant="caption" color="text.secondary"
                sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.5 }}>
                {item.snippet}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function CompetitorColumn({ title, items, selected, onToggle, excluded }) {
  const filtered = items.filter((it) => {
    try {
      const domain = new URL(it.url).hostname.replace('www.', '');
      return !excluded.some((ex) => domain.includes(ex.replace('www.', '')));
    } catch { return true; }
  });

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        {title} <Chip label={filtered.length} size="small" sx={{ ml: 1 }} />
      </Typography>
      {filtered.length === 0
        ? <Typography variant="body2" color="text.secondary">Нет результатов</Typography>
        : filtered.map((item) => {
          const isSelected = selected.includes(item.url);
          const limitReached = selected.length >= MAX_SELECTED;
          return (
            <Box key={item.url} sx={{ mb: 1 }}>
              <CompetitorCard
                item={item}
                checked={isSelected}
                disabled={limitReached && !isSelected}
                onChange={(checked) => onToggle(item.url, checked)}
              />
            </Box>
          );
        })
      }
    </Box>
  );
}

export default function Competitors() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const loadProject = useCallback(async () => {
    try {
      const p = await getProject(id);
      setProject(p);
      if (p.status === 'searching') setSearching(true);
      if (p.status === 'analyzing') setGenerating(true);
      if (p.status === 'done') {
        clearInterval(pollRef.current);
        navigate(`/projects/${id}/result`);
      }
      return p;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProject().then((p) => {
      if (p && (p.status === 'searching' || p.status === 'analyzing')) {
        pollRef.current = setInterval(async () => {
          const updated = await loadProject();
          if (updated && updated.status !== 'searching' && updated.status !== 'analyzing') {
            clearInterval(pollRef.current);
            setSearching(false);
            setGenerating(false);
          }
        }, 3000);
      }
    });
    return () => clearInterval(pollRef.current);
  }, [loadProject]);

  const handleToggle = (url, checked) => {
    setSelected((prev) =>
      checked ? [...prev.filter((u) => u !== url), url] : prev.filter((u) => u !== url)
    );
  };

  const handleGenerate = async () => {
    if (selected.length === 0) { setError('Выберите хотя бы одного конкурента'); return; }
    setGenerating(true);
    setError('');
    try {
      await generateTZ(id, selected);
      navigate(`/projects/${id}/result`);
    } catch (e) {
      setGenerating(false);
      setError(e.message);
    }
  };

  if (!project) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  const google = (() => { try { return JSON.parse(project.competitors_google || '[]'); } catch { return []; } })();
  const yandex = (() => { try { return JSON.parse(project.competitors_yandex || '[]'); } catch { return []; } })();
  const excluded = (() => { try { return JSON.parse(project.excluded_competitors || '[]'); } catch { return []; } })();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Конкуренты</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {project.title} · {project.main_keyword}
      </Typography>

      {(searching || generating) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {searching ? 'Ищем конкурентов в поисковых системах...' : 'Анализируем страницы конкурентов и генерируем ТЗ...'}
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {!searching && (google.length > 0 || yandex.length > 0) && (
        <>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Выбрано: <strong>{selected.length}/{MAX_SELECTED}</strong>
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <CompetitorColumn
                title="Google"
                items={google}
                selected={selected}
                onToggle={handleToggle}
                excluded={excluded}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CompetitorColumn
                title="Яндекс"
                items={yandex}
                selected={selected}
                onToggle={handleToggle}
                excluded={excluded}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate(`/projects/${id}/result`)}>
              Пропустить
            </Button>
            <Button
              variant="contained"
              startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
              onClick={handleGenerate}
              disabled={generating || selected.length === 0}
            >
              {generating ? 'Генерируем ТЗ...' : `Анализировать (${selected.length})`}
            </Button>
          </Box>
        </>
      )}

      {!searching && google.length === 0 && yandex.length === 0 && (
        <Alert severity="info">
          Конкуренты ещё не найдены. Дождитесь завершения поиска или вернитесь позже.
        </Alert>
      )}
    </Box>
  );
}
