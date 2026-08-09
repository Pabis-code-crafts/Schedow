import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popper from '@mui/material/Popper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AppCard, EmptyState, PageHeader, SectionTitle, StatCard } from '@/components/design-system';
import { useSendChatMessage } from '@/features/ai/queries';
import type { AiActionProposal, ChatResponse } from '@/features/ai/types';
import {
  useChangeAssignmentWorker,
  useCreateScheduleAssignment,
  useRemoveScheduleAssignment,
  useScheduleWorkspace,
  useShiftRecommendations,
} from '@/features/schedule/queries';
import type { ScheduledShift, ScheduleWorker, ShiftRecommendation, ShiftTemplate, WeeklySchedule, WeekDay } from '@/features/schedule/types';
import { getApiErrorMessage } from '@/services/api';

type Selection = { type: 'none' } | { type: 'week' } | { type: 'day'; dayId: string } | { type: 'shift'; shiftId: string };
type Draft = { day: WeekDay; mode: 'create' | 'change'; shift?: ScheduledShift; template: ShiftTemplate };
type RecDraft = { day: WeekDay; template: ShiftTemplate };
type CellContext = { day: WeekDay; shift: ScheduledShift; template: ShiftTemplate };
type Toast = { message: string; severity: 'success' | 'error' } | null;

const weekFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function SchedulePage() {
  const [weekStartDate, setWeekStartDate] = useState(() => getCurrentWeekStartDate());
  const [selection, setSelection] = useState<Selection>({ type: 'none' });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [recDraft, setRecDraft] = useState<RecDraft | null>(null);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<'assign' | 'recommend' | null>(null);
  const [menu, setMenu] = useState<{ anchorEl: HTMLElement; context: CellContext } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CellContext | null>(null);
  const [aiOpen, setAiOpen] = useState(true);
  const [toast, setToast] = useState<Toast>(null);

  const { data: schedule, error, isError, isFetching, isLoading, refetch } = useScheduleWorkspace(weekStartDate);
  const createAssignment = useCreateScheduleAssignment(weekStartDate);
  const changeWorker = useChangeAssignmentWorker(weekStartDate);
  const removeAssignment = useRemoveScheduleAssignment(weekStartDate);
  const recommendations = useShiftRecommendations();
  const isBusy = createAssignment.isPending || changeWorker.isPending;
  const metrics = useMemo(() => getMetrics(schedule), [schedule]);

  useEffect(() => {
    if (!schedule) return;
    setSelection((current) => reconcileSelection(current, schedule));
  }, [schedule]);
  useEffect(() => {
    if (selection.type !== 'shift' || !parseEmptyId(selection.shiftId)) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;

      if (target?.closest('[data-empty-cell-popover="true"], [data-empty-cell-trigger="selected"]')) {
        return;
      }

      setActiveAction(null);
      setSelection({ type: 'none' });
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer, true);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer, true);
    };
  }, [selection]);

  const saveAssignment = async (day: WeekDay, template: ShiftTemplate, workerId: number) => {
    createAssignment.reset();
    await createAssignment.mutateAsync({ weekStartDate, dayOfWeek: javaDay(day.fullLabel), assignedUserId: workerId, shiftId: Number(template.id) });
  };

  const openRecommend = (day: WeekDay, template: ShiftTemplate) => {
    recommendations.reset();
    createAssignment.reset();
    setActiveAction(null);
    setSelection({ type: 'none' });
    setRecDraft({ day, template });
    if (isNumeric(template.id)) recommendations.mutate({ date: day.id, dayOfWeek: javaDay(day.fullLabel), shiftId: Number(template.id) });
  };

  const openSelectedAssignment = () => {
    if (!schedule || selection.type !== 'shift') return setToast({ message: 'Select an open schedule cell first.', severity: 'error' });
    const empty = parseEmptyId(selection.shiftId);
    if (!empty) return setToast({ message: 'This shift already has an assignment.', severity: 'error' });
    const day = getDay(schedule, empty.dayId);
    const template = getTemplate(schedule, empty.templateId);
    if (!day || !template) return setToast({ message: 'The selected cell is no longer available.', severity: 'error' });
    createAssignment.reset();
    setActiveAction('assign');
    setSelection({ type: 'none' });
    setDraft({ day, mode: 'create', template });
  };

  return (
    <>
      <Stack spacing={4}>
        <PageHeader eyebrow="Schedule workspace" subtitle="A clean weekly planning canvas built from backend shift templates, selected dates, and assigned workers." title="Weekly workforce plan" />
        <WeekToolbar value={weekStartDate} fetching={isFetching} weekSelected={selection.type === 'week'} label={schedule?.weekLabel ?? `Week of ${weekFmt.format(parseDate(weekStartDate))}`} onDate={(date) => date && setWeekStartDate(getWeekStartDate(date))} onMove={(days) => setWeekStartDate((current) => dateId(addDays(parseDate(current), days)))} onToday={() => setWeekStartDate(getCurrentWeekStartDate())} onWeek={() => { setActiveAction(null); setSelection((current) => current.type === 'week' ? { type: 'none' } : { type: 'week' }); setAiOpen(true); }} />
        {isLoading || isFetching ? <MetricSkeleton /> : <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}><StatCard helperText={`${metrics.totalCells} schedule cells this week`} icon={<GroupsRoundedIcon />} title="Assigned shifts" tone="success" trend={{ direction: 'flat', label: 'Live data' }} value={String(metrics.assigned)} /><StatCard helperText="Ready for manager action" icon={<AddRoundedIcon />} title="Open cells" tone={metrics.open > 0 ? 'warning' : 'success'} trend={{ direction: 'flat', label: 'MVP view' }} value={String(metrics.open)} /><StatCard helperText="Scheduling copilot suggestions" icon={<AutoAwesomeRoundedIcon />} title="AI signals" tone="info" trend={{ direction: 'flat', label: 'Available' }} value={String(metrics.ai)} /></Stack>}
        <Stack alignItems="flex-start" direction={{ xs: 'column', xl: 'row' }} spacing={3}>
          <AppCard sx={{ flex: 1, minWidth: 0, overflow: 'visible', width: '100%' }}>
            {isLoading || isFetching ? <GridSkeleton /> : isError ? <Stack spacing={2}><Alert severity="error">Could not load the schedule assignments. {getApiErrorMessage(error)}</Alert><Button onClick={() => void refetch()} variant="contained">Retry</Button></Stack> : schedule && schedule.shiftTemplates.length > 0 ? <Stack spacing={3}><SectionTitle description="Rows come from backend shift templates. Columns represent the selected week." title={schedule.weekLabel} /><ActionBar onAdd={openSelectedAssignment} /><ScheduleGrid activeAction={activeAction} schedule={schedule} selection={selection} onAssign={(day, template) => { createAssignment.reset(); setActiveAction('assign'); setSelection({ type: 'none' }); setDraft({ day, mode: 'create', template }); }} onMenu={(anchorEl, context) => setMenu({ anchorEl, context })} onRecommend={openRecommend} onSelectDay={(dayId) => { setActiveAction(null); setSelection((current) => current.type === 'day' && current.dayId === dayId ? { type: 'none' } : { type: 'day', dayId }); setAiOpen(true); }} onSelectEmpty={(day, template) => { const id = emptyId(day.id, template.id); setActiveAction(null); setSelection((current) => current.type === 'shift' && current.shiftId === id ? { type: 'none' } : { type: 'shift', shiftId: id }); setAiOpen(true); }} onSelectShift={(_, shift) => { setActiveAction(null); setSelection((current) => current.type === 'shift' && current.shiftId === shift.id ? { type: 'none' } : { type: 'shift', shiftId: shift.id }); setAiOpen(true); }} /></Stack> : <EmptyState action={<Button onClick={() => void refetch()} variant="outlined">Refresh</Button>} icon={<CalendarMonthRoundedIcon />} title="No assignments for this week" description="Once the backend returns shift assignments, this workspace will render the week dynamically from that data." />}
          </AppCard>
          {aiOpen && schedule ? <AiPanel isApproving={isBusy} schedule={schedule} selection={selection} onApproveAssignment={async (proposal) => { if (proposal.assignmentId) { await changeWorker.mutateAsync({ assignmentId: proposal.assignmentId, newUserId: proposal.workerId }); } else { await createAssignment.mutateAsync({ weekStartDate: proposal.weekStartDate, dayOfWeek: proposal.dayOfWeek, assignedUserId: proposal.workerId, shiftId: proposal.shiftId }); } setToast({ message: `${proposal.workerName} has been assigned to ${proposal.shiftName ?? 'this shift'}.`, severity: 'success' }); }} onClose={() => setAiOpen(false)} /> : null}
        </Stack>
      </Stack>
      {!aiOpen && schedule ? <Tooltip title="Open Schedow AI"><Button color="primary" onClick={() => setAiOpen(true)} size="large" startIcon={<AutoAwesomeRoundedIcon />} sx={{ bottom: { xs: 20, sm: 28 }, boxShadow: 5, position: 'fixed', right: { xs: 20, sm: 32 }, zIndex: (theme) => theme.zIndex.drawer - 1 }} variant="contained">Schedow AI</Button></Tooltip> : null}
      {schedule ? <AssignDialog draft={draft} error={mutationError(draft?.mode === 'change' ? changeWorker.error : createAssignment.error)} isSubmitting={isBusy} submitDisabled={draft ? !isNumeric(draft.template.id) || (draft.mode === 'change' && (!draft.shift || !isNumeric(draft.shift.id))) : false} workers={schedule.workers} onClose={() => { if (!isBusy) { setDraft(null); createAssignment.reset(); changeWorker.reset(); } }} onSubmit={async (workerId) => { if (!draft) return; try { if (draft.mode === 'change' && draft.shift) { await changeWorker.mutateAsync({ assignmentId: Number(draft.shift.id), newUserId: Number(workerId) }); setToast({ message: 'Worker changed.', severity: 'success' }); } else { await saveAssignment(draft.day, draft.template, Number(workerId)); setToast({ message: 'Shift assigned.', severity: 'success' }); } setDraft(null); } catch (err) { if (draft.mode === 'change') setToast({ message: getApiErrorMessage(err), severity: 'error' }); } }} /> : null}
      <RecommendationDialog assignError={mutationError(createAssignment.error)} assigningUserId={assigningUserId} draft={recDraft} isAssigning={createAssignment.isPending} isLoading={recommendations.isPending} recommendations={recommendations.data ?? []} recommendationError={recommendationError(recommendations.error)} onClose={() => { if (!recommendations.isPending && !createAssignment.isPending) { setRecDraft(null); setAssigningUserId(null); setActiveAction(null); setSelection({ type: 'none' }); recommendations.reset(); createAssignment.reset(); } }} onAssign={async (rec) => { if (!recDraft || rec.userId === null) return; setAssigningUserId(rec.userId); try { await saveAssignment(recDraft.day, recDraft.template, rec.userId); setToast({ message: 'Shift assigned.', severity: 'success' }); setRecDraft(null); setActiveAction(null); recommendations.reset(); } catch (err) { setToast({ message: getApiErrorMessage(err), severity: 'error' }); } finally { setAssigningUserId(null); } }} />
      <ActionMenu menu={menu} onClose={() => setMenu(null)} onChange={(context) => { setMenu(null); changeWorker.reset(); setDraft({ day: context.day, mode: 'change', shift: context.shift, template: context.template }); }} onRemove={(context) => { setMenu(null); setRemoveTarget(context); }} />
      <RemoveDialog target={removeTarget} removing={removeAssignment.isPending} onClose={() => { if (!removeAssignment.isPending) { setRemoveTarget(null); removeAssignment.reset(); } }} onConfirm={() => { if (!removeTarget || !isNumeric(removeTarget.shift.id)) return setToast({ message: 'The selected assignment is missing a numeric backend id.', severity: 'error' }); removeAssignment.mutate(Number(removeTarget.shift.id), { onError: (err) => setToast({ message: getApiErrorMessage(err), severity: 'error' }), onSuccess: () => { setRemoveTarget(null); setSelection({ type: 'none' }); setToast({ message: 'Assignment removed.', severity: 'success' }); } }); }} />
      <Snackbar anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} autoHideDuration={4200} onClose={() => setToast(null)} open={Boolean(toast)}><Alert onClose={() => setToast(null)} severity={toast?.severity ?? 'success'} variant="filled">{toast?.message}</Alert></Snackbar>
    </>
  );
}

