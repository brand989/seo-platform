import { useState } from 'react';
import {
  Box, Button, Typography, TextField, Grid, Card, CardContent,
  FormControlLabel, Switch, MenuItem, Divider, Alert, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { createProject, searchCompetitors } from '../api';

const TEXT_TYPES = ['статья', 'лендинг', 'карточка товара', 'категория', 'обзор', 'руководство'];
const LANGUAGES = ['ru', 'uk', 'en', 'kz'];
const TEXT_STYLES = ['нейтральный', 'экспертный', 'разговорный', 'продающий', 'информационный'];

const INIT = {
  title: '', main_keyword: '', client_name: '', client_website: '',
  client_niche: '', client_description: '',
  text_type: 'статья', text_volume: 3000, text_style: 'нейтральный',
  target_audience: '', region: 'Москва', language: 'ru',
  faq_enabled: false, faq_count: 5,
  additional_requirements: '', excluded_competitors: [],
};

function Field({ label, required, error, ...rest }) {
  return (
    <TextField
      label={label}
      fullWidth
      size="small"
      required={required}
      error={Boolean(error)}
      helperText={error || ''}
      {...rest}
    />
  );
}

export default function ProjectNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Обязательное поле';
    if (!form.main_keyword.trim()) errs.main_keyword = 'Обязательное поле';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const project = await createProject(form);
      navigate(`/projects/${project.Id}/result`);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSearch = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const project = await createProject(form);
      await searchCompetitors(project.Id);
      navigate(`/projects/${project.Id}/competitors`);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Новый проект</Typography>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <Grid container spacing={3}>
        {/* ── Данные клиента ── */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Данные клиента</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field label="Название проекта" required value={form.title}
                    onChange={set('title')} error={errors.title} />
                </Grid>
                <Grid item xs={12}>
                  <Field label="Основной ключевой запрос" required value={form.main_keyword}
                    onChange={set('main_keyword')} error={errors.main_keyword} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Имя клиента" value={form.client_name} onChange={set('client_name')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Сайт клиента" value={form.client_website} onChange={set('client_website')} />
                </Grid>
                <Grid item xs={12}>
                  <Field label="Ниша / тематика" value={form.client_niche} onChange={set('client_niche')} />
                </Grid>
                <Grid item xs={12}>
                  <Field label="Описание клиента" value={form.client_description}
                    onChange={set('client_description')} multiline rows={3} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Параметры текста ── */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Параметры текста</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field label="Тип текста" select value={form.text_type} onChange={set('text_type')}>
                    {TEXT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Объём (слов)" type="number" value={form.text_volume} onChange={set('text_volume')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Стиль" select value={form.text_style} onChange={set('text_style')}>
                    {TEXT_STYLES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Регион" value={form.region} onChange={set('region')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Язык" select value={form.language} onChange={set('language')}>
                    {LANGUAGES.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field label="Целевая аудитория" value={form.target_audience}
                    onChange={set('target_audience')} multiline rows={2} />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={form.faq_enabled} onChange={set('faq_enabled')} />}
                    label="Добавить раздел FAQ"
                  />
                </Grid>

                {form.faq_enabled && (
                  <Grid item xs={12} sm={6}>
                    <Field label="Количество вопросов FAQ" type="number"
                      value={form.faq_count} onChange={set('faq_count')} />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Field label="Дополнительные требования" value={form.additional_requirements}
                    onChange={set('additional_requirements')} multiline rows={2}
                    placeholder="Укажите специальные требования к контенту..." />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Кнопки ── */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/projects')} disabled={loading}>
          Отмена
        </Button>
        <Button variant="outlined" startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave} disabled={loading}>
          Сохранить черновик
        </Button>
        <Button variant="contained" startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
          onClick={handleSaveAndSearch} disabled={loading}>
          Найти конкурентов
        </Button>
      </Box>
    </Box>
  );
}
