import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
  AppCard,
  EmptyState,
  PageHeader,
  SectionTitle,
  StatCard,
} from '@/components/design-system';
import {
  useCreateScheduleAssignment,
  useScheduleWorkspace,
} from '@/features/schedule/queries';
import type {
  ScheduledShift,
  ScheduleWorker,
  ShiftTemplate,
  WeeklySchedule,
  WeekDay,
} from '@/features/schedule/types';

type Selection =
  | { type: 'none' }
  | { type: 'shift'; shiftId: string }
  | { type: 'multi'; shiftIds: string[] }
  | { type: 'day'; dayId: string }
  | { type: 'week' };

type AssignmentDraft = {
  day: WeekDay;
  template: ShiftTemplate;
};

type CellActionContext =
  | {
      type: 'empty';
      day: WeekDay;
      template: ShiftTemplate;
    }
  | {
      type: 'assigned';
      day: WeekDay;
      shift: ScheduledShift;
      template: ShiftTemplate;
    };

type CellActionMenuState = {
  anchorEl: HTMLElement;
  context: CellActionContext;
} | null;

const weekTitleFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function SchedulePage() {
  const [weekStartDate, setWeekStartDate] = useState(() => getCurrentWeekStartDate());
  const [selection, setSelection] = useState<Selection>({ type: 'none' });
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [assignmentDraft, setAssignmentDraft] = useState<AssignmentDraft | null>(null);
  const [cellActionMenu, setCellActionMenu] = useState<CellActionMenuState>(null);
  const { data: schedule, error, isError, isFetching, isLoading, refetch } =
    useScheduleWorkspace(weekStartDate);
  const createAssignmentMutation = useCreateScheduleAssignment(weekStartDate);
  const isScheduleLoading = isLoading || isFetching;

  const selectedShift =
    schedule && selection.type === 'shift'
      ? schedule.shifts.find((shift) => shift.id === selection.shiftId)
      : undefined;

  const selectionSummary = useMemo(
    () => getSelectionSummary(selection, schedule),
    [schedule, selection],
  );

  const metrics = useMemo(() => getScheduleMetrics(schedule), [schedule]);

  const changeWeek = (days: number) => {
    setWeekStartDate((current) => toDateId(addDays(parseLocalDate(current), days)));
  };

  const selectDate = (date: string) => {
    if (!date) {
      return;
    }

    setWeekStartDate(getWeekStartDate(date));
  };

  const selectToday = () => {
    setWeekStartDate(getCurrentWeekStartDate());
  };

  useEffect(() => {
    if (!schedule) {
      return;
    }

    setSelection((current) => reconcileSelection(current, schedule));
  }, [schedule]);

  const handleShiftClick = (event: MouseEvent, shift: ScheduledShift) => {
    setAiPanelOpen(true);

    if (event.metaKey || event.ctrlKey) {
      setSelection((current) => {
        const currentIds =
          current.type === 'multi'
            ? current.shiftIds
            : current.type === 'shift'
              ? [current.shiftId]
              : [];
        const nextIds = currentIds.includes(shift.id)
          ? currentIds.filter((id) => id !== shift.id)
          : [...currentIds, shift.id];

        if (nextIds.length === 0) {
          return { type: 'none' };
        }

        if (nextIds.length === 1) {
          return { type: 'shift', shiftId: nextIds[0] };
        }

        return { type: 'multi', shiftIds: nextIds };
      });
      return;
    }

    setSelection((current) =>
      current.type === 'shift' && current.shiftId === shift.id
        ? { type: 'none' }
        : { type: 'shift', shiftId: shift.id },
    );
  };

  return (
    <>
      <Stack spacing={4}>
        <PageHeader
          eyebrow="Schedule workspace"
          subtitle="A clean weekly planning canvas built from backend shift templates, selected dates, and assigned workers."
          title="Weekly workforce plan"
        />

        <ScheduleWeekToolbar
          datePickerValue={weekStartDate}
          isFetching={isFetching}
          isWeekSelected={selection.type === 'week'}
          weekLabel={schedule?.weekLabel ?? formatWeekLabel(weekStartDate)}
          onChangeWeek={changeWeek}
          onSelectDate={selectDate}
          onSelectToday={selectToday}
          onSelectWeek={() => {
            setSelection((current) =>
              current.type === 'week' ? { type: 'none' } : { type: 'week' },
            );
            setAiPanelOpen(true);
          }}
        />

        {isScheduleLoading ? (
          <ScheduleMetricsSkeleton />
        ) : (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
            <StatCard
              helperText={`${metrics.totalShifts} schedule cells this week`}
              icon={<GroupsRoundedIcon />}
              title="Assigned shifts"
              tone="success"
              trend={{ direction: 'flat', label: 'Live data' }}
              value={String(metrics.totalAssigned)}
            />
            <StatCard
              helperText="Ready for manager action"
              icon={<AddRoundedIcon />}
              title="Open cells"
              tone={metrics.unassignedCount > 0 ? 'warning' : 'success'}
              trend={{ direction: 'flat', label: 'MVP view' }}
              value={String(metrics.unassignedCount)}
            />
            <StatCard
              helperText="Scheduling copilot suggestions"
              icon={<AutoAwesomeRoundedIcon />}
              title="AI signals"
              tone="info"
              trend={{ direction: 'flat', label: 'Available' }}
              value={String(metrics.aiReadyCount)}
            />
          </Stack>
        )}

        {selection.type !== 'none' && schedule ? (
          <ContextToolbar
            selection={selection}
            selectionSummary={selectionSummary}
            onClear={() => setSelection({ type: 'none' })}
            onOpenAi={() => setAiPanelOpen(true)}
          />
        ) : null}

        <Stack alignItems="flex-start" direction={{ xs: 'column', xl: 'row' }} spacing={3}>
          <AppCard sx={{ flex: 1, minWidth: 0, overflow: 'hidden', width: '100%' }}>
            {isScheduleLoading ? (
              <ScheduleWorkspaceSkeleton />
            ) : isError ? (
              <ScheduleErrorState
                message={getErrorMessage(error)}
                onRetry={() => {
                  void refetch();
                }}
              />
            ) : schedule && schedule.shiftTemplates.length > 0 ? (
              <Stack
                key={schedule.weekStartDate}
                spacing={3}
                sx={{
                  animation: 'scheduleWeekIn 180ms ease-out',
                  '@keyframes scheduleWeekIn': {
                    from: { opacity: 0.72, transform: 'translateY(4px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Stack
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <SectionTitle
                    description="Rows come from backend shift templates. Columns represent the selected week."
                    title={schedule.weekLabel}
                  />
                </Stack>

                <ScheduleGrid
                  schedule={schedule}
                  selection={selection}
                  onSelectDay={(dayId) => {
                    setSelection((current) =>
                      current.type === 'day' && current.dayId === dayId
                        ? { type: 'none' }
                        : { type: 'day', dayId },
                    );
                    setAiPanelOpen(true);
                  }}
                  onSelectShift={handleShiftClick}
                  onSelectEmptyCell={(day, template) => {
                    setSelection((current) => {
                      const emptyCellId = getEmptyCellSelectionId(day.id, template.id);

                      return current.type === 'shift' && current.shiftId === emptyCellId
                        ? { type: 'none' }
                        : { type: 'shift', shiftId: emptyCellId };
                    });
                    setAiPanelOpen(true);
                  }}
                  onOpenCellActions={(anchorEl, context) => setCellActionMenu({ anchorEl, context })}
                />
              </Stack>
            ) : (
              <EmptyState
                action={
                  <Button onClick={() => void refetch()} variant="outlined">
                    Refresh
                  </Button>
                }
                icon={<CalendarMonthRoundedIcon />}
                title="No assignments for this week"
                description="Once the backend returns shift assignments, this workspace will render the week dynamically from that data."
              />
            )}
          </AppCard>

          {aiPanelOpen && schedule && schedule.shiftTemplates.length > 0 ? (
            <AIPanel
              schedule={schedule}
              selectedShift={selectedShift}
              selection={selection}
              selectionSummary={selectionSummary}
              onClose={() => setAiPanelOpen(false)}
            />
          ) : null}
        </Stack>
      </Stack>

      {!aiPanelOpen && schedule && schedule.shiftTemplates.length > 0 ? (
        <Tooltip title="Open Schedow AI">
          <Button
            color="primary"
            onClick={() => setAiPanelOpen(true)}
            size="large"
            startIcon={<AutoAwesomeRoundedIcon />}
            sx={{
              bottom: { xs: 20, sm: 28 },
              boxShadow: 5,
              position: 'fixed',
              right: { xs: 20, sm: 32 },
              zIndex: (theme) => theme.zIndex.drawer - 1,
            }}
            variant="contained"
          >
            Schedow AI
          </Button>
        </Tooltip>
      ) : null}

      {schedule ? (
        <AssignWorkerDialog
          draft={assignmentDraft}
          isSubmitting={createAssignmentMutation.isPending}
          isSubmitDisabled={
            assignmentDraft ? !isNumericId(assignmentDraft.template.id) : false
          }
          submitError={getMutationErrorMessage(createAssignmentMutation.error)}
          workers={schedule.workers}
          onClose={() => {
            if (!createAssignmentMutation.isPending) {
              setAssignmentDraft(null);
              createAssignmentMutation.reset();
            }
          }}
          onSubmit={async (workerId) => {
            if (!assignmentDraft) {
              return;
            }

            createAssignmentMutation.reset();

            const assignedUserId = toNumericId(workerId);
            const shiftId = toNumericId(assignmentDraft.template.id);

            try {
              await createAssignmentMutation.mutateAsync({
                weekStartDate,
                dayOfWeek: toJavaDayOfWeek(assignmentDraft.day.fullLabel),
                assignedUserId,
                shiftId,
              });
              setAssignmentDraft(null);
            } catch {
              // React Query stores the API error; the dialog renders it via submitError.
            }
          }}
        />
      ) : null}

      <CellActionMenu
        menuState={cellActionMenu}
        onClose={() => setCellActionMenu(null)}
        onAskAi={(context) => {
          setCellActionMenu(null);
          setAiPanelOpen(true);
          if (context.type === 'empty') {
            setSelection({
              type: 'shift',
              shiftId: getEmptyCellSelectionId(context.day.id, context.template.id),
            });
          } else {
            setSelection({ type: 'shift', shiftId: context.shift.id });
          }
        }}
        onAssignWorker={(day, template) => {
          setCellActionMenu(null);
          setAssignmentDraft({ day, template });
        }}
      />
    </>
  );
}

type ScheduleWeekToolbarProps = {
  datePickerValue: string;
  isFetching: boolean;
  isWeekSelected: boolean;
  weekLabel: string;
  onChangeWeek: (days: number) => void;
  onSelectDate: (date: string) => void;
  onSelectToday: () => void;
  onSelectWeek: () => void;
};

function ScheduleWeekToolbar({
  datePickerValue,
  isFetching,
  isWeekSelected,
  onChangeWeek,
  onSelectDate,
  onSelectToday,
  onSelectWeek,
  weekLabel,
}: ScheduleWeekToolbarProps) {
  return (
    <AppCard
      sx={{
        bgcolor: (theme) => alpha(theme.palette.grey[100], 0.62),
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
        boxShadow: 2,
      }}
    >
      <Stack
        alignItems={{ xs: 'stretch', lg: 'center' }}
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            disabled={isFetching}
            onClick={() => onChangeWeek(-7)}
            startIcon={<ChevronLeftRoundedIcon />}
            variant="outlined"
          >
            Previous Week
          </Button>
          <Button
            disabled={isFetching}
            endIcon={<ChevronRightRoundedIcon />}
            onClick={() => onChangeWeek(7)}
            variant="outlined"
          >
            Next Week
          </Button>
          <Button disabled={isFetching} onClick={onSelectToday} variant="text">
            Today
          </Button>
        </Stack>

        <Box sx={{ textAlign: { xs: 'left', lg: 'center' } }}>
          <Typography color="text.secondary" variant="caption">
            Viewing
          </Typography>
          <Typography color="text.primary" variant="h5">
            {weekLabel}
          </Typography>
        </Box>

        <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            InputLabelProps={{ shrink: true }}
            disabled={isFetching}
            inputProps={{ 'aria-label': 'Pick schedule date' }}
            label="Pick date"
            onChange={(event) => onSelectDate(event.target.value)}
            size="small"
            type="date"
            value={datePickerValue}
            sx={{
              minWidth: { xs: '100%', sm: 180 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 3,
              },
            }}
          />
          <Button
            color={isWeekSelected ? 'primary' : 'secondary'}
            disabled={isFetching}
            onClick={onSelectWeek}
            startIcon={<CalendarMonthRoundedIcon />}
            variant={isWeekSelected ? 'contained' : 'outlined'}
          >
            Select Week
          </Button>
        </Stack>
      </Stack>
    </AppCard>
  );
}

type ScheduleGridProps = {
  schedule: WeeklySchedule;
  selection: Selection;
  onSelectDay: (dayId: string) => void;
  onSelectShift: (event: MouseEvent, shift: ScheduledShift) => void;
  onSelectEmptyCell: (day: WeekDay, template: ShiftTemplate) => void;
  onOpenCellActions: (anchorEl: HTMLElement, context: CellActionContext) => void;
};

function ScheduleGrid({
  onOpenCellActions,
  onSelectDay,
  onSelectEmptyCell,
  onSelectShift,
  schedule,
  selection,
}: ScheduleGridProps) {
  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '140px repeat(7, minmax(170px, 1fr))',
            lg: '168px repeat(7, minmax(180px, 1fr))',
          },
          minWidth: 1360,
        }}
      >
        <Box />
        {schedule.days.map((day) => (
          <DayHeader
            day={day}
            isSelected={selection.type === 'day' ? selection.dayId === day.id : selection.type === 'week'}
            key={day.id}
            onClick={() => onSelectDay(day.id)}
          />
        ))}

        {schedule.shiftTemplates.map((template) => (
          <ScheduleRow
            key={template.id}
            onOpenCellActions={onOpenCellActions}
            onSelectEmptyCell={onSelectEmptyCell}
            onSelectShift={onSelectShift}
            schedule={schedule}
            selection={selection}
            template={template}
          />
        ))}
      </Box>
    </Box>
  );
}