function WeekToolbar({ fetching, label, onDate, onMove, onToday, onWeek, value, weekSelected }: { fetching: boolean; label: string; value: string; weekSelected: boolean; onDate: (date: string) => void; onMove: (days: number) => void; onToday: () => void; onWeek: () => void }) {
  return <AppCard sx={{ bgcolor: (theme) => alpha(theme.palette.grey[100], 0.62), boxShadow: 2 }}><Stack alignItems={{ xs: 'stretch', lg: 'center' }} direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button disabled={fetching} onClick={() => onMove(-7)} startIcon={<ChevronLeftRoundedIcon />} variant="outlined">Previous Week</Button><Button disabled={fetching} endIcon={<ChevronRightRoundedIcon />} onClick={() => onMove(7)} variant="outlined">Next Week</Button><Button disabled={fetching} onClick={onToday}>Today</Button></Stack><Box><Typography color="text.secondary" variant="caption">Viewing</Typography><Typography variant="h5">{label}</Typography></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><TextField InputLabelProps={{ shrink: true }} disabled={fetching} label="Pick date" onChange={(e) => onDate(e.target.value)} size="small" type="date" value={value} /><Button disabled={fetching} onClick={onWeek} startIcon={<CalendarMonthRoundedIcon />} variant={weekSelected ? 'contained' : 'outlined'}>Select Week</Button></Stack></Stack></AppCard>;
}

function ActionBar({ onAdd }: { onAdd: () => void }) {
  return <Box sx={{ bgcolor: (theme) => alpha(theme.palette.grey[100], 0.62), border: 1, borderColor: 'divider', borderRadius: 3, px: 1.5, py: 1 }}><Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}><Typography color="text.secondary" variant="caption">Schedule actions</Typography><Button onClick={onAdd} size="small" startIcon={<AddRoundedIcon />} variant="contained">Add Assignment</Button></Stack></Box>;
}

function ScheduleGrid({ activeAction, onAssign, onMenu, onRecommend, onSelectDay, onSelectEmpty, onSelectShift, schedule, selection }: { activeAction: 'assign' | 'recommend' | null; schedule: WeeklySchedule; selection: Selection; onAssign: (day: WeekDay, template: ShiftTemplate) => void; onMenu: (anchorEl: HTMLElement, context: CellContext) => void; onRecommend: (day: WeekDay, template: ShiftTemplate) => void; onSelectDay: (dayId: string) => void; onSelectEmpty: (day: WeekDay, template: ShiftTemplate) => void; onSelectShift: (event: MouseEvent, shift: ScheduledShift) => void }) {
  return <Box sx={{ overflowX: { xs: 'auto', lg: 'visible' }, pb: 1 }}><Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '104px repeat(7, minmax(120px, 1fr))', lg: '116px repeat(7, minmax(0, 1fr))' }, minWidth: { xs: 980, lg: 0 } }}><Box />{schedule.days.map((day) => <DayHeader day={day} key={day.id} selected={selection.type === 'day' ? selection.dayId === day.id : selection.type === 'week'} onClick={() => onSelectDay(day.id)} />)}{schedule.shiftTemplates.map((template) => <ScheduleRow activeAction={activeAction} key={template.id} onAssign={onAssign} onMenu={onMenu} onRecommend={onRecommend} onSelectEmpty={onSelectEmpty} onSelectShift={onSelectShift} schedule={schedule} selection={selection} template={template} />)}</Box></Box>;
}

function ScheduleRow({ activeAction, onAssign, onMenu, onRecommend, onSelectEmpty, onSelectShift, schedule, selection, template }: { activeAction: 'assign' | 'recommend' | null; schedule: WeeklySchedule; selection: Selection; template: ShiftTemplate; onAssign: (day: WeekDay, template: ShiftTemplate) => void; onMenu: (anchorEl: HTMLElement, context: CellContext) => void; onRecommend: (day: WeekDay, template: ShiftTemplate) => void; onSelectEmpty: (day: WeekDay, template: ShiftTemplate) => void; onSelectShift: (event: MouseEvent, shift: ScheduledShift) => void }) {
  return <><Box sx={{ alignSelf: 'stretch', bgcolor: (theme) => alpha(theme.palette.grey[100], 0.6), border: 1, borderColor: 'divider', borderRadius: 4, minHeight: 92, p: 1.25 }}><Typography noWrap variant="subtitle2">{template.name}</Typography><Typography color="text.secondary" mt={0.5} variant="caption">{shiftTime(template)}</Typography></Box>{schedule.days.map((day) => { const shift = getShift(schedule, day.id, template.id); return shift ? <ShiftCell key={shift.id} selected={isShiftSelected(schedule, selection, shift.id)} shift={shift} onClick={(event) => onSelectShift(event, shift)} onMenu={(anchorEl) => onMenu(anchorEl, { day, shift, template })} /> : <EmptyCell activeAction={isEmptySelected(selection, day.id, template.id) ? activeAction : null} day={day} key={`${day.id}-${template.id}`} selected={isEmptySelected(selection, day.id, template.id)} template={template} onAssign={() => onAssign(day, template)} onClick={() => onSelectEmpty(day, template)} onRecommend={() => onRecommend(day, template)} />; })}</>;
}

