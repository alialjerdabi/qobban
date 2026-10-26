-- PRACTICE CLIENTS. Invented, so the screens have something to show before real
-- clients exist. Every name is prefixed so nobody mistakes one for a real customer.
-- Delete with:  DELETE FROM customers WHERE name LIKE '[PRACTICE]%';

SET NAMES utf8mb4;

INSERT IGNORE INTO customers (name, kind, phone, company_name, cr_no, vat_no, area, note) VALUES
  ('[PRACTICE] Ahmed Al Dosari',  'person',  '39000001', NULL, NULL, NULL, 'Riffa',    'Villa gate and railing enquiry'),
  ('[PRACTICE] Fatima Al Khalifa','person',  '39000002', NULL, NULL, NULL, 'Saar',     'Pergola, repeat customer'),
  ('[PRACTICE] Gulf Contracting', 'company', '17000003', 'Gulf Contracting W.L.L.', '12345-1', '220000000000002', 'Sitra', 'B2B, monthly site work'),
  ('[PRACTICE] Manama Interiors', 'company', '17000004', 'Manama Interiors S.P.C.', '54321-2', '220000000000003', 'Manama', 'Decoration subcontractor'),
  ('[PRACTICE] Yousif Rentals',   'company', '39000005', 'Yousif Rentals',          '99887-1', NULL,              'Muharraq','Maintenance call-outs');
