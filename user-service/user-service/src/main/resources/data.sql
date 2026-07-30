INSERT INTO users
(id, name, email, password, role, site, contracted_hours, active)
VALUES

(
1,
'John',
'john@schedow.com',
'$2a$10$22xYWQY3et8a4sbrPUsKde/loPk75/ZLo.5CREoiRKW24pmVHfhCq',
'WORKER',
'Hatfield',
20,
true
),

(
2,
'Sarah',
'sarah@schedow.com',
'$2a$10$22xYWQY3et8a4sbrPUsKde/loPk75/ZLo.5CREoiRKW24pmVHfhCq',
'WORKER',
'Hatfield',
20,
true
),

(
3,
'Alex',
'alex@schedow.com',
'$2a$10$22xYWQY3et8a4sbrPUsKde/loPk75/ZLo.5CREoiRKW24pmVHfhCq',
'WORKER',
'Hatfield',
16,
true
),

(
4,
'Emma',
'emma@schedow.com',
'$2a$10$22xYWQY3et8a4sbrPUsKde/loPk75/ZLo.5CREoiRKW24pmVHfhCq',
'WORKER',
'Hatfield',
12,
true
),

(
5,
'Tom',
'tom@schedow.com',
'$2a$10$22xYWQY3et8a4sbrPUsKde/loPk75/ZLo.5CREoiRKW24pmVHfhCq',
'WORKER',
'Hatfield',
24,
true
),

(
6,
'supervisor',
'supervisor@schedow.com',
'$2a$10$22xYWQY3et8a4sbrPUsKde/loPk75/ZLo.5CREoiRKW24pmVHfhCq',
'SUPERVISOR',
'Hatfield',
0,
true
),

(
7,
'Admin',
'admin@schedow.com',
'$2a$10$22xYWQY3et8a4sbrPUsKde/loPk75/ZLo.5CREoiRKW24pmVHfhCq',
'ADMIN',
'Hatfield',
0,
true
);

-- ===========================================
-- RESET USERS SEQUENCE
-- ===========================================

SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    COALESCE((SELECT MAX(id) FROM users), 1),
    true
);