function DayHeader({ day, onClick, selected }: { day: WeekDay; selected: boolean; onClick: () => void }) {
  return <ButtonBase onClick={onClick} sx={{ borderRadius: 4, display: 'block', textAlign: 'left' }}><Box sx={{ bgcolor: selected ? 'primary.main' : (theme) => alpha(theme.palette.grey[100], 0.78), border: 1, borderColor: selected ? 'primary.main' : 'divider', borderRadius: 4, color: selected ? 'primary.contrastText' : 'text.primary', minHeight: 64, p: 1.25, '&:hover': { boxShadow: 2 } }}><Typography noWrap variant="subtitle2">{day.label}</Typography><Typography color={selected ? 'inherit' : 'text.secondary'} variant="caption">{day.date}</Typography></Box></ButtonBase>;
}
function ShiftCell({ onClick, onMenu, selected, shift }: { shift: ScheduledShift; selected: boolean; onClick: (event: MouseEvent) => void; onMenu: (anchorEl: HTMLElement) => void }) {
  const worker = shift.assignedWorkers[0];
  return <ButtonBase onClick={onClick} sx={{ borderRadius: 4, display: 'block', height: '100%', textAlign: 'left' }}><Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: selected ? 'primary.main' : 'divider', borderRadius: 4, boxShadow: selected ? 4 : 1, minHeight: 92, outline: selected ? '3px solid' : '0 solid transparent', outlineColor: (theme) => alpha(theme.palette.primary.main, 0.18), p: 1.25, position: 'relative', '&:hover': { borderColor: 'primary.main', boxShadow: 3, transform: 'translateY(-2px)' } }}><IconButton aria-label="Open cell actions" onClick={(event) => { event.stopPropagation(); onMenu(event.currentTarget); }} size="small" sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', height: 28, position: 'absolute', right: 10, top: 10, width: 28 }}><MoreHorizRoundedIcon sx={{ fontSize: 18 }} /></IconButton><Stack justifyContent="center" sx={{ minHeight: 68, pr: 3 }}>{worker ? <Stack alignItems="center" direction="row" spacing={1.25}><Avatar sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12), color: 'primary.dark', fontSize: 12, fontWeight: 700, height: 28, width: 28 }}>{worker.initials}</Avatar><Typography noWrap fontWeight={600} variant="body2">{worker.name}</Typography></Stack> : <Typography color="text.secondary" variant="caption">Unassigned</Typography>}</Stack></Box></ButtonBase>;
}

function EmptyCell({ activeAction, day, onAssign, onClick, onRecommend, selected, template }: { activeAction: 'assign' | 'recommend' | null; day: WeekDay; selected: boolean; template: ShiftTemplate; onAssign: () => void; onClick: () => void; onRecommend: () => void }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  return <><ButtonBase ref={ref} data-empty-cell-trigger={selected ? 'selected' : undefined} aria-label={`Select ${template.name} on ${day.fullLabel}`} onClick={onClick} sx={{ borderRadius: 4, display: 'block', height: '100%', overflow: 'visible', textAlign: 'center', width: '100%' }}><Box sx={{ alignItems: 'center', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.55), border: 1, borderColor: selected ? 'primary.main' : 'divider', borderRadius: 4, borderStyle: 'dashed', display: 'flex', minHeight: 92, outline: selected ? '3px solid' : '0 solid transparent', outlineColor: (theme) => alpha(theme.palette.primary.main, 0.18), p: 1.25, '&:hover': { bgcolor: 'background.paper', borderColor: 'primary.main', boxShadow: 2, transform: 'translateY(-2px)' } }}><Stack alignItems="center" justifyContent="center" spacing={1} sx={{ width: '100%' }}><AddRoundedIcon color="secondary" fontSize="small" /><Typography color="text.secondary" variant="caption">Unassigned</Typography></Stack></Box></ButtonBase><Popper anchorEl={ref.current} disablePortal={false} modifiers={[{ name: 'offset', options: { offset: [0, 12] } }, { name: 'flip', options: { fallbackPlacements: ['left-start', 'right-end', 'left-end', 'bottom-start', 'top-start'], padding: 16 } }, { name: 'preventOverflow', options: { boundary: 'viewport', padding: 16, rootBoundary: 'viewport' } }]} open={selected} placement="right-start" sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}><Box data-empty-cell-popover="true" onClick={(event) => event.stopPropagation()} sx={{ bgcolor: 'background.paper', border: 1, borderColor: (theme) => alpha(theme.palette.primary.main, 0.18), borderRadius: 3, boxShadow: 4, minWidth: 224, p: 1, width: 224 }}><Stack spacing={0.75}><Button fullWidth onClick={(event) => { event.stopPropagation(); onAssign(); }} size="small" startIcon={<AddRoundedIcon />} sx={{ justifyContent: 'flex-start', whiteSpace: 'nowrap' }} variant={activeAction === 'assign' ? 'contained' : 'outlined'}>Assign Shift</Button><Button fullWidth onClick={(event) => { event.stopPropagation(); onRecommend(); }} size="small" startIcon={<AutoAwesomeRoundedIcon />} sx={{ justifyContent: 'flex-start', whiteSpace: 'nowrap' }} variant={activeAction === 'recommend' ? 'contained' : 'outlined'}>Recommend Worker</Button></Stack></Box></Popper></>;
}