type ScheduleRowProps = {
  schedule: WeeklySchedule;
  template: ShiftTemplate;
  selection: Selection;
  onSelectShift: (event: MouseEvent, shift: ScheduledShift) => void;
  onSelectEmptyCell: (day: WeekDay, template: ShiftTemplate) => void;
  onOpenCellActions: (anchorEl: HTMLElement, context: CellActionContext) => void;
};

function ScheduleRow({
  onOpenCellActions,
  onSelectEmptyCell,
  onSelectShift,
  schedule,
  selection,
  template,
}: ScheduleRowProps) {
  return (
    <>
      <Box
        sx={{
          alignSelf: 'stretch',
          bgcolor: (theme) => alpha(theme.palette.grey[100], 0.6),
          border: 1,
          borderColor: 'divider',
          borderRadius: 4,
          p: 2,
        }}
      >
        <Typography color="text.primary" variant="subtitle2">
          {template.name}
        </Typography>
        <Typography color="text.secondary" mt={0.5} variant="caption">
          Start {formatTimeField(template.startTime)}
        </Typography>
        <Typography color="text.secondary" display="block" variant="caption">
          End {formatTimeField(template.endTime)}
        </Typography>
      </Box>
      {schedule.days.map((day) => {
        const shift = getShift(schedule, day.id, template.id);

        return shift ? (
          <ShiftCell
            day={day}
            isSelected={isShiftSelected(schedule, selection, shift.id)}
            key={shift.id}
            onClick={(event) => onSelectShift(event, shift)}
            onOpenActions={(anchorEl) =>
              onOpenCellActions(anchorEl, { type: 'assigned', day, shift, template })
            }
            shift={shift}
            template={template}
          />
        ) : (
          <EmptyShiftCell
            day={day}
            isSelected={isShiftSelected(
              schedule,
              selection,
              getEmptyCellSelectionId(day.id, template.id),
            )}
            key={`${day.id}-${template.id}`}
            template={template}
            onClick={() => onSelectEmptyCell(day, template)}
            onOpenActions={(anchorEl) =>
              onOpenCellActions(anchorEl, { type: 'empty', day, template })
            }
          />
        );
      })}
    </>
  );
}

