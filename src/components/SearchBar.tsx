import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Box, Button, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useApp } from '../store/AppContext';
import { buildSuggestions } from '../lib/search';

type Suggestion = ReturnType<typeof buildSuggestions>[number];

export default function SearchBar({ initial = '' }: { initial?: string }) {
  const { db, logEvent } = useApp();
  const nav = useNavigate();
  const [value, setValue] = useState(initial);

  const options = useMemo<Suggestion[]>(
    () => (db ? buildSuggestions(db.levels, db.topics, db.tracks) : []),
    [db],
  );

  const go = (q: string) => {
    const query = q.trim();
    if (!query) return;
    logEvent({ type: 'search', path: '/catalog', label: query });
    nav(`/catalog?q=${encodeURIComponent(query)}`);
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        border: '1px solid rgba(33,25,95,0.1)',
        bgcolor: '#ffffff',
        boxShadow: '0 24px 60px -32px rgba(33,25,95,0.28)',
      }}
      elevation={0}
    >
      <Typography variant="h6" sx={{ mb: 1.5, color: 'text.primary' }}>
        Что послушаем сегодня?
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Autocomplete
          freeSolo
          fullWidth
          options={options}
          getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
          inputValue={value}
          onInputChange={(_, v) => setValue(v)}
          onChange={(_, v) => {
            if (!v) return;
            if (typeof v === 'string') return go(v);
            if (v.type === 'level') nav(`/catalog?level=${v.id}`);
            else if (v.type === 'topic') nav(`/catalog?topic=${v.id}`);
            else nav(`/catalog?track=${v.id}`);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder='Например: «А1», «покупки», «θάλασσα»'
              onKeyDown={(e) => {
                if (e.key === 'Enter') go(value);
              }}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                      {params.slotProps.input.startAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />
        <Button variant="contained" size="large" onClick={() => go(value)} sx={{ px: 4 }}>
          Найти
        </Button>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mt: 1,
          display: 'block',
          /*
           * На телефоне строка упиралась в скруглённый угол карточки: справа
           * зазора не оставалось. Поля сдвигают текст внутрь и заставляют
           * переноситься раньше, до края.
           */
          px: { xs: 2.5, sm: 0 },
          fontSize: { xs: 15, sm: 16 },
          lineHeight: 1.45,
          overflowWrap: 'anywhere',
        }}
      >
        Ищем по уровню, теме, названию, исполнителю и по тексту песни — на русском и на греческом.
      </Typography>
    </Paper>
  );
}