function AssignDialog({ draft, error, isSubmitting, onClose, onSubmit, submitDisabled, workers }: { draft: Draft | null; error?: string; isSubmitting: boolean; submitDisabled: boolean; workers: ScheduleWorker[]; onClose: () => void; onSubmit: (workerId: string) => Promise<void> }) {
  const [workerId, setWorkerId] = useState('');
  const [validation, setValidation] = useState('');
  useEffect(() => { if (draft) { setWorkerId(''); setValidation(''); } }, [draft]);
  const submit = async () => { if (!workerId) return setValidation('Select a worker before creating the assignment.'); if (!isNumeric(workerId) || submitDisabled) return setValidation('The selected worker or shift is missing a numeric backend id.'); await onSubmit(workerId); };
  return <Dialog fullWidth maxWidth="sm" onClose={isSubmitting ? undefined : onClose} open={Boolean(draft)}><DialogTitle>{draft?.mode === 'change' ? 'Change Worker' : 'Assign Worker'}</DialogTitle><DialogContent>{draft ? <Stack spacing={3} sx={{ pt: 1 }}><Context day={draft.day} template={draft.template} />{workers.length ? <FormControl fullWidth error={Boolean(validation)}><InputLabel id="worker-label">Worker</InputLabel><Select disabled={isSubmitting} label="Worker" labelId="worker-label" onChange={(event) => { setWorkerId(event.target.value); setValidation(''); }} value={workerId}>{workers.map((worker) => <MenuItem key={worker.id} value={worker.id}>{worker.name}</MenuItem>)}</Select>{validation ? <Typography color="error.main" mt={0.75} variant="caption">{validation}</Typography> : null}</FormControl> : <Alert severity="warning">No workers were returned by the backend.</Alert>}{error ? <Alert severity="error">{error}</Alert> : null}</Stack> : null}</DialogContent><DialogActions sx={{ px: 3, pb: 3 }}><Button disabled={isSubmitting} onClick={onClose}>Cancel</Button><Button disabled={isSubmitting || !workers.length || submitDisabled} onClick={() => void submit()} startIcon={isSubmitting ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />} variant="contained">{isSubmitting ? 'Saving...' : draft?.mode === 'change' ? 'Change worker' : 'Create assignment'}</Button></DialogActions></Dialog>;
}

function RecommendationDialog({ assignError, assigningUserId, draft, isAssigning, isLoading, onAssign, onClose, recommendationError, recommendations }: { assignError?: string; assigningUserId: number | null; draft: RecDraft | null; isAssigning: boolean; isLoading: boolean; recommendations: ShiftRecommendation[]; recommendationError?: string; onAssign: (rec: ShiftRecommendation) => Promise<void>; onClose: () => void }) {
  const busy = isLoading || isAssigning;
  return <Dialog fullWidth maxWidth="sm" onClose={busy ? undefined : onClose} open={Boolean(draft)}><DialogTitle sx={{ pb: 1 }}><Stack direction="row" justifyContent="space-between"><Box><Typography color="text.secondary" variant="caption">Schedow AI</Typography><Typography variant="h4">Recommended Workers</Typography></Box><IconButton disabled={busy} onClick={onClose}><CloseRoundedIcon /></IconButton></Stack></DialogTitle><DialogContent sx={{ pt: 2 }}>{draft ? <Stack spacing={3}><Context day={draft.day} template={draft.template} />{recommendationError ? <Alert severity="error">{recommendationError}</Alert> : null}{assignError ? <Alert severity="error">{assignError}</Alert> : null}{isLoading ? <Stack spacing={1.5}>{[0, 1, 2].map((item) => <Skeleton height={72} key={item} sx={{ borderRadius: 3 }} variant="rounded" />)}</Stack> : recommendations.length ? <Stack spacing={1.5}>{recommendations.map((rec) => <Box key={`${rec.userId ?? 'missing'}-${rec.workerName}`} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 2 }}><Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}><Stack spacing={0.75}><Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}><Typography variant="subtitle2">{rec.workerName}</Typography>{rec.recurringWorker ? <Badge label="Recurring" tone="secondary" /> : null}{rec.fairnessScore !== null ? <Badge label={`Fairness ${rec.fairnessScore}`} tone="info" /> : null}</Stack>{rec.reason ? <Typography color="text.secondary" variant="body2">{rec.reason}</Typography> : null}{!rec.canAssign && rec.disabledReason ? <Typography color="error.main" variant="caption">{rec.disabledReason}</Typography> : null}</Stack><Button disabled={isAssigning || !rec.canAssign || !isNumeric(draft.template.id)} onClick={() => void onAssign(rec)} startIcon={assigningUserId === rec.userId ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon fontSize="small" />} sx={{ alignItems: 'center', alignSelf: { xs: 'stretch', sm: 'center' }, flexShrink: 0, height: 36, justifyContent: 'center', minWidth: 104, px: 2, whiteSpace: 'nowrap', width: { xs: '100%', sm: 104 }, '& .MuiButton-startIcon': { alignItems: 'center', display: 'inline-flex', marginLeft: 0, marginRight: 0.75, '& svg': { fontSize: 18 } } }} variant="contained">Assign</Button></Stack></Box>)}</Stack> : recommendationError ? null : <Alert severity="info">No recommendations were returned for this shift.</Alert>}</Stack> : null}</DialogContent><DialogActions sx={{ px: 3, pb: 3 }}><Button disabled={busy} onClick={onClose}>Close</Button></DialogActions></Dialog>;
}

function Badge({ label, tone }: { label: string; tone: 'secondary' | 'info' }) {
  return <Box sx={{ bgcolor: (theme) => alpha(theme.palette[tone].main, 0.14), borderRadius: 999, color: `${tone}.dark`, fontSize: 12, fontWeight: 700, px: 1, py: 0.25 }}>{label}</Box>;
}

