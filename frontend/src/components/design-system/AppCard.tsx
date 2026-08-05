import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { CardProps } from '@mui/material/Card';
import type { PropsWithChildren, ReactNode } from 'react';

type AppCardProps = PropsWithChildren<
  CardProps & {
    actions?: ReactNode;
  }
>;

export function AppCard({ actions, children, sx, ...props }: AppCardProps) {
  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        boxShadow: 2,
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: actions ? 2 : 3 } }}>{children}</CardContent>
      {actions}
    </Card>
  );
}
