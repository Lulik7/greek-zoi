import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { api } from '../../api/client';
import { useApp } from '../../store/AppContext';

/**
 * Резервная копия и перенос содержимого школы.
 *
 * Выгрузка — обычный файл с уровнями, темами, материалами и текстами песен.
 * Им же переносят содержимое с одного сайта на другой: скачали на одном,
 * загрузили на другом. Ученики, оплаты и статистика в файл не попадают —
 * это данные конкретного сервера.
 */
export default function BackupAdmin() {
  const { db, refresh } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const counts = db
    ? { levels: db.levels.length, topics: db.topics.length, tracks: db.tracks.length }
    : { levels: 0, topics: 0, tracks: 0 };

  const download = async () => {
    setBusy('export');
    setError('');
    setMsg('');
    try {
      const blob = await api.exportContent();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `школа-греческого-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Файл скачан — посмотрите в папке «Загрузки».');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выгрузить содержимое');
    } finally {
      setBusy('');
    }
  };

  const upload = async (file: File) => {
    setBusy('import');
    setError('');
    setMsg('');
    try {
      const data = JSON.parse(await file.text());
      const res = await api.importContent(data);
      await refresh();
      setMsg(
        `Готово: уровней — ${res.levels}, тем — ${res.topics}, материалов — ${res.tracks}.`,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Не удалось прочитать файл — проверьте, что выбран файл выгрузки',
      );
    } finally {
      setBusy('');
    }
  };

  return (
    <Stack spacing={3}>
      {msg && <Alert severity="success">{msg}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Скачать копию
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            В файл попадут уровни, темы, все материалы с текстами и переводами, а также
            настройки сайта. Сейчас это {counts.levels} уровня, {counts.topics} тем и{' '}
            {counts.tracks} материалов. Ученики, оплаты и статистика в файл не попадают.
            Сами аудиозаписи тоже: они лежат отдельными файлами на сервере.
          </Typography>
          <Button
            variant="contained"
            startIcon={busy === 'export' ? <CircularProgress size={18} /> : <DownloadIcon />}
            onClick={download}
            disabled={!!busy}
          >
            {busy === 'export' ? 'Готовлю файл…' : 'Скачать копию'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Загрузить из файла
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Содержимое сайта заменится целиком тем, что в файле. Пригодится, чтобы
            перенести материалы с домашнего компьютера на сайт в интернете или вернуть
            всё назад, если что-то случайно удалили.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Нынешние уровни, темы и материалы будут удалены и заменены. Ученики и их
            подписки останутся. Перед загрузкой лучше скачать копию — кнопкой выше.
          </Alert>
          <Button
            variant="outlined"
            startIcon={busy === 'import' ? <CircularProgress size={18} /> : <UploadFileIcon />}
            onClick={() => fileRef.current?.click()}
            disabled={!!busy}
          >
            {busy === 'import' ? 'Загружаю…' : 'Выбрать файл и загрузить'}
          </Button>
          <Box
            component="input"
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            sx={{ display: 'none' }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void upload(file);
            }}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