function Context({ day, template }: { day: WeekDay; template: ShiftTemplate }) {
  return <Box sx={{ bgcolor: (theme) => alpha(theme.palette.grey[100], 0.7), border: 1, borderColor: 'divider', borderRadius: 3, p: 2 }}><Stack spacing={1.5}><Stack direction="row" justifyContent="space-between"><Typography color="text.secondary" variant="body2">Date</Typography><Typography variant="subtitle2">{day.fullLabel}, {day.date}</Typography></Stack><Stack direction="row" justifyContent="space-between"><Typography color="text.secondary" variant="body2">Shift</Typography><Typography variant="subtitle2">{template.name}</Typography></Stack><Stack direction="row" justifyContent="space-between"><Typography color="text.secondary" variant="body2">Time</Typography><Typography variant="subtitle2">{shiftTime(template)}</Typography></Stack></Stack></Box>;
}
function ActionMenu({ menu, onChange, onClose, onRemove }: { menu: { anchorEl: HTMLElement; context: CellContext } | null; onChange: (context: CellContext) => void; onClose: () => void; onRemove: (context: CellContext) => void }) {
  const context = menu?.context;
  return <Menu anchorEl={menu?.anchorEl ?? null} onClose={onClose} open={Boolean(menu)}><MenuItem disabled={!context} onClick={() => context && onChange(context)}>Change Worker</MenuItem><MenuItem disabled={!context} onClick={() => context && onRemove(context)}>Remove Assignment</MenuItem></Menu>;
}

function RemoveDialog({ onClose, onConfirm, removing, target }: { target: CellContext | null; removing: boolean; onClose: () => void; onConfirm: () => void }) {
  const worker = target?.shift.assignedWorkers[0];
  return <Dialog fullWidth maxWidth="xs" onClose={removing ? undefined : onClose} open={Boolean(target)}><DialogTitle>Remove this assignment?</DialogTitle><DialogContent>{target ? <Stack spacing={1}><Typography color="text.secondary" variant="body2">{target.day.fullLabel}, {target.day.date}</Typography><Typography variant="subtitle2">{target.template.name} - {shiftTime(target.template)}</Typography>{worker ? <Typography color="text.secondary" variant="body2">{worker.name}</Typography> : null}</Stack> : null}</DialogContent><DialogActions sx={{ px: 3, pb: 3 }}><Button disabled={removing} onClick={onClose}>Cancel</Button><Button color="error" disabled={removing} onClick={onConfirm} startIcon={removing ? <CircularProgress color="inherit" size={16} /> : undefined} variant="contained">{removing ? 'Removing...' : 'Remove assignment'}</Button></DialogActions></Dialog>;
}

function AiPanel({ isApproving, onApproveAssignment, onClose, schedule, selection }: { isApproving: boolean; schedule: WeeklySchedule; selection: Selection; onApproveAssignment: (proposal: AiActionProposal) => Promise<void>; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([]);
  const [draft, setDraft] = useState('');
  const [pendingAction, setPendingAction] = useState<AiActionProposal | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [approvedMessage, setApprovedMessage] = useState<string | null>(null);
  const chat = useSendChatMessage();
  const { reset: resetChat } = chat;
  const context = useMemo(() => getAiContext(schedule, selection), [schedule, selection]);

  useEffect(() => {
    setMessages([]);
    setDraft('');
    setPendingAction(null);
    setApprovalError(null);
    setApprovedMessage(null);
    resetChat();
  }, [context.key, resetChat]);

  const send = async (message: string) => {
    const text = message.trim();
    if (!text || chat.isPending) return;
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', content: text }]);
    setDraft('');
    setApprovalError(null);
    setApprovedMessage(null);
    try {
      const response = await chat.mutateAsync({ message: text, context: context.context });
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: response.response }]);
      const action = getAssignmentAction(response);
      setPendingAction(action && actionMatchesContext(action, context.context) ? action : null);
    } catch {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: 'Schedow AI could not respond.' }]);
    }
  };

  const approve = async () => {
    if (!pendingAction) return;
    if (!actionMatchesContext(pendingAction, context.context)) {
      setPendingAction(null);
      setApprovalError('This recommendation no longer matches the active schedule context.');
      return;
    }
    setApprovalError(null);
    try {
      await onApproveAssignment(pendingAction);
      setApprovedMessage(`${pendingAction.workerName} is now assigned to ${pendingAction.shiftName ?? 'this shift'}.`);
      setPendingAction(null);
    } catch (error) {
      setApprovalError(getApiErrorMessage(error, 'Could not approve this assignment.'));
    }
  };

  return <AppCard sx={{ flexShrink: 0, position: { xl: 'sticky' }, top: { xl: 96 }, width: { xs: '100%', xl: 360 } }}><Stack spacing={3}><Stack alignItems="center" direction="row" justifyContent="space-between"><Stack direction="row" spacing={1.5}><Box sx={{ alignItems: 'center', bgcolor: 'primary.main', borderRadius: 3, color: 'primary.contrastText', display: 'flex', height: 40, justifyContent: 'center', width: 40 }}><AutoAwesomeRoundedIcon fontSize="small" /></Box><Box><Typography variant="subtitle1">Schedow AI</Typography><Typography color="text.secondary" variant="caption">Scheduling copilot</Typography></Box></Stack><IconButton onClick={onClose}><CloseRoundedIcon /></IconButton></Stack><Box sx={{ maxHeight: { xs: 360, xl: 'calc(100vh - 360px)' }, minHeight: 320, overflowY: 'auto' }}>{messages.length ? <Stack spacing={1.5}>{messages.map((message) => <ChatMessageBubble key={message.id} message={message} />)}{pendingAction ? <AiApprovalCard action={pendingAction} error={approvalError} isApproving={isApproving} schedule={schedule} onApprove={() => void approve()} /> : null}{approvedMessage ? <Alert severity="success">{approvedMessage}</Alert> : null}{chat.isPending ? <CircularProgress size={18} /> : null}</Stack> : <Stack spacing={1.25}><Typography color="text.secondary" variant="caption">Suggested prompts</Typography>{context.prompts.map((prompt) => <Button fullWidth key={prompt} onClick={() => void send(prompt)} sx={{ justifyContent: 'flex-start', textAlign: 'left' }} variant="outlined">{prompt}</Button>)}</Stack>}</Box><Stack spacing={1}><Typography color="text.secondary" variant="caption">Active context</Typography><Box sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06), border: 1, borderColor: (theme) => alpha(theme.palette.primary.main, 0.16), borderRadius: 3, px: 1.5, py: 1 }}><Typography variant="subtitle2">{context.label}</Typography></Box><TextField fullWidth minRows={3} multiline onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(draft); } }} placeholder="Message Schedow AI..." size="small" value={draft} />{chat.error ? <Alert severity="error">{getApiErrorMessage(chat.error)}</Alert> : null}<Button disabled={!draft.trim() || chat.isPending} onClick={() => void send(draft)} variant="contained">Send</Button></Stack></Stack></AppCard>;
}

