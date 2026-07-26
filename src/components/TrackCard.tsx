import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ForumIcon from '@mui/icons-material/Forum';
import ReplayIcon from '@mui/icons-material/Replay';
import type { Level, Topic, Track } from '../types';
import { useApp } from '../store/AppContext';
import { GREEK_FONT } from '../theme';

interface Props {
  track: Track;
  levels: Level[];
  topics: Topic[];
  onLocked: (track: Track) => void;
  /** Развернуть карточку сразу (переход из поиска по конкретному треку) */
  defaultOpen?: boolean;
}

export default function TrackCard({ track, levels, topics, onLocked, defaultOpen }: Props) {
  const { hasSubscription, logEvent } = useApp();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(!!defaultOpen);
  const [showText, setShowText] = useState(!!defaultOpen);
  const [time, setTime] = useState(0);

  // сервер сам решает, что показывать: у закрытых материалов нет ни аудио, ни текста
  const unlocked = track.locked === undefined ? track.free || hasSubscription : !track.locked;

  const levelChips = useMemo(
    () => levels.filter((l) => track.levelIds.includes(l.id)),
    [levels, track.levelIds],
  );
  const topicChips = useMemo(
    () => topics.filter((t) => track.topicIds.includes(t.id)),
    [topics, track.topicIds],
  );

  const timed = track.lyrics.some((l) => typeof l.time === 'number');
  const activeIndex = useMemo(() => {
    if (!timed) return -1;
    let idx = -1;
    track.lyrics.forEach((l, i) => {
      if (typeof l.time === 'number' && l.time <= time + 0.15) idx = i;
    });
    return idx;
  }, [time, timed, track.lyrics]);

  const handleOpen = () => {
    if (!unlocked) {
      logEvent({ type: 'locked', path: '/catalog', label: track.title });
      onLocked(track);
      return;
    }
    const next = !open;
    setOpen(next);
    if (next) {
      setShowText(true);
      logEvent({ type: 'play', path: '/catalog', label: track.title });
    }
  };

  const seek = (t?: number) => {
    if (typeof t !== 'number' || !audioRef.current) return;
    audioRef.current.currentTime = t;
    void audioRef.current.play();
  };

  return (
    <Card sx={{ opacity: unlocked ? 1 : 0.96 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'flex-start' } }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              flexGrow: 1,
              minWidth: 0,
            }}
          >
          <Box
            sx={{
              width: { xs: 40, sm: 46 },
              height: { xs: 40, sm: 46 },
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: unlocked ? 'primary.main' : 'grey.400',
              color: 'common.white',
              flexShrink: 0,
            }}
          >
            {track.kind === 'song' ? <MusicNoteIcon /> : <ForumIcon />}
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography
                variant="h6"
                sx={{ fontFamily: GREEK_FONT, fontSize: { xs: 20, sm: 22 }, fontWeight: 600 }}
              >
                {track.title}
              </Typography>
              {track.free ? (
                <Chip size="small" color="success" icon={<LockOpenIcon />} label="Бесплатно" />
              ) : (
                <Chip
                  size="small"
                  color={hasSubscription ? 'primary' : 'default'}
                  icon={<LockIcon />}
                  label={hasSubscription ? 'Доступно по подписке' : 'По подписке'}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {track.titleRu} · {track.artist}
            </Typography>

            <Stack direction="row" spacing={0.75} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
              {levelChips.map((l) => (
                <Chip key={l.id} size="small" variant="outlined" color="primary" label={l.code} />
              ))}
              {topicChips.map((t) => (
                <Chip key={t.id} size="small" variant="outlined" label={`${t.emoji} ${t.title}`} />
              ))}
              <Chip
                size="small"
                variant="outlined"
                label={track.kind === 'song' ? 'Песня' : 'Диалог'}
              />
            </Stack>
          </Box>
          </Box>

          <Stack
            direction={{ xs: 'row', sm: 'column' }}
            spacing={1}
            sx={{ alignItems: { xs: 'center', sm: 'flex-end' }, flexShrink: 0 }}
          >
            <Button
              variant={unlocked ? 'contained' : 'outlined'}
              startIcon={unlocked ? undefined : <LockIcon />}
              onClick={handleOpen}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              {unlocked ? (open ? 'Свернуть' : 'Слушать') : 'Открыть'}
            </Button>
            {unlocked && (
              <Tooltip title="Текст с переводом">
                <span>
                  <IconButton
                    onClick={() => {
                      setOpen(true);
                      setShowText((v) => !v);
                    }}
                    color={showText ? 'primary' : 'default'}
                  >
                    <SubtitlesIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <Collapse in={open && unlocked} unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Box
            component="audio"
            ref={audioRef}
            src={track.audioUrl}
            controls
            preload="none"
            onTimeUpdate={(e) => setTime((e.target as HTMLAudioElement).currentTime)}
            sx={{ width: '100%' }}
          />

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Button size="small" startIcon={<SubtitlesIcon />} onClick={() => setShowText((v) => !v)}>
              {showText ? 'Скрыть текст' : 'Показать текст'}
            </Button>
            <Button size="small" startIcon={<ReplayIcon />} onClick={() => seek(0)}>
              С начала
            </Button>
            {timed && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                Текст подсвечивается по ходу записи — нажмите на строку, чтобы перемотать.
              </Typography>
            )}
          </Stack>

          <Collapse in={showText}>
            <Box sx={{ mt: 2, bgcolor: 'action.hover', borderRadius: 2, p: { xs: 1.5, sm: 2 } }}>
              {track.lyrics.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Текст к этому материалу пока не добавлен.
                </Typography>
              )}
              <Stack spacing={1}>
                {track.lyrics.map((line, i) => {
                  const active = i === activeIndex;
                  return (
                    <Box
                      key={i}
                      onClick={() => seek(line.time)}
                      sx={{
                        cursor: typeof line.time === 'number' ? 'pointer' : 'default',
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        borderLeft: '3px solid',
                        borderColor: active ? 'secondary.main' : 'transparent',
                        bgcolor: active ? 'rgba(53,167,232,0.14)' : 'transparent',
                        transition: 'background-color .2s',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: GREEK_FONT,
                          fontSize: { xs: 18, sm: 19 },
                          fontWeight: active ? 700 : 500,
                          color: active ? 'primary.dark' : 'text.primary',
                        }}
                      >
                        {line.el}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {line.ru}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
              {track.note && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    <b>Заметка преподавателя:</b> {track.note}
                  </Typography>
                </>
              )}
            </Box>
          </Collapse>
        </Collapse>
      </CardContent>
    </Card>
  );
}