type DayHeaderProps = {
  day: WeekDay;
  isSelected: boolean;
  onClick: () => void;
};

function DayHeader({ day, isSelected, onClick }: DayHeaderProps) {
  return (
    <ButtonBase onClick={onClick} sx={{ borderRadius: 4, display: 'block', textAlign: 'left' }}>
      <Box
        sx={{
          bgcolor: isSelected ? 'primary.main' : (theme) => alpha(theme.palette.grey[100], 0.78),
          border: 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          borderRadius: 4,
          color: isSelected ? 'primary.contrastText' : 'text.primary',
          p: 2,
          transition: (theme) => theme.transitions.create(['background-color', 'box-shadow']),
          '&:hover': { boxShadow: 2 },
        }}
      >
        <Typography variant="subtitle2">{day.fullLabel}</Typography>
        <Typography
          color={isSelected ? 'inherit' : 'text.secondary'}
          display="block"
          mt={0.5}
          variant="caption"
        >
          {day.date}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

type ShiftCellProps = {
  day: WeekDay;
  shift: ScheduledShift;
  template: ShiftTemplate;
  isSelected: boolean;
  onClick: (event: MouseEvent) => void;
  onOpenActions: (anchorEl: HTMLElement) => void;
};

function ShiftCell({ isSelected, onClick, onOpenActions, shift, template }: ShiftCellProps) {
  const assignedWorker = shift.assignedWorkers[0];

  return (
    <ButtonBase
      onClick={onClick}
      sx={{ borderRadius: 4, display: 'block', height: '100%', textAlign: 'left' }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          borderRadius: 4,
          boxShadow: isSelected ? 4 : 1,
          minHeight: 150,
          outline: isSelected ? '3px solid' : '0 solid transparent',
          outlineColor: (theme) => alpha(theme.palette.primary.main, 0.18),
          p: 1.75,
          position: 'relative',
          '& .cell-action-button': {
            opacity: isSelected ? 1 : 0,
            pointerEvents: isSelected ? 'auto' : 'none',
            transform: isSelected ? 'scale(1)' : 'scale(0.94)',
          },
          transition: (theme) =>
            theme.transitions.create(['border-color', 'box-shadow', 'transform', 'outline-color'], {
              duration: theme.transitions.duration.short,
            }),
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 3,
            transform: 'translateY(-2px)',
            '& .cell-action-button': {
              opacity: 1,
              pointerEvents: 'auto',
              transform: 'scale(1)',
            },
          },
        }}
      >
        <CellActionButton onOpenActions={onOpenActions} />
        <Stack justifyContent="space-between" spacing={2} sx={{ minHeight: 120 }}>
          <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap variant="subtitle2">
                {template.name}
              </Typography>
              <Typography color="text.secondary" display="block" mt={0.25} variant="caption">
                {formatShiftTime(template)}
              </Typography>
            </Box>
          </Stack>

          {assignedWorker ? (
            <Stack alignItems="center" direction="row" spacing={1.25}>
              <Avatar
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.dark',
                  fontSize: 12,
                  fontWeight: 700,
                  height: 32,
                  width: 32,
                }}
              >
                {assignedWorker.initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap variant="body2">
                  {assignedWorker.name}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Stack alignItems="center" direction="row" spacing={1.25}>
              <AddRoundedIcon color="secondary" fontSize="small" />
              <Typography color="text.secondary" variant="caption">
                Unassigned
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </ButtonBase>
  );
}

type EmptyShiftCellProps = {
  day: WeekDay;
  isSelected: boolean;
  template: ShiftTemplate;
  onClick: () => void;
  onOpenActions: (anchorEl: HTMLElement) => void;
};

function EmptyShiftCell({
  day,
  isSelected,
  onClick,
  onOpenActions,
  template,
}: EmptyShiftCellProps) {
  return (
    <ButtonBase
      aria-label={`Select ${template.name} on ${day.fullLabel}`}
      onClick={onClick}
      sx={{
        borderRadius: 4,
        display: 'block',
        height: '100%',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.55),
          border: 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          borderRadius: 4,
          borderStyle: 'dashed',
          display: 'flex',
          minHeight: 150,
          outline: isSelected ? '3px solid' : '0 solid transparent',
          outlineColor: (theme) => alpha(theme.palette.primary.main, 0.18),
          p: 2,
          position: 'relative',
          '& .cell-action-button': {
            opacity: isSelected ? 1 : 0,
            pointerEvents: isSelected ? 'auto' : 'none',
            transform: isSelected ? 'scale(1)' : 'scale(0.94)',
          },
          transition: (theme) =>
            theme.transitions.create([
              'background-color',
              'border-color',
              'box-shadow',
              'outline-color',
              'transform',
            ]),
          '&:hover': {
            bgcolor: 'background.paper',
            borderColor: 'primary.main',
            boxShadow: 2,
            transform: 'translateY(-2px)',
            '& .cell-action-button': {
              opacity: 1,
              pointerEvents: 'auto',
              transform: 'scale(1)',
            },
          },
        }}
      >
        <CellActionButton onOpenActions={onOpenActions} />
        <Stack alignItems="center" spacing={1} sx={{ width: '100%' }}>
          <AddRoundedIcon color="secondary" />
          <Typography color="text.secondary" variant="caption">
            Assign worker
          </Typography>
        </Stack>
      </Box>
    </ButtonBase>
  );
}

