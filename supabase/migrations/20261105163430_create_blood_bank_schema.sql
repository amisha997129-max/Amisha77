/*
# Blood Bank Management System — Schema & Seed Data

## Overview
Creates the full data model for a blood bank management system: donors,
blood inventory, blood requests, and donation camps/events. Pre-populates
all tables with realistic sample data so the app looks complete on first load.

## New Tables
1. `donors` — registered donors with contact info and eligibility.
   - id, name, age, blood_group, phone, email, last_donation_date, city, eligible
2. `blood_inventory` — stock levels per blood group.
   - id, blood_group (unique), units, updated_at
3. `blood_requests` — requests from hospitals/patients.
   - id, patient_name, blood_group, units_needed, urgency, hospital_name, contact, status, created_at
4. `camps` — upcoming blood donation camps/events.
   - id, title, date, time, location, description, registered

## Security
- This is a single-tenant app with NO sign-in screen.
- RLS enabled on every table.
- CRUD granted to `anon, authenticated` so the anon-key frontend works.
- Policies allow all CRUD for anon + authenticated (intentionally shared/public data).
*/

-- ============================================================
-- donors
-- ============================================================
CREATE TABLE IF NOT EXISTS donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  phone text NOT NULL,
  email text,
  last_donation_date date,
  city text NOT NULL,
  eligible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON donors TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_donors" ON donors;
CREATE POLICY "anon_select_donors" ON donors FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_donors" ON donors;
CREATE POLICY "anon_insert_donors" ON donors FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_donors" ON donors;
CREATE POLICY "anon_update_donors" ON donors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_donors" ON donors;
CREATE POLICY "anon_delete_donors" ON donors FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- blood_inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS blood_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_group text UNIQUE NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON blood_inventory TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_inventory" ON blood_inventory;
CREATE POLICY "anon_select_inventory" ON blood_inventory FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_inventory" ON blood_inventory;
CREATE POLICY "anon_insert_inventory" ON blood_inventory FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_inventory" ON blood_inventory;
CREATE POLICY "anon_update_inventory" ON blood_inventory FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_inventory" ON blood_inventory;
CREATE POLICY "anon_delete_inventory" ON blood_inventory FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- blood_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units_needed integer NOT NULL DEFAULT 1,
  urgency text NOT NULL DEFAULT 'Normal' CHECK (urgency IN ('Critical','Urgent','Normal')),
  hospital_name text NOT NULL,
  contact text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Fulfilled','Rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON blood_requests TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_requests" ON blood_requests;
CREATE POLICY "anon_select_requests" ON blood_requests FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_requests" ON blood_requests;
CREATE POLICY "anon_insert_requests" ON blood_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_requests" ON blood_requests;
CREATE POLICY "anon_update_requests" ON blood_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_requests" ON blood_requests;
CREATE POLICY "anon_delete_requests" ON blood_requests FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- camps
-- ============================================================
CREATE TABLE IF NOT EXISTS camps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  description text,
  registered integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE camps ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON camps TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_camps" ON camps;
