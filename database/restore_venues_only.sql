-- Restore venues only (orgs and leagues already restored)
INSERT INTO "public"."venues" (
    "id", "organization_id", "venue_owner_id", "name", "street_address", "city", "state",
    "zip_code", "phone", "bar_box_tables", "regulation_tables", "proprietor_name",
    "proprietor_phone", "league_contact_name", "league_contact_phone", "league_contact_email",
    "website", "business_hours", "notes", "is_active", "created_at", "updated_at",
    "bar_box_table_numbers"
) VALUES
    ('8ee822ea-5ff8-4c78-90ee-9baa3acf6f57', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'Crystals', '5707 Gall Bl', 'Zephyrhills', 'FL', '33540', '813-715-2004', 4, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-12 00:31:50.355931+00', '2025-10-12 00:47:50.40834+00', ARRAY[1,2,3,4]),
    ('b9d6be5e-c98b-4569-a83a-1e5adc89b096', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'happy dayz', '12401 us 301', 'dade city', 'FL', '33525', '352-521-5003', 6, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-12 00:52:17.780418+00', '2025-10-12 00:52:17.780418+00', ARRAY[1,2,3,4,5,6]),
    ('ece734e4-3483-42f9-976a-4d4a1650db67', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'buteras billiards', '1234 shit st', 'tampa', 'FL', '33555', '283-746-5833', 6, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-02 18:27:58.366982+00', '2025-11-02 18:40:35.882019+00', ARRAY[1,2,3,4,5,6]),
    ('ad877885-68e0-435f-ab56-9a48a1a07fd0', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'cool pool', '9874 calutrans', 'zephyrhills', 'FL', '33540', '384-783-6733', 6, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-02 19:05:04.203804+00', '2025-11-02 19:05:21.777335+00', ARRAY[1,2,3,4,5,6]),
    ('5b9ef269-deff-4d98-81eb-b3821f5e161c', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'newest test venue 2', '4321 asshole st', 'zephyrhills', 'FL', '33540', '423-123-6889', 7, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-02 19:13:16.138311+00', '2025-11-02 19:13:52.67291+00', ARRAY[1,2,3,4,5,6,7]);

-- league_venues
INSERT INTO "public"."league_venues" ("id", "league_id", "venue_id", "available_bar_box_tables", "available_regulation_tables", "added_at", "updated_at") VALUES
    ('34607c40-baf0-40e8-8989-88da115f53c2', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', 'ece734e4-3483-42f9-976a-4d4a1650db67', 6, 0, '2025-11-05 04:01:53.313646+00', '2025-11-05 04:01:53.313646+00'),
    ('c6ff00b5-1557-49ce-b1ba-062f016acfb1', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', 'ad877885-68e0-435f-ab56-9a48a1a07fd0', 6, 0, '2025-11-05 04:01:55.468195+00', '2025-11-05 04:01:55.468195+00'),
    ('9ffb4ce7-9009-4ffb-bc6b-d753ab40a5bf', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', '8ee822ea-5ff8-4c78-90ee-9baa3acf6f57', 4, 0, '2025-11-05 04:01:55.468195+00', '2025-11-05 04:01:55.468195+00'),
    ('0da80a6f-b3e4-4d5d-980f-1cccaaf47ce3', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', 'b9d6be5e-c98b-4569-a83a-1e5adc89b096', 6, 0, '2025-11-05 04:01:55.468195+00', '2025-11-05 04:01:55.468195+00'),
    ('b3e31d60-900c-4499-a1db-2156e08a9e9b', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', '5b9ef269-deff-4d98-81eb-b3821f5e161c', 7, 0, '2025-11-05 04:01:55.468195+00', '2025-11-05 04:01:55.468195+00'),
    ('c20e0aa3-3cd9-4819-9800-387610a2de3f', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', 'ece734e4-3483-42f9-976a-4d4a1650db67', 6, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00'),
    ('a83d6451-7a9d-4abd-b90c-a52871e6f497', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', 'ad877885-68e0-435f-ab56-9a48a1a07fd0', 6, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00'),
    ('b3af551b-1dcc-43e6-845d-754bb6f0e05a', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', '8ee822ea-5ff8-4c78-90ee-9baa3acf6f57', 4, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00'),
    ('0b70dbda-136d-467d-8fbd-fa5f4d877e37', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', 'b9d6be5e-c98b-4569-a83a-1e5adc89b096', 6, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00'),
    ('872f114d-bcb7-4d5a-86b3-2b62a111092a', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', '5b9ef269-deff-4d98-81eb-b3821f5e161c', 7, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00');
