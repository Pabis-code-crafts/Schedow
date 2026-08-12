import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';

import { AppCard, EmptyState, PageHeader, SectionTitle } from '@/components/design-system';
import { useCreateShiftTemplate, useShiftTemplates } from '@/features/schedule/queries';
import type {
  CreateShiftPayload,
  ListResponse,
  ShiftTemplateDto,
} from '@/features/schedule/types';
import { useRegisterUser, useWorkers } from '@/features/users/queries';
import type { RegisterUserPayload, UserResponse, UserRole } from '@/features/users/types';
import { getApiErrorMessage } from '@/services/api';

const initialStaffForm: RegisterUserPayload = {
  name: '',
  email: '',
  password: '',
  role: 'WORKER',
  site: '',
  contractedHours: 20,
};

const initialShiftForm: CreateShiftPayload = {
  name: '',
  startTime: '',
  endTime: '',
};

type ManagementTab = 'workers' | 'shifts';

type ToastState = {
  message: string;
  severity: 'success' | 'error';
} | null;

export function WorkersPage() {
  const [activeTab, setActiveTab] = useState<ManagementTab>('workers');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [staffForm, setStaffForm] = useState<RegisterUserPayload>(initialStaffForm);
  const [shiftForm, setShiftForm] = useState<CreateShiftPayload>(initialShiftForm);
  const [toast, setToast] = useState<ToastState>(null);
  const workersQuery = useWorkers();
  const shiftTemplatesQuery = useShiftTemplates();
  const registerUserMutation = useRegisterUser();
  const createShiftMutation = useCreateShiftTemplate();
  const workers = workersQuery.data ?? [];
  const shiftTemplates = useMemo(
    () => normalizeShiftTemplates(shiftTemplatesQuery.data),
    [shiftTemplatesQuery.data],
  );

  const closeStaffDialog = () => {
    if (registerUserMutation.isPending) {
      return;
    }

    setIsAddStaffOpen(false);
    setStaffForm(initialStaffForm);
    registerUserMutation.reset();
  };

  const closeShiftDialog = () => {
    if (createShiftMutation.isPending) {
      return;
    }

    setIsAddShiftOpen(false);
    setShiftForm(initialShiftForm);
    createShiftMutation.reset();
  };

  return (
    <>
      <Stack spacing={3}>
        <PageHeader
          eyebrow="Admin"
          subtitle="Manage staff and shift templates from one compact workspace. Schedule remains focused on weekly assignments."
          title="People & Shifts"
        />

        <AppCard sx={{ p: 1 }}>
          <Tabs
            onChange={(_, value: ManagementTab) => setActiveTab(value)}
            value={activeTab}
            variant="scrollable"
          >
            <Tab icon={<GroupsRoundedIcon />} iconPosition="start" label="Workers" value="workers" />
            <Tab icon={<CalendarMonthRoundedIcon />} iconPosition="start" label="Shifts" value="shifts" />
          </Tabs>
        </AppCard>

        {activeTab === 'workers' ? (
          <WorkersTab
            error={workersQuery.error}
            isError={workersQuery.isError}
            isLoading={workersQuery.isLoading}
            workers={workers}
            onAddStaff={() => setIsAddStaffOpen(true)}
          />
        ) : (
          <ShiftsTab
            error={shiftTemplatesQuery.error}
            isError={shiftTemplatesQuery.isError}
            isLoading={shiftTemplatesQuery.isLoading}
            shifts={shiftTemplates}
          />
        )}
      </Stack>

      <AddStaffDialog
        form={staffForm}
        isSubmitting={registerUserMutation.isPending}
        open={isAddStaffOpen}
        submitError={getMutationErrorMessage(registerUserMutation.error, 'Could not add staff.')}
        onChange={setStaffForm}
        onClose={closeStaffDialog}
        onSubmit={() => {
          registerUserMutation.mutate(staffForm, {
            onError: (error) => {
              setToast({
                message: getApiErrorMessage(error, 'Could not add staff.'),
                severity: 'error',
              });
            },
            onSuccess: () => {
              setToast({ message: 'Staff member added.', severity: 'success' });
              closeStaffDialog();
            },
          });
        }}
      />

      <AddShiftDialog
        form={shiftForm}
        isSubmitting={createShiftMutation.isPending}
        open={isAddShiftOpen}
        submitError={getMutationErrorMessage(createShiftMutation.error, 'Could not add shift.')}
        onChange={setShiftForm}
        onClose={closeShiftDialog}
        onSubmit={() => {
          createShiftMutation.mutate(shiftForm, {
            onError: (error) => {
              setToast({
                message: getApiErrorMessage(error, 'Could not add shift.'),
                severity: 'error',
              });
            },
            onSuccess: () => {
              setToast({ message: 'Shift template added.', severity: 'success' });
              closeShiftDialog();
            },
          });
        }}
      />

      <Snackbar
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        autoHideDuration={4200}
        onClose={() => setToast(null)}
        open={Boolean(toast)}
      >
        <Alert onClose={() => setToast(null)} severity={toast?.severity ?? 'success'} variant="filled">
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

type WorkersTabProps = {
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  workers: UserResponse[];
  onAddStaff: () => void;
};

function WorkersTab({ error, isError, isLoading, onAddStaff, workers }: WorkersTabProps) {
  return (
    <AppCard>
      <Stack spacing={3}>
        <Stack
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
        >
          <SectionTitle
            description="Staff records are loaded from the existing User Service."
            title="Worker directory"
          />
          <Button onClick={onAddStaff} startIcon={<AddRoundedIcon />} variant="contained">
            Add Staff
          </Button>
        </Stack>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert severity="error">{getApiErrorMessage(error, 'Could not load workers.')}</Alert>
        ) : workers.length === 0 ? (
          <EmptyState
            action={
              <Button onClick={onAddStaff} startIcon={<AddRoundedIcon />} variant="contained">
                Add Staff
              </Button>
            }
            description="Add staff before assigning shifts in the schedule workspace."
            icon={<GroupsRoundedIcon />}
            title="No workers found"
          />
        ) : (
          <Stack spacing={1.25}>
            {workers.map((worker) => (
              <WorkerRow key={worker.id} worker={worker} />
            ))}
          </Stack>
        )}
      </Stack>
    </AppCard>
  );
}

type WorkerRowProps = {
  worker: UserResponse;
};

function WorkerRow({ worker }: WorkerRowProps) {
  const isActive = worker.active !== false;

  return (
    <Box
      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        justifyContent: 'space-between',
        p: 1.5,
      }}
    >
      <Stack alignItems="center" direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
        <Avatar
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: 'primary.dark',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {getInitials(worker.name)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography noWrap variant="subtitle2">
              {worker.name}
            </Typography>
            <Chip
              color={isActive ? 'success' : 'default'}
              label={isActive ? 'Active' : 'Inactive'}
              size="small"
              variant="outlined"
            />
          </Stack>
          <Typography color="text.secondary" noWrap variant="caption">
            {worker.email} - {worker.site || 'No site'} - {worker.contractedHours ?? 0}h contracted
          </Typography>
        </Box>
      </Stack>
      <UnavailableActions itemLabel="worker" />
    </Box>
  );
}

type ShiftsTabProps = {
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  shifts: ShiftTemplateDto[];
};

function ShiftsTab({ error, isError, isLoading, shifts }: ShiftsTabProps) {
  return (
    <AppCard>
      <Stack spacing={3}>
        <Stack
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
        >
          <SectionTitle
            description="Shift templates are loaded from the existing Schedule Service."
            title="Shift templates"
          />
          <Tooltip title="Coming Soon"><span><Button disabled startIcon={<AddRoundedIcon />} variant="contained">Add Shift</Button></span></Tooltip>
        </Stack>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert severity="error">{getApiErrorMessage(error, 'Could not load shifts.')}</Alert>
        ) : shifts.length === 0 ? (
          <EmptyState
            action={
              <Tooltip title="Coming Soon"><span><Button disabled startIcon={<AddRoundedIcon />} variant="contained">Add Shift</Button></span></Tooltip>
            }
            description="Create shift templates here, then assign workers from the Schedule page."
            icon={<CalendarMonthRoundedIcon />}
            title="No shift templates found"
          />
        ) : (
          <Stack spacing={1.25}>
            {shifts.map((shift, index) => (
              <ShiftRow key={getShiftId(shift, index)} shift={shift} />
            ))}
          </Stack>
        )}
      </Stack>
    </AppCard>
  );
}

type ShiftRowProps = {
  shift: ShiftTemplateDto;
};

function ShiftRow({ shift }: ShiftRowProps) {
  return (
    <Box
      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        justifyContent: 'space-between',
        p: 1.5,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap variant="subtitle2">
          {shift.name ?? shift.shiftName ?? 'Missing shift name'}
        </Typography>
        <Typography color="text.secondary" noWrap variant="caption">
          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
        </Typography>
      </Box>
      <UnavailableActions itemLabel="shift template" />
    </Box>
  );
}

type UnavailableActionsProps = {
  itemLabel: string;
};