CREATE POLICY "anon_select_camps" ON camps FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_camps" ON camps;
CREATE POLICY "anon_insert_camps" ON camps FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_camps" ON camps;
CREATE POLICY "anon_update_camps" ON camps FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_camps" ON camps;
CREATE POLICY "anon_delete_camps" ON camps FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- Seed data
-- ============================================================
INSERT INTO donors (name, age, blood_group, phone, email, last_donation_date, city, eligible) VALUES
('Aarav Sharma', 28, 'O+', '9876543210', 'aarav.sharma@email.com', '2026-08-15', 'Mumbai', true),
('Priya Patel', 32, 'A+', '9876543211', 'priya.patel@email.com', '2026-07-20', 'Ahmedabad', true),
('Rohan Verma', 25, 'B+', '9876543212', 'rohan.verma@email.com', '2026-09-01', 'Delhi', true),
('Sneha Reddy', 30, 'AB+', '9876543213', 'sneha.reddy@email.com', '2026-06-10', 'Hyderabad', true),
('Karthik Iyer', 35, 'O-', '9876543214', 'karthik.iyer@email.com', '2026-05-05', 'Chennai', false),
('Ananya Gupta', 27, 'A-', '9876543215', 'ananya.gupta@email.com', '2026-08-25', 'Kolkata', true),
('Vikram Singh', 40, 'B-', '9876543216', 'vikram.singh@email.com', '2026-04-12', 'Jaipur', false),
('Meera Nair', 29, 'AB-', '9876543217', 'meera.nair@email.com', '2026-09-10', 'Kochi', true),
('Arjun Kapoor', 33, 'O+', '9876543218', 'arjun.kapoor@email.com', '2026-07-30', 'Chandigarh', true),
('Divya Joshi', 26, 'A+', '9876543219', 'divya.joshi@email.com', '2026-08-18', 'Pune', true),
('Sai Krishna', 31, 'B+', '9876543220', 'sai.krishna@email.com', '2026-06-22', 'Bengaluru', true),
('Ishita Rao', 24, 'O-', '9876543221', 'ishita.rao@email.com', '2026-09-15', 'Indore', true),
('Aditya Mehta', 38, 'AB+', '9876543222', 'aditya.mehta@email.com', '2026-03-08', 'Surat', false),
('Pooja Desai', 28, 'A-', '9876543223', 'pooja.desai@email.com', '2026-08-05', 'Nagpur', true),
('Rahul Naidu', 34, 'B-', '9876543224', 'rahul.naidu@email.com', '2026-07-12', 'Visakhapatnam', true)
ON CONFLICT DO NOTHING;

INSERT INTO blood_inventory (blood_group, units) VALUES
('A+', 42), ('A-', 8), ('B+', 26), ('B-', 3),
('AB+', 15), ('AB-', 6), ('O+', 50), ('O-', 4)
ON CONFLICT (blood_group) DO NOTHING;

INSERT INTO blood_requests (patient_name, blood_group, units_needed, urgency, hospital_name, contact, status) VALUES
('Ramesh Kulkarni', 'O-', 2, 'Critical', 'Apollo Hospital, Mumbai', '9876500001', 'Pending'),
('Lakshmi Venkat', 'AB+', 1, 'Normal', 'Fortis Hospital, Bengaluru', '9876500002', 'Pending'),
('Joseph Thomas', 'B+', 3, 'Urgent', 'AIIMS, Delhi', '9876500003', 'Approved'),
('Fatima Sheikh', 'A+', 2, 'Urgent', 'CMI Hospital, Chennai', '9876500004', 'Pending'),
('Gurpreet Kaur', 'O+', 4, 'Critical', 'Max Hospital, Ludhiana', '9876500005', 'Fulfilled')
ON CONFLICT DO NOTHING;

INSERT INTO camps (title, date, time, location, description, registered) VALUES
('Annual Blood Donation Drive', '2026-11-15', '09:00 AM - 04:00 PM', 'Community Center, Bandra, Mumbai', 'Join us for our largest blood donation drive of the year. Free health check-up for all donors.', 87),
('College Campus Donation Camp', '2026-11-22', '10:00 AM - 02:00 PM', 'IIT Bombay Campus, Powai', 'A youth-focused donation camp organized in partnership with the student council.', 45),
('Corporate Donor Day', '2026-12-05', '11:00 AM - 03:00 PM', 'Tech Park, Whitefield, Bengaluru', 'Employees from leading tech companies come together to donate blood.', 62),
('Rural Health & Donation Camp', '2026-12-12', '08:00 AM - 01:00 PM', 'Primary Health Center, Manesar', 'Bringing blood donation facilities to rural communities. Transport provided.', 28)
ON CONFLICT DO NOTHING;
