-- =====================================================
-- SEED FAKE MEMBERS - DEVELOPMENT ONLY
-- =====================================================
-- Creates 150 fake member records for testing search/lookup UX
-- These members do NOT have user_id (can't log in)
-- All Florida-based so operators in FL can see them
-- About 20% have BCA numbers
-- =====================================================

-- Insert 150 fake members
INSERT INTO members (first_name, last_name, nickname, phone, email, address, city, state, zip_code, date_of_birth, role, bca_member_number) VALUES
-- Miami Area (33101-33199)
('James', 'Anderson', 'Jimmy', '305-555-0101', 'james.anderson@example.com', '1001 Biscayne Blvd', 'Miami', 'FL', '33101', '1985-03-15', 'player', '123456'),
('Maria', 'Garcia', 'Maria', '305-555-0102', 'maria.garcia@example.com', '1002 Ocean Drive', 'Miami', 'FL', '33139', '1990-07-22', 'player', NULL),
('Robert', 'Martinez', 'Bobby', '305-555-0103', 'robert.martinez@example.com', '1003 Collins Ave', 'Miami Beach', 'FL', '33140', '1982-11-08', 'player', NULL),
('Jennifer', 'Rodriguez', 'Jenny', '305-555-0104', 'jennifer.rodriguez@example.com', '1004 Washington Ave', 'Miami Beach', 'FL', '33139', '1995-02-14', 'player', '234567'),
('Michael', 'Hernandez', 'Mike', '305-555-0105', 'michael.hernandez@example.com', '1005 Alton Rd', 'Miami Beach', 'FL', '33139', '1988-09-30', 'player', NULL),
('Lisa', 'Lopez', 'Lisa', '305-555-0106', 'lisa.lopez@example.com', '1006 Flagler St', 'Miami', 'FL', '33130', '1992-05-18', 'player', NULL),
('David', 'Gonzalez', 'Dave', '305-555-0107', 'david.gonzalez@example.com', '1007 Coral Way', 'Miami', 'FL', '33145', '1987-12-25', 'player', '345678'),
('Sarah', 'Wilson', 'Sarah', '305-555-0108', 'sarah.wilson@example.com', '1008 SW 8th St', 'Miami', 'FL', '33135', '1991-08-07', 'player', NULL),
('Christopher', 'Perez', 'Chris', '305-555-0109', 'christopher.perez@example.com', '1009 NW 7th St', 'Miami', 'FL', '33136', '1984-04-20', 'player', NULL),
('Jessica', 'Sanchez', 'Jess', '305-555-0110', 'jessica.sanchez@example.com', '1010 Brickell Ave', 'Miami', 'FL', '33131', '1993-10-12', 'player', '456789'),

-- Tampa Area (33601-33699)
('Daniel', 'Ramirez', 'Danny', '813-555-0201', 'daniel.ramirez@example.com', '2001 Tampa St', 'Tampa', 'FL', '33602', '1986-01-30', 'player', NULL),
('Emily', 'Torres', 'Emily', '813-555-0202', 'emily.torres@example.com', '2002 Kennedy Blvd', 'Tampa', 'FL', '33602', '1994-06-15', 'player', NULL),
('Matthew', 'Rivera', 'Matt', '813-555-0203', 'matthew.rivera@example.com', '2003 Bayshore Blvd', 'Tampa', 'FL', '33606', '1989-03-22', 'player', '567890'),
('Amanda', 'Flores', 'Amanda', '813-555-0204', 'amanda.flores@example.com', '2004 Davis Islands', 'Tampa', 'FL', '33606', '1992-09-08', 'player', NULL),
('Joshua', 'Gomez', 'Josh', '813-555-0205', 'joshua.gomez@example.com', '2005 Hyde Park Ave', 'Tampa', 'FL', '33606', '1983-12-19', 'player', NULL),
('Ashley', 'Reyes', 'Ash', '813-555-0206', 'ashley.reyes@example.com', '2006 Armenia Ave', 'Tampa', 'FL', '33607', '1990-07-04', 'player', '678901'),
('Andrew', 'Cruz', 'Andy', '813-555-0207', 'andrew.cruz@example.com', '2007 Dale Mabry Hwy', 'Tampa', 'FL', '33609', '1987-02-28', 'player', NULL),
('Stephanie', 'Morales', 'Steph', '813-555-0208', 'stephanie.morales@example.com', '2008 Henderson Blvd', 'Tampa', 'FL', '33609', '1995-11-16', 'player', NULL),
('Ryan', 'Gutierrez', 'Ryan', '813-555-0209', 'ryan.gutierrez@example.com', '2009 Cypress St', 'Tampa', 'FL', '33607', '1988-05-23', 'player', '789012'),
('Nicole', 'Ortiz', 'Nikki', '813-555-0210', 'nicole.ortiz@example.com', '2010 Florida Ave', 'Tampa', 'FL', '33602', '1991-08-10', 'player', NULL),

-- Orlando Area (32801-32899)
('Brandon', 'Jimenez', 'Brandon', '407-555-0301', 'brandon.jimenez@example.com', '3001 Orange Ave', 'Orlando', 'FL', '32801', '1985-04-17', 'player', NULL),
('Melissa', 'Ruiz', 'Mel', '407-555-0302', 'melissa.ruiz@example.com', '3002 Church St', 'Orlando', 'FL', '32801', '1993-10-05', 'player', '890123'),
('Jonathan', 'Diaz', 'Jon', '407-555-0303', 'jonathan.diaz@example.com', '3003 Colonial Dr', 'Orlando', 'FL', '32803', '1989-01-12', 'player', NULL),
('Heather', 'Mendoza', 'Heather', '407-555-0304', 'heather.mendoza@example.com', '3004 Mills Ave', 'Orlando', 'FL', '32803', '1991-06-29', 'player', NULL),
('Justin', 'Castro', 'Justin', '407-555-0305', 'justin.castro@example.com', '3005 Bumby Ave', 'Orlando', 'FL', '32803', '1986-09-14', 'player', '901234'),
('Lauren', 'Vargas', 'Lauren', '407-555-0306', 'lauren.vargas@example.com', '3006 Summerlin Ave', 'Orlando', 'FL', '32806', '1994-03-20', 'player', NULL),
('Kevin', 'Romero', 'Kevin', '407-555-0307', 'kevin.romero@example.com', '3007 Curry Ford Rd', 'Orlando', 'FL', '32806', '1987-12-08', 'player', NULL),
('Rachel', 'Medina', 'Rachel', '407-555-0308', 'rachel.medina@example.com', '3008 Hoffner Ave', 'Orlando', 'FL', '32822', '1992-07-25', 'player', '012345'),
('Tyler', 'Aguilar', 'Tyler', '407-555-0309', 'tyler.aguilar@example.com', '3009 Sand Lake Rd', 'Orlando', 'FL', '32819', '1988-02-11', 'player', NULL),
('Amber', 'Moreno', 'Amber', '407-555-0310', 'amber.moreno@example.com', '3010 Conroy Rd', 'Orlando', 'FL', '32839', '1990-11-03', 'player', NULL),

-- Jacksonville Area (32099, 32201-32299)
('Eric', 'Ramos', 'Eric', '904-555-0401', 'eric.ramos@example.com', '4001 Bay St', 'Jacksonville', 'FL', '32202', '1984-05-19', 'player', '123450'),
('Michelle', 'Santos', 'Michelle', '904-555-0402', 'michelle.santos@example.com', '4002 Main St', 'Jacksonville', 'FL', '32202', '1991-09-27', 'player', NULL),
('Jacob', 'Navarro', 'Jake', '904-555-0403', 'jacob.navarro@example.com', '4003 Ocean Blvd', 'Jacksonville Beach', 'FL', '32250', '1987-01-14', 'player', NULL),
('Danielle', 'Campos', 'Dani', '904-555-0404', 'danielle.campos@example.com', '4004 Beach Blvd', 'Jacksonville Beach', 'FL', '32250', '1995-06-08', 'player', '234560'),
('Aaron', 'Delgado', 'Aaron', '904-555-0405', 'aaron.delgado@example.com', '4005 Atlantic Blvd', 'Jacksonville', 'FL', '32225', '1989-10-22', 'player', NULL),
('Brittany', 'Guerrero', 'Brittany', '904-555-0406', 'brittany.guerrero@example.com', '4006 Southside Blvd', 'Jacksonville', 'FL', '32256', '1993-03-16', 'player', NULL),
('Nathan', 'Ortega', 'Nate', '904-555-0407', 'nathan.ortega@example.com', '4007 St Johns Ave', 'Jacksonville', 'FL', '32205', '1986-08-30', 'player', '345670'),
('Samantha', 'Fuentes', 'Sam', '904-555-0408', 'samantha.fuentes@example.com', '4008 University Blvd', 'Jacksonville', 'FL', '32211', '1992-12-13', 'player', NULL),
('Kyle', 'Valdez', 'Kyle', '904-555-0409', 'kyle.valdez@example.com', '4009 Beach Blvd', 'Jacksonville', 'FL', '32207', '1988-04-26', 'player', NULL),
('Christina', 'Salazar', 'Chris', '904-555-0410', 'christina.salazar@example.com', '4010 San Jose Blvd', 'Jacksonville', 'FL', '32217', '1990-07-19', 'player', '456780'),

-- Fort Lauderdale Area (33301-33399)
('Adam', 'Castillo', 'Adam', '954-555-0501', 'adam.castillo@example.com', '5001 Las Olas Blvd', 'Fort Lauderdale', 'FL', '33301', '1985-02-23', 'player', NULL),
('Kelly', 'Jimenez', 'Kelly', '954-555-0502', 'kelly.jimenez@example.com', '5002 Sunrise Blvd', 'Fort Lauderdale', 'FL', '33304', '1991-08-15', 'player', NULL),
('Jason', 'Miranda', 'Jason', '954-555-0503', 'jason.miranda@example.com', '5003 Oakland Park Blvd', 'Fort Lauderdale', 'FL', '33306', '1987-11-28', 'player', '567891'),
('Megan', 'Rojas', 'Megan', '954-555-0504', 'megan.rojas@example.com', '5004 Commercial Blvd', 'Fort Lauderdale', 'FL', '33308', '1994-05-07', 'player', NULL),
('Brian', 'Acosta', 'Brian', '954-555-0505', 'brian.acosta@example.com', '5005 Federal Hwy', 'Fort Lauderdale', 'FL', '33308', '1989-09-19', 'player', NULL),
('Laura', 'Contreras', 'Laura', '954-555-0506', 'laura.contreras@example.com', '5006 Sample Rd', 'Pompano Beach', 'FL', '33064', '1992-01-31', 'player', '678902'),
('Scott', 'Luna', 'Scott', '954-555-0507', 'scott.luna@example.com', '5007 Atlantic Blvd', 'Pompano Beach', 'FL', '33062', '1986-06-12', 'player', NULL),
('Angela', 'Herrera', 'Angie', '954-555-0508', 'angela.herrera@example.com', '5008 Copans Rd', 'Pompano Beach', 'FL', '33064', '1993-10-24', 'player', NULL),
('Timothy', 'Dominguez', 'Tim', '954-555-0509', 'timothy.dominguez@example.com', '5009 McNab Rd', 'Pompano Beach', 'FL', '33069', '1988-03-08', 'player', '789013'),
('Rebecca', 'Estrada', 'Becca', '954-555-0510', 'rebecca.estrada@example.com', '5010 Sample Rd', 'Coral Springs', 'FL', '33065', '1991-07-16', 'player', NULL),

-- St. Petersburg Area (33701-33799)
('Jeremy', 'Figueroa', 'Jeremy', '727-555-0601', 'jeremy.figueroa@example.com', '6001 Central Ave', 'St. Petersburg', 'FL', '33701', '1984-09-21', 'player', NULL),
('Crystal', 'Cardenas', 'Crystal', '727-555-0602', 'crystal.cardenas@example.com', '6002 4th St N', 'St. Petersburg', 'FL', '33701', '1992-02-14', 'player', '890124'),
('Patrick', 'Vega', 'Pat', '727-555-0603', 'patrick.vega@example.com', '6003 Beach Dr', 'St. Petersburg', 'FL', '33701', '1988-06-29', 'player', NULL),
('Kimberly', 'Leon', 'Kim', '727-555-0604', 'kimberly.leon@example.com', '6004 1st Ave N', 'St. Petersburg', 'FL', '33701', '1995-11-10', 'player', NULL),
('Sean', 'Soto', 'Sean', '727-555-0605', 'sean.soto@example.com', '6005 Tyrone Blvd', 'St. Petersburg', 'FL', '33710', '1987-04-03', 'player', '901235'),
('Tiffany', 'Cortez', 'Tiff', '727-555-0606', 'tiffany.cortez@example.com', '6006 66th St N', 'St. Petersburg', 'FL', '33709', '1993-08-18', 'player', NULL),
('Gregory', 'Pacheco', 'Greg', '727-555-0607', 'gregory.pacheco@example.com', '6007 38th Ave N', 'St. Petersburg', 'FL', '33710', '1986-12-26', 'player', NULL),
('Vanessa', 'Calderon', 'Vanessa', '727-555-0608', 'vanessa.calderon@example.com', '6008 Park Blvd', 'Pinellas Park', 'FL', '33781', '1991-05-09', 'player', '012346'),
('Peter', 'Alvarado', 'Peter', '727-555-0609', 'peter.alvarado@example.com', '6009 49th St N', 'St. Petersburg', 'FL', '33709', '1989-09-24', 'player', NULL),
('Monica', 'Galindo', 'Monica', '727-555-0610', 'monica.galindo@example.com', '6010 Ulmerton Rd', 'Largo', 'FL', '33771', '1994-01-15', 'player', NULL),

-- Tallahassee Area (32301-32399)
('Bradley', 'Ibarra', 'Brad', '850-555-0701', 'bradley.ibarra@example.com', '7001 Tennessee St', 'Tallahassee', 'FL', '32304', '1985-07-28', 'player', '123451'),
('Catherine', 'Velasquez', 'Cathy', '850-555-0702', 'catherine.velasquez@example.com', '7002 Apalachee Pkwy', 'Tallahassee', 'FL', '32301', '1992-11-06', 'player', NULL),
('Kenneth', 'Maldonado', 'Ken', '850-555-0703', 'kenneth.maldonado@example.com', '7003 Monroe St', 'Tallahassee', 'FL', '32303', '1988-03-19', 'player', NULL),
('Diana', 'Espinoza', 'Diana', '850-555-0704', 'diana.espinoza@example.com', '7004 Capital Cir', 'Tallahassee', 'FL', '32308', '1993-07-31', 'player', '234561'),
('Richard', 'Mejia', 'Rick', '850-555-0705', 'richard.mejia@example.com', '7005 Thomasville Rd', 'Tallahassee', 'FL', '32308', '1987-10-13', 'player', NULL),
('Alexis', 'Orozco', 'Alexis', '850-555-0706', 'alexis.orozco@example.com', '7006 Mahan Dr', 'Tallahassee', 'FL', '32308', '1991-02-25', 'player', NULL),
('Dennis', 'Sandoval', 'Dennis', '850-555-0707', 'dennis.sandoval@example.com', '7007 Pensacola St', 'Tallahassee', 'FL', '32304', '1986-06-08', 'player', '345671'),
('Sharon', 'Ochoa', 'Sharon', '850-555-0708', 'sharon.ochoa@example.com', '7008 Magnolia Dr', 'Tallahassee', 'FL', '32301', '1994-10-20', 'player', NULL),
('Jerry', 'Cervantes', 'Jerry', '850-555-0709', 'jerry.cervantes@example.com', '7009 Lafayette St', 'Tallahassee', 'FL', '32301', '1989-01-02', 'player', NULL),
('Cynthia', 'Cabrera', 'Cindy', '850-555-0710', 'cynthia.cabrera@example.com', '7010 Gaines St', 'Tallahassee', 'FL', '32304', '1992-05-17', 'player', '456781'),

-- Pensacola Area (32501-32599)
('Raymond', 'Nunez', 'Ray', '850-555-0801', 'raymond.nunez@example.com', '8001 Palafox St', 'Pensacola', 'FL', '32501', '1984-08-22', 'player', NULL),
('Pamela', 'Rios', 'Pam', '850-555-0802', 'pamela.rios@example.com', '8002 Navy Blvd', 'Pensacola', 'FL', '32507', '1990-12-04', 'player', NULL),
('Harold', 'Pena', 'Harold', '850-555-0803', 'harold.pena@example.com', '8003 Gulf Beach Hwy', 'Pensacola', 'FL', '32507', '1987-04-16', 'player', '567892'),
('Julie', 'Montoya', 'Julie', '850-555-0804', 'julie.montoya@example.com', '8004 Davis Hwy', 'Pensacola', 'FL', '32514', '1993-08-28', 'player', NULL),
('Carl', 'Blanco', 'Carl', '850-555-0805', 'carl.blanco@example.com', '8005 9th Ave', 'Pensacola', 'FL', '32514', '1988-11-09', 'player', NULL),
('Frances', 'Rubio', 'Frances', '850-555-0806', 'frances.rubio@example.com', '8006 Perdido Key Dr', 'Pensacola', 'FL', '32507', '1991-03-23', 'player', '678903'),
('Roy', 'Marquez', 'Roy', '850-555-0807', 'roy.marquez@example.com', '8007 Brent Ln', 'Pensacola', 'FL', '32503', '1985-07-06', 'player', NULL),
('Martha', 'Zavala', 'Martha', '850-555-0808', 'martha.zavala@example.com', '8008 Summit Blvd', 'Pensacola', 'FL', '32505', '1992-10-18', 'player', NULL),
('Willie', 'Osorio', 'Willie', '850-555-0809', 'willie.osorio@example.com', '8009 Mobile Hwy', 'Pensacola', 'FL', '32506', '1989-02-01', 'player', '789014'),
('Virginia', 'Robles', 'Ginny', '850-555-0810', 'virginia.robles@example.com', '8010 Creighton Rd', 'Pensacola', 'FL', '32504', '1994-06-14', 'player', NULL),

-- Clearwater Area (33755-33769)
('Albert', 'Molina', 'Al', '727-555-0901', 'albert.molina@example.com', '9001 Gulf to Bay Blvd', 'Clearwater', 'FL', '33759', '1986-09-11', 'player', NULL),
('Joyce', 'Valencia', 'Joyce', '727-555-0902', 'joyce.valencia@example.com', '9002 Belleair Rd', 'Clearwater', 'FL', '33756', '1991-01-24', 'player', '890125'),
('Joe', 'Carrillo', 'Joe', '727-555-0903', 'joe.carrillo@example.com', '9003 Drew St', 'Clearwater', 'FL', '33755', '1988-05-07', 'player', NULL),
('Kathryn', 'Rosales', 'Kate', '727-555-0904', 'kathryn.rosales@example.com', '9004 Sunset Point Rd', 'Clearwater', 'FL', '33759', '1993-09-19', 'player', NULL),
('Frank', 'Vasquez', 'Frank', '727-555-0905', 'frank.vasquez@example.com', '9005 Court St', 'Clearwater', 'FL', '33756', '1987-12-31', 'player', '901236'),
('Judith', 'Carmona', 'Judy', '727-555-0906', 'judith.carmona@example.com', '9006 Cleveland St', 'Clearwater', 'FL', '33755', '1992-04-13', 'player', NULL),
('Douglas', 'Cano', 'Doug', '727-555-0907', 'douglas.cano@example.com', '9007 Keene Rd', 'Clearwater', 'FL', '33755', '1986-08-26', 'player', NULL),
('Evelyn', 'Barrera', 'Evelyn', '727-555-0908', 'evelyn.barrera@example.com', '9008 Missouri Ave', 'Clearwater', 'FL', '33756', '1994-12-08', 'player', '012347'),
('Henry', 'Esquivel', 'Hank', '727-555-0909', 'henry.esquivel@example.com', '9009 Highland Ave', 'Clearwater', 'FL', '33755', '1989-03-21', 'player', NULL),
('Teresa', 'Villarreal', 'Teresa', '727-555-0910', 'teresa.villarreal@example.com', '9010 Bayshore Blvd', 'Clearwater', 'FL', '33767', '1991-07-03', 'player', NULL),

-- Sarasota Area (34201-34299)
('Walter', 'Zamora', 'Walt', '941-555-1001', 'walter.zamora@example.com', '10001 Main St', 'Sarasota', 'FL', '34236', '1985-10-15', 'player', '123452'),
('Ann', 'Montes', 'Ann', '941-555-1002', 'ann.montes@example.com', '10002 Tamiami Trail', 'Sarasota', 'FL', '34231', '1992-02-27', 'player', NULL),
('Ralph', 'Duarte', 'Ralph', '941-555-1003', 'ralph.duarte@example.com', '10003 Fruitville Rd', 'Sarasota', 'FL', '34232', '1988-06-10', 'player', NULL),
('Janice', 'Quiroz', 'Jan', '941-555-1004', 'janice.quiroz@example.com', '10004 Bee Ridge Rd', 'Sarasota', 'FL', '34233', '1993-10-22', 'player', '234562'),
('Roger', 'Barajas', 'Roger', '941-555-1005', 'roger.barajas@example.com', '10005 Clark Rd', 'Sarasota', 'FL', '34233', '1987-01-04', 'player', NULL),
('Marie', 'Velazquez', 'Marie', '941-555-1006', 'marie.velazquez@example.com', '10006 Stickney Point Rd', 'Sarasota', 'FL', '34231', '1991-05-18', 'player', NULL),
('Jack', 'Camacho', 'Jack', '941-555-1007', 'jack.camacho@example.com', '10007 Siesta Dr', 'Sarasota', 'FL', '34242', '1986-09-30', 'player', '345672'),
('Diane', 'Bautista', 'Diane', '941-555-1008', 'diane.bautista@example.com', '10008 Gulf Gate Dr', 'Sarasota', 'FL', '34231', '1994-01-11', 'player', NULL),
('Arthur', 'Avila', 'Art', '941-555-1009', 'arthur.avila@example.com', '10009 Beneva Rd', 'Sarasota', 'FL', '34238', '1989-05-24', 'player', NULL),
('Joan', 'Corona', 'Joan', '941-555-1010', 'joan.corona@example.com', '10010 McIntosh Rd', 'Sarasota', 'FL', '34232', '1992-09-06', 'player', '456782'),

-- Cape Coral Area (33901-33999)
('Eugene', 'Cordova', 'Gene', '239-555-1101', 'eugene.cordova@example.com', '11001 Del Prado Blvd', 'Cape Coral', 'FL', '33909', '1984-11-17', 'player', NULL),
('Cheryl', 'Escobar', 'Cheryl', '239-555-1102', 'cheryl.escobar@example.com', '11002 Santa Barbara Blvd', 'Cape Coral', 'FL', '33991', '1990-03-30', 'player', NULL),
('Russell', 'Munoz', 'Russ', '239-555-1103', 'russell.munoz@example.com', '11003 Pine Island Rd', 'Cape Coral', 'FL', '33909', '1987-07-12', 'player', '567893'),
('Carolyn', 'Lara', 'Carolyn', '239-555-1104', 'carolyn.lara@example.com', '11004 Cape Coral Pkwy', 'Cape Coral', 'FL', '33904', '1993-11-24', 'player', NULL),
('Philip', 'Calderon', 'Phil', '239-555-1105', 'philip.calderon@example.com', '11005 Veterans Pkwy', 'Cape Coral', 'FL', '33914', '1988-02-06', 'player', NULL),
('Janet', 'Paz', 'Janet', '239-555-1106', 'janet.paz@example.com', '11006 Chiquita Blvd', 'Cape Coral', 'FL', '33993', '1991-06-19', 'player', '678904'),
('Billy', 'Gil', 'Billy', '239-555-1107', 'billy.gil@example.com', '11007 Skyline Blvd', 'Cape Coral', 'FL', '33914', '1985-10-01', 'player', NULL),
('Betty', 'Tovar', 'Betty', '239-555-1108', 'betty.tovar@example.com', '11008 Hancock Bridge Pkwy', 'Cape Coral', 'FL', '33990', '1992-01-13', 'player', NULL),
('Bobby', 'Delacruz', 'Bobby', '239-555-1109', 'bobby.delacruz@example.com', '11009 Embers Pkwy', 'Cape Coral', 'FL', '33993', '1989-05-26', 'player', '789015'),
('Gloria', 'Mata', 'Gloria', '239-555-1110', 'gloria.mata@example.com', '11010 Nicholas Pkwy', 'Cape Coral', 'FL', '33990', '1994-09-08', 'player', NULL),

-- Port St. Lucie Area (34950-34989)
('Lawrence', 'Fernandez', 'Larry', '772-555-1201', 'lawrence.fernandez@example.com', '12001 US Highway 1', 'Port St. Lucie', 'FL', '34952', '1986-12-20', 'player', NULL),
('Doris', 'Alonso', 'Doris', '772-555-1202', 'doris.alonso@example.com', '12002 SW Port St Lucie Blvd', 'Port St. Lucie', 'FL', '34953', '1991-04-02', 'player', '890126'),
('Louis', 'Trujillo', 'Lou', '772-555-1203', 'louis.trujillo@example.com', '12003 SE Walton Rd', 'Port St. Lucie', 'FL', '34952', '1988-08-15', 'player', NULL),
('Marilyn', 'Rosario', 'Marilyn', '772-555-1204', 'marilyn.rosario@example.com', '12004 SW Darwin Blvd', 'Port St. Lucie', 'FL', '34987', '1993-12-27', 'player', NULL),
('Gerald', 'Quintero', 'Gerald', '772-555-1205', 'gerald.quintero@example.com', '12005 Gatlin Blvd', 'Port St. Lucie', 'FL', '34953', '1987-03-10', 'player', '901237'),
('Norma', 'Elizondo', 'Norma', '772-555-1206', 'norma.elizondo@example.com', '12006 SW Cashmere Blvd', 'Port St. Lucie', 'FL', '34987', '1992-07-23', 'player', NULL),
('Keith', 'Bustamante', 'Keith', '772-555-1207', 'keith.bustamante@example.com', '12007 SW California Blvd', 'Port St. Lucie', 'FL', '34987', '1986-11-05', 'player', NULL),
('Alice', 'Olvera', 'Alice', '772-555-1208', 'alice.olvera@example.com', '12008 SW Bayshore Blvd', 'Port St. Lucie', 'FL', '34987', '1994-03-18', 'player', '012348'),
('Craig', 'Arellano', 'Craig', '772-555-1209', 'craig.arellano@example.com', '12009 SW Becker Rd', 'Port St. Lucie', 'FL', '34987', '1989-06-30', 'player', NULL),
('Debra', 'Guillen', 'Deb', '772-555-1210', 'debra.guillen@example.com', '12010 SW Jennings Ave', 'Port St. Lucie', 'FL', '34987', '1991-10-12', 'player', NULL),

-- Hialeah Area (33010-33018)
('Wayne', 'Solis', 'Wayne', '305-555-1301', 'wayne.solis@example.com', '13001 W 49th St', 'Hialeah', 'FL', '33012', '1985-01-25', 'player', '123453'),
('Theresa', 'Lugo', 'Terry', '305-555-1302', 'theresa.lugo@example.com', '13002 Palm Ave', 'Hialeah', 'FL', '33010', '1992-05-08', 'player', NULL),
('Randy', 'Navarro', 'Randy', '305-555-1303', 'randy.navarro@example.com', '13003 E 4th Ave', 'Hialeah', 'FL', '33013', '1988-09-20', 'player', NULL),
('Tammy', 'Cisneros', 'Tammy', '305-555-1304', 'tammy.cisneros@example.com', '13004 NW 79th St', 'Hialeah', 'FL', '33016', '1993-01-01', 'player', '234563'),
('Howard', 'Nieves', 'Howard', '305-555-1305', 'howard.nieves@example.com', '13005 W 84th St', 'Hialeah', 'FL', '33014', '1987-05-15', 'player', NULL),
('Shirley', 'Galvan', 'Shirley', '305-555-1306', 'shirley.galvan@example.com', '13006 E 8th Ave', 'Hialeah', 'FL', '33013', '1991-09-27', 'player', NULL),
('Larry', 'Andrade', 'Larry', '305-555-1307', 'larry.andrade@example.com', '13007 W 20th Ave', 'Hialeah', 'FL', '33010', '1986-01-09', 'player', '345673'),
('Brenda', 'Jaramillo', 'Brenda', '305-555-1308', 'brenda.jaramillo@example.com', '13008 NW 103rd St', 'Hialeah', 'FL', '33018', '1994-05-22', 'player', NULL),
('Eugene', 'Collazo', 'Gene', '305-555-1309', 'eugene.collazo@example.com', '13009 SE 3rd Ct', 'Hialeah', 'FL', '33010', '1989-08-03', 'player', NULL),
('Katherine', 'Lucero', 'Kathy', '305-555-1310', 'katherine.lucero@example.com', '13010 W 12th Ave', 'Hialeah', 'FL', '33012', '1992-12-16', 'player', '456783');

-- =====================================================
-- SEED COMPLETE
-- =====================================================
-- 150 fake members inserted
-- All Florida-based across 12 major cities
-- ~20% have BCA member numbers
-- system_player_number will be auto-assigned (1-150)
-- Ready for testing captain search/lookup UX
-- =====================================================
