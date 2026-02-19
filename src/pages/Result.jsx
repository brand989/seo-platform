import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  Alert, CircularProgress, Divider, Tooltip, IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, searchCompetitors } from '../api';
import StatusChip from '../components/StatusChip';

const INFO_FIELDS = [
  { key: 'main_keyword', label: 'Ключевой запрос' },
  { key: 'text_type', label: 'Тип текста' },
  { key: 'text_volume', label: 'Объём', render: (v) => `${v} слов` },
  { key: 'region', label: 'Регион' },
  { key: 'language', label: 'Язык' },
  { key: 'client_name', label: 'Клиент' },
  { key: 'client_niche', label: 'Ниша' },
];

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const p = await getProject(id);
      setProject(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = () => {
    if (!project?.tz_content) return;
    navigator.clipboard.writeText(project.tz_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!project?.tz_content) return;
    const blob = new Blob([project.tz_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title || 'tz'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSearchCompetitors = async () => {
    setSearching(true);
    try {
      await searchCompetitors(id);
      navigate(`/projects/${id}/competitors`);
    } catch (e) {
      alert('Ошибка: ' + e.message);
    } finally {
      setSearching(false);
    }
  };

  const selectedCompetitors = (() => {
    try { return JSON.parse(project?.selected_competitors || '[]'); } catch { return []; }
  })();

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return null;

  const hasTZ = Boolean(project.tz_content);

  return (
    <Grid container spacing={3}>
      {/* ── Main content ── */}
      <Grid item xs={12} md={8}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>{project.title || 'Без названия'}</Typography>
          <StatusChip status={project.status} />
        </Box>

        {hasTZ ? (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'flex-end' }}>
                <Tooltip title={copied ? 'Скопировано!' : 'Копировать'}>
                  <IconButton onClick={handleCopy} size="small" color={copied ? 'success' : 'default'}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Скачать .md">
                  <IconButton onClick={handleDownload} size="small">
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Перегенерировать">
                  <IconButton onClick={handleSearchCompetitors} size="small" disabled={searching}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{
                '& h1,& h2,& h3': { color: 'text.primary', mt: 2, mb: 1 },
                '& p': { color: 'text.secondary', lineHeight: 1.7, mb: 1 },
                '& ul,& ol': { pl: 3, color: 'text.secondary' },
                '& li': { mb: 0.5 },
                '& code': { bgcolor: 'grey.100', px: 0.5, borderRadius: 0.5, fontSize: '0.85em' },
                '& strong': { color: 'text.primary' },
              }}>
                <ReactMarkdown>{project.tz_content}</ReactMarkdown>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              {project.status === 'analyzing' ? (
                <>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography>Идёт генерация ТЗ...</Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>ТЗ ещё не создано</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Сначала найдите конкурентов и запустите анализ
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                    onClick={handleSearchCompetitors}
                    disabled={searching}
                  >
                    Найти конкурентов
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Grid>

      {/* ── Sidebar ── */}
      <Grid item xs={12} md={4}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Параметры проекта
            </Typography>
            {INFO_FIELDS.map(({ key, label, render }) =>
              project[key] ? (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {render ? render(project[key]) : project[key]}
                  </Typography>
                </Box>
              ) : null
            )}
            {project.faq_enabled && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">FAQ</Typography>
                <Typography variant="caption" fontWeight={500}>{project.faq_count} вопросов</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {selectedCompetitors.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Анализируемые конкуренты
              </Typography>
              {selectedCompetitors.map((url) => {
                const domain = (() => { try { return new URL(url).hostname; } catch { return url; } })();
                return (
                  <Chip
                    key={url}
                    label={domain}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5, maxWidth: '100%' }}
                    onClick={() => window.open(url, '_blank')}
                  />
                );
              })}
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<SearchIcon />}
            onClick={handleSearchCompetitors}
            disabled={searching}
          >
            Найти конкурентов
          </Button>
          {hasTZ && (
            <>
              <Button variant="outlined" fullWidth startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                {copied ? 'Скопировано!' : 'Копировать ТЗ'}
              </Button>
              <Button variant="outlined" fullWidth startIcon={<DownloadIcon />} onClick={handleDownload}>
                Скачать .md
              </Button>
            </>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
