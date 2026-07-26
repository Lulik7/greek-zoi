import { Box, Card, CardContent, Chip, Typography } from '@mui/material';

interface Props {
  title: string;
  description?: string;
  url: string;
  badge?: string;
}

/** Поддерживает YouTube/Vimeo (iframe) и прямые mp4-ссылки. */
export default function VideoBlock({ title, description, url, badge }: Props) {
  const isFile = /\.(mp4|webm|ogg)(\?|$)/i.test(url);

  return (
    <Card>
      <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: 'grey.900' }}>
        {url ? (
          isFile ? (
            <Box
              component="video"
              src={url}
              controls
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
          ) : (
            <Box
              component="iframe"
              src={url}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          )
        ) : (
          <Typography
            sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'grey.500' }}
          >
            Видео ещё не загружено
          </Typography>
        )}
      </Box>
      <CardContent>
        {badge && <Chip size="small" color="secondary" label={badge} sx={{ mb: 1 }} />}
        {title && <Typography variant="h6">{title}</Typography>}
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
