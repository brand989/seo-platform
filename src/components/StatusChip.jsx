import Chip from '@mui/material/Chip';

const STATUS_MAP = {
  draft: { label: 'Черновик', color: 'default' },
  searching: { label: 'Поиск...', color: 'info' },
  competitors_found: { label: 'Конкуренты найдены', color: 'success' },
  analyzing: { label: 'Анализ...', color: 'warning' },
  done: { label: 'Готово', color: 'success' },
  error: { label: 'Ошибка', color: 'error' },
};

export default function StatusChip({ status }) {
  const cfg = STATUS_MAP[status] || { label: status || '—', color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
}
