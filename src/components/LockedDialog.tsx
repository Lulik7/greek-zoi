import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import type { Track } from '../types';
import { useApp } from '../store/AppContext';
import AuthDialog from './AuthDialog';

interface Props {
  track: Track | null;
  onClose: () => void;
}

export default function LockedDialog({ track, onClose }: Props) {
  const { user } = useApp();
  const nav = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Dialog open={!!track} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <LockIcon color="warning" /> Материал по подписке
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            «{track?.title}» входит в подписку школы. Один материал в каждой теме открыт всем —
            остальные доступны после оформления подписки.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            {user
              ? 'Вы уже вошли в аккаунт — осталось выбрать тариф. Доступ открывается сразу после оплаты.'
              : 'Зарегистрируйтесь (это займёт минуту), оплатите подписку — и все материалы откроются автоматически.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            <Button onClick={onClose} sx={{ flexGrow: 1 }}>
              Не сейчас
            </Button>
            {!user && (
              <Button variant="outlined" onClick={() => setAuthOpen(true)}>
                Войти
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => {
                onClose();
                nav('/subscribe');
              }}
            >
              Оформить подписку
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        reason="После входа вы сможете оформить подписку и слушать все материалы."
        onSuccess={onClose}
      />
    </>
  );
}
