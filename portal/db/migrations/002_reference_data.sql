-- Reference data: the company, roles, quote terms, number series and a starting price list.
-- Everything here is real except where marked PLACEHOLDER — see docs/OPEN-QUESTIONS.md.
-- Idempotent: INSERT IGNORE / ON DUPLICATE KEY, so re-running changes nothing.

SET NAMES utf8mb4;

-- ------------------------------------------------------------ the company
-- Legal names and CR are confirmed. VAT number and address are still placeholders;
-- a tax invoice must not be issued to a real customer until the VAT number is real.
INSERT INTO company (id, name_en, name_ar, cr_no, vat_no, address_en, address_ar,
                     phone, whatsapp, email, website, hours_en, hours_ar,
                     vat_rate_bp, labour_rate_fils, margin_pct, quote_valid_days)
VALUES (1,
  'QOBBAN WELDING, DECORATION, MAINTENANCE',
  'قبان لأعمال اللحام و الديكور و الصيانة',
  '60181-8',
  'PLACEHOLDER-VAT',
  'PLACEHOLDER — workshop address, Kingdom of Bahrain',
  'PLACEHOLDER — عنوان الورشة، مملكة البحرين',
  '+973 3994 9004', '97339949004', 'info@qobban.store', 'https://www.qobban.store',
  'Workshop 8:00–17:00. Deliveries, materials and replies continue after hours.',
  'الورشة ٨:٠٠ – ١٧:٠٠. التوصيل وشراء المواد والرد يستمر بعد الدوام.',
  1000, 10000, 20.00, 14)
ON DUPLICATE KEY UPDATE name_en = VALUES(name_en), name_ar = VALUES(name_ar), cr_no = VALUES(cr_no);

-- ------------------------------------------------------------ roles
INSERT IGNORE INTO roles (code, name_en, name_ar) VALUES
  ('owner',      'Owner / Manager', 'المالك / المدير'),
  ('manager',    'Sales / Office',  'المبيعات / المكتب'),
  ('accountant', 'Accountant',      'المحاسب'),
  ('foreman',    'Foreman',         'رئيس العمال');

-- ------------------------------------------------------------ number series
INSERT IGNORE INTO doc_sequences (doc_type, prefix, next_no) VALUES
  ('quote', 'Q-', 1), ('invoice', 'INV-', 1), ('credit_note', 'CN-', 1),
  ('receipt', 'RC-', 1), ('job', 'JOB-', 1), ('purchase_order', 'PO-', 1),
  ('delivery_note', 'DN-', 1);

-- ------------------------------------------------------------ quote terms
-- The six from the brief. Text is copied onto each document when it is saved, so
-- editing a term here never changes a quote the customer already has.
INSERT IGNORE INTO quote_terms (code, sort, default_on, text_en, text_ar) VALUES
  ('payment', 1, 1,
   'Payment schedule: 50% advance, 40% on delivery, 10% after installation.',
   'جدول الدفع: ٥٠٪ مقدمًا، ٤٠٪ عند التسليم، ١٠٪ بعد التركيب.'),
  ('materials', 2, 1,
   'Material prices are valid for the quote validity period only and are subject to market change after it.',
   'أسعار المواد سارية خلال مدة صلاحية العرض فقط وتخضع لتغير السوق بعدها.'),
  ('site', 3, 1,
   'The site must provide clear access and mains power on the agreed installation date.',
   'يجب توفير مدخل واضح وتيار كهربائي في الموقع بتاريخ التركيب المتفق عليه.'),
  ('drawings', 4, 1,
   'Fabrication begins after the customer approves the drawings in writing.',
   'يبدأ التصنيع بعد اعتماد العميل للمخططات خطيًا.'),
  ('warranty', 5, 1,
   'Welding workmanship is warranted for 12 months from handover.',
   'ضمان على أعمال اللحام لمدة ١٢ شهرًا من تاريخ التسليم.'),
  ('coating', 6, 1,
   'Galvanising and painting are not included unless stated as a line in this quote.',
   'الجلفنة والدهان غير مشمولين ما لم يُذكرا كبند في هذا العرض.');

-- ------------------------------------------------------------ price list
-- PRACTICE RATES. Plausible Bahrain figures so the quote builder can be used and
-- tested; every one must be checked against real supplier prices before go-live.
INSERT IGNORE INTO price_list (code, name_en, name_ar, kind, category, unit, rate_fils, cost_fils) VALUES
  -- labour
  ('LAB-WELD',  'Welder, per hour',          'لحّام، بالساعة',          'labour', 'Labour', 'hour', 10000, 7000),
  ('LAB-HELP',  'Helper, per hour',          'مساعد، بالساعة',          'labour', 'Labour', 'hour',  6000, 4000),
  ('LAB-SITE',  'On-site visit, per hour',   'زيارة موقع، بالساعة',     'labour', 'Labour', 'hour', 12000, 8000),
  -- steel sections
  ('STL-BOX40', 'Box section 40x40x2 mm',    'مواسير مربعة ٤٠×٤٠×٢ مم', 'material', 'Steel sections', 'm',  1800, 1350),
  ('STL-BOX50', 'Box section 50x50x2 mm',    'مواسير مربعة ٥٠×٥٠×٢ مم', 'material', 'Steel sections', 'm',  2300, 1750),
  ('STL-ANG40', 'Angle 40x40x4 mm',          'زاوية ٤٠×٤٠×٤ مم',        'material', 'Steel sections', 'm',  1600, 1200),
  ('STL-RHS',   'RHS 100x50x3 mm',           'مستطيل ١٠٠×٥٠×٣ مم',      'material', 'Steel sections', 'm',  4200, 3200),
  ('STL-RND12', 'Round bar 12 mm',           'حديد دائري ١٢ مم',        'material', 'Steel sections', 'm',   900,  650),
  -- sheets
  ('SHT-MS2',   'MS sheet 2 mm',             'صاج حديد ٢ مم',           'material', 'Sheets', 'm2',  6500, 5000),
  ('SHT-GI1',   'GI sheet 1 mm',             'صاج مجلفن ١ مم',          'material', 'Sheets', 'm2',  5200, 4000),
  ('SHT-EXP',   'Expanded mesh',             'شبك ممدد',                'material', 'Sheets', 'm2',  4800, 3600),
  -- finishing
  ('FIN-PRIME', 'Primer coat',               'دهان أساس',               'material', 'Paint', 'm2',  1200,  800),
  ('FIN-PAINT', 'Top coat, per m2',          'دهان نهائي، للمتر المربع','material', 'Paint', 'm2',  1800, 1200),
  ('FIN-POWDR', 'Powder coating, per m2',    'طلاء بودرة، للمتر المربع','material', 'Paint', 'm2',  4500, 3400),
  ('FIN-GALV',  'Hot-dip galvanising, per kg','جلفنة بالغمس، للكيلو',   'material', 'Paint', 'kg',   650,  480),
  -- consumables
  ('CON-ELEC',  'Welding electrodes, per kg','أقطاب لحام، للكيلو',      'material', 'Consumables', 'kg', 2200, 1600),
  ('CON-DISC',  'Cutting disc',              'قرص قطع',                 'material', 'Consumables', 'piece', 800, 550),
  -- unit rates (whole-item pricing)
  ('UR-RAIL',   'Railing, supplied and fitted','درابزين، توريد وتركيب', 'unit_rate', 'Unit rates', 'm',  18500, 13000),
  ('UR-GATE',   'Gate, per m2',              'بوابة، للمتر المربع',     'unit_rate', 'Unit rates', 'm2', 42000, 30000),
  ('UR-CANOPY', 'Canopy / car shade, per m2','مظلة سيارات، للمتر المربع','unit_rate','Unit rates', 'm2', 28000, 20000),
  ('UR-DOOR',   'Steel door, per piece',     'باب حديد، للقطعة',        'unit_rate', 'Unit rates', 'piece', 95000, 68000),
  -- ready products
  ('PRD-STAND', 'Decorative metal stand',    'ستاند ديكور معدني',       'product', 'Ready products', 'piece', 33000, 21000),
  ('PRD-SHELF', 'Industrial shelf unit',     'وحدة رفوف صناعية',        'product', 'Ready products', 'piece', 68000, 45000);