type CellActionButtonProps = {
  onOpenActions: (anchorEl: HTMLElement) => void;
};

function CellActionButton({ onOpenActions }: CellActionButtonProps) {
  return (
    <IconButton
      aria-label="Open cell actions"
      className="cell-action-button"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onOpenActions(event.currentTarget);
      }}
      size="small"
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        boxShadow: 1,
        height: 28,
        position: 'absolute',
        right: 10,
        top: 10,
        transition: (theme) =>
          theme.transitions.create(['opacity', 'transform', 'background-color']),
        width: 28,
        zIndex: 2,
        '&:hover': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        },
      }}
    >
      <MoreHorizRoundedIcon sx={{ fontSize: 18 }} />
    </IconButton>
  );
}

type CellActionMenuProps = {
  menuState: CellActionMenuState;
  onAssignWorker: (day: WeekDay, template: ShiftTemplate) => void;
  onAskAi: (context: CellActionContext) => void;
  onClose: () => void;
};

function CellActionMenu({
  menuState,
  onAskAi,
  onAssignWorker,
  onClose,
}: CellActionMenuProps) {
  const context = menuState?.context;

  return (
    <Menu
      anchorEl={menuState?.anchorEl ?? null}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      onClose={onClose}
      open={Boolean(menuState)}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      slotProps={{
        paper: {
          sx: {
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: 4,
            minWidth: 190,
            mt: 1,
            py: 0.75,
          },
        },
      }}
    >
      {context?.type === 'empty' ? (
        <MenuItem onClick={() => onAssignWorker(context.day, context.template)}>
          Assign Worker
        </MenuItem>
      ) : null}
      {context?.type === 'assigned' ? (
        <MenuItem onClick={onClose}>Edit Assignment</MenuItem>
      ) : null}
      {context?.type === 'assigned' ? (
        <MenuItem onClick={onClose}>Remove Assignment</MenuItem>
      ) : null}
      {context ? <MenuItem onClick={() => onAskAi(context)}>Ask Schedow AI</MenuItem> : null}
    </Menu>
  );
}