function UnavailableActions({ itemLabel }: UnavailableActionsProps) {
  const message = `No backend endpoint is currently exposed to edit or delete this ${itemLabel}.`;

  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title={message}>
        <span>
          <Button disabled size="small" startIcon={<EditRoundedIcon />} variant="outlined">
            Edit
          </Button>
        </span>
      </Tooltip>
      <Tooltip title={message}>
        <span>
          <Button
            disabled
            color="error"
            size="small"
            startIcon={<DeleteOutlineRoundedIcon />}
            variant="outlined"
          >
            Delete
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}

function ListSkeleton() {
  return (
    <Stack spacing={1.25}>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton height={72} key={index} sx={{ borderRadius: 3 }} variant="rounded" />
      ))}
    </Stack>
  );
}

type AddStaffDialogProps = {
  form: RegisterUserPayload;
  isSubmitting: boolean;
  open: boolean;
  submitError?: string;
  onChange: (form: RegisterUserPayload) => void;
  onClose: () => void;
  onSubmit: () => void;
};

function AddStaffDialog({
  form,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
  open,
  submitError,
}: AddStaffDialogProps) {
  const canSubmit = Boolean(
    form.name.trim() &&
      form.email.trim() &&
      form.password.trim() &&
      form.site.trim() &&
      Number.isFinite(form.contractedHours),
  );

  return (
    <Dialog fullWidth maxWidth="sm" onClose={isSubmitting ? undefined : onClose} open={open}>
      <DialogTitle>Add Staff</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            disabled={isSubmitting}
            label="Name"
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            value={form.name}
          />
          <TextField
            disabled={isSubmitting}
            label="Email"
            onChange={(event) => onChange({ ...form, email: event.target.value })}
            type="email"
            value={form.email}
          />
          <TextField
            disabled={isSubmitting}
            label="Temporary password"
            onChange={(event) => onChange({ ...form, password: event.target.value })}
            type="password"
            value={form.password}
          />
          <TextField
            disabled={isSubmitting}
            label="Role"
            onChange={(event) => onChange({ ...form, role: event.target.value as UserRole })}
            select
            value={form.role}
          >
            {(['WORKER', 'SUPERVISOR', 'ADMIN'] satisfies UserRole[]).map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            disabled={isSubmitting}
            label="Site"
            onChange={(event) => onChange({ ...form, site: event.target.value })}
            value={form.site}
          />
          <TextField
            disabled={isSubmitting}
            inputProps={{ min: 0 }}
            label="Contracted hours"
            onChange={(event) => onChange({ ...form, contractedHours: Number(event.target.value) })}
            type="number"
            value={form.contractedHours}
          />
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={isSubmitting} onClick={onClose} variant="text">
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || !canSubmit}
          onClick={onSubmit}
          startIcon={isSubmitting ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />}
          variant="contained"
        >
          {isSubmitting ? 'Adding...' : 'Add Staff'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type AddShiftDialogProps = {
  form: CreateShiftPayload;
  isSubmitting: boolean;
  open: boolean;
  submitError?: string;
  onChange: (form: CreateShiftPayload) => void;
  onClose: () => void;
  onSubmit: () => void;
};

function AddShiftDialog({
  form,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
  open,
  submitError,
}: AddShiftDialogProps) {
  const canSubmit = Boolean(form.name.trim() && form.startTime && form.endTime);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={isSubmitting ? undefined : onClose} open={open}>
      <DialogTitle>Add Shift</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            disabled={isSubmitting}
            label="Shift name"
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            value={form.name}
          />
          <TextField
            disabled={isSubmitting}
            InputLabelProps={{ shrink: true }}
            label="Start time"
            onChange={(event) => onChange({ ...form, startTime: event.target.value })}
            type="time"
            value={form.startTime}
          />
          <TextField
            disabled={isSubmitting}
            InputLabelProps={{ shrink: true }}
            label="End time"
            onChange={(event) => onChange({ ...form, endTime: event.target.value })}
            type="time"
            value={form.endTime}
          />
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={isSubmitting} onClick={onClose} variant="text">
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || !canSubmit}
          onClick={onSubmit}
          startIcon={isSubmitting ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />}
          variant="contained"
        >
          {isSubmitting ? 'Adding...' : 'Add Shift'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function normalizeShiftTemplates(response?: ListResponse<ShiftTemplateDto>): ShiftTemplateDto[] {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  return response.shifts ?? response.data ?? response.items ?? response.content ?? [];
}

function getShiftId(shift: ShiftTemplateDto, index: number): string {
  return String(shift.id ?? shift.shiftTemplateId ?? shift.templateId ?? `shift-${index}`);
}

function formatTime(value?: string): string {
  return value || 'Missing time';
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'ST'
  );
}

function getMutationErrorMessage(error: unknown, fallback: string): string | undefined {
  if (!error) {
    return undefined;
  }

  return getApiErrorMessage(error, fallback);
}



