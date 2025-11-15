SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict u4CfUPn8IcILui5U8Dt3crMVn22sO7ZSw30d8Gj18QBAemS6wuBU5XvXxrKWcRa

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '880cbc96-aec9-47d8-b0e7-ccf24f6f63a1', '{"action":"user_signedup","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-15 16:31:25.86295+00', ''),
	('00000000-0000-0000-0000-000000000000', '763196dc-bdc4-478f-a939-7b3251596da3', '{"action":"login","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:31:25.868045+00', ''),
	('00000000-0000-0000-0000-000000000000', '58b0cebb-275d-42e8-83f1-8726084218f3', '{"action":"user_signedup","actor_id":"6fc809fb-c970-4f6a-82e7-d87bfdce3d96","actor_username":"captain1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-15 16:31:49.187211+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3a3f86d-4462-4c10-a025-d46a9bf94c05', '{"action":"login","actor_id":"6fc809fb-c970-4f6a-82e7-d87bfdce3d96","actor_username":"captain1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:31:49.190518+00', ''),
	('00000000-0000-0000-0000-000000000000', '7785cc17-add2-4d4c-b9bc-fdfe029c09f9', '{"action":"user_signedup","actor_id":"80af04d2-aff2-4068-91c8-89c3042b109c","actor_username":"captain2@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-15 16:32:21.024892+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6e56778-adcb-4ac6-9556-1fc6bcd16fe2', '{"action":"login","actor_id":"80af04d2-aff2-4068-91c8-89c3042b109c","actor_username":"captain2@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:32:21.027606+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb4ef327-fb87-4b61-8d52-a29953dd26bc', '{"action":"user_signedup","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-15 16:32:47.867352+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b27dae65-8380-4824-8a2c-ff3b195d4cd0', '{"action":"login","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:32:47.870065+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e06edb9f-a69d-4c13-b113-45b1929018cc', '{"action":"login","actor_id":"6fc809fb-c970-4f6a-82e7-d87bfdce3d96","actor_username":"captain1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:33:08.71886+00', ''),
	('00000000-0000-0000-0000-000000000000', '52a23c67-c2ce-45c3-891b-fb814307c64f', '{"action":"login","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:39:00.179149+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ff4d5d15-21c2-4828-b481-516367ab0770', '{"action":"login","actor_id":"6fc809fb-c970-4f6a-82e7-d87bfdce3d96","actor_username":"captain1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:52:56.870597+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c3720ec5-9f71-45d1-ae6f-f388a9fe35aa', '{"action":"logout","actor_id":"6fc809fb-c970-4f6a-82e7-d87bfdce3d96","actor_username":"captain1@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-15 16:54:41.636176+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd91b213-004f-46bf-97a0-6d54bffd48f5', '{"action":"login","actor_id":"80af04d2-aff2-4068-91c8-89c3042b109c","actor_username":"captain2@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:54:55.51906+00', ''),
	('00000000-0000-0000-0000-000000000000', '1aa48f37-db34-455d-afcd-33ed2b63e3fb', '{"action":"logout","actor_id":"80af04d2-aff2-4068-91c8-89c3042b109c","actor_username":"captain2@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-15 16:55:55.274623+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cad9fc3e-d74e-4700-a03d-2e89fd2ad173', '{"action":"login","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-15 16:56:07.932997+00', ''),
	('00000000-0000-0000-0000-000000000000', '96a69077-8cf3-45ab-b484-d2d827c72293', '{"action":"token_refreshed","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 17:37:01.663768+00', ''),
	('00000000-0000-0000-0000-000000000000', '7766d4b1-907e-4bfa-b0e5-4eab8a62bde7', '{"action":"token_revoked","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 17:37:01.669269+00', ''),
	('00000000-0000-0000-0000-000000000000', '5cb9de05-1aa3-47a0-b3a2-7f4727ca33a0', '{"action":"token_refreshed","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 17:54:35.513495+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c88bf446-31e0-44f3-a071-1010cf50da97', '{"action":"token_revoked","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 17:54:35.517522+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b29fdff-e783-4522-8b73-2f42b3b475ae', '{"action":"token_refreshed","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 18:35:12.366093+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a469399-ff52-4ad2-9c6d-506db8288157', '{"action":"token_revoked","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 18:35:12.379818+00', ''),
	('00000000-0000-0000-0000-000000000000', '1cd0dbdc-ec60-40c4-a08b-e62e11e4d38d', '{"action":"token_refreshed","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 18:52:56.154147+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c1653b48-93d9-48b8-bff7-d15cd9a97234', '{"action":"token_revoked","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 18:52:56.155742+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f82939dd-9b35-4b71-bcb6-b91566e4ff6f', '{"action":"token_refreshed","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 19:33:53.412235+00', ''),
	('00000000-0000-0000-0000-000000000000', '9920d423-1bb1-42ae-bc6c-3ed2fc97e9d3', '{"action":"token_revoked","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 19:33:53.613846+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d6f6f26-3412-4587-a89f-83e38237b67f', '{"action":"token_refreshed","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 20:02:22.774911+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e5dc2110-8b37-4199-bafe-4cec7748d311', '{"action":"token_revoked","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 20:02:22.794831+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3ab140a-5989-4a81-8de3-109f595d0628', '{"action":"token_refreshed","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 20:37:42.907163+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b00c5f8e-7daf-44e3-ab16-658990d831f8', '{"action":"token_revoked","actor_id":"90928e11-4436-4b91-80ba-af112e64337d","actor_username":"shodbyed@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 20:37:42.926462+00', ''),
	('00000000-0000-0000-0000-000000000000', '4e858f6b-78df-4045-9dfd-992ed1bd88ff', '{"action":"token_refreshed","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 21:00:45.859401+00', ''),
	('00000000-0000-0000-0000-000000000000', '1de88ca0-d325-415c-bc5d-fb2a2626b3ee', '{"action":"token_revoked","actor_id":"b1b96b25-ab30-46e8-b289-eee218691270","actor_username":"captain3@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-15 21:00:45.862627+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '90928e11-4436-4b91-80ba-af112e64337d', 'authenticated', 'authenticated', 'shodbyed@gmail.com', '$2a$10$NLMUY7U7ddEdgq3oQ9At9u9hQiUM4EMo/QSZ03qEWNQaBaM54KHhG', '2025-11-15 16:31:25.864567+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-15 16:39:00.183358+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "90928e11-4436-4b91-80ba-af112e64337d", "email": "shodbyed@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-15 16:31:25.83796+00', '2025-11-15 20:37:42.961977+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b1b96b25-ab30-46e8-b289-eee218691270', 'authenticated', 'authenticated', 'captain3@gmail.com', '$2a$10$K4HLaWFHnQqpUdLm1dlvl.jUm5LnuuoPyGne7LPyIfkR0H6tBRNlS', '2025-11-15 16:32:47.867794+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-15 16:56:07.934437+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b1b96b25-ab30-46e8-b289-eee218691270", "email": "captain3@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-15 16:32:47.860951+00', '2025-11-15 21:00:45.866748+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6fc809fb-c970-4f6a-82e7-d87bfdce3d96', 'authenticated', 'authenticated', 'captain1@gmail.com', '$2a$10$IsQdElXaLBs4IDnLwOf6uerW4KVrMfmPN15XDO15VDhdNj.H0wbr2', '2025-11-15 16:31:49.18809+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-15 16:52:56.874967+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6fc809fb-c970-4f6a-82e7-d87bfdce3d96", "email": "captain1@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-15 16:31:49.181059+00', '2025-11-15 16:52:56.882107+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '80af04d2-aff2-4068-91c8-89c3042b109c', 'authenticated', 'authenticated', 'captain2@gmail.com', '$2a$10$WXshvuBbr1Kwe/AEZc00eeH1BXm9GIHUTpO/nsK.MOrCtDn06kjXu', '2025-11-15 16:32:21.02563+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-15 16:54:55.526815+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "80af04d2-aff2-4068-91c8-89c3042b109c", "email": "captain2@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-15 16:32:21.01917+00', '2025-11-15 16:54:55.542838+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('90928e11-4436-4b91-80ba-af112e64337d', '90928e11-4436-4b91-80ba-af112e64337d', '{"sub": "90928e11-4436-4b91-80ba-af112e64337d", "email": "shodbyed@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-15 16:31:25.859572+00', '2025-11-15 16:31:25.859602+00', '2025-11-15 16:31:25.859602+00', 'b20b419c-d2b3-452f-8b47-c5937c3405c7'),
	('6fc809fb-c970-4f6a-82e7-d87bfdce3d96', '6fc809fb-c970-4f6a-82e7-d87bfdce3d96', '{"sub": "6fc809fb-c970-4f6a-82e7-d87bfdce3d96", "email": "captain1@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-15 16:31:49.183855+00', '2025-11-15 16:31:49.18388+00', '2025-11-15 16:31:49.18388+00', '17c20b66-7b1e-4b16-8bea-6cd2e61bcff3'),
	('80af04d2-aff2-4068-91c8-89c3042b109c', '80af04d2-aff2-4068-91c8-89c3042b109c', '{"sub": "80af04d2-aff2-4068-91c8-89c3042b109c", "email": "captain2@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-15 16:32:21.02205+00', '2025-11-15 16:32:21.022083+00', '2025-11-15 16:32:21.022083+00', 'eb26755e-0950-444b-87ba-c03d77ce4d9d'),
	('b1b96b25-ab30-46e8-b289-eee218691270', 'b1b96b25-ab30-46e8-b289-eee218691270', '{"sub": "b1b96b25-ab30-46e8-b289-eee218691270", "email": "captain3@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-15 16:32:47.864537+00', '2025-11-15 16:32:47.864563+00', '2025-11-15 16:32:47.864563+00', '9b0cc1c8-b25d-4ef0-9cfc-f3bc4b2736fe');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id") VALUES
	('b9dd1890-89a6-46a1-97b5-ab0104990301', '90928e11-4436-4b91-80ba-af112e64337d', '2025-11-15 16:31:25.869444+00', '2025-11-15 16:31:25.869444+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '172.217.15.202', NULL, NULL),
	('8e4a02c2-a1c4-4693-bc9b-3c962db5774c', 'b1b96b25-ab30-46e8-b289-eee218691270', '2025-11-15 16:32:47.870822+00', '2025-11-15 16:32:47.870822+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '172.217.15.202', NULL, NULL),
	('48d93a65-6bde-4b83-935f-1fed8052426e', '90928e11-4436-4b91-80ba-af112e64337d', '2025-11-15 16:39:00.183925+00', '2025-11-15 20:37:42.966041+00', NULL, 'aal1', NULL, '2025-11-15 20:37:42.965903', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '172.217.15.202', NULL, NULL),
	('acc0a8cd-691b-4cbb-bb15-c558c221a66d', 'b1b96b25-ab30-46e8-b289-eee218691270', '2025-11-15 16:56:07.934531+00', '2025-11-15 21:00:45.870315+00', NULL, 'aal1', NULL, '2025-11-15 21:00:45.869087', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '172.217.15.202', NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('b9dd1890-89a6-46a1-97b5-ab0104990301', '2025-11-15 16:31:25.875262+00', '2025-11-15 16:31:25.875262+00', 'password', 'b7dd172e-44e0-4975-be5f-bad82cab1492'),
	('8e4a02c2-a1c4-4693-bc9b-3c962db5774c', '2025-11-15 16:32:47.87244+00', '2025-11-15 16:32:47.87244+00', 'password', '6744fb33-54f8-4326-903d-488dc116970a'),
	('48d93a65-6bde-4b83-935f-1fed8052426e', '2025-11-15 16:39:00.18977+00', '2025-11-15 16:39:00.18977+00', 'password', '19b15c93-2a50-4f12-b11f-e520395ecca0'),
	('acc0a8cd-691b-4cbb-bb15-c558c221a66d', '2025-11-15 16:56:07.936916+00', '2025-11-15 16:56:07.936916+00', 'password', 'bcaf9ad7-7554-421b-a6b1-e3778e63169c');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, 'vaizfalkb6bj', '90928e11-4436-4b91-80ba-af112e64337d', false, '2025-11-15 16:31:25.872411+00', '2025-11-15 16:31:25.872411+00', NULL, 'b9dd1890-89a6-46a1-97b5-ab0104990301'),
	('00000000-0000-0000-0000-000000000000', 4, '233mzor3snva', 'b1b96b25-ab30-46e8-b289-eee218691270', false, '2025-11-15 16:32:47.871319+00', '2025-11-15 16:32:47.871319+00', NULL, '8e4a02c2-a1c4-4693-bc9b-3c962db5774c'),
	('00000000-0000-0000-0000-000000000000', 6, 'b4c445253r7p', '90928e11-4436-4b91-80ba-af112e64337d', true, '2025-11-15 16:39:00.187752+00', '2025-11-15 17:37:01.670598+00', NULL, '48d93a65-6bde-4b83-935f-1fed8052426e'),
	('00000000-0000-0000-0000-000000000000', 9, 'kgsjm2qto4j4', 'b1b96b25-ab30-46e8-b289-eee218691270', true, '2025-11-15 16:56:07.935618+00', '2025-11-15 17:54:35.520077+00', NULL, 'acc0a8cd-691b-4cbb-bb15-c558c221a66d'),
	('00000000-0000-0000-0000-000000000000', 10, 'lz3oapk4os3w', '90928e11-4436-4b91-80ba-af112e64337d', true, '2025-11-15 17:37:01.681121+00', '2025-11-15 18:35:12.381859+00', 'b4c445253r7p', '48d93a65-6bde-4b83-935f-1fed8052426e'),
	('00000000-0000-0000-0000-000000000000', 11, 'jjxl7sqssg3q', 'b1b96b25-ab30-46e8-b289-eee218691270', true, '2025-11-15 17:54:35.522521+00', '2025-11-15 18:52:56.156151+00', 'kgsjm2qto4j4', 'acc0a8cd-691b-4cbb-bb15-c558c221a66d'),
	('00000000-0000-0000-0000-000000000000', 12, 'jjdqnqahgk3k', '90928e11-4436-4b91-80ba-af112e64337d', true, '2025-11-15 18:35:12.385715+00', '2025-11-15 19:33:53.617834+00', 'lz3oapk4os3w', '48d93a65-6bde-4b83-935f-1fed8052426e'),
	('00000000-0000-0000-0000-000000000000', 13, 'ogedh7cxugej', 'b1b96b25-ab30-46e8-b289-eee218691270', true, '2025-11-15 18:52:56.157765+00', '2025-11-15 20:02:22.80665+00', 'jjxl7sqssg3q', 'acc0a8cd-691b-4cbb-bb15-c558c221a66d'),
	('00000000-0000-0000-0000-000000000000', 14, 'plrpnjrwqu3h', '90928e11-4436-4b91-80ba-af112e64337d', true, '2025-11-15 19:33:53.652068+00', '2025-11-15 20:37:42.926838+00', 'jjdqnqahgk3k', '48d93a65-6bde-4b83-935f-1fed8052426e'),
	('00000000-0000-0000-0000-000000000000', 16, 'ce4xo6yuqqy3', '90928e11-4436-4b91-80ba-af112e64337d', false, '2025-11-15 20:37:42.94907+00', '2025-11-15 20:37:42.94907+00', 'plrpnjrwqu3h', '48d93a65-6bde-4b83-935f-1fed8052426e'),
	('00000000-0000-0000-0000-000000000000', 15, 'eu7vvypgn63r', 'b1b96b25-ab30-46e8-b289-eee218691270', true, '2025-11-15 20:02:22.812156+00', '2025-11-15 21:00:45.863112+00', 'ogedh7cxugej', 'acc0a8cd-691b-4cbb-bb15-c558c221a66d'),
	('00000000-0000-0000-0000-000000000000', 17, 'h7wryo2ro3wi', 'b1b96b25-ab30-46e8-b289-eee218691270', false, '2025-11-15 21:00:45.865077+00', '2025-11-15 21:00:45.865077+00', 'eu7vvypgn63r', 'acc0a8cd-691b-4cbb-bb15-c558c221a66d');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."members" ("id", "user_id", "first_name", "last_name", "nickname", "phone", "email", "address", "city", "state", "zip_code", "date_of_birth", "role", "system_player_number", "bca_member_number", "membership_paid_date", "created_at", "updated_at", "profanity_filter_enabled") VALUES
	('d79719da-2ffd-4a10-b5d0-1563ecd9e9db', NULL, 'James', 'Anderson', 'Jimmy', '305-555-0101', 'james.anderson@example.com', '1001 Biscayne Blvd', 'Miami', 'FL', '33101', '1985-03-15', 'player', 1, '123456', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('f07a1002-707e-4dfa-9801-ef31423428a3', NULL, 'Maria', 'Garcia', 'Maria', '305-555-0102', 'maria.garcia@example.com', '1002 Ocean Drive', 'Miami', 'FL', '33139', '1990-07-22', 'player', 2, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('14544cb1-5c9c-42ee-9929-0dc7814731b3', NULL, 'Robert', 'Martinez', 'Bobby', '305-555-0103', 'robert.martinez@example.com', '1003 Collins Ave', 'Miami Beach', 'FL', '33140', '1982-11-08', 'player', 3, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('4f550b10-3b2e-40cc-a59c-2bfa82feced7', NULL, 'Jennifer', 'Rodriguez', 'Jenny', '305-555-0104', 'jennifer.rodriguez@example.com', '1004 Washington Ave', 'Miami Beach', 'FL', '33139', '1995-02-14', 'player', 4, '234567', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('c566ad06-32b5-48c5-baaf-ceb1a2d1ce0c', NULL, 'Michael', 'Hernandez', 'Mike', '305-555-0105', 'michael.hernandez@example.com', '1005 Alton Rd', 'Miami Beach', 'FL', '33139', '1988-09-30', 'player', 5, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('f33f9491-abd6-4f2b-85a1-081f94b56364', NULL, 'Lisa', 'Lopez', 'Lisa', '305-555-0106', 'lisa.lopez@example.com', '1006 Flagler St', 'Miami', 'FL', '33130', '1992-05-18', 'player', 6, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('7f5e979c-c7b9-4355-b943-8db78479d37f', NULL, 'David', 'Gonzalez', 'Dave', '305-555-0107', 'david.gonzalez@example.com', '1007 Coral Way', 'Miami', 'FL', '33145', '1987-12-25', 'player', 7, '345678', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ad684451-0849-4d8c-ae91-b91564dd4f2c', NULL, 'Sarah', 'Wilson', 'Sarah', '305-555-0108', 'sarah.wilson@example.com', '1008 SW 8th St', 'Miami', 'FL', '33135', '1991-08-07', 'player', 8, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('e66783d4-e80d-46a3-951f-4d45612d780b', NULL, 'Christopher', 'Perez', 'Chris', '305-555-0109', 'christopher.perez@example.com', '1009 NW 7th St', 'Miami', 'FL', '33136', '1984-04-20', 'player', 9, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2d67d6fb-40bc-4a8f-a488-637330ee706b', NULL, 'Jessica', 'Sanchez', 'Jess', '305-555-0110', 'jessica.sanchez@example.com', '1010 Brickell Ave', 'Miami', 'FL', '33131', '1993-10-12', 'player', 10, '456789', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('b988778a-e420-47f0-b77d-3d6b58f6dd3c', NULL, 'Daniel', 'Ramirez', 'Danny', '813-555-0201', 'daniel.ramirez@example.com', '2001 Tampa St', 'Tampa', 'FL', '33602', '1986-01-30', 'player', 11, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('0ec0a080-9686-4d50-9f31-a4561d19e41d', NULL, 'Emily', 'Torres', 'Emily', '813-555-0202', 'emily.torres@example.com', '2002 Kennedy Blvd', 'Tampa', 'FL', '33602', '1994-06-15', 'player', 12, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('8b14cbb8-85d1-4a8f-986a-4a001ed13b13', NULL, 'Matthew', 'Rivera', 'Matt', '813-555-0203', 'matthew.rivera@example.com', '2003 Bayshore Blvd', 'Tampa', 'FL', '33606', '1989-03-22', 'player', 13, '567890', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('907ed950-e30e-46f6-8209-f8b0ef67fa04', NULL, 'Amanda', 'Flores', 'Amanda', '813-555-0204', 'amanda.flores@example.com', '2004 Davis Islands', 'Tampa', 'FL', '33606', '1992-09-08', 'player', 14, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('eea8ebf6-056d-4c77-aad1-f8117c761658', NULL, 'Joshua', 'Gomez', 'Josh', '813-555-0205', 'joshua.gomez@example.com', '2005 Hyde Park Ave', 'Tampa', 'FL', '33606', '1983-12-19', 'player', 15, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('01e95d1a-b362-49c9-aec4-8380e12618ef', NULL, 'Ashley', 'Reyes', 'Ash', '813-555-0206', 'ashley.reyes@example.com', '2006 Armenia Ave', 'Tampa', 'FL', '33607', '1990-07-04', 'player', 16, '678901', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('383b6c4d-7c71-45be-a473-355afe7750a7', NULL, 'Andrew', 'Cruz', 'Andy', '813-555-0207', 'andrew.cruz@example.com', '2007 Dale Mabry Hwy', 'Tampa', 'FL', '33609', '1987-02-28', 'player', 17, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('1fd3ad84-da67-4c4c-80fb-c68256f1c727', NULL, 'Stephanie', 'Morales', 'Steph', '813-555-0208', 'stephanie.morales@example.com', '2008 Henderson Blvd', 'Tampa', 'FL', '33609', '1995-11-16', 'player', 18, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('e1c94630-2497-4440-ba03-5c033fc02f74', NULL, 'Ryan', 'Gutierrez', 'Ryan', '813-555-0209', 'ryan.gutierrez@example.com', '2009 Cypress St', 'Tampa', 'FL', '33607', '1988-05-23', 'player', 19, '789012', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('4b5dc889-1287-46a1-87b5-1ebc2aef7cf4', NULL, 'Nicole', 'Ortiz', 'Nikki', '813-555-0210', 'nicole.ortiz@example.com', '2010 Florida Ave', 'Tampa', 'FL', '33602', '1991-08-10', 'player', 20, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('c72af9cd-52d7-46f9-bae7-dfe8cac5272b', NULL, 'Brandon', 'Jimenez', 'Brandon', '407-555-0301', 'brandon.jimenez@example.com', '3001 Orange Ave', 'Orlando', 'FL', '32801', '1985-04-17', 'player', 21, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('f5ab5c22-7a38-44c9-bd8c-34af0d6794d3', NULL, 'Melissa', 'Ruiz', 'Mel', '407-555-0302', 'melissa.ruiz@example.com', '3002 Church St', 'Orlando', 'FL', '32801', '1993-10-05', 'player', 22, '890123', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('6ef351a1-125d-4bbe-9cb3-1fe2c67e0058', NULL, 'Jonathan', 'Diaz', 'Jon', '407-555-0303', 'jonathan.diaz@example.com', '3003 Colonial Dr', 'Orlando', 'FL', '32803', '1989-01-12', 'player', 23, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('5fe591c6-7fdd-4d7d-a7d2-533038c51077', NULL, 'Heather', 'Mendoza', 'Heather', '407-555-0304', 'heather.mendoza@example.com', '3004 Mills Ave', 'Orlando', 'FL', '32803', '1991-06-29', 'player', 24, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('35542837-14fc-4f11-a213-992bd4346b2a', NULL, 'Justin', 'Castro', 'Justin', '407-555-0305', 'justin.castro@example.com', '3005 Bumby Ave', 'Orlando', 'FL', '32803', '1986-09-14', 'player', 25, '901234', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('4a3ea53a-e161-46bd-aed7-356a41aecd19', NULL, 'Lauren', 'Vargas', 'Lauren', '407-555-0306', 'lauren.vargas@example.com', '3006 Summerlin Ave', 'Orlando', 'FL', '32806', '1994-03-20', 'player', 26, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('1bb83961-917f-42fe-bf9b-60b6de873727', NULL, 'Kevin', 'Romero', 'Kevin', '407-555-0307', 'kevin.romero@example.com', '3007 Curry Ford Rd', 'Orlando', 'FL', '32806', '1987-12-08', 'player', 27, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('452a0ed4-0892-49d7-98f0-7557c4710dac', NULL, 'Rachel', 'Medina', 'Rachel', '407-555-0308', 'rachel.medina@example.com', '3008 Hoffner Ave', 'Orlando', 'FL', '32822', '1992-07-25', 'player', 28, '012345', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('afba540c-b5fe-46e0-859d-9e02d9c570e3', NULL, 'Tyler', 'Aguilar', 'Tyler', '407-555-0309', 'tyler.aguilar@example.com', '3009 Sand Lake Rd', 'Orlando', 'FL', '32819', '1988-02-11', 'player', 29, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('3303e439-6d1d-4f2b-a2e3-cb1d71d138dd', NULL, 'Amber', 'Moreno', 'Amber', '407-555-0310', 'amber.moreno@example.com', '3010 Conroy Rd', 'Orlando', 'FL', '32839', '1990-11-03', 'player', 30, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('c916b3b4-be12-4024-9790-04e8ed2be92d', NULL, 'Eric', 'Ramos', 'Eric', '904-555-0401', 'eric.ramos@example.com', '4001 Bay St', 'Jacksonville', 'FL', '32202', '1984-05-19', 'player', 31, '123450', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('d2812b33-96ad-4f5a-85b5-aabca10b74c9', NULL, 'Michelle', 'Santos', 'Michelle', '904-555-0402', 'michelle.santos@example.com', '4002 Main St', 'Jacksonville', 'FL', '32202', '1991-09-27', 'player', 32, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2e0ef73a-8454-4975-aee8-bae6fd7cf610', NULL, 'Jacob', 'Navarro', 'Jake', '904-555-0403', 'jacob.navarro@example.com', '4003 Ocean Blvd', 'Jacksonville Beach', 'FL', '32250', '1987-01-14', 'player', 33, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('b0fc9b1f-a51a-43c7-9626-bca8fc103235', NULL, 'Danielle', 'Campos', 'Dani', '904-555-0404', 'danielle.campos@example.com', '4004 Beach Blvd', 'Jacksonville Beach', 'FL', '32250', '1995-06-08', 'player', 34, '234560', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2d3de035-3825-4374-b75d-3fc7d8288fef', NULL, 'Aaron', 'Delgado', 'Aaron', '904-555-0405', 'aaron.delgado@example.com', '4005 Atlantic Blvd', 'Jacksonville', 'FL', '32225', '1989-10-22', 'player', 35, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('f5858265-e6fd-414e-a7a2-e81309848aaa', NULL, 'Brittany', 'Guerrero', 'Brittany', '904-555-0406', 'brittany.guerrero@example.com', '4006 Southside Blvd', 'Jacksonville', 'FL', '32256', '1993-03-16', 'player', 36, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ffea553e-2155-4e3e-83f8-8bc9721a2c4b', NULL, 'Nathan', 'Ortega', 'Nate', '904-555-0407', 'nathan.ortega@example.com', '4007 St Johns Ave', 'Jacksonville', 'FL', '32205', '1986-08-30', 'player', 37, '345670', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('4e9f2a0e-d2cd-4a98-a4dd-f410a7fa836c', NULL, 'Samantha', 'Fuentes', 'Sam', '904-555-0408', 'samantha.fuentes@example.com', '4008 University Blvd', 'Jacksonville', 'FL', '32211', '1992-12-13', 'player', 38, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('0f9eba0c-0f97-4e84-9ba5-052fd53de89e', NULL, 'Kyle', 'Valdez', 'Kyle', '904-555-0409', 'kyle.valdez@example.com', '4009 Beach Blvd', 'Jacksonville', 'FL', '32207', '1988-04-26', 'player', 39, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('de6c018e-91a7-4923-8d52-52ec796c518f', NULL, 'Christina', 'Salazar', 'Chris', '904-555-0410', 'christina.salazar@example.com', '4010 San Jose Blvd', 'Jacksonville', 'FL', '32217', '1990-07-19', 'player', 40, '456780', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('9a05acfa-40e4-4135-be74-874cd65cae0c', NULL, 'Adam', 'Castillo', 'Adam', '954-555-0501', 'adam.castillo@example.com', '5001 Las Olas Blvd', 'Fort Lauderdale', 'FL', '33301', '1985-02-23', 'player', 41, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('213375b5-68b7-4a54-8a0f-d6d3e6b82714', NULL, 'Kelly', 'Jimenez', 'Kelly', '954-555-0502', 'kelly.jimenez@example.com', '5002 Sunrise Blvd', 'Fort Lauderdale', 'FL', '33304', '1991-08-15', 'player', 42, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('aba9878a-f661-4491-853e-8529b5d74bd5', NULL, 'Jason', 'Miranda', 'Jason', '954-555-0503', 'jason.miranda@example.com', '5003 Oakland Park Blvd', 'Fort Lauderdale', 'FL', '33306', '1987-11-28', 'player', 43, '567891', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('8cd672ac-5c42-4fc9-b2f4-832ce5bfece1', NULL, 'Megan', 'Rojas', 'Megan', '954-555-0504', 'megan.rojas@example.com', '5004 Commercial Blvd', 'Fort Lauderdale', 'FL', '33308', '1994-05-07', 'player', 44, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('03975276-3f37-467c-af39-cf2fa21232f1', NULL, 'Brian', 'Acosta', 'Brian', '954-555-0505', 'brian.acosta@example.com', '5005 Federal Hwy', 'Fort Lauderdale', 'FL', '33308', '1989-09-19', 'player', 45, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('58978489-7607-4814-b559-58fc570c41f6', NULL, 'Laura', 'Contreras', 'Laura', '954-555-0506', 'laura.contreras@example.com', '5006 Sample Rd', 'Pompano Beach', 'FL', '33064', '1992-01-31', 'player', 46, '678902', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('c6ea3fab-5d71-4638-bad3-6bf19c42fbde', NULL, 'Scott', 'Luna', 'Scott', '954-555-0507', 'scott.luna@example.com', '5007 Atlantic Blvd', 'Pompano Beach', 'FL', '33062', '1986-06-12', 'player', 47, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('13cc5e2c-cd66-4eb4-9ae6-a17744110ce2', NULL, 'Angela', 'Herrera', 'Angie', '954-555-0508', 'angela.herrera@example.com', '5008 Copans Rd', 'Pompano Beach', 'FL', '33064', '1993-10-24', 'player', 48, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('405720f8-b287-4b44-8920-83d6d927d3f4', NULL, 'Timothy', 'Dominguez', 'Tim', '954-555-0509', 'timothy.dominguez@example.com', '5009 McNab Rd', 'Pompano Beach', 'FL', '33069', '1988-03-08', 'player', 49, '789013', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('3bb08c86-3f57-4fbc-b8c0-02a459abb7cd', NULL, 'Rebecca', 'Estrada', 'Becca', '954-555-0510', 'rebecca.estrada@example.com', '5010 Sample Rd', 'Coral Springs', 'FL', '33065', '1991-07-16', 'player', 50, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('3e464dac-0d86-4bad-acd3-5caf0a4f4c64', NULL, 'Jeremy', 'Figueroa', 'Jeremy', '727-555-0601', 'jeremy.figueroa@example.com', '6001 Central Ave', 'St. Petersburg', 'FL', '33701', '1984-09-21', 'player', 51, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('65f7dae5-9392-4509-ad5d-ad3404567636', NULL, 'Crystal', 'Cardenas', 'Crystal', '727-555-0602', 'crystal.cardenas@example.com', '6002 4th St N', 'St. Petersburg', 'FL', '33701', '1992-02-14', 'player', 52, '890124', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('fc051ee1-e714-434e-9c2c-6564ca129f37', NULL, 'Patrick', 'Vega', 'Pat', '727-555-0603', 'patrick.vega@example.com', '6003 Beach Dr', 'St. Petersburg', 'FL', '33701', '1988-06-29', 'player', 53, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('b1983728-4ac0-41de-b35a-e45c6387781a', NULL, 'Kimberly', 'Leon', 'Kim', '727-555-0604', 'kimberly.leon@example.com', '6004 1st Ave N', 'St. Petersburg', 'FL', '33701', '1995-11-10', 'player', 54, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('7c7b28a5-49c7-4b5e-9b54-1585f691d039', NULL, 'Sean', 'Soto', 'Sean', '727-555-0605', 'sean.soto@example.com', '6005 Tyrone Blvd', 'St. Petersburg', 'FL', '33710', '1987-04-03', 'player', 55, '901235', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2d5c9c06-df3b-4988-86f8-0aa7aa8078c1', NULL, 'Tiffany', 'Cortez', 'Tiff', '727-555-0606', 'tiffany.cortez@example.com', '6006 66th St N', 'St. Petersburg', 'FL', '33709', '1993-08-18', 'player', 56, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('fe34fa80-f813-4695-bc3b-062e7e914d65', NULL, 'Gregory', 'Pacheco', 'Greg', '727-555-0607', 'gregory.pacheco@example.com', '6007 38th Ave N', 'St. Petersburg', 'FL', '33710', '1986-12-26', 'player', 57, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('bc74af8c-9751-445c-aa2d-2718847454d5', NULL, 'Vanessa', 'Calderon', 'Vanessa', '727-555-0608', 'vanessa.calderon@example.com', '6008 Park Blvd', 'Pinellas Park', 'FL', '33781', '1991-05-09', 'player', 58, '012346', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('f927aa2f-7eac-4ca0-aad8-9526e2ca8bba', NULL, 'Peter', 'Alvarado', 'Peter', '727-555-0609', 'peter.alvarado@example.com', '6009 49th St N', 'St. Petersburg', 'FL', '33709', '1989-09-24', 'player', 59, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2348966a-176e-4b5d-bdee-d042c1835ca3', NULL, 'Monica', 'Galindo', 'Monica', '727-555-0610', 'monica.galindo@example.com', '6010 Ulmerton Rd', 'Largo', 'FL', '33771', '1994-01-15', 'player', 60, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('cb426237-08ed-4462-af0d-59d8d7a7547b', NULL, 'Bradley', 'Ibarra', 'Brad', '850-555-0701', 'bradley.ibarra@example.com', '7001 Tennessee St', 'Tallahassee', 'FL', '32304', '1985-07-28', 'player', 61, '123451', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('f483ca6d-3743-45b2-a546-ef010816a9ab', NULL, 'Catherine', 'Velasquez', 'Cathy', '850-555-0702', 'catherine.velasquez@example.com', '7002 Apalachee Pkwy', 'Tallahassee', 'FL', '32301', '1992-11-06', 'player', 62, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ce69e9d2-59c0-4fa6-bc70-748ef45effb3', NULL, 'Kenneth', 'Maldonado', 'Ken', '850-555-0703', 'kenneth.maldonado@example.com', '7003 Monroe St', 'Tallahassee', 'FL', '32303', '1988-03-19', 'player', 63, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ecf79724-7104-4396-b51e-1cc2160805de', NULL, 'Diana', 'Espinoza', 'Diana', '850-555-0704', 'diana.espinoza@example.com', '7004 Capital Cir', 'Tallahassee', 'FL', '32308', '1993-07-31', 'player', 64, '234561', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('285dbf14-ab33-46cd-839d-09bed47738b2', NULL, 'Richard', 'Mejia', 'Rick', '850-555-0705', 'richard.mejia@example.com', '7005 Thomasville Rd', 'Tallahassee', 'FL', '32308', '1987-10-13', 'player', 65, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2616e55d-9d00-4e2d-bec8-806755a60f1e', NULL, 'Alexis', 'Orozco', 'Alexis', '850-555-0706', 'alexis.orozco@example.com', '7006 Mahan Dr', 'Tallahassee', 'FL', '32308', '1991-02-25', 'player', 66, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('6a96c28b-fb95-4f97-88a2-3985f478333e', NULL, 'Dennis', 'Sandoval', 'Dennis', '850-555-0707', 'dennis.sandoval@example.com', '7007 Pensacola St', 'Tallahassee', 'FL', '32304', '1986-06-08', 'player', 67, '345671', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('43b6d9a7-8850-4d08-bcb9-0d9d617c9d95', NULL, 'Sharon', 'Ochoa', 'Sharon', '850-555-0708', 'sharon.ochoa@example.com', '7008 Magnolia Dr', 'Tallahassee', 'FL', '32301', '1994-10-20', 'player', 68, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('e3cfaebd-724e-432d-b83d-9a0cc7f68486', NULL, 'Jerry', 'Cervantes', 'Jerry', '850-555-0709', 'jerry.cervantes@example.com', '7009 Lafayette St', 'Tallahassee', 'FL', '32301', '1989-01-02', 'player', 69, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('dff84632-1172-4eaf-b422-1fc69b661584', NULL, 'Cynthia', 'Cabrera', 'Cindy', '850-555-0710', 'cynthia.cabrera@example.com', '7010 Gaines St', 'Tallahassee', 'FL', '32304', '1992-05-17', 'player', 70, '456781', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('29934eea-1284-4067-8d65-f2e2bb06e08d', NULL, 'Raymond', 'Nunez', 'Ray', '850-555-0801', 'raymond.nunez@example.com', '8001 Palafox St', 'Pensacola', 'FL', '32501', '1984-08-22', 'player', 71, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('016947c5-281b-4663-969f-33a4dd9253a6', NULL, 'Pamela', 'Rios', 'Pam', '850-555-0802', 'pamela.rios@example.com', '8002 Navy Blvd', 'Pensacola', 'FL', '32507', '1990-12-04', 'player', 72, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('a4b6429e-3791-4f94-8ef9-cd1243ef1a82', NULL, 'Harold', 'Pena', 'Harold', '850-555-0803', 'harold.pena@example.com', '8003 Gulf Beach Hwy', 'Pensacola', 'FL', '32507', '1987-04-16', 'player', 73, '567892', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('80594374-139d-46d8-83ff-24acf769b201', NULL, 'Julie', 'Montoya', 'Julie', '850-555-0804', 'julie.montoya@example.com', '8004 Davis Hwy', 'Pensacola', 'FL', '32514', '1993-08-28', 'player', 74, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('9243242f-0ec2-4880-9736-3008561bb544', NULL, 'Carl', 'Blanco', 'Carl', '850-555-0805', 'carl.blanco@example.com', '8005 9th Ave', 'Pensacola', 'FL', '32514', '1988-11-09', 'player', 75, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('fa4b9d19-d354-40c3-b7b7-0ee9cdf168c0', NULL, 'Frances', 'Rubio', 'Frances', '850-555-0806', 'frances.rubio@example.com', '8006 Perdido Key Dr', 'Pensacola', 'FL', '32507', '1991-03-23', 'player', 76, '678903', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2822c39b-84a6-4f75-91fc-11714d215c88', NULL, 'Roy', 'Marquez', 'Roy', '850-555-0807', 'roy.marquez@example.com', '8007 Brent Ln', 'Pensacola', 'FL', '32503', '1985-07-06', 'player', 77, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('dbb3f7d5-ecc5-45f4-80d5-8b575fbc286e', NULL, 'Martha', 'Zavala', 'Martha', '850-555-0808', 'martha.zavala@example.com', '8008 Summit Blvd', 'Pensacola', 'FL', '32505', '1992-10-18', 'player', 78, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('d8846715-68f2-401e-9436-bf60650d2579', NULL, 'Willie', 'Osorio', 'Willie', '850-555-0809', 'willie.osorio@example.com', '8009 Mobile Hwy', 'Pensacola', 'FL', '32506', '1989-02-01', 'player', 79, '789014', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('d50d4193-ee1f-42cf-840c-ef93c8e2fc5a', NULL, 'Virginia', 'Robles', 'Ginny', '850-555-0810', 'virginia.robles@example.com', '8010 Creighton Rd', 'Pensacola', 'FL', '32504', '1994-06-14', 'player', 80, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('c4d04ca6-57c9-4dbc-8e0c-9bddc773ad67', NULL, 'Albert', 'Molina', 'Al', '727-555-0901', 'albert.molina@example.com', '9001 Gulf to Bay Blvd', 'Clearwater', 'FL', '33759', '1986-09-11', 'player', 81, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('13cc4d61-39f2-46d9-891f-17716a5b1598', NULL, 'Joyce', 'Valencia', 'Joyce', '727-555-0902', 'joyce.valencia@example.com', '9002 Belleair Rd', 'Clearwater', 'FL', '33756', '1991-01-24', 'player', 82, '890125', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('41184715-0646-4bd1-8df8-b62d46981185', NULL, 'Joe', 'Carrillo', 'Joe', '727-555-0903', 'joe.carrillo@example.com', '9003 Drew St', 'Clearwater', 'FL', '33755', '1988-05-07', 'player', 83, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('aa1d113d-e029-4572-84e0-8459742b7dc0', NULL, 'Kathryn', 'Rosales', 'Kate', '727-555-0904', 'kathryn.rosales@example.com', '9004 Sunset Point Rd', 'Clearwater', 'FL', '33759', '1993-09-19', 'player', 84, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('b83e37b8-9c18-45ce-8bc3-0d737b43ddc5', NULL, 'Frank', 'Vasquez', 'Frank', '727-555-0905', 'frank.vasquez@example.com', '9005 Court St', 'Clearwater', 'FL', '33756', '1987-12-31', 'player', 85, '901236', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ca2373b7-a5a0-402b-ab76-ae9134c47ed7', NULL, 'Judith', 'Carmona', 'Judy', '727-555-0906', 'judith.carmona@example.com', '9006 Cleveland St', 'Clearwater', 'FL', '33755', '1992-04-13', 'player', 86, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('17a7c5ed-7692-41da-bafc-4a390765ad4b', NULL, 'Douglas', 'Cano', 'Doug', '727-555-0907', 'douglas.cano@example.com', '9007 Keene Rd', 'Clearwater', 'FL', '33755', '1986-08-26', 'player', 87, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ff341c0d-dc4c-41d7-928a-5cec111cc236', NULL, 'Evelyn', 'Barrera', 'Evelyn', '727-555-0908', 'evelyn.barrera@example.com', '9008 Missouri Ave', 'Clearwater', 'FL', '33756', '1994-12-08', 'player', 88, '012347', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('87f6d782-ecd6-456e-b36a-47d733b5189b', NULL, 'Henry', 'Esquivel', 'Hank', '727-555-0909', 'henry.esquivel@example.com', '9009 Highland Ave', 'Clearwater', 'FL', '33755', '1989-03-21', 'player', 89, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('379161b2-8b1d-4369-82a7-270ec2c3fc78', NULL, 'Teresa', 'Villarreal', 'Teresa', '727-555-0910', 'teresa.villarreal@example.com', '9010 Bayshore Blvd', 'Clearwater', 'FL', '33767', '1991-07-03', 'player', 90, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('1f75ecfb-50e3-43de-9527-59204d744360', NULL, 'Walter', 'Zamora', 'Walt', '941-555-1001', 'walter.zamora@example.com', '10001 Main St', 'Sarasota', 'FL', '34236', '1985-10-15', 'player', 91, '123452', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2780aa04-d6a9-4ecd-9eed-d8c7289fa377', NULL, 'Ann', 'Montes', 'Ann', '941-555-1002', 'ann.montes@example.com', '10002 Tamiami Trail', 'Sarasota', 'FL', '34231', '1992-02-27', 'player', 92, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ef04b740-8d4e-4a62-8863-93287975168e', NULL, 'Ralph', 'Duarte', 'Ralph', '941-555-1003', 'ralph.duarte@example.com', '10003 Fruitville Rd', 'Sarasota', 'FL', '34232', '1988-06-10', 'player', 93, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ae749ff6-e185-4f13-9ada-adb6861f9ec6', NULL, 'Janice', 'Quiroz', 'Jan', '941-555-1004', 'janice.quiroz@example.com', '10004 Bee Ridge Rd', 'Sarasota', 'FL', '34233', '1993-10-22', 'player', 94, '234562', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('47dd3e75-f707-43d2-8201-7cb301ec6b50', NULL, 'Roger', 'Barajas', 'Roger', '941-555-1005', 'roger.barajas@example.com', '10005 Clark Rd', 'Sarasota', 'FL', '34233', '1987-01-04', 'player', 95, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('0fabf93d-ab25-4e68-9467-7afacddc8a01', NULL, 'Marie', 'Velazquez', 'Marie', '941-555-1006', 'marie.velazquez@example.com', '10006 Stickney Point Rd', 'Sarasota', 'FL', '34231', '1991-05-18', 'player', 96, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('590e782c-d310-4ee8-924a-8d18fb06aca4', NULL, 'Jack', 'Camacho', 'Jack', '941-555-1007', 'jack.camacho@example.com', '10007 Siesta Dr', 'Sarasota', 'FL', '34242', '1986-09-30', 'player', 97, '345672', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('04f7db32-220c-4d2c-b933-4f702bab0775', NULL, 'Diane', 'Bautista', 'Diane', '941-555-1008', 'diane.bautista@example.com', '10008 Gulf Gate Dr', 'Sarasota', 'FL', '34231', '1994-01-11', 'player', 98, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('c0cba27d-2a98-4b0b-adfd-3187ec3c0f67', NULL, 'Arthur', 'Avila', 'Art', '941-555-1009', 'arthur.avila@example.com', '10009 Beneva Rd', 'Sarasota', 'FL', '34238', '1989-05-24', 'player', 99, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('3b3ab643-5b59-4bf5-9dbd-ccfff3fe9767', NULL, 'Joan', 'Corona', 'Joan', '941-555-1010', 'joan.corona@example.com', '10010 McIntosh Rd', 'Sarasota', 'FL', '34232', '1992-09-06', 'player', 100, '456782', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('81902c90-80d3-4efa-a701-a2994c972fa6', NULL, 'Eugene', 'Cordova', 'Gene', '239-555-1101', 'eugene.cordova@example.com', '11001 Del Prado Blvd', 'Cape Coral', 'FL', '33909', '1984-11-17', 'player', 101, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('e2e49ab9-667a-4fc7-861d-244edb04d599', NULL, 'Cheryl', 'Escobar', 'Cheryl', '239-555-1102', 'cheryl.escobar@example.com', '11002 Santa Barbara Blvd', 'Cape Coral', 'FL', '33991', '1990-03-30', 'player', 102, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('edec6325-186e-42b3-a047-9830aafeecdc', NULL, 'Russell', 'Munoz', 'Russ', '239-555-1103', 'russell.munoz@example.com', '11003 Pine Island Rd', 'Cape Coral', 'FL', '33909', '1987-07-12', 'player', 103, '567893', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('59b82efe-f060-4c36-91bf-09d3adab7760', NULL, 'Carolyn', 'Lara', 'Carolyn', '239-555-1104', 'carolyn.lara@example.com', '11004 Cape Coral Pkwy', 'Cape Coral', 'FL', '33904', '1993-11-24', 'player', 104, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('547a9008-59c1-4f76-a261-c6c2c8550a76', NULL, 'Philip', 'Calderon', 'Phil', '239-555-1105', 'philip.calderon@example.com', '11005 Veterans Pkwy', 'Cape Coral', 'FL', '33914', '1988-02-06', 'player', 105, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('00a4a8d0-e48b-4770-b38e-750a94ce640c', NULL, 'Janet', 'Paz', 'Janet', '239-555-1106', 'janet.paz@example.com', '11006 Chiquita Blvd', 'Cape Coral', 'FL', '33993', '1991-06-19', 'player', 106, '678904', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('1c8bced1-59e4-4aba-b4eb-a5a68b696d6e', NULL, 'Billy', 'Gil', 'Billy', '239-555-1107', 'billy.gil@example.com', '11007 Skyline Blvd', 'Cape Coral', 'FL', '33914', '1985-10-01', 'player', 107, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('1eea8d44-bc7b-4784-9ff0-d4908f8a66d8', NULL, 'Betty', 'Tovar', 'Betty', '239-555-1108', 'betty.tovar@example.com', '11008 Hancock Bridge Pkwy', 'Cape Coral', 'FL', '33990', '1992-01-13', 'player', 108, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('f30cc7d4-15a8-4a04-837a-9493b6d52c2f', NULL, 'Bobby', 'Delacruz', 'Bobby', '239-555-1109', 'bobby.delacruz@example.com', '11009 Embers Pkwy', 'Cape Coral', 'FL', '33993', '1989-05-26', 'player', 109, '789015', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ffbb86c5-7316-4493-9d95-f71ada88cb03', NULL, 'Gloria', 'Mata', 'Gloria', '239-555-1110', 'gloria.mata@example.com', '11010 Nicholas Pkwy', 'Cape Coral', 'FL', '33990', '1994-09-08', 'player', 110, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('ab312cb0-577d-40d7-9f18-b73336ce3bf2', NULL, 'Lawrence', 'Fernandez', 'Larry', '772-555-1201', 'lawrence.fernandez@example.com', '12001 US Highway 1', 'Port St. Lucie', 'FL', '34952', '1986-12-20', 'player', 111, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('c8c89ebb-bc87-42a6-be0e-04773f766e03', NULL, 'Doris', 'Alonso', 'Doris', '772-555-1202', 'doris.alonso@example.com', '12002 SW Port St Lucie Blvd', 'Port St. Lucie', 'FL', '34953', '1991-04-02', 'player', 112, '890126', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('7df10e12-9224-4d41-8c0c-402bbaa809ca', NULL, 'Louis', 'Trujillo', 'Lou', '772-555-1203', 'louis.trujillo@example.com', '12003 SE Walton Rd', 'Port St. Lucie', 'FL', '34952', '1988-08-15', 'player', 113, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('65730a84-3b6f-4467-9950-42eac89c4708', NULL, 'Marilyn', 'Rosario', 'Marilyn', '772-555-1204', 'marilyn.rosario@example.com', '12004 SW Darwin Blvd', 'Port St. Lucie', 'FL', '34987', '1993-12-27', 'player', 114, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('45e610eb-9d2c-4344-a9b1-00fb6e6fd8c2', NULL, 'Gerald', 'Quintero', 'Gerald', '772-555-1205', 'gerald.quintero@example.com', '12005 Gatlin Blvd', 'Port St. Lucie', 'FL', '34953', '1987-03-10', 'player', 115, '901237', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('6c1827cc-06ee-426e-b02e-08aee32fa572', NULL, 'Norma', 'Elizondo', 'Norma', '772-555-1206', 'norma.elizondo@example.com', '12006 SW Cashmere Blvd', 'Port St. Lucie', 'FL', '34987', '1992-07-23', 'player', 116, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('9c0df25a-a576-4a72-a845-78e78a2bc4c5', NULL, 'Keith', 'Bustamante', 'Keith', '772-555-1207', 'keith.bustamante@example.com', '12007 SW California Blvd', 'Port St. Lucie', 'FL', '34987', '1986-11-05', 'player', 117, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('a754f4e7-194d-4069-9b8f-c910e2ea9df8', NULL, 'Alice', 'Olvera', 'Alice', '772-555-1208', 'alice.olvera@example.com', '12008 SW Bayshore Blvd', 'Port St. Lucie', 'FL', '34987', '1994-03-18', 'player', 118, '012348', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('cbb08302-12b3-4172-9486-ef8eaa09b70f', NULL, 'Craig', 'Arellano', 'Craig', '772-555-1209', 'craig.arellano@example.com', '12009 SW Becker Rd', 'Port St. Lucie', 'FL', '34987', '1989-06-30', 'player', 119, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('c3013f0c-fb24-493c-883a-5ed9e6b641fc', NULL, 'Debra', 'Guillen', 'Deb', '772-555-1210', 'debra.guillen@example.com', '12010 SW Jennings Ave', 'Port St. Lucie', 'FL', '34987', '1991-10-12', 'player', 120, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('67798e82-0acb-4e97-a1ac-f67cab6fd433', NULL, 'Wayne', 'Solis', 'Wayne', '305-555-1301', 'wayne.solis@example.com', '13001 W 49th St', 'Hialeah', 'FL', '33012', '1985-01-25', 'player', 121, '123453', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('603269fa-863c-4ebf-a034-9295977b4e87', NULL, 'Theresa', 'Lugo', 'Terry', '305-555-1302', 'theresa.lugo@example.com', '13002 Palm Ave', 'Hialeah', 'FL', '33010', '1992-05-08', 'player', 122, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('295c6039-1881-4778-ac5b-0a1a6bc5d22d', NULL, 'Randy', 'Navarro', 'Randy', '305-555-1303', 'randy.navarro@example.com', '13003 E 4th Ave', 'Hialeah', 'FL', '33013', '1988-09-20', 'player', 123, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('fb14af9c-36a4-4d72-80ce-62099d7cf809', NULL, 'Tammy', 'Cisneros', 'Tammy', '305-555-1304', 'tammy.cisneros@example.com', '13004 NW 79th St', 'Hialeah', 'FL', '33016', '1993-01-01', 'player', 124, '234563', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('832db14f-9594-4548-bd6e-e9a870607e16', NULL, 'Howard', 'Nieves', 'Howard', '305-555-1305', 'howard.nieves@example.com', '13005 W 84th St', 'Hialeah', 'FL', '33014', '1987-05-15', 'player', 125, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('cd2eb9a1-ca18-46e2-8bed-fa44e28a1ff3', NULL, 'Shirley', 'Galvan', 'Shirley', '305-555-1306', 'shirley.galvan@example.com', '13006 E 8th Ave', 'Hialeah', 'FL', '33013', '1991-09-27', 'player', 126, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('bb5d2f24-56b7-4587-845f-b073314c16b3', NULL, 'Larry', 'Andrade', 'Larry', '305-555-1307', 'larry.andrade@example.com', '13007 W 20th Ave', 'Hialeah', 'FL', '33010', '1986-01-09', 'player', 127, '345673', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('9f5e12f1-cab5-4cc0-946d-755482e19ae9', NULL, 'Brenda', 'Jaramillo', 'Brenda', '305-555-1308', 'brenda.jaramillo@example.com', '13008 NW 103rd St', 'Hialeah', 'FL', '33018', '1994-05-22', 'player', 128, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('2ccafe43-fb9a-42df-84aa-000b0b0c76eb', NULL, 'Eugene', 'Collazo', 'Gene', '305-555-1309', 'eugene.collazo@example.com', '13009 SE 3rd Ct', 'Hialeah', 'FL', '33010', '1989-08-03', 'player', 129, NULL, NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('6a88a67e-180e-4f21-a043-dd6bb738e2ee', NULL, 'Katherine', 'Lucero', 'Kathy', '305-555-1310', 'katherine.lucero@example.com', '13010 W 12th Ave', 'Hialeah', 'FL', '33012', '1992-12-16', 'player', 130, '456783', NULL, '2025-11-15 16:01:53.101915+00', '2025-11-15 16:01:53.101915+00', false),
	('5578b542-d4d3-4d71-8acf-760d3457fe0f', '90928e11-4436-4b91-80ba-af112e64337d', 'Ed', 'Poplet', 'Eddy', '8059072636', 'shodbyed@gmail.com', '6101 Twilight Dr', 'Zephyrhills', 'FL', '33540', '1968-04-08', 'league_operator', 131, NULL, NULL, '2025-11-15 16:41:27.895042+00', '2025-11-15 16:42:50.999497+00', false),
	('d74645ed-5992-49ce-b27c-f568a95988d9', '6fc809fb-c970-4f6a-82e7-d87bfdce3d96', 'Captain', 'One', 'Cap1', '1234123512', 'captain1@gmail.com', '123 Kent St', 'Buggersville', 'FL', '33333', '1999-12-31', 'player', 132, NULL, NULL, '2025-11-15 16:54:37.153503+00', '2025-11-15 16:54:37.153503+00', false),
	('11c64e95-c942-401d-9eac-87509e2c5a1d', '80af04d2-aff2-4068-91c8-89c3042b109c', 'Captain', 'Two', 'Cap2', '1234184812', 'captain2@gmail.com', '8387 Bogus St', 'Tampa', 'FL', '33333', '2000-03-04', 'player', 133, NULL, NULL, '2025-11-15 16:55:45.07909+00', '2025-11-15 16:55:45.07909+00', false),
	('9d5251a9-ba68-4a0c-9e59-5461643d2c20', 'b1b96b25-ab30-46e8-b289-eee218691270', 'Captain', 'Three', 'Cap3', '1293804701', 'captain3@gmail.com', '1328 Shit St', 'Dade', 'FL', '33333', '2004-04-04', 'player', 134, NULL, NULL, '2025-11-15 16:57:14.385444+00', '2025-11-15 16:57:14.385444+00', false);


--
-- Data for Name: blocked_users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: championship_date_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."championship_date_options" ("id", "organization", "year", "start_date", "end_date", "vote_count", "dev_verified", "created_at", "updated_at") VALUES
	('1628412f-beee-49e3-9853-73b5c320fb9e', 'BCA', 2026, '2026-02-18', '2026-02-28', 1, false, '2025-11-15 16:50:40.337087+00', '2025-11-15 16:50:40.337087+00');


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: handicap_chart_3vs3; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."handicap_chart_3vs3" ("hcp_diff", "games_to_win", "games_to_tie", "games_to_lose") VALUES
	(12, 16, 15, 14),
	(11, 15, NULL, 14),
	(10, 15, 14, 13),
	(9, 14, NULL, 13),
	(8, 14, 13, 12),
	(7, 13, NULL, 12),
	(6, 13, 12, 11),
	(5, 12, NULL, 11),
	(4, 12, 11, 10),
	(3, 11, NULL, 10),
	(2, 11, 10, 9),
	(1, 10, NULL, 9),
	(0, 10, 9, 8),
	(-1, 9, NULL, 8),
	(-2, 9, 8, 7),
	(-3, 8, NULL, 7),
	(-4, 8, 7, 6),
	(-5, 7, NULL, 6),
	(-6, 7, 6, 5),
	(-7, 6, NULL, 5),
	(-8, 6, 5, 4),
	(-9, 5, NULL, 4),
	(-10, 5, 4, 3),
	(-11, 4, NULL, 3),
	(-12, 4, 3, 2);


--
-- Data for Name: league_operators; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."league_operators" ("id", "member_id", "organization_name", "organization_address", "organization_city", "organization_state", "organization_zip_code", "contact_disclaimer_acknowledged", "league_email", "email_visibility", "league_phone", "phone_visibility", "stripe_customer_id", "payment_method_id", "card_last4", "card_brand", "expiry_month", "expiry_year", "billing_zip", "payment_verified", "created_at", "updated_at", "profanity_filter_enabled") VALUES
	('180d36df-3791-488c-ba3c-cf863358aa6e', '5578b542-d4d3-4d71-8acf-760d3457fe0f', 'New Test Leagues', '6101 Twilight Dr', 'Zephyrhills', 'FL', '33540', true, 'shodbyed@gmail.com', 'anyone', '8059072636', 'my_teams', 'cus_mock_zp4cshrppl000000', 'pm_mock_fnsqiqhz78b00000', '4242', 'visa', 12, 2027, '12345', true, '2025-11-15 16:42:50.921611+00', '2025-11-15 16:42:50.921611+00', false);


--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."leagues" ("id", "operator_id", "game_type", "day_of_week", "division", "team_format", "league_start_date", "created_at", "updated_at", "status", "handicap_variant", "team_handicap_variant", "golden_break_counts_as_win", "handicap_level") VALUES
	('ed281d71-1746-4eb8-a72e-b76a3f079dbe', '180d36df-3791-488c-ba3c-cf863358aa6e', 'nine_ball', 'monday', 'Tester', '5_man', '2025-11-17', '2025-11-15 16:49:27.376907+00', '2025-11-15 16:49:27.376907+00', 'active', 'standard', 'standard', true, 'standard');


--
-- Data for Name: venue_owners; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."venues" ("id", "created_by_operator_id", "venue_owner_id", "name", "street_address", "city", "state", "zip_code", "phone", "bar_box_tables", "regulation_tables", "proprietor_name", "proprietor_phone", "league_contact_name", "league_contact_phone", "league_contact_email", "website", "business_hours", "notes", "is_active", "created_at", "updated_at") VALUES
	('6d8f88a0-dad7-48e7-889e-82868be62bd2', '180d36df-3791-488c-ba3c-cf863358aa6e', NULL, 'Repellat Billiards', '1974 McKenzie Crescent', 'dade city', 'FL', '33540', '792-317-7295', 6, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-15 16:51:52.751763+00', '2025-11-15 16:51:52.751763+00');


--
-- Data for Name: league_venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."league_venues" ("id", "league_id", "venue_id", "available_bar_box_tables", "available_regulation_tables", "added_at", "updated_at") VALUES
	('9dfaecac-bc0c-444e-8f5f-893e2c957c94', 'ed281d71-1746-4eb8-a72e-b76a3f079dbe', '6d8f88a0-dad7-48e7-889e-82868be62bd2', 6, 0, '2025-11-15 16:51:58.847592+00', '2025-11-15 16:51:58.847592+00');


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."seasons" ("id", "league_id", "season_name", "start_date", "end_date", "season_length", "status", "season_completed", "created_at", "updated_at") VALUES
	('a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'ed281d71-1746-4eb8-a72e-b76a3f079dbe', 'Fall 2025 Monday 9-Ball Tester', '2025-11-17', '2026-03-08', 16, 'active', false, '2025-11-15 16:50:40.434339+00', '2025-11-15 17:46:32.544377+00');


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."teams" ("id", "season_id", "league_id", "captain_id", "home_venue_id", "team_name", "roster_size", "wins", "losses", "ties", "points", "games_won", "games_lost", "status", "created_at", "updated_at") VALUES
	('351fe606-9740-4adf-8e62-fdca7ecdc4bb', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'ed281d71-1746-4eb8-a72e-b76a3f079dbe', 'd74645ed-5992-49ce-b27c-f568a95988d9', '6d8f88a0-dad7-48e7-889e-82868be62bd2', 'Team 1', 5, 0, 0, 0, 0, 0, 0, 'active', '2025-11-15 16:57:52.34991+00', '2025-11-15 16:57:52.34991+00'),
	('f3150e2f-2947-41f1-af03-ccd6657ee2da', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'ed281d71-1746-4eb8-a72e-b76a3f079dbe', '11c64e95-c942-401d-9eac-87509e2c5a1d', '6d8f88a0-dad7-48e7-889e-82868be62bd2', 'Team 2', 5, 0, 0, 0, 0, 0, 0, 'active', '2025-11-15 16:58:01.844478+00', '2025-11-15 16:58:01.844478+00'),
	('d2538f50-e864-4ed0-a89a-98057835943e', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'ed281d71-1746-4eb8-a72e-b76a3f079dbe', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '6d8f88a0-dad7-48e7-889e-82868be62bd2', 'Team 4', 5, 0, 0, 0, 0, 0, 0, 'active', '2025-11-15 16:58:20.98602+00', '2025-11-15 17:47:03.410918+00'),
	('089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'ed281d71-1746-4eb8-a72e-b76a3f079dbe', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', '6d8f88a0-dad7-48e7-889e-82868be62bd2', 'Team 3', 5, 0, 0, 0, 0, 0, 0, 'active', '2025-11-15 16:58:11.74889+00', '2025-11-15 17:47:28.832322+00');


--
-- Data for Name: match_lineups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."match_lineups" ("id", "match_id", "team_id", "player1_id", "player1_handicap", "player2_id", "player2_handicap", "player3_id", "player3_handicap", "locked", "locked_at", "created_at", "updated_at", "home_team_modifier", "player4_id", "player4_handicap", "player5_id", "player5_handicap") VALUES
	('583607e0-38fd-4bab-8597-8d014c3a83ba', 'd30adf0e-4599-4547-ac90-d008dcc8c354', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 1.0, '04f7db32-220c-4d2c-b933-4f702bab0775', 0.0, 'ff341c0d-dc4c-41d7-928a-5cec111cc236', 0.0, true, '2025-11-15 20:50:07.378589+00', '2025-11-15 17:01:25.089108+00', '2025-11-15 20:50:07.378589+00', 0, NULL, 0.0, NULL, 0.0),
	('74ea9aa6-d4ca-4d22-b3e5-b4a0787228bc', '9986bf93-b081-488b-8514-29e971fbb6b3', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('bfecab6c-eb13-4a39-9352-2a8e38600aba', '9986bf93-b081-488b-8514-29e971fbb6b3', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('eb4bd3fb-2b11-4365-aaea-7a420d0a6354', '0ce7bc1b-cde1-43f2-a496-e2be7c7d5342', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('65928c99-1f6c-477a-bb86-11c608bd8780', '0ce7bc1b-cde1-43f2-a496-e2be7c7d5342', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('7047e256-d4de-436d-990e-6f9c7af68ad4', '3a5d3d8d-a8a5-4001-9e21-cbcaea038184', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('d13a7de9-bcc5-4a04-8759-c026110b0548', '3a5d3d8d-a8a5-4001-9e21-cbcaea038184', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('3e92a1ef-054e-41dc-9b6c-095bc4b8bb5e', 'b3238be1-e0dc-490d-a26a-d46d3ebd92fb', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('f4c5770b-46d1-4164-81f9-a05cb4237093', 'b3238be1-e0dc-490d-a26a-d46d3ebd92fb', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('0ea5ee0e-ba90-419c-bf87-02ee38f2a174', '15e073f4-be43-4e65-a7b0-75aa0a4131e1', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('e2b79ebb-99d1-4a53-93d7-7d17a26ab540', '15e073f4-be43-4e65-a7b0-75aa0a4131e1', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('ba8ae1fc-f0b2-4549-b303-35c6134dbbec', '3285e233-ab47-4fd8-8257-b50a9de4e4b0', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('d574ca4a-2aea-4823-b004-abe59d32bace', '3285e233-ab47-4fd8-8257-b50a9de4e4b0', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('329e7ede-dc44-4e22-a07a-8158c4a44ffd', 'e18488f1-beae-45fe-ae70-43ea6d93683b', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('93af923e-2a06-4eac-a37e-5151262fd419', 'e18488f1-beae-45fe-ae70-43ea6d93683b', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('40101716-8092-4f4e-867e-9d95c15edb95', '94fe500a-4036-42a5-baaa-78fd6ce3eb28', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('820e70c8-9d64-416a-a277-839a9530e247', '94fe500a-4036-42a5-baaa-78fd6ce3eb28', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('97fd34bf-6ecd-4c4e-a76b-3b70a597c77a', '424050d8-965b-423e-a124-9bdc66c33bac', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('91b4e240-eced-4a26-a3df-7d8f2a04815d', '424050d8-965b-423e-a124-9bdc66c33bac', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('dd37557e-5aba-46e8-ba9a-ef666443f21c', 'c91cfae6-46c6-40b8-8b7e-1ec1364e6db5', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('bf451862-b335-4c15-83ca-946e50098e60', 'c91cfae6-46c6-40b8-8b7e-1ec1364e6db5', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('cde6cd5a-22d7-424b-b7cc-232b65644220', 'e7f7569e-b1d3-4631-b3a6-126bb9f2e8fb', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('91da404d-c2d0-465b-b8c5-ecd945c1383a', 'e7f7569e-b1d3-4631-b3a6-126bb9f2e8fb', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('66ef1e45-7764-473a-a43d-507a863b2e57', '9dfcc904-6fe2-42ca-b5b7-612a3a0a5763', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('6004bf80-e992-474f-943c-aae2a160eb3e', '9dfcc904-6fe2-42ca-b5b7-612a3a0a5763', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('7a7ccc88-03ad-4cd8-9762-601cbb784216', '33f1f37e-ebc2-4139-97ef-01b8b72241fd', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('279bb0ff-a355-4e9a-ac45-862099b22b7d', '33f1f37e-ebc2-4139-97ef-01b8b72241fd', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('c8339eec-88a9-483e-9328-9f112a693a67', 'fb6df288-835e-47c6-9609-ad0acaece6a8', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('61ef3b5b-b18b-45d1-a8bd-96761da59b20', 'fb6df288-835e-47c6-9609-ad0acaece6a8', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('0c837faf-5e87-4e76-b9e2-6c9442d59ecf', '1266a4d1-0776-4b02-8bb8-b1285daee15d', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('740331e5-4894-4b04-aac2-87b39d920e7a', '1266a4d1-0776-4b02-8bb8-b1285daee15d', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('9e4242c6-a9fb-439e-8c1a-a9566e76d74e', '8cd2ab5a-85fa-4884-b3ab-cee67a255a5e', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('98520f87-cb1d-43d1-97f1-4790bb5f3476', '8cd2ab5a-85fa-4884-b3ab-cee67a255a5e', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('9e4a3dbd-8fce-42b0-82b9-78b2b291518c', 'db16a0e2-09cc-4cff-a6cf-4b5f7b72cd4e', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('68bb7b92-3b59-427f-bd4a-1fcd5eb489ca', 'db16a0e2-09cc-4cff-a6cf-4b5f7b72cd4e', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('42830e48-4a46-42bf-8a1b-48173dd7bbe1', 'ed26d27c-6fe8-4242-ab24-f033751c8ab5', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('9a605ce6-dceb-46e0-a007-c0ea91878ef6', 'ed26d27c-6fe8-4242-ab24-f033751c8ab5', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('2a5084c9-cf38-4c0e-a8db-d3be2a84c258', 'deeeee2c-0394-403e-884a-f7fa79421913', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('bbce17b0-7501-4171-a895-f94ccc3aa026', 'deeeee2c-0394-403e-884a-f7fa79421913', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('13ea9c2a-3b39-408e-abdf-558e934092b4', 'ed3320e8-87af-4af8-aa5a-91baa6a992dd', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('379b0686-3008-4531-b648-c7e283600f36', 'ed3320e8-87af-4af8-aa5a-91baa6a992dd', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('42d3f181-d921-4b7c-ac18-0114bdcf3e92', '307f9252-7734-4b74-90f9-5c67ebd9c780', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('92bb61c7-5d26-4716-9d83-2811bff55f5a', '307f9252-7734-4b74-90f9-5c67ebd9c780', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('47288cf4-d688-40f5-8b41-dda59ced3fff', '9ec51b74-bd2a-4437-bafe-129bc0b53d34', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('a589828f-f058-4109-a432-1678985d9098', '9ec51b74-bd2a-4437-bafe-129bc0b53d34', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('91d8935e-eadb-4bc4-bbf3-9306312191b2', 'd0f32d0d-4ba4-4739-8087-32cb7a64b0d7', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('6e2e11e2-59b0-40db-8632-965bc511ad77', 'd0f32d0d-4ba4-4739-8087-32cb7a64b0d7', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('fa506d3d-00f0-4a42-9a71-5fd3f8757575', 'f4fbc750-0502-4aed-85d2-bea48c3e9543', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('b3bf2dfe-806f-4241-b9c0-268adedd35e5', 'f4fbc750-0502-4aed-85d2-bea48c3e9543', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('04d242e4-bd46-43f1-8118-dbe9bff11387', '82cd0645-66fe-4ea7-a4cb-888f1ca8d08c', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('3669c880-2383-46cd-987d-46531a044128', '82cd0645-66fe-4ea7-a4cb-888f1ca8d08c', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('45c73c6d-b80a-44af-8213-aabf99fa6afd', '9733ee71-3650-4b7c-b4e2-3d5107957b2f', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('53fd4034-5833-4633-8b0b-eb3e7b9c58df', '9733ee71-3650-4b7c-b4e2-3d5107957b2f', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('b241f88f-bd85-4c76-808e-a02854504c56', 'c1bc01a7-323d-419f-8285-43bf392142a4', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('0a1805ab-946b-4e31-a5d9-ffd02cb3dce9', 'c1bc01a7-323d-419f-8285-43bf392142a4', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('52eadd18-fe4f-4398-9db3-4e4525fa4a0d', 'e948f773-06df-456b-a6ca-563703e880a8', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('92770d7d-d8a1-440f-9f11-f2cdfeab3689', 'e948f773-06df-456b-a6ca-563703e880a8', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('2b4c0aed-32ea-4033-b3b2-cedc78c4d9b0', '7ccbe037-6446-4a8d-9dfa-6c74ca23d698', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('90d55c3e-d85c-4e4c-b1d5-cbd51ddd650b', '7ccbe037-6446-4a8d-9dfa-6c74ca23d698', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('5e54edf3-429d-4b3e-bfd8-84bbdb84df30', '0a53d8ef-28ad-4e44-81ff-b31225efdcc3', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('e10d68ea-d870-487d-a86a-30d2df3063c1', '0a53d8ef-28ad-4e44-81ff-b31225efdcc3', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('8098e0a6-176b-4527-bd29-6ed10164bd3c', '61673189-c8a9-40a3-8fd2-a953c46aca7b', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('2357e9f7-a3b5-40f8-a818-1f8fa4b56d16', '61673189-c8a9-40a3-8fd2-a953c46aca7b', 'd2538f50-e864-4ed0-a89a-98057835943e', NULL, 0.0, NULL, 0.0, NULL, 0.0, false, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 0, NULL, 0.0, NULL, 0.0),
	('efdefea4-5690-48e2-a47f-ef5900cd73af', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 'd2538f50-e864-4ed0-a89a-98057835943e', '5578b542-d4d3-4d71-8acf-760d3457fe0f', 0.0, 'bb5d2f24-56b7-4587-845f-b073314c16b3', 0.0, 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', 0.0, true, '2025-11-15 20:50:16.04865+00', '2025-11-15 17:01:25.089108+00', '2025-11-15 20:50:16.04865+00', 0, NULL, 0.0, NULL, 0.0);


--
-- Data for Name: season_weeks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."season_weeks" ("id", "season_id", "scheduled_date", "week_name", "week_type", "week_completed", "notes", "created_at", "updated_at") VALUES
	('7af4f96a-d295-4b5e-942c-f5b646fd2e06', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2025-11-17', 'Week 1', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('bc6c3048-c240-4e88-90a4-f897bf77a06d', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2025-11-24', 'Thanksgiving Day', 'blackout', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('112b4f5d-c6c8-4d56-ab8d-83b068e7c876', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2025-12-01', 'Week 2', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('128306a2-6f95-4449-a2dd-593b7ad16e88', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2025-12-08', 'Week 3', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('15aca16c-4c31-456c-b345-ad7936f1bd6b', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2025-12-15', 'Week 4', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('1191bf10-00b5-4408-ad6b-973d94855c43', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2025-12-22', 'Christmas Eve', 'blackout', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('04b614b3-a2be-4547-95fe-066ab643c1bd', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2025-12-29', 'Christmas Day', 'blackout', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('125fe12f-d150-43aa-8758-c93175fd562c', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-01-05', 'Week 5', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('fdad3329-36e8-4118-b9d3-6dcc9731510e', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-01-12', 'Week 6', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('7ca3b18d-85a1-4d4f-ac00-60aae80547a1', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-01-19', 'Martin Luther King Jr. Day', 'blackout', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('255ac669-f67a-4e3b-94eb-df6948507a59', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-01-26', 'Week 7', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('428818f1-f2c3-489e-9ab0-0ea79e618fcc', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-02-02', 'Week 8', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('9a55d6da-4a93-4ab6-8510-2ee2a20bc577', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-02-09', 'Week 9', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('fc4ae969-aeb7-47e8-b914-93458844b3cb', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-02-16', 'Valentine''s Day', 'blackout', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('e2713571-47b3-429e-ab62-e4e08be6532c', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-02-23', 'BCA National Tournament Week 1', 'blackout', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('0bd7349e-1c09-4d4b-88cd-a3bd750e3714', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-03-02', 'Week 10', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('a8a816de-335a-432c-877f-363d5e44ce0c', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-03-09', 'Week 11', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('f7dd8370-c1a5-4445-9ab0-d4949faa4ba7', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-03-16', 'Week 12', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('8e3105aa-aae7-4a0a-8e9e-957bcd31e0cb', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-03-23', 'Week 13', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('28928950-b071-4787-aae0-bf03a3f85e1f', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-03-30', 'Week 14', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('8411e7ba-1780-4fd2-92cc-c3ea4ed4c11d', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-04-06', 'Week 15', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('090b9bb5-98b6-4c5f-ad82-afd3400954f5', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-04-13', 'Week 16', 'regular', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('746608b9-2700-4d60-9796-099c05e5314f', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-04-20', 'Season End Break', 'season_end_break', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00'),
	('2ffe391a-1c9b-4ba1-b3b8-65586819885f', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '2026-04-27', 'Playoffs', 'playoffs', false, NULL, '2025-11-15 16:50:40.462231+00', '2025-11-15 16:50:40.462231+00');


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."matches" ("id", "season_id", "season_week_id", "home_team_id", "away_team_id", "scheduled_venue_id", "actual_venue_id", "match_number", "status", "home_team_score", "away_team_score", "created_at", "updated_at", "home_lineup_id", "away_lineup_id", "home_games_to_win", "away_games_to_win", "home_games_to_tie", "away_games_to_tie", "home_games_won", "away_games_won", "home_points_earned", "away_points_earned", "winner_team_id", "match_result", "started_at", "completed_at", "results_confirmed_by_home", "results_confirmed_by_away", "home_team_verified_by", "away_team_verified_by", "home_games_to_lose", "away_games_to_lose") VALUES
	('d30adf0e-4599-4547-ac90-d008dcc8c354', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '7af4f96a-d295-4b5e-942c-f5b646fd2e06', 'd2538f50-e864-4ed0-a89a-98057835943e', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'completed', 10, 8, '2025-11-15 17:01:25.089108+00', '2025-11-15 20:54:07.874339+00', 'efdefea4-5690-48e2-a47f-ef5900cd73af', '583607e0-38fd-4bab-8597-8d014c3a83ba', 9, 10, NULL, NULL, 10, 8, 1, -2, 'd2538f50-e864-4ed0-a89a-98057835943e', 'home_win', '2025-11-15 20:40:42.332+00', '2025-11-15 20:54:07.848+00', true, true, '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 8, 9),
	('9986bf93-b081-488b-8514-29e971fbb6b3', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '7af4f96a-d295-4b5e-942c-f5b646fd2e06', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '74ea9aa6-d4ca-4d22-b3e5-b4a0787228bc', 'bfecab6c-eb13-4a39-9352-2a8e38600aba', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('0ce7bc1b-cde1-43f2-a496-e2be7c7d5342', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '112b4f5d-c6c8-4d56-ab8d-83b068e7c876', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', 'd2538f50-e864-4ed0-a89a-98057835943e', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 'eb4bd3fb-2b11-4365-aaea-7a420d0a6354', '65928c99-1f6c-477a-bb86-11c608bd8780', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('3a5d3d8d-a8a5-4001-9e21-cbcaea038184', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '112b4f5d-c6c8-4d56-ab8d-83b068e7c876', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '7047e256-d4de-436d-990e-6f9c7af68ad4', 'd13a7de9-bcc5-4a04-8759-c026110b0548', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('b3238be1-e0dc-490d-a26a-d46d3ebd92fb', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '128306a2-6f95-4449-a2dd-593b7ad16e88', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '3e92a1ef-054e-41dc-9b6c-095bc4b8bb5e', 'f4c5770b-46d1-4164-81f9-a05cb4237093', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('15e073f4-be43-4e65-a7b0-75aa0a4131e1', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '128306a2-6f95-4449-a2dd-593b7ad16e88', 'd2538f50-e864-4ed0-a89a-98057835943e', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '0ea5ee0e-ba90-419c-bf87-02ee38f2a174', 'e2b79ebb-99d1-4a53-93d7-7d17a26ab540', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('3285e233-ab47-4fd8-8257-b50a9de4e4b0', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '15aca16c-4c31-456c-b345-ad7936f1bd6b', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 'ba8ae1fc-f0b2-4549-b303-35c6134dbbec', 'd574ca4a-2aea-4823-b004-abe59d32bace', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('e18488f1-beae-45fe-ae70-43ea6d93683b', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '15aca16c-4c31-456c-b345-ad7936f1bd6b', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'd2538f50-e864-4ed0-a89a-98057835943e', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '329e7ede-dc44-4e22-a07a-8158c4a44ffd', '93af923e-2a06-4eac-a37e-5151262fd419', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('94fe500a-4036-42a5-baaa-78fd6ce3eb28', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '125fe12f-d150-43aa-8758-c93175fd562c', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '40101716-8092-4f4e-867e-9d95c15edb95', '820e70c8-9d64-416a-a277-839a9530e247', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('424050d8-965b-423e-a124-9bdc66c33bac', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '125fe12f-d150-43aa-8758-c93175fd562c', 'd2538f50-e864-4ed0-a89a-98057835943e', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '97fd34bf-6ecd-4c4e-a76b-3b70a597c77a', '91b4e240-eced-4a26-a3df-7d8f2a04815d', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('c91cfae6-46c6-40b8-8b7e-1ec1364e6db5', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'fdad3329-36e8-4118-b9d3-6dcc9731510e', 'd2538f50-e864-4ed0-a89a-98057835943e', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 'dd37557e-5aba-46e8-ba9a-ef666443f21c', 'bf451862-b335-4c15-83ca-946e50098e60', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('e7f7569e-b1d3-4631-b3a6-126bb9f2e8fb', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'fdad3329-36e8-4118-b9d3-6dcc9731510e', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 'cde6cd5a-22d7-424b-b7cc-232b65644220', '91da404d-c2d0-465b-b8c5-ecd945c1383a', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('9dfcc904-6fe2-42ca-b5b7-612a3a0a5763', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '255ac669-f67a-4e3b-94eb-df6948507a59', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'd2538f50-e864-4ed0-a89a-98057835943e', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '66ef1e45-7764-473a-a43d-507a863b2e57', '6004bf80-e992-474f-943c-aae2a160eb3e', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('33f1f37e-ebc2-4139-97ef-01b8b72241fd', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '255ac669-f67a-4e3b-94eb-df6948507a59', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '7a7ccc88-03ad-4cd8-9762-601cbb784216', '279bb0ff-a355-4e9a-ac45-862099b22b7d', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('fb6df288-835e-47c6-9609-ad0acaece6a8', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '428818f1-f2c3-489e-9ab0-0ea79e618fcc', 'd2538f50-e864-4ed0-a89a-98057835943e', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 'c8339eec-88a9-483e-9328-9f112a693a67', '61ef3b5b-b18b-45d1-a8bd-96761da59b20', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('1266a4d1-0776-4b02-8bb8-b1285daee15d', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '428818f1-f2c3-489e-9ab0-0ea79e618fcc', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '0c837faf-5e87-4e76-b9e2-6c9442d59ecf', '740331e5-4894-4b04-aac2-87b39d920e7a', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('8cd2ab5a-85fa-4884-b3ab-cee67a255a5e', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '9a55d6da-4a93-4ab6-8510-2ee2a20bc577', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '9e4242c6-a9fb-439e-8c1a-a9566e76d74e', '98520f87-cb1d-43d1-97f1-4790bb5f3476', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('db16a0e2-09cc-4cff-a6cf-4b5f7b72cd4e', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '9a55d6da-4a93-4ab6-8510-2ee2a20bc577', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', 'd2538f50-e864-4ed0-a89a-98057835943e', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '9e4a3dbd-8fce-42b0-82b9-78b2b291518c', '68bb7b92-3b59-427f-bd4a-1fcd5eb489ca', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('ed26d27c-6fe8-4242-ab24-f033751c8ab5', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '0bd7349e-1c09-4d4b-88cd-a3bd750e3714', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '42830e48-4a46-42bf-8a1b-48173dd7bbe1', '9a605ce6-dceb-46e0-a007-c0ea91878ef6', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('deeeee2c-0394-403e-884a-f7fa79421913', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '0bd7349e-1c09-4d4b-88cd-a3bd750e3714', 'd2538f50-e864-4ed0-a89a-98057835943e', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '2a5084c9-cf38-4c0e-a8db-d3be2a84c258', 'bbce17b0-7501-4171-a895-f94ccc3aa026', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('ed3320e8-87af-4af8-aa5a-91baa6a992dd', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'a8a816de-335a-432c-877f-363d5e44ce0c', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '13ea9c2a-3b39-408e-abdf-558e934092b4', '379b0686-3008-4531-b648-c7e283600f36', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('307f9252-7734-4b74-90f9-5c67ebd9c780', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'a8a816de-335a-432c-877f-363d5e44ce0c', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', 'd2538f50-e864-4ed0-a89a-98057835943e', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '42d3f181-d921-4b7c-ac18-0114bdcf3e92', '92bb61c7-5d26-4716-9d83-2811bff55f5a', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('9ec51b74-bd2a-4437-bafe-129bc0b53d34', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'f7dd8370-c1a5-4445-9ab0-d4949faa4ba7', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', 'd2538f50-e864-4ed0-a89a-98057835943e', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '47288cf4-d688-40f5-8b41-dda59ced3fff', 'a589828f-f058-4109-a432-1678985d9098', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('d0f32d0d-4ba4-4739-8087-32cb7a64b0d7', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', 'f7dd8370-c1a5-4445-9ab0-d4949faa4ba7', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '91d8935e-eadb-4bc4-bbf3-9306312191b2', '6e2e11e2-59b0-40db-8632-965bc511ad77', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('f4fbc750-0502-4aed-85d2-bea48c3e9543', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '8e3105aa-aae7-4a0a-8e9e-957bcd31e0cb', 'd2538f50-e864-4ed0-a89a-98057835943e', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 'fa506d3d-00f0-4a42-9a71-5fd3f8757575', 'b3bf2dfe-806f-4241-b9c0-268adedd35e5', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('82cd0645-66fe-4ea7-a4cb-888f1ca8d08c', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '8e3105aa-aae7-4a0a-8e9e-957bcd31e0cb', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '04d242e4-bd46-43f1-8118-dbe9bff11387', '3669c880-2383-46cd-987d-46531a044128', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('9733ee71-3650-4b7c-b4e2-3d5107957b2f', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '28928950-b071-4787-aae0-bf03a3f85e1f', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', 'd2538f50-e864-4ed0-a89a-98057835943e', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '45c73c6d-b80a-44af-8213-aabf99fa6afd', '53fd4034-5833-4633-8b0b-eb3e7b9c58df', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('c1bc01a7-323d-419f-8285-43bf392142a4', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '28928950-b071-4787-aae0-bf03a3f85e1f', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', 'b241f88f-bd85-4c76-808e-a02854504c56', '0a1805ab-946b-4e31-a5d9-ffd02cb3dce9', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('e948f773-06df-456b-a6ca-563703e880a8', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '8411e7ba-1780-4fd2-92cc-c3ea4ed4c11d', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '52eadd18-fe4f-4398-9db3-4e4525fa4a0d', '92770d7d-d8a1-440f-9f11-f2cdfeab3689', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('7ccbe037-6446-4a8d-9dfa-6c74ca23d698', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '8411e7ba-1780-4fd2-92cc-c3ea4ed4c11d', 'd2538f50-e864-4ed0-a89a-98057835943e', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '2b4c0aed-32ea-4033-b3b2-cedc78c4d9b0', '90d55c3e-d85c-4e4c-b1d5-cbd51ddd650b', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('0a53d8ef-28ad-4e44-81ff-b31225efdcc3', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '090b9bb5-98b6-4c5f-ad82-afd3400954f5', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 1, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '5e54edf3-429d-4b3e-bfd8-84bbdb84df30', 'e10d68ea-d870-487d-a86a-30d2df3063c1', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL),
	('61673189-c8a9-40a3-8fd2-a953c46aca7b', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', '090b9bb5-98b6-4c5f-ad82-afd3400954f5', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'd2538f50-e864-4ed0-a89a-98057835943e', '6d8f88a0-dad7-48e7-889e-82868be62bd2', NULL, 2, 'scheduled', NULL, NULL, '2025-11-15 17:01:25.089108+00', '2025-11-15 17:01:25.089108+00', '8098e0a6-176b-4527-bd29-6ed10164bd3c', '2357e9f7-a3b5-40f8-a818-1f8fa4b56d16', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL);


--
-- Data for Name: match_games; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."match_games" ("id", "match_id", "game_number", "home_player_id", "away_player_id", "winner_team_id", "winner_player_id", "home_action", "away_action", "break_and_run", "golden_break", "confirmed_at", "is_tiebreaker", "created_at", "updated_at", "game_type", "confirmed_by_home", "confirmed_by_away", "vacate_requested_by") VALUES
	('b20c4ab1-5bec-4b43-af8a-657736a0831f', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 8, 'bb5d2f24-56b7-4587-845f-b073314c16b3', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 'breaks', 'racks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('baa2084c-4d78-4815-bea9-dd1e42c4ab92', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 9, 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', '04f7db32-220c-4d2c-b933-4f702bab0775', 'd2538f50-e864-4ed0-a89a-98057835943e', 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', 'breaks', 'racks', true, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('f8ebd3c3-0680-431c-9137-30ea6e53aa1d', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 1, '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 'd2538f50-e864-4ed0-a89a-98057835943e', '5578b542-d4d3-4d71-8acf-760d3457fe0f', 'breaks', 'racks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('93d5ab85-0c31-4bbd-819f-853ecf92cd6e', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 2, 'bb5d2f24-56b7-4587-845f-b073314c16b3', '04f7db32-220c-4d2c-b933-4f702bab0775', 'd2538f50-e864-4ed0-a89a-98057835943e', 'bb5d2f24-56b7-4587-845f-b073314c16b3', 'breaks', 'racks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('23e97945-d93f-45ec-bc64-e8590bb1edb4', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 3, 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', 'd2538f50-e864-4ed0-a89a-98057835943e', 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', 'breaks', 'racks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('446e16e5-029a-4c3b-b60b-90783392cf07', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 4, '5578b542-d4d3-4d71-8acf-760d3457fe0f', '04f7db32-220c-4d2c-b933-4f702bab0775', 'd2538f50-e864-4ed0-a89a-98057835943e', '5578b542-d4d3-4d71-8acf-760d3457fe0f', 'racks', 'breaks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('0b301259-35b4-48fb-924c-a5c3e2e470f0', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 5, 'bb5d2f24-56b7-4587-845f-b073314c16b3', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', 'd2538f50-e864-4ed0-a89a-98057835943e', 'bb5d2f24-56b7-4587-845f-b073314c16b3', 'racks', 'breaks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('f7c147cf-acff-44ff-ac1d-d5da108d4dca', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 6, 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 'd2538f50-e864-4ed0-a89a-98057835943e', 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', 'racks', 'breaks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('7f2ff9db-f966-4c1b-bbef-ada8c675e85f', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 7, '5578b542-d4d3-4d71-8acf-760d3457fe0f', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', 'breaks', 'racks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('0868cc85-be5f-49f2-bc67-279ba9fa368c', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 10, '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 'd2538f50-e864-4ed0-a89a-98057835943e', '5578b542-d4d3-4d71-8acf-760d3457fe0f', 'racks', 'breaks', true, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('3491b076-9116-4bcf-a85a-1c05b09d7ceb', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 11, 'bb5d2f24-56b7-4587-845f-b073314c16b3', '04f7db32-220c-4d2c-b933-4f702bab0775', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '04f7db32-220c-4d2c-b933-4f702bab0775', 'racks', 'breaks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('0a93b6af-a360-4d16-857e-c4081b50ab1e', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 12, 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', 'd2538f50-e864-4ed0-a89a-98057835943e', 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', 'racks', 'breaks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('222006b2-e94f-4af7-8323-cf1f294f3c20', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 13, '5578b542-d4d3-4d71-8acf-760d3457fe0f', '04f7db32-220c-4d2c-b933-4f702bab0775', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '04f7db32-220c-4d2c-b933-4f702bab0775', 'breaks', 'racks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('15186c14-a70b-424d-bde9-a8cb1c16c4f6', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 14, 'bb5d2f24-56b7-4587-845f-b073314c16b3', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', 'breaks', 'racks', false, true, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('66f0e469-977f-416f-a30e-673712e1ba28', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 15, 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 'breaks', 'racks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('eb237c07-5e38-45d0-86fb-ddf084e471ec', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 16, '5578b542-d4d3-4d71-8acf-760d3457fe0f', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', 'racks', 'breaks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('9517e57a-febd-464d-b913-281c99c96725', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 17, 'bb5d2f24-56b7-4587-845f-b073314c16b3', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 'd2538f50-e864-4ed0-a89a-98057835943e', 'bb5d2f24-56b7-4587-845f-b073314c16b3', 'racks', 'breaks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL),
	('149de226-b2cb-46ad-81f2-daef537b5cf1', 'd30adf0e-4599-4547-ac90-d008dcc8c354', 18, 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', '04f7db32-220c-4d2c-b933-4f702bab0775', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '04f7db32-220c-4d2c-b933-4f702bab0775', 'racks', 'breaks', false, false, NULL, false, '2025-11-15 20:50:16.319393+00', '2025-11-15 20:50:16.319393+00', 'nine_ball', '5578b542-d4d3-4d71-8acf-760d3457fe0f', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', NULL);


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: operator_blackout_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."operator_blackout_preferences" ("id", "operator_id", "preference_type", "preference_action", "holiday_name", "championship_id", "custom_name", "custom_start_date", "custom_end_date", "auto_apply", "created_at", "updated_at") VALUES
	('a51491c9-1c6d-4d67-98e5-a136500ae3b1', '180d36df-3791-488c-ba3c-cf863358aa6e', 'championship', 'blackout', NULL, '1628412f-beee-49e3-9853-73b5c320fb9e', NULL, NULL, NULL, false, '2025-11-15 16:50:40.393242+00', '2025-11-15 16:50:40.393242+00');


--
-- Data for Name: user_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: report_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: report_updates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: team_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."team_players" ("id", "team_id", "member_id", "season_id", "is_captain", "individual_wins", "individual_losses", "skill_level", "status", "joined_at", "updated_at") VALUES
	('53b30322-5362-48fb-b4c1-665213e5ec54', '351fe606-9740-4adf-8e62-fdca7ecdc4bb', 'd74645ed-5992-49ce-b27c-f568a95988d9', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', true, 0, 0, NULL, 'active', '2025-11-15 16:57:52.413601+00', '2025-11-15 16:57:52.413601+00'),
	('bb3302a7-25ba-49a5-a917-23239efa5912', 'f3150e2f-2947-41f1-af03-ccd6657ee2da', '11c64e95-c942-401d-9eac-87509e2c5a1d', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', true, 0, 0, NULL, 'active', '2025-11-15 16:58:01.911358+00', '2025-11-15 16:58:01.911358+00'),
	('24bcdfa9-7635-4b15-80c2-d003e2614d50', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '9d5251a9-ba68-4a0c-9e59-5461643d2c20', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', true, 0, 0, NULL, 'active', '2025-11-15 16:58:11.95022+00', '2025-11-15 16:58:11.95022+00'),
	('0e2a8477-92ad-4165-ab2e-9114f23d1017', 'd2538f50-e864-4ed0-a89a-98057835943e', '5578b542-d4d3-4d71-8acf-760d3457fe0f', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', true, 0, 0, NULL, 'active', '2025-11-15 16:58:21.006097+00', '2025-11-15 17:47:03.511981+00'),
	('a625edd8-c73d-455b-bf21-ce29a1534c6c', 'd2538f50-e864-4ed0-a89a-98057835943e', 'd79719da-2ffd-4a10-b5d0-1563ecd9e9db', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', false, 0, 0, NULL, 'active', '2025-11-15 17:47:03.69144+00', '2025-11-15 17:47:03.69144+00'),
	('3b01e27f-9937-4dc1-baed-c7889a2364e2', 'd2538f50-e864-4ed0-a89a-98057835943e', 'bb5d2f24-56b7-4587-845f-b073314c16b3', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', false, 0, 0, NULL, 'active', '2025-11-15 17:47:03.69144+00', '2025-11-15 17:47:03.69144+00'),
	('9e145e14-e6ec-41f3-ad3d-74eba5b2984b', 'd2538f50-e864-4ed0-a89a-98057835943e', 'c0cba27d-2a98-4b0b-adfd-3187ec3c0f67', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', false, 0, 0, NULL, 'active', '2025-11-15 17:47:03.69144+00', '2025-11-15 17:47:03.69144+00'),
	('8823e4c2-4a28-43fa-bda4-850285209a92', 'd2538f50-e864-4ed0-a89a-98057835943e', '47dd3e75-f707-43d2-8201-7cb301ec6b50', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', false, 0, 0, NULL, 'active', '2025-11-15 17:47:03.69144+00', '2025-11-15 17:47:03.69144+00'),
	('4602835c-db69-452d-ade1-f043c77074da', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', '04f7db32-220c-4d2c-b933-4f702bab0775', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', false, 0, 0, NULL, 'active', '2025-11-15 17:47:29.021166+00', '2025-11-15 17:47:29.021166+00'),
	('05a1834b-8211-4a40-b16b-cb24279e7c62', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'ff341c0d-dc4c-41d7-928a-5cec111cc236', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', false, 0, 0, NULL, 'active', '2025-11-15 17:47:29.021166+00', '2025-11-15 17:47:29.021166+00'),
	('d0d3de5c-20dc-4eaa-bac4-5dabaf108bea', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'c8c89ebb-bc87-42a6-be0e-04773f766e03', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', false, 0, 0, NULL, 'active', '2025-11-15 17:47:29.021166+00', '2025-11-15 17:47:29.021166+00'),
	('8fff88f8-ac8d-4437-8165-146648597e5e', '089e5ef8-f618-4e0d-8c41-90369acdfdb8', 'bc74af8c-9751-445c-aa2d-2718847454d5', 'a56b68ce-323d-4ced-a815-3f9fe5f7a4a3', false, 0, 0, NULL, 'active', '2025-11-15 17:47:29.021166+00', '2025-11-15 17:47:29.021166+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 17, true);


--
-- Name: members_system_player_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."members_system_player_number_seq"', 134, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict u4CfUPn8IcILui5U8Dt3crMVn22sO7ZSw30d8Gj18QBAemS6wuBU5XvXxrKWcRa

RESET ALL;