type AssignWorkerDialogProps = {
  draft: AssignmentDraft | null;
  workers: ScheduleWorker[];
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  submitError?: string;
  onClose: () => void;
  onSubmit: (workerId: string) => Promise<void>;
};

function AssignWorkerDialog({
  draft,
  isSubmitDisabled,
  isSubmitting,
  onClose,
  onSubmit,
  submitError,
  workers,
}: AssignWorkerDialogProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (draft) {
      setSelectedWorkerId('');
      setValidationError('');
    }
  }, [draft]);

  const handleSubmit = async () => {
    if (!selectedWorkerId) {
      setValidationError('Select a worker before creating the assignment.');
      return;
    }

    if (!isNumericId(selectedWorkerId)) {
      setValidationError('The selected worker is missing a numeric backend id.');
      return;
    }

    if (isSubmitDisabled) {
      setValidationError('The selected shift is missing a numeric backend id.');
      return;
    }

    setValidationError('');
    await onSubmit(selectedWorkerId);
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={isSubmitting ? undefined : onClose} open={Boolean(draft)}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography color="text.secondary" variant="caption">
              Create assignment
            </Typography>
            <Typography variant="h4">Assign Worker</Typography>
          </Box>
          <IconButton aria-label="Close assign worker modal" disabled={isSubmitting} onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {draft ? (
          <Stack spacing={3}>
            <Box
              sx={{
                bgcolor: (theme) => alpha(theme.palette.grey[100], 0.7),
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                p: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="text.secondary" variant="body2">
                    Date
                  </Typography>
                  <Typography variant="subtitle2">
                    {draft.day.fullLabel}, {draft.day.date}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="text.secondary" variant="body2">
                    Shift
                  </Typography>
                  <Typography variant="subtitle2">{draft.template.name}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="text.secondary" variant="body2">
                    Time
                  </Typography>
                  <Typography variant="subtitle2">{formatShiftTime(draft.template)}</Typography>
                </Stack>
              </Stack>
            </Box>

            {workers.length > 0 ? (
              <FormControl fullWidth error={Boolean(validationError)}>
                <InputLabel id="assign-worker-label">Worker</InputLabel>
                <Select
                  disabled={isSubmitting}
                  label="Worker"
                  labelId="assign-worker-label"
                  onChange={(event) => {
                    setSelectedWorkerId(event.target.value);
                    setValidationError('');
                  }}
                  value={selectedWorkerId}
                >
                  {workers.map((worker) => (
                    <MenuItem key={worker.id} value={worker.id}>
                      <Stack alignItems="center" direction="row" spacing={1.5}>
                        <Avatar
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                            color: 'primary.dark',
                            fontSize: 12,
                            fontWeight: 700,
                            height: 28,
                            width: 28,
                          }}
                        >
                          {worker.initials}
                        </Avatar>
                        <Typography>{worker.name}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                {validationError ? (
                  <Typography color="error.main" mt={0.75} variant="caption">
                    {validationError}
                  </Typography>
                ) : null}
              </FormControl>
            ) : (
              <Alert severity="warning">
                No workers were returned by the backend. Add workers before creating an assignment.
              </Alert>
            )}

            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={isSubmitting} onClick={onClose} variant="text">
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || workers.length === 0 || isSubmitDisabled}
          onClick={() => {
            void handleSubmit();
          }}
          startIcon={<AddRoundedIcon />}
          variant="contained"
        >
          {isSubmitting ? 'Creating...' : 'Create assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ScheduleMetricsSkeleton() {
  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
      {Array.from({ length: 3 }, (_, index) => (
        <AppCard key={index} sx={{ flex: 1 }}>
          <Stack spacing={2}>
            <Skeleton height={18} width="38%" />
            <Skeleton height={42} width="54%" />
            <Skeleton height={28} width="70%" />
          </Stack>
        </AppCard>
      ))}
    </Stack>
  );
}

function ScheduleWorkspaceSkeleton() {
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Skeleton height={28} width={220} />
          <Skeleton height={18} width={320} />
        </Box>
        <Skeleton height={28} width={260} />
      </Stack>
      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '140px repeat(7, minmax(170px, 1fr))',
              lg: '168px repeat(7, minmax(180px, 1fr))',
            },
            minWidth: 1360,
          }}
        >
          {Array.from({ length: 40 }, (_, index) => (
            <Skeleton
              height={index < 8 ? 82 : 178}
              key={index}
              sx={{ borderRadius: 4 }}
              variant="rounded"
            />
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

type ScheduleErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function ScheduleErrorState({ message, onRetry }: ScheduleErrorStateProps) {
  return (
    <Stack spacing={2}>
      <Alert severity="error">
        Could not load the schedule assignments. {message}
      </Alert>
      <Button onClick={onRetry} sx={{ alignSelf: 'flex-start' }} variant="contained">
        Retry
      </Button>
    </Stack>
  );
}

type ContextToolbarProps = {
  selection: Selection;
  selectionSummary: string;
  onClear: () => void;
  onOpenAi: () => void;
};

function ContextToolbar({
  onClear,
  onOpenAi,
  selection,
  selectionSummary,
}: ContextToolbarProps) {
  const actions = getContextActions(selection);

  return (
    <AppCard
      sx={{
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
        boxShadow: 3,
      }}
    >
      <Stack
        alignItems={{ xs: 'flex-start', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography color="text.secondary" variant="caption">
            Selected
          </Typography>
          <Typography color="text.primary" variant="subtitle1">
            {selectionSummary}
          </Typography>
        </Box>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Button onClick={onOpenAi} startIcon={<AutoAwesomeRoundedIcon />} variant="contained">
            {actions[0]}
          </Button>
          {actions.slice(1).map((action) => (
            <Button key={action} variant="outlined">
              {action}
            </Button>
          ))}
          <Button color="secondary" onClick={onClear} startIcon={<CloseRoundedIcon />} variant="text">
            Clear selection
          </Button>
        </Stack>
      </Stack>
    </AppCard>
  );
}

type AIPanelProps = {
  schedule: WeeklySchedule;
  selection: Selection;
  selectionSummary: string;
  selectedShift?: ScheduledShift;
  onClose: () => void;
};

function AIPanel({ onClose, schedule, selectedShift, selection, selectionSummary }: AIPanelProps) {
  const quickActions = getAiQuickActions(selection);
  const contextLines = getAiContextLines(schedule, selection, selectedShift);

  return (
    <AppCard
      sx={{
        flexShrink: 0,
        position: { xl: 'sticky' },
        top: { xl: 96 },
        width: { xs: '100%', xl: 360 },
      }}
    >
      <Stack spacing={3}>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={1.5}>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'primary.main',
                borderRadius: 3,
                color: 'primary.contrastText',
                display: 'flex',
                height: 40,
                justifyContent: 'center',
                width: 40,
              }}
            >
              <SmartToyRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1">Schedow AI</Typography>
              <Typography color="text.secondary" variant="caption">
                Scheduling copilot
              </Typography>
            </Box>
          </Stack>
          <IconButton aria-label="Close Schedow AI panel" onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Divider />

        <Stack spacing={1.5}>
          <Typography color="text.secondary" variant="caption">
            Current context
          </Typography>
          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[100], 0.72),
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              p: 2,
            }}
          >
            <Typography variant="subtitle2">{selectionSummary}</Typography>
            <Stack spacing={0.75} sx={{ mt: 1.5 }}>
              {contextLines.map((line) => (
                <Typography color="text.secondary" key={line} variant="body2">
                  {line}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={1.5}>
          <Typography color="text.secondary" variant="caption">
            Quick actions
          </Typography>
          {quickActions.map((action) => (
            <Button
              fullWidth
              key={action.label}
              startIcon={action.icon}
              sx={{ justifyContent: 'flex-start' }}
              variant="outlined"
            >
              {action.label}
            </Button>
          ))}
        </Stack>

        <Box>
          <TextField
            fullWidth
            minRows={3}
            multiline
            placeholder="Ask about this schedule context..."
            size="small"
          />
          <Button fullWidth startIcon={<SendRoundedIcon />} sx={{ mt: 1.5 }} variant="contained">
            Ask Schedow AI
          </Button>
        </Box>
      </Stack>
    </AppCard>
  );
}

function getScheduleMetrics(schedule?: WeeklySchedule) {
  if (!schedule || schedule.shifts.length === 0) {
    return {
      totalAssigned: 0,
      totalShifts: 0,
      unassignedCount: 0,
      aiReadyCount: 0,
    };
  }

  const totalAssigned = schedule.shifts.filter((shift) => shift.assignedWorkers.length > 0).length;
  const totalPossibleCells = schedule.days.length * schedule.shiftTemplates.length;

  return {
    totalAssigned,
    totalShifts: schedule.shifts.length,
    unassignedCount: Math.max(0, totalPossibleCells - schedule.shifts.length),
    aiReadyCount: schedule.shifts.filter((shift) => shift.aiRecommendationAvailable).length,
  };
}

function isShiftSelected(schedule: WeeklySchedule, selection: Selection, shiftId: string): boolean {
  if (selection.type === 'shift') {
    return selection.shiftId === shiftId;
  }

  if (selection.type === 'multi') {
    return selection.shiftIds.includes(shiftId);
  }

  if (selection.type === 'day') {
    return schedule.shifts.some((shift) => shift.id === shiftId && shift.dayId === selection.dayId);
  }

  return selection.type === 'week';
}

function getShift(
  schedule: WeeklySchedule,
  dayId: string,
  templateId: string,
): ScheduledShift | undefined {
  return schedule.shifts.find((shift) => shift.dayId === dayId && shift.templateId === templateId);
}

function getSelectionSummary(selection: Selection, schedule?: WeeklySchedule): string {
  if (selection.type === 'none' || !schedule) {
    return 'No selection';
  }

  if (selection.type === 'week') {
    return schedule.weekLabel;
  }

  if (selection.type === 'day') {
    return getDay(schedule, selection.dayId)?.fullLabel ?? 'Day selected';
  }

  if (selection.type === 'multi') {
    return `${selection.shiftIds.length} shifts selected`;
  }

  const shift = schedule.shifts.find((item) => item.id === selection.shiftId);

  if (!shift) {
    return 'Shift selected';
  }

  return `${getDay(schedule, shift.dayId)?.fullLabel ?? 'Day'} - ${
    getTemplate(schedule, shift.templateId)?.name ?? 'Shift'
  }`;
}

function getContextActions(selection: Selection): string[] {
  if (selection.type === 'week') {
    return ['Weekly Summary', 'Review Assignments', 'AI Insights'];
  }

  if (selection.type === 'day') {
    return ['Ask AI', 'Review Day', 'Detect Conflicts'];
  }

  if (selection.type === 'multi') {
    return ['Ask Schedow AI', 'Review Assignments', 'Detect Conflicts'];
  }

  return ['Ask Schedow AI', 'Edit Assignment', 'Find Replacement'];
}

function getAiQuickActions(selection: Selection): Array<{ label: string; icon: ReactNode }> {
  if (selection.type === 'week') {
    return [
      { label: 'Weekly Summary', icon: <InsightsRoundedIcon /> },
      { label: 'Staffing Risks', icon: <ReportProblemRoundedIcon /> },
      { label: 'Improvement Suggestions', icon: <AutoAwesomeRoundedIcon /> },
    ];
  }

  if (selection.type === 'day') {
    return [
      { label: 'Summarize Day', icon: <InsightsRoundedIcon /> },
      { label: 'Detect Conflicts', icon: <ReportProblemRoundedIcon /> },
      { label: 'Review Assignments', icon: <GroupsRoundedIcon /> },
    ];
  }

  return [
    { label: 'Recommend Worker', icon: <PersonSearchRoundedIcon /> },
    { label: 'Explain Assignment', icon: <InsightsRoundedIcon /> },
    { label: 'Find Replacement', icon: <GroupsRoundedIcon /> },
    { label: 'Detect Conflicts', icon: <ReportProblemRoundedIcon /> },
  ];
}

function getAiContextLines(
  schedule: WeeklySchedule,
  selection: Selection,
  selectedShift?: ScheduledShift,
): string[] {
  if (selection.type === 'week') {
    return [
      `${getScheduleMetrics(schedule).totalAssigned} assigned shifts`,
      `${getScheduleMetrics(schedule).unassignedCount} unassigned cells`,
      `${schedule.shifts.filter((shift) => shift.aiRecommendationAvailable).length} AI recommendations`,
    ];
  }

  if (selection.type === 'day') {
    const dayShifts = schedule.shifts.filter((shift) => shift.dayId === selection.dayId);
    const assigned = dayShifts.filter((shift) => shift.assignedWorkers.length > 0).length;
    const totalCells = schedule.shiftTemplates.length;

    return [
      `${assigned} assigned shifts`,
      `${Math.max(0, totalCells - assigned)} unassigned cells`,
      `${schedule.workers.length} workers available`,
    ];
  }

  if (selection.type === 'multi') {
    return [
      `${selection.shiftIds.length} selected shifts`,
      'Actions apply to every selected shift',
      'Use Control or Command click to adjust selection',
    ];
  }

  if (selectedShift) {
    const template = getTemplate(schedule, selectedShift.templateId);
    const assignedWorker = selectedShift.assignedWorkers[0];

    return [
      getDay(schedule, selectedShift.dayId)?.fullLabel ?? 'Selected day',
      `${template?.name ?? 'Missing shift name'} - ${template ? formatShiftTime(template) : 'Missing shift time'}`,
      assignedWorker ? assignedWorker.name : 'Unassigned',
    ];
  }

  return ['Select a shift, day, or week to focus recommendations.'];
}

function getDay(schedule: WeeklySchedule, dayId: string): WeekDay | undefined {
  return schedule.days.find((day) => day.id === dayId);
}

function getTemplate(schedule: WeeklySchedule, templateId: string): ShiftTemplate | undefined {
  return schedule.shiftTemplates.find((template) => template.id === templateId);
}

function getEmptyCellSelectionId(dayId: string, templateId: string): string {
  return `empty:${dayId}:${templateId}`;
}

function formatShiftTime(template: ShiftTemplate): string {
  return `${formatTimeField(template.startTime)} - ${formatTimeField(template.endTime)}`;
}

function formatTimeField(value: string | null): string {
  return value ?? 'Missing time';
}

function toJavaDayOfWeek(day: string): string {
  return day.toUpperCase();
}

function toNumericId(id: string): number {
  return Number(id);
}

function isNumericId(id: string): boolean {
  return Number.isFinite(toNumericId(id));
}

function getCurrentWeekStartDate(): string {
  return getWeekStartDate(toDateId(new Date()));
}

function getWeekStartDate(dateValue: string): string {
  const date = parseLocalDate(dateValue);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  return toDateId(addDays(date, mondayOffset));
}

function formatWeekLabel(weekStartDate: string): string {
  return `Week of ${weekTitleFormatter.format(parseLocalDate(weekStartDate))}`;
}

function reconcileSelection(selection: Selection, schedule: WeeklySchedule): Selection {
  if (selection.type === 'none' || selection.type === 'week') {
    return selection;
  }

  if (selection.type === 'shift') {
    return schedule.shifts.some((shift) => shift.id === selection.shiftId)
      ? selection
      : { type: 'none' };
  }

  if (selection.type === 'multi') {
    const shiftIds = selection.shiftIds.filter((shiftId) =>
      schedule.shifts.some((shift) => shift.id === shiftId),
    );

    if (shiftIds.length === 0) {
      return { type: 'none' };
    }

    if (shiftIds.length === 1) {
      return { type: 'shift', shiftId: shiftIds[0] };
    }

    return { type: 'multi', shiftIds };
  }

  const exactDay = schedule.days.find((day) => day.id === selection.dayId);

  if (exactDay) {
    return selection;
  }

  const selectedDate = parseLocalDate(selection.dayId);
  const matchingWeekday = schedule.days.find(
    (day) => parseLocalDate(day.id).getDay() === selectedDate.getDay(),
  );

  return matchingWeekday ? { type: 'day', dayId: matchingWeekday.id } : { type: 'none' };
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);

  return nextDate;
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date(value);
  }

  return new Date(year, month - 1, day);
}

function toDateId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Please try again.';
}

function getMutationErrorMessage(error: unknown): string | undefined {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not create the assignment. Please try again.';
}
