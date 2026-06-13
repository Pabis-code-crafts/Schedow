INSERT INTO shifts (id, name, start_time, end_time)
VALUES
(1, 'Morning Shift', '06:00:00', '09:30:00'),
(2, 'Afternoon Shift', '12:00:00', '16:30:00'),
(3, 'Evening Shift', '17:00:00', '20:30:00'),
(4, 'Weekend Shift', '06:00:00', '14:00:00'),
(5, 'Closing Shift', '17:00:00', '21:00:00');

INSERT INTO recurring_shift_assignments
(id, user_id, day_of_week, shift_id)
VALUES
(1, 1, 'SATURDAY', 4),
(2, 2, 'SUNDAY', 4),
(3, 3, 'FRIDAY', 5);

INSERT INTO weekly_shift_assignments
(id, week_start_date, day_of_week,
assigned_user_id, shift_template_id)
VALUES
(1, '2026-06-08', 'MONDAY', 1, 1),
(2, '2026-06-08', 'MONDAY', 2, 2),
(3, '2026-06-08', 'TUESDAY', 1, 3),
(4, '2026-06-08', 'WEDNESDAY', 3, 1),
(5, '2026-06-08', 'THURSDAY', 4, 2),
(6, '2026-06-08', 'FRIDAY', 1, 5),
(7, '2026-06-08', 'SATURDAY', 1, 4),
(8, '2026-06-08', 'SUNDAY', 2, 4);

INSERT INTO unavailability
(id, user_id, unavailable_date,
start_time, end_time, reason)
VALUES
(1, 4, '2026-06-13',
'06:00:00', '14:00:00', 'University Class'),

(2, 5, '2026-06-14',
'12:00:00', '21:00:00', 'Another Job'),

(3, 2, '2026-06-13',
'17:00:00', '21:00:00', 'Family Event'),

(4, 3, '2026-06-12',
'06:00:00', '12:00:00', 'Medical Appointment');

INSERT INTO weekly_shift_assignments
(id, week_start_date, day_of_week,
assigned_user_id, shift_template_id)
VALUES
(9, '2026-06-15', 'MONDAY', 1, 1),
(10, '2026-06-15', 'MONDAY', 1, 2),
(11, '2026-06-15', 'TUESDAY', 1, 3),
(12, '2026-06-15', 'WEDNESDAY', 2, 1),
(13, '2026-06-15', 'THURSDAY', 3, 2),
(14, '2026-06-15', 'FRIDAY', 4, 5);