function AiApprovalCard({ action, error, isApproving, onApprove, schedule }: { action: AiActionProposal; error: string | null; isApproving: boolean; schedule: WeeklySchedule; onApprove: () => void }) {
  const template = schedule.shiftTemplates.find((item) => Number(item.id) === action.shiftId);
  const date = action.date ? formatActionDate(action.date) : action.dayOfWeek;
  const shiftName = action.shiftName ?? template?.name ?? 'Shift';
  const time = action.startTime && action.endTime ? `${action.startTime} - ${action.endTime}` : template ? shiftTime(template) : 'Time unavailable';
  return <Box sx={{ alignSelf: 'stretch', bgcolor: 'background.paper', border: 1, borderColor: (theme) => alpha(theme.palette.primary.main, 0.2), borderRadius: 3, boxShadow: 2, p: 2 }}><Stack spacing={1.5}><Box><Typography color="text.secondary" variant="caption">Recommended assignment</Typography><Typography variant="subtitle1">{action.workerName}</Typography><Typography color="text.secondary" variant="body2">{shiftName}</Typography><Typography color="text.secondary" variant="caption">{date} - {time}</Typography></Box>{error ? <Alert severity="error">{error}</Alert> : null}<Button disabled={isApproving} onClick={onApprove} startIcon={isApproving ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon fontSize="small" />} sx={{ alignSelf: 'flex-start', '& .MuiButton-startIcon': { alignItems: 'center', display: 'inline-flex', marginRight: 0.75 } }} variant="contained">{isApproving ? 'Assigning...' : 'Approve Assignment'}</Button></Stack></Box>;
}
function ChatMessageBubble({ message }: { message: { role: 'user' | 'assistant'; content: string } }) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        bgcolor: isUser ? 'primary.main' : (theme) => alpha(theme.palette.grey[100], 0.82),
        border: 1,
        borderColor: isUser ? 'primary.main' : 'divider',
        borderRadius: 3,
        color: isUser ? 'primary.contrastText' : 'text.primary',
        maxWidth: '88%',
        overflowWrap: 'anywhere',
        px: 1.5,
        py: 1.25,
        wordBreak: 'break-word',
      }}
    >
      {isUser ? (
        <Typography sx={{ whiteSpace: 'pre-wrap' }} variant="body2">
          {message.content}
        </Typography>
      ) : (
        <MarkdownMessage content={message.content} />
      )}
    </Box>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: 'bullet' | 'number' | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join('\n').trim();
    if (text) {
      blocks.push(
        <Typography component="p" key={`p-${blocks.length}`} sx={{ mb: 1, whiteSpace: 'pre-line' }} variant="body2">
          {renderInlineMarkdown(text)}
        </Typography>,
      );
    }
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) return;
    blocks.push(
      <Box
        component={listType === 'number' ? 'ol' : 'ul'}
        key={`list-${blocks.length}`}
        sx={{ my: 1, pl: 2.5, '& li': { mb: 0.5, pl: 0.25 } }}
      >
        {listItems.map((item, index) => (
          <Typography component="li" key={`${item}-${index}`} variant="body2">
            {renderInlineMarkdown(item)}
          </Typography>
        ))}
      </Box>,
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    const boldHeadingMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*$/);
    const boldHeadingWithTextMatch = trimmed.match(/^\*\*([^*]+)\*\*\s+(.+)$/);
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (headingMatch || boldHeadingMatch || boldHeadingWithTextMatch) {
      flushParagraph();
      flushList();
      const headingText = headingMatch?.[2] ?? boldHeadingMatch?.[1] ?? boldHeadingWithTextMatch?.[1] ?? '';
      blocks.push(
        <Typography component="h3" key={`h-${blocks.length}`} sx={{ fontWeight: 700, mb: 0.75, mt: blocks.length ? 1.25 : 0 }} variant="subtitle2">
          {renderInlineMarkdown(headingText)}
        </Typography>,
      );
      if (boldHeadingWithTextMatch?.[2]) {
        paragraph.push(boldHeadingWithTextMatch[2]);
      }
      return;
    }

    if (bulletMatch || numberedMatch) {
      flushParagraph();
      const nextType = bulletMatch ? 'bullet' : 'number';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bulletMatch?.[1] ?? numberedMatch?.[1] ?? '').trim());
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <Box sx={{ '& > :last-child': { mb: 0 } }}>{blocks}</Box>;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);

    if (bold) {
      return (
        <Box component="strong" key={`${part}-${index}`} sx={{ fontWeight: 700 }}>
          {bold[1]}
        </Box>
      );
    }

    return part;
  });
}
function getAssignmentAction(response: ChatResponse): AiActionProposal | null {
  const action = response.actionProposal ?? response.pendingAction ?? response.action ?? null;
  if (!action) return null;
  const actionType = String(action.type ?? action.action ?? response.type ?? '').toUpperCase();
  const isAssignmentAction = actionType.includes('ASSIGN') && (actionType.includes('SHIFT') || actionType.includes('WORKER'));
  if (!isAssignmentAction || !Number.isFinite(Number(action.workerId)) || !Number.isFinite(Number(action.shiftId))) return null;
  return {
    ...action,
    workerId: Number(action.workerId),
    shiftId: Number(action.shiftId),
  };
}

function actionMatchesContext(action: AiActionProposal, context: { [key: string]: string | number | null | undefined }) {
  if (context.contextType !== 'SHIFT') return true;
  return context.weekStartDate === action.weekStartDate && context.dayOfWeek === action.dayOfWeek && Number(context.shiftId) === action.shiftId && (action.assignmentId == null || context.assignmentId === action.assignmentId);
}

function formatActionDate(value: string) {
  const date = parseDate(value);
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}
function MetricSkeleton() { return <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>{[0, 1, 2].map((item) => <AppCard key={item} sx={{ flex: 1 }}><Skeleton height={88} /></AppCard>)}</Stack>; }
function GridSkeleton() { return <Stack spacing={2}>{[0, 1, 2, 3, 4].map((item) => <Skeleton height={92} key={item} sx={{ borderRadius: 3 }} variant="rounded" />)}</Stack>; }
function getMetrics(schedule?: WeeklySchedule) { const assigned = schedule?.shifts.filter((shift) => shift.assignedWorkers.length > 0).length ?? 0; const possible = schedule ? schedule.days.length * schedule.shiftTemplates.length : 0; return { assigned, totalCells: schedule?.shifts.length ?? 0, open: Math.max(0, possible - (schedule?.shifts.length ?? 0)), ai: schedule?.shifts.filter((shift) => shift.aiRecommendationAvailable).length ?? 0 }; }
function getAiContext(schedule: WeeklySchedule, selection: Selection) { if (selection.type === 'shift') { const empty = parseEmptyId(selection.shiftId); const shift = schedule.shifts.find((item) => item.id === selection.shiftId); const day = empty ? getDay(schedule, empty.dayId) : shift ? getDay(schedule, shift.dayId) : undefined; const template = empty ? getTemplate(schedule, empty.templateId) : shift ? getTemplate(schedule, shift.templateId) : undefined; if (day && template) return { key: `SHIFT:${day.id}:${template.id}:${shift?.id ?? 'empty'}`, label: `${day.fullLabel} - ${template.name}`, context: { contextType: 'SHIFT', weekStartDate: schedule.weekStartDate, date: day.id, dayOfWeek: javaDay(day.fullLabel), shiftId: nullableNumber(template.id), shiftName: template.name, startTime: template.startTime, endTime: template.endTime, assignmentId: shift ? nullableNumber(shift.id) : null, assignedWorkerName: shift?.assignedWorkers[0]?.name ?? null }, prompts: shift?.assignedWorkers[0] ? ['Explain this assignment', 'Who else could work this shift?', 'Can you suggest an alternative?'] : ['Recommend a worker for this shift', 'Who is available for this shift?', 'Show me the best candidates'] }; } if (selection.type === 'day') { const day = getDay(schedule, selection.dayId); if (day) return { key: `DAY:${day.id}`, label: `${day.fullLabel} - ${day.date}`, context: { contextType: 'DAY', weekStartDate: schedule.weekStartDate, date: day.id, dayOfWeek: javaDay(day.fullLabel) }, prompts: [`Summarize ${day.fullLabel}'s staffing`, 'Which shifts are unassigned?', 'Are there any scheduling conflicts?'] }; } return { key: `WEEK:${schedule.weekStartDate}`, label: `Week: ${weekFmt.format(parseDate(schedule.weekStartDate))}`, context: { contextType: 'WEEK', weekStartDate: schedule.weekStartDate }, prompts: ['Give me an overview of this week', 'Which shifts are still unfilled?', 'Where are the staffing gaps?'] }; }
function isShiftSelected(schedule: WeeklySchedule, selection: Selection, shiftId: string) { if (selection.type === 'shift') return selection.shiftId === shiftId; if (selection.type === 'day') return schedule.shifts.some((shift) => shift.id === shiftId && shift.dayId === selection.dayId); return selection.type === 'week'; }
function isEmptySelected(selection: Selection, dayId: string, templateId: string) { return selection.type === 'shift' && selection.shiftId === emptyId(dayId, templateId); }
function reconcileSelection(selection: Selection, schedule: WeeklySchedule): Selection { if (selection.type !== 'shift') return selection; if (schedule.shifts.some((shift) => shift.id === selection.shiftId)) return selection; const empty = parseEmptyId(selection.shiftId); return empty && !getShift(schedule, empty.dayId, empty.templateId) ? selection : { type: 'none' }; }
function getShift(schedule: WeeklySchedule, dayId: string, templateId: string) { return schedule.shifts.find((shift) => shift.dayId === dayId && shift.templateId === templateId); }
function getDay(schedule: WeeklySchedule, dayId: string) { return schedule.days.find((day) => day.id === dayId); }
function getTemplate(schedule: WeeklySchedule, templateId: string) { return schedule.shiftTemplates.find((template) => template.id === templateId); }
function emptyId(dayId: string, templateId: string) { return `empty:${dayId}:${templateId}`; }
function parseEmptyId(shiftId: string) { const [, dayId, templateId] = shiftId.match(/^empty:(.+):(.+)$/) ?? []; return dayId && templateId ? { dayId, templateId } : null; }
function shiftTime(template: ShiftTemplate) { return `${template.startTime ?? 'Missing time'} - ${template.endTime ?? 'Missing time'}`; }
function mutationError(error: unknown) { return error ? getApiErrorMessage(error) : undefined; }
function recommendationError(error: unknown) { return error ? getApiErrorMessage(error, 'Could not load recommendations. Please try again.') : undefined; }
function javaDay(day: string) { return day.toUpperCase(); }
function isNumeric(id: string) { return Number.isFinite(Number(id)); }
function nullableNumber(id: string) { return isNumeric(id) ? Number(id) : null; }
function getCurrentWeekStartDate() { return getWeekStartDate(dateId(new Date())); }
function getWeekStartDate(value: string) { const date = parseDate(value); const day = date.getDay(); return dateId(addDays(date, day === 0 ? -6 : 1 - day)); }
function addDays(date: Date, days: number) { const next = new Date(date); next.setDate(date.getDate() + days); return next; }
function parseDate(value: string) { const [year, month, day] = value.split('-').map(Number); return year && month && day ? new Date(year, month - 1, day) : new Date(value); }
function dateId(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }






