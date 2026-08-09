-- ===========================================
-- SHIFTS
-- ===========================================

INSERT INTO shifts (id, name, start_time, end_time)
VALUES
(1, 'Morning Shift', '06:00:00', '09:30:00'),
(2, 'Afternoon Shift', '12:00:00', '16:30:00'),
(3, 'Evening Shift', '17:00:00', '20:30:00'),
(4, 'Core Shift', '06:00:00', '14:00:00'),
(5, 'Closing Shift', '17:00:00', '21:00:00');

-- ===========================================
-- RECURRING ASSIGNMENTS
-- Contracted / Regular shifts
-- ===========================================

INSERT INTO recurring_shift_assignments
(id, user_id, day_of_week, shift_id)
VALUES
(1,1,'MONDAY',1),
(2,2,'MONDAY',2),
(3,3,'TUESDAY',1),
(4,4,'WEDNESDAY',2),
(5,5,'THURSDAY',3),
(6,1,'FRIDAY',5),
(7,2,'SATURDAY',4),
(8,3,'SUNDAY',4);

-- ===========================================
-- WEEK 1
-- ===========================================

INSERT INTO weekly_shift_assignments
(id,week_start_date,day_of_week,assigned_user_id,shift_template_id)
VALUES
(1,'2026-06-08','MONDAY',1,1),
(2,'2026-06-08','MONDAY',2,2),
(3,'2026-06-08','TUESDAY',3,1),
(4,'2026-06-08','WEDNESDAY',4,2),
(5,'2026-06-08','THURSDAY',5,3),
(6,'2026-06-08','FRIDAY',1,5),
(7,'2026-06-08','SATURDAY',2,4),
(8,'2026-06-08','SUNDAY',3,4);

-- ===========================================
-- WEEK 2
-- ===========================================

INSERT INTO weekly_shift_assignments
(id,week_start_date,day_of_week,assigned_user_id,shift_template_id)
VALUES
(9,'2026-06-15','MONDAY',1,1),
(10,'2026-06-15','MONDAY',1,2),
(11,'2026-06-15','TUESDAY',2,3),
(12,'2026-06-15','WEDNESDAY',3,1),
(13,'2026-06-15','THURSDAY',4,2),
(14,'2026-06-15','FRIDAY',5,5);

-- ===========================================
-- WEEK 3
-- Gives different workloads for fairness
-- ===========================================

INSERT INTO weekly_shift_assignments
(id,week_start_date,day_of_week,assigned_user_id,shift_template_id)
VALUES
(15,'2026-06-22','MONDAY',1,1),
(16,'2026-06-22','TUESDAY',1,2),
(17,'2026-06-22','WEDNESDAY',2,3),
(18,'2026-06-22','THURSDAY',3,1),
(19,'2026-06-22','FRIDAY',4,5);

-- ===========================================
-- UNAVAILABILITY
-- ===========================================

INSERT INTO unavailability
(id,user_id,unavailable_date,start_time,end_time,reason)
VALUES
(1,4,'2026-06-13','06:00:00','14:00:00','University'),
(2,5,'2026-06-14','12:00:00','21:00:00','Another Job'),
(3,2,'2026-06-13','17:00:00','21:00:00','Family Event'),
(4,3,'2026-06-12','06:00:00','12:00:00','Medical Appointment');

-- ===========================================
-- RESET SEQUENCES
-- ===========================================

SELECT setval(
    pg_get_serial_sequence('shifts', 'id'),
    COALESCE((SELECT MAX(id) FROM shifts), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('recurring_shift_assignments', 'id'),
    COALESCE((SELECT MAX(id) FROM recurring_shift_assignments), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('weekly_shift_assignments', 'id'),
    COALESCE((SELECT MAX(id) FROM weekly_shift_assignments), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('unavailability', 'id'),
    COALESCE((SELECT MAX(id) FROM unavailability), 1),
    true
);