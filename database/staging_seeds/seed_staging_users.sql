-- =====================================================
-- SEED STAGING USERS - FOR TEST LEAGUE TONIGHT
-- =====================================================
-- Creates 32 real players for staging test run
-- All users have password: password123
-- Email format: firstname.lastname@test.com
-- Nickname format: FirstName + LastInitial
-- All addresses are Florida
-- =====================================================

-- Password for all users: test-password-123
-- Bcrypt hash: $2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2

-- =====================================================
-- AUTH.USERS - Create authentication records
-- =====================================================

INSERT INTO "auth"."users" (
  "instance_id", "id", "aud", "role", "email", "encrypted_password",
  "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at",
  "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change",
  "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data",
  "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at",
  "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current",
  "email_change_confirm_status", "banned_until", "reauthentication_token",
  "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous"
) VALUES
-- 1. Eliseo Sandoval (66%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000001', 'authenticated', 'authenticated', 'eliseo.sandoval@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000001", "email": "eliseo.sandoval@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 2. John Finley (74%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000002', 'authenticated', 'authenticated', 'john.finley@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000002", "email": "john.finley@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 3. Jose Sanabria (48%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000003', 'authenticated', 'authenticated', 'jose.sanabria@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000003", "email": "jose.sanabria@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 4. Paul Runyan (76%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000004', 'authenticated', 'authenticated', 'paul.runyan@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000004", "email": "paul.runyan@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 5. Margie Sandoval (34%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000005', 'authenticated', 'authenticated', 'margie.sandoval@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000005", "email": "margie.sandoval@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 6. David Grimes (54%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000006', 'authenticated', 'authenticated', 'david.grimes@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000006", "email": "david.grimes@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 7. Kristine Guzman (56%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000007', 'authenticated', 'authenticated', 'kristine.guzman@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000007", "email": "kristine.guzman@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 8. Donnie Sandoval (0%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000008', 'authenticated', 'authenticated', 'donnie.sandoval@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000008", "email": "donnie.sandoval@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 9. Tim Carpenter (58%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000009', 'authenticated', 'authenticated', 'tim.carpenter@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000009", "email": "tim.carpenter@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 10. Gynn Hathaway (44%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000010', 'authenticated', 'authenticated', 'gynn.hathaway@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000010", "email": "gynn.hathaway@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 11. Gerald Knierim (70%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000011', 'authenticated', 'authenticated', 'gerald.knierim@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000011", "email": "gerald.knierim@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 12. Hot Rod Zalewski (44%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000012', 'authenticated', 'authenticated', 'hotrod.zalewski@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000012", "email": "hotrod.zalewski@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 13. Trent Bailey (42%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000013', 'authenticated', 'authenticated', 'trent.bailey@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000013", "email": "trent.bailey@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 14. Rick Bergevin Jr. (81%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000014', 'authenticated', 'authenticated', 'rick.bergevinjr@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000014", "email": "rick.bergevinjr@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 15. Mike Patten (56%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000015', 'authenticated', 'authenticated', 'mike.patten@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000015", "email": "mike.patten@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 16. Rick Bergevin Sr. (50%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000016', 'authenticated', 'authenticated', 'rick.bergevinsr@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000016", "email": "rick.bergevinsr@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 17. Johnny Braxton (60%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000017', 'authenticated', 'authenticated', 'johnny.braxton@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000017", "email": "johnny.braxton@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 18. Ed Phillips (51%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000018', 'authenticated', 'authenticated', 'ed.phillips@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000018", "email": "ed.phillips@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 19. Jimmy Newsome (50%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000019', 'authenticated', 'authenticated', 'jimmy.newsome@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000019", "email": "jimmy.newsome@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 20. Melinda Newsome (29%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000020', 'authenticated', 'authenticated', 'melinda.newsome@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000020", "email": "melinda.newsome@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 21. Ed Carle (56%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000021', 'authenticated', 'authenticated', 'ed.carle@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000021", "email": "ed.carle@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 22. Bill Holly (0%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000022', 'authenticated', 'authenticated', 'bill.holly@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000022", "email": "bill.holly@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 23. Oren Gomez (0%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000023', 'authenticated', 'authenticated', 'oren.gomez@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000023", "email": "oren.gomez@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 24. Sherie Grayling (0%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000024', 'authenticated', 'authenticated', 'sherie.grayling@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000024", "email": "sherie.grayling@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 25. Justin Whidden (59%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000025', 'authenticated', 'authenticated', 'justin.whidden@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000025", "email": "justin.whidden@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 26. Ed Poplet (78%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000026', 'authenticated', 'authenticated', 'ed.poplet@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000026", "email": "ed.poplet@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 27. Glenn 'Shane' Lewis (46%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000027', 'authenticated', 'authenticated', 'glenn.lewis@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000027", "email": "glenn.lewis@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 28. Derek Samuels (0%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000028', 'authenticated', 'authenticated', 'derek.samuels@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000028", "email": "derek.samuels@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 29. Kelvin Singleton (45%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000029', 'authenticated', 'authenticated', 'kelvin.singleton@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000029", "email": "kelvin.singleton@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 30. Mike Stepp (62%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000030', 'authenticated', 'authenticated', 'mike.stepp@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000030", "email": "mike.stepp@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 31. Craig Pickard (0%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000031', 'authenticated', 'authenticated', 'craig.pickard@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000031", "email": "craig.pickard@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
-- 32. Justine Valentine (0%)
('00000000-0000-0000-0000-000000000000', 'a0000001-0001-0001-0001-000000000032', 'authenticated', 'authenticated', 'justine.valentine@test.com', '$2a$10$rN8eJLJ3mRqKWPkKXq.5ieTqMbE4z.QZJ5v3G5.5k5VxYqJ5Gu5K2', NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a0000001-0001-0001-0001-000000000032", "email": "justine.valentine@test.com", "email_verified": true, "phone_verified": false}', NULL, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false)
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- AUTH.IDENTITIES - Required for email login to work
-- =====================================================

INSERT INTO "auth"."identities" (
  "provider_id", "user_id", "identity_data", "provider",
  "last_sign_in_at", "created_at", "updated_at", "id"
) VALUES
('a0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001', '{"sub": "a0000001-0001-0001-0001-000000000001", "email": "eliseo.sandoval@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000002', '{"sub": "a0000001-0001-0001-0001-000000000002", "email": "john.finley@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000003', '{"sub": "a0000001-0001-0001-0001-000000000003", "email": "jose.sanabria@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000004', 'a0000001-0001-0001-0001-000000000004', '{"sub": "a0000001-0001-0001-0001-000000000004", "email": "paul.runyan@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000005', 'a0000001-0001-0001-0001-000000000005', '{"sub": "a0000001-0001-0001-0001-000000000005", "email": "margie.sandoval@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000006', 'a0000001-0001-0001-0001-000000000006', '{"sub": "a0000001-0001-0001-0001-000000000006", "email": "david.grimes@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000007', 'a0000001-0001-0001-0001-000000000007', '{"sub": "a0000001-0001-0001-0001-000000000007", "email": "kristine.guzman@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000008', 'a0000001-0001-0001-0001-000000000008', '{"sub": "a0000001-0001-0001-0001-000000000008", "email": "donnie.sandoval@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000009', 'a0000001-0001-0001-0001-000000000009', '{"sub": "a0000001-0001-0001-0001-000000000009", "email": "tim.carpenter@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000010', 'a0000001-0001-0001-0001-000000000010', '{"sub": "a0000001-0001-0001-0001-000000000010", "email": "gynn.hathaway@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000011', 'a0000001-0001-0001-0001-000000000011', '{"sub": "a0000001-0001-0001-0001-000000000011", "email": "gerald.knierim@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000012', 'a0000001-0001-0001-0001-000000000012', '{"sub": "a0000001-0001-0001-0001-000000000012", "email": "hotrod.zalewski@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000013', 'a0000001-0001-0001-0001-000000000013', '{"sub": "a0000001-0001-0001-0001-000000000013", "email": "trent.bailey@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000014', 'a0000001-0001-0001-0001-000000000014', '{"sub": "a0000001-0001-0001-0001-000000000014", "email": "rick.bergevinjr@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000015', 'a0000001-0001-0001-0001-000000000015', '{"sub": "a0000001-0001-0001-0001-000000000015", "email": "mike.patten@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000016', 'a0000001-0001-0001-0001-000000000016', '{"sub": "a0000001-0001-0001-0001-000000000016", "email": "rick.bergevinsr@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000017', 'a0000001-0001-0001-0001-000000000017', '{"sub": "a0000001-0001-0001-0001-000000000017", "email": "johnny.braxton@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000018', 'a0000001-0001-0001-0001-000000000018', '{"sub": "a0000001-0001-0001-0001-000000000018", "email": "ed.phillips@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000019', 'a0000001-0001-0001-0001-000000000019', '{"sub": "a0000001-0001-0001-0001-000000000019", "email": "jimmy.newsome@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000020', 'a0000001-0001-0001-0001-000000000020', '{"sub": "a0000001-0001-0001-0001-000000000020", "email": "melinda.newsome@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000021', 'a0000001-0001-0001-0001-000000000021', '{"sub": "a0000001-0001-0001-0001-000000000021", "email": "ed.carle@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000022', 'a0000001-0001-0001-0001-000000000022', '{"sub": "a0000001-0001-0001-0001-000000000022", "email": "bill.holly@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000023', 'a0000001-0001-0001-0001-000000000023', '{"sub": "a0000001-0001-0001-0001-000000000023", "email": "oren.gomez@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000024', 'a0000001-0001-0001-0001-000000000024', '{"sub": "a0000001-0001-0001-0001-000000000024", "email": "sherie.grayling@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000025', 'a0000001-0001-0001-0001-000000000025', '{"sub": "a0000001-0001-0001-0001-000000000025", "email": "justin.whidden@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000026', 'a0000001-0001-0001-0001-000000000026', '{"sub": "a0000001-0001-0001-0001-000000000026", "email": "ed.poplet@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000027', 'a0000001-0001-0001-0001-000000000027', '{"sub": "a0000001-0001-0001-0001-000000000027", "email": "glenn.lewis@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000028', 'a0000001-0001-0001-0001-000000000028', '{"sub": "a0000001-0001-0001-0001-000000000028", "email": "derek.samuels@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000029', 'a0000001-0001-0001-0001-000000000029', '{"sub": "a0000001-0001-0001-0001-000000000029", "email": "kelvin.singleton@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000030', 'a0000001-0001-0001-0001-000000000030', '{"sub": "a0000001-0001-0001-0001-000000000030", "email": "mike.stepp@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000031', 'a0000001-0001-0001-0001-000000000031', '{"sub": "a0000001-0001-0001-0001-000000000031", "email": "craig.pickard@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid()),
('a0000001-0001-0001-0001-000000000032', 'a0000001-0001-0001-0001-000000000032', '{"sub": "a0000001-0001-0001-0001-000000000032", "email": "justine.valentine@test.com", "email_verified": false, "phone_verified": false}', 'email', NOW(), NOW(), NOW(), gen_random_uuid())
ON CONFLICT (provider_id, provider) DO NOTHING;


-- =====================================================
-- MEMBERS - Create profile records
-- All Florida addresses with fake data
-- =====================================================

INSERT INTO "public"."members" (
  "user_id", "first_name", "last_name", "nickname", "phone", "email",
  "address", "city", "state", "zip_code", "date_of_birth", "role"
) VALUES
-- 1. Eliseo Sandoval
('a0000001-0001-0001-0001-000000000001', 'Eliseo', 'Sandoval', 'EliseoS', '555-101-0001', 'eliseo.sandoval@test.com', '101 Palm Beach Blvd', 'Fort Myers', 'FL', '33901', '1985-03-15', 'player'),
-- 2. John Finley
('a0000001-0001-0001-0001-000000000002', 'John', 'Finley', 'JohnF', '555-101-0002', 'john.finley@test.com', '202 Coconut Dr', 'Naples', 'FL', '34102', '1978-07-22', 'player'),
-- 3. Jose Sanabria
('a0000001-0001-0001-0001-000000000003', 'Jose', 'Sanabria', 'JoseS', '555-101-0003', 'jose.sanabria@test.com', '303 Gulf Shore Blvd', 'Bonita Springs', 'FL', '34134', '1990-11-08', 'player'),
-- 4. Paul Runyan
('a0000001-0001-0001-0001-000000000004', 'Paul', 'Runyan', 'PaulR', '555-101-0004', 'paul.runyan@test.com', '404 Estero Blvd', 'Fort Myers Beach', 'FL', '33931', '1982-05-30', 'player'),
-- 5. Margie Sandoval
('a0000001-0001-0001-0001-000000000005', 'Margie', 'Sandoval', 'MargieS', '555-101-0005', 'margie.sandoval@test.com', '505 McGregor Blvd', 'Fort Myers', 'FL', '33901', '1988-09-12', 'player'),
-- 6. David Grimes
('a0000001-0001-0001-0001-000000000006', 'David', 'Grimes', 'DavidG', '555-101-0006', 'david.grimes@test.com', '606 Colonial Blvd', 'Fort Myers', 'FL', '33907', '1975-12-03', 'player'),
-- 7. Kristine Guzman
('a0000001-0001-0001-0001-000000000007', 'Kristine', 'Guzman', 'KristineG', '555-101-0007', 'kristine.guzman@test.com', '707 Daniels Pkwy', 'Fort Myers', 'FL', '33912', '1992-04-18', 'player'),
-- 8. Donnie Sandoval
('a0000001-0001-0001-0001-000000000008', 'Donnie', 'Sandoval', 'DonnieS', '555-101-0008', 'donnie.sandoval@test.com', '808 Metro Pkwy', 'Fort Myers', 'FL', '33966', '1995-08-25', 'player'),
-- 9. Tim Carpenter
('a0000001-0001-0001-0001-000000000009', 'Tim', 'Carpenter', 'TimC', '555-101-0009', 'tim.carpenter@test.com', '909 Summerlin Rd', 'Fort Myers', 'FL', '33931', '1980-01-14', 'player'),
-- 10. Gynn Hathaway
('a0000001-0001-0001-0001-000000000010', 'Gynn', 'Hathaway', 'GynnH', '555-101-0010', 'gynn.hathaway@test.com', '1010 Six Mile Cypress', 'Fort Myers', 'FL', '33912', '1987-06-07', 'player'),
-- 11. Gerald Knierim
('a0000001-0001-0001-0001-000000000011', 'Gerald', 'Knierim', 'GeraldK', '555-101-0011', 'gerald.knierim@test.com', '1111 Gladiolus Dr', 'Fort Myers', 'FL', '33908', '1973-10-29', 'player'),
-- 12. Hot Rod Zalewski
('a0000001-0001-0001-0001-000000000012', 'Hot Rod', 'Zalewski', 'HotRodZ', '555-101-0012', 'hotrod.zalewski@test.com', '1212 Winkler Ave', 'Fort Myers', 'FL', '33901', '1970-02-16', 'player'),
-- 13. Trent Bailey
('a0000001-0001-0001-0001-000000000013', 'Trent', 'Bailey', 'TrentB', '555-101-0013', 'trent.bailey@test.com', '1313 Cleveland Ave', 'Fort Myers', 'FL', '33901', '1993-07-11', 'player'),
-- 14. Rick Bergevin Jr.
('a0000001-0001-0001-0001-000000000014', 'Rick', 'Bergevin Jr.', 'RickB', '555-101-0014', 'rick.bergevinjr@test.com', '1414 Fowler St', 'Fort Myers', 'FL', '33901', '1991-03-28', 'player'),
-- 15. Mike Patten
('a0000001-0001-0001-0001-000000000015', 'Mike', 'Patten', 'MikeP', '555-101-0015', 'mike.patten@test.com', '1515 Edison Ave', 'Fort Myers', 'FL', '33901', '1984-11-19', 'player'),
-- 16. Rick Bergevin Sr.
('a0000001-0001-0001-0001-000000000016', 'Rick', 'Bergevin Sr.', 'RickB', '555-101-0016', 'rick.bergevinsr@test.com', '1616 First St', 'Fort Myers', 'FL', '33901', '1965-09-05', 'player'),
-- 17. Johnny Braxton
('a0000001-0001-0001-0001-000000000017', 'Johnny', 'Braxton', 'JohnnyB', '555-101-0017', 'johnny.braxton@test.com', '1717 Second St', 'Fort Myers', 'FL', '33901', '1977-04-23', 'player'),
-- 18. Ed Phillips
('a0000001-0001-0001-0001-000000000018', 'Ed', 'Phillips', 'EdP', '555-101-0018', 'ed.phillips@test.com', '1818 Broadway', 'Fort Myers', 'FL', '33901', '1969-12-31', 'player'),
-- 19. Jimmy Newsome
('a0000001-0001-0001-0001-000000000019', 'Jimmy', 'Newsome', 'JimmyN', '555-101-0019', 'jimmy.newsome@test.com', '1919 Main St', 'Fort Myers', 'FL', '33901', '1981-08-17', 'player'),
-- 20. Melinda Newsome
('a0000001-0001-0001-0001-000000000020', 'Melinda', 'Newsome', 'MelindaN', '555-101-0020', 'melinda.newsome@test.com', '2020 Main St', 'Fort Myers', 'FL', '33901', '1983-05-09', 'player'),
-- 21. Ed Carle
('a0000001-0001-0001-0001-000000000021', 'Ed', 'Carle', 'EdC', '555-101-0021', 'ed.carle@test.com', '2121 Bay St', 'Fort Myers', 'FL', '33901', '1972-02-28', 'player'),
-- 22. Bill Holly
('a0000001-0001-0001-0001-000000000022', 'Bill', 'Holly', 'BillH', '555-101-0022', 'bill.holly@test.com', '2222 Oak St', 'Fort Myers', 'FL', '33901', '1968-10-14', 'player'),
-- 23. Oren Gomez
('a0000001-0001-0001-0001-000000000023', 'Oren', 'Gomez', 'OrenG', '555-101-0023', 'oren.gomez@test.com', '2323 Pine St', 'Fort Myers', 'FL', '33901', '1994-06-21', 'player'),
-- 24. Sherie Grayling
('a0000001-0001-0001-0001-000000000024', 'Sherie', 'Grayling', 'SherieG', '555-101-0024', 'sherie.grayling@test.com', '2424 Maple St', 'Fort Myers', 'FL', '33901', '1986-01-07', 'player'),
-- 25. Justin Whidden
('a0000001-0001-0001-0001-000000000025', 'Justin', 'Whidden', 'JustinW', '555-101-0025', 'justin.whidden@test.com', '2525 Cedar St', 'Cape Coral', 'FL', '33904', '1989-09-30', 'player'),
-- 26. Ed Poplet
('a0000001-0001-0001-0001-000000000026', 'Ed', 'Poplet', 'EdP', '555-101-0026', 'ed.poplet@test.com', '2626 Del Prado Blvd', 'Cape Coral', 'FL', '33904', '1979-03-12', 'player'),
-- 27. Glenn 'Shane' Lewis
('a0000001-0001-0001-0001-000000000027', 'Glenn', 'Lewis', 'ShaneL', '555-101-0027', 'glenn.lewis@test.com', '2727 Santa Barbara Blvd', 'Cape Coral', 'FL', '33914', '1976-07-04', 'player'),
-- 28. Derek Samuels
('a0000001-0001-0001-0001-000000000028', 'Derek', 'Samuels', 'DerekS', '555-101-0028', 'derek.samuels@test.com', '2828 Chiquita Blvd', 'Cape Coral', 'FL', '33914', '1996-11-22', 'player'),
-- 29. Kelvin Singleton
('a0000001-0001-0001-0001-000000000029', 'Kelvin', 'Singleton', 'KelvinS', '555-101-0029', 'kelvin.singleton@test.com', '2929 Skyline Blvd', 'Cape Coral', 'FL', '33914', '1988-04-15', 'player'),
-- 30. Mike Stepp
('a0000001-0001-0001-0001-000000000030', 'Mike', 'Stepp', 'MikeS', '555-101-0030', 'mike.stepp@test.com', '3030 Veterans Pkwy', 'Cape Coral', 'FL', '33914', '1974-08-08', 'player'),
-- 31. Craig Pickard
('a0000001-0001-0001-0001-000000000031', 'Craig', 'Pickard', 'CraigP', '555-101-0031', 'craig.pickard@test.com', '3131 Country Club Blvd', 'Cape Coral', 'FL', '33990', '1971-12-25', 'player'),
-- 32. Justine Valentine
('a0000001-0001-0001-0001-000000000032', 'Justine', 'Valentine', 'JustineV', '555-101-0032', 'justine.valentine@test.com', '3232 Coronado Pkwy', 'Cape Coral', 'FL', '33904', '1997-02-14', 'player')
ON CONFLICT (user_id) DO NOTHING;


-- =====================================================
-- QUICK REFERENCE - Player Handicaps (for when adding to teams)
-- =====================================================
-- Eliseo Sandoval     66%
-- John Finley         74%
-- Jose Sanabria       48%
-- Paul Runyan         76%
-- Margie Sandoval     34%
-- David Grimes        54%
-- Kristine Guzman     56%
-- Donnie Sandoval     0%
-- Tim Carpenter       58%
-- Gynn Hathaway       44%
-- Gerald Knierim      70%
-- Hot Rod Zalewski    44%
-- Trent Bailey        42%
-- Rick Bergevin Jr.   81%
-- Mike Patten         56%
-- Rick Bergevin Sr.   50%
-- Johnny Braxton      60%
-- Ed Phillips         51%
-- Jimmy Newsome       50%
-- Melinda Newsome     29%
-- Ed Carle            56%
-- Bill Holly          0%
-- Oren Gomez          0%
-- Sherie Grayling     0%
-- Justin Whidden      59%
-- Ed Poplet           78%
-- Glenn 'Shane' Lewis 46%
-- Derek Samuels       0%
-- Kelvin Singleton    45%
-- Mike Stepp          62%
-- Craig Pickard       0%
-- Justine Valentine   0%
-- =====================================================


-- =====================================================
-- LOGIN CREDENTIALS
-- =====================================================
-- Email: firstname.lastname@test.com (lowercase, no spaces)
-- Password: test-password-123
--
-- Examples:
--   eliseo.sandoval@test.com / test-password-123
--   john.finley@test.com / test-password-123
--   hotrod.zalewski@test.com / test-password-123
--   rick.bergevinjr@test.com / test-password-123
--   glenn.lewis@test.com / test-password-123
-- =====================================================
