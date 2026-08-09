const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const WORKSPACE = 'C:\\AI-Workspace\\Qobban\\MARKETING';
const V1 = path.join(WORKSPACE, 'week-1-qobban');
const OUT = path.join(WORKSPACE, 'week-1-qobban-v2');
const ASSETS = path.join(OUT, 'assets');
const VISUALS = path.join(ASSETS, 'visuals');
const PRICE_BASES = path.join(OUT, 'post-07-checklist-carousel', 'base-images-v3');
const LOGO_REF = 'C:\\Users\\icy\\AppData\\Local\\Temp\\codex-clipboard-55a996c9-a40f-4c75-8168-f5786e06bc08.png';
const PANEL_SOURCE = 'C:\\Users\\icy\\.codex\\generated_images\\019fc45d-3713-7e82-a7c6-dea0addda7b3\\exec-fbae82bc-9388-42ec-8170-1d49c33eda8c.png';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ALMARAI_LIGHT = path.join(ASSETS, 'fonts', 'almarai', 'Almarai-Light.ttf');
const ALMARAI_REGULAR = path.join(ASSETS, 'fonts', 'almarai', 'Almarai-Regular.ttf');
const ALMARAI_BOLD = path.join(ASSETS, 'fonts', 'almarai', 'Almarai-Bold.ttf');
const ALMARAI_EXTRABOLD = path.join(ASSETS, 'fonts', 'almarai', 'Almarai-ExtraBold.ttf');

const YELLOW = '#FFC220';
const WARM_WHITE = '#F2F2F2';

const designs = [
  {
    id: 'post-01-brand-intro-v2', folder: 'post-01-brand-intro', count: '01', total: '01', category: 'QOBBAN',
    source: path.join(V1, 'post-01-brand-intro', 'source-renders', 'post-01-brand-intro-base.png'),
    headline: 'الدقة <span>معيارنا</span>',
    support: 'بوابات، مظلات، درابزين، وأعمال معدنية مصممة للمكان',
    features: ['قياس دقيق', 'تنفيذ نظيف', 'تركيب احترافي'],
    footerCta: 'ناقش مشروعك معنا',
  },
  {
    id: 'slide-01-cover-v2', folder: 'post-03-service-carousel', count: '01', total: '07', category: 'SERVICES',
    source: path.join(V1, 'post-03-service-carousel', 'source-renders', 'slide-01-cover-base.png'),
    headline: 'شنو نقدر <span>ننفذ لك؟</span>',
    support: 'حلول للمنازل، المشاريع التجارية، والتنفيذ حسب الطلب',
    features: ['منازل', 'مشاريع تجارية', 'تنفيذ حسب الطلب'],
    footerCta: 'اسحب وشوف الخدمات',
  },
  {
    id: 'slide-02-gates-v2', folder: 'post-03-service-carousel', count: '02', total: '07', category: 'GATES',
    source: path.join(V1, 'post-03-service-carousel', 'source-renders', 'slide-02-gates.png'), crop: { left: 0, top: 0, width: 700, height: 1600 },
    headline: 'واجهة أقوى من <span>أول نظرة</span>',
    support: 'بوابات مصممة للخصوصية، الأمان، وسهولة الاستخدام اليومي',
    features: ['خصوصية', 'أمان', 'استخدام يومي'],
  },
  {
    id: 'slide-03-pergolas-v2', folder: 'post-03-service-carousel', count: '03', total: '07', category: 'PERGOLAS',
    source: path.join(V1, 'post-03-service-carousel', 'source-renders', 'slide-03-pergolas.png'), crop: { left: 360, top: 0, width: 640, height: 1600 },
    headline: 'استفد من المساحة الخارجية <span>أكثر</span>',
    support: 'حلول ظل عملية ومصممة عشان تنسجم مع المكان',
    features: ['ظل عملي', 'تكامل مع المكان', 'تنفيذ محسوب'],
    headlineSize: 54,
  },
  {
    id: 'slide-04-railings-v2', folder: 'post-03-service-carousel', count: '04', total: '07', category: 'RAILINGS',
    source: path.join(V1, 'post-03-service-carousel', 'source-renders', 'slide-04-railings.png'), crop: { left: 0, top: 0, width: 720, height: 1600 },
    headline: 'أمان بدون ما تخسر <span>جمال المكان</span>',
    support: 'درابزين وسلالم بتفاصيل نظيفة وتنفيذ محسوب',
    features: ['أمان', 'تفاصيل نظيفة', 'تنفيذ محسوب'],
    headlineSize: 54,
  },
  {
    id: 'slide-05-canopies-v2', folder: 'post-03-service-carousel', count: '05', total: '07', category: 'CANOPIES',
    source: path.join(V1, 'post-03-service-carousel', 'source-renders', 'slide-05-canopies.png'), crop: { left: 0, top: 0, width: 690, height: 1600 },
    headline: 'حماية عملية للمكان <span>والسيارة</span>',
    support: 'مظلات للمنازل، المواقف، والمشاريع التجارية',
    features: ['منازل', 'مواقف', 'مشاريع تجارية'],
    headlineSize: 54,
  },
  {
    id: 'slide-06-custom-products-v2', folder: 'post-03-service-carousel', count: '06', total: '07', category: 'CUSTOM',
    source: path.join(V1, 'post-03-service-carousel', 'source-renders', 'slide-06-custom-products.png'), crop: { left: 0, top: 0, width: 640, height: 1600 },
    headline: 'تفاصيل تعطي المكان <span>هويته</span>',
    support: 'شاشات، فواصل، ستاندات، خشب وWPC، وتنفيذ حسب الطلب',
    features: ['معدن', 'خشب وWPC', 'حسب الطلب'],
  },
  {
    id: 'slide-07-maintenance-v2', folder: 'post-03-service-carousel', count: '07', total: '07', category: 'MAINTENANCE',
    source: path.join(V1, 'post-03-service-carousel', 'source-renders', 'slide-07-maintenance.png'), crop: { left: 420, top: 0, width: 580, height: 1600 },
    headline: 'حافظ على اللي <span>بنيته</span>',
    support: 'صيانة، إصلاح، إعادة طلاء، تركيب وتنفيذ في الموقع',
    features: ['صيانة', 'إصلاح', 'إعادة طلاء'],
    footerCta: 'احفظ البوست وأرسل تفاصيل مشروعك',
  },
  {
    id: 'post-05-gate-lead-v2', folder: 'post-05-gate-lead', count: '01', total: '01', category: 'GATES',
    source: path.join(V1, 'post-05-gate-lead', 'source-renders', 'post-05-gate-lead-base.png'),
    headline: 'الأمان ما يعني إنك تتنازل عن <span>الشكل</span>',
    support: 'بوابات مصممة للخصوصية، الحضور، والاستخدام اليومي',
    features: ['خصوصية', 'حضور', 'استخدام يومي'],
    footerCta: 'أرسل كلمة «بوابة» وخلنا نناقش مشروعك',
    headlineSize: 52,
  },
  {
    id: 'slide-01-cover-v2', folder: 'post-07-checklist-carousel', count: '01', total: '07', category: 'CHECKLIST',
    source: path.join(V1, 'post-07-checklist-carousel', 'source-renders', 'slide-01-cover.png'), crop: { left: 0, top: 420, width: 1000, height: 1100 },
    headline: 'لا تختار على <span>السعر بس</span>',
    support: '5 أشياء تأكد منها قبل تعتمد عرض سعر الأعمال المعدنية',
    features: ['الخامة', 'القياس', 'نطاق العمل'],
    footerCta: 'احفظ القائمة',
  },
  {
    id: 'slide-02-material-v2', folder: 'post-07-checklist-carousel', count: '02', total: '07', category: 'MATERIAL',
    source: path.join(PRICE_BASES, 'slide-02-material-photo.png'),
    headline: 'شنو نوع الخامة <span>المستخدمة؟</span>',
    support: 'تأكد من نوع المعدن، السماكة، ومدى مناسبته للاستخدام والموقع',
    features: ['نوع المعدن', 'السماكة', 'ملاءمة الاستخدام'],
    headlineSize: 54,
  },
  {
    id: 'slide-03-climate-v2', folder: 'post-07-checklist-carousel', count: '03', total: '07', category: 'CLIMATE',
    source: path.join(PRICE_BASES, 'slide-03-climate-photo.png'),
    headline: 'هل الخامة مناسبة <span>لجو البحرين؟</span>',
    support: 'اسأل عن تجهيز السطح، الطلاء، الحماية من الصدأ، والصيانة المطلوبة',
    features: ['تجهيز السطح', 'الطلاء', 'الصيانة'],
    headlineSize: 54,
  },
  {
    id: 'slide-04-measurement-v2', folder: 'post-07-checklist-carousel', count: '04', total: '07', category: 'MEASUREMENT',
    source: path.join(PRICE_BASES, 'slide-04-measurement-photo.png'),
    headline: 'هل الموقع انقاس <span>بشكل صحيح؟</span>',
    support: 'الفرق البسيط في القياس ممكن يسبب ميلان، صعوبة في الفتح، أو مشاكل في التركيب',
    features: ['استقامة', 'سهولة الفتح', 'تركيب صحيح'],
    headlineSize: 52,
  },
  {
    id: 'slide-05-scope-v2', folder: 'post-07-checklist-carousel', count: '05', total: '07', category: 'SCOPE',
    source: path.join(PRICE_BASES, 'slide-05-scope-photo.png'),
    headline: 'شنو يشمل <span>عرض السعر؟</span>',
    support: 'وضح التصميم، الخامة، التشطيب، النقل، التركيب، الأتمتة والتنظيف',
    features: ['التصميم والخامة', 'النقل والتركيب', 'الأتمتة والتنظيف'],
    headlineSize: 54,
  },
  {
    id: 'slide-06-after-fabrication-v2', folder: 'post-07-checklist-carousel', count: '06', total: '07', category: 'HANDOVER',
    source: path.join(PRICE_BASES, 'slide-06-handover-photo.png'),
    headline: 'شنو يصير بعد <span>التصنيع؟</span>',
    support: 'تأكد من طريقة التركيب، حماية الموقع، التسليم النهائي، والمتابعة بعد المشروع',
    features: ['حماية الموقع', 'التسليم النهائي', 'المتابعة'],
    headlineSize: 54,
  },
  {
    id: 'slide-07-cta-v2', folder: 'post-07-checklist-carousel', count: '07', total: '07', category: 'ACTION',
    source: path.join(PRICE_BASES, 'slide-07-comparison-photo.png'),
    headline: 'قارن طريقة الشغل… <span>مو السعر بس</span>',
    support: 'كل ما كان السؤال أوضح، كانت النتيجة أفضل',
    features: ['احفظ القائمة', 'أرسل تفاصيل مشروعك'],
    footerCta: 'وأرسل لنا تفاصيل مشروعك',
    headlineSize: 52,
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function dataUrl(file) {
  const ext = path.extname(file).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${fs.readFileSync(file).toString('base64')}`;
}

function fontDataUrl(file) {
  return `data:font/ttf;base64,${fs.readFileSync(file).toString('base64')}`;
}

async function prepareAssets() {
  ensureDir(ASSETS);
  ensureDir(VISUALS);

  const logoRaw = await sharp(LOGO_REF)
    .extract({ left: 272, top: 138, width: 408, height: 420 })
    .resize({ width: 220, height: 226, fit: 'contain' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < logoRaw.data.length; i += 4) {
    const peak = Math.max(logoRaw.data[i], logoRaw.data[i + 1], logoRaw.data[i + 2]);
    logoRaw.data[i + 3] = Math.max(0, Math.min(255, Math.round((peak - 18) * 12)));
  }
  await sharp(logoRaw.data, { raw: logoRaw.info })
    .png()
    .toFile(path.join(ASSETS, 'qobban-logo-lockup.png'));

  await sharp(PANEL_SOURCE)
    .resize(460, 1350, { fit: 'cover' })
    .png()
    .toFile(path.join(ASSETS, 'shared-charcoal-panel.png'));

  for (const design of designs) {
    const output = path.join(VISUALS, `${design.folder}-${design.id}.png`);
    let pipeline = sharp(design.source);
    if (design.crop) {
      const metadata = await pipeline.metadata();
      const left = Math.round((design.crop.left / 1000) * metadata.width);
      const top = Math.round((design.crop.top / 1600) * metadata.height);
      const width = Math.min(
        Math.round((design.crop.width / 1000) * metadata.width),
        metadata.width - left,
      );
      const height = Math.min(
        Math.round((design.crop.height / 1600) * metadata.height),
        metadata.height - top,
      );
      pipeline = pipeline.extract({ left, top, width, height });
    }
    await pipeline
      .resize(620, 1350, { fit: 'cover', position: 'centre' })
      .modulate({ saturation: 0.93, brightness: 1.02 })
      .sharpen({ sigma: 0.6 })
      .png()
      .toFile(output);
    design.visual = output;
  }
}

function iconFor(index) {
  return ['✓', '↔', '◇'][index % 3];
}

function renderHtml(design, logoData, panelData, visualData, fonts) {
  const features = design.features.map((item, index) => `
    <div class="feature">
      <div class="feature-icon">${iconFor(index)}</div>
      <div class="feature-text">${item}</div>
    </div>`).join('');

  return `<!doctype html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face { font-family: 'Almarai'; src: url('${fonts.light}') format('truetype'); font-style: normal; font-weight: 300; font-display: block; }
      @font-face { font-family: 'Almarai'; src: url('${fonts.regular}') format('truetype'); font-style: normal; font-weight: 400; font-display: block; }
      @font-face { font-family: 'Almarai'; src: url('${fonts.bold}') format('truetype'); font-style: normal; font-weight: 700; font-display: block; }
      @font-face { font-family: 'Almarai'; src: url('${fonts.extrabold}') format('truetype'); font-style: normal; font-weight: 800; font-display: block; }
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1350px; overflow: hidden; background: #111; }
      body { font-family: 'Almarai', Tahoma, Arial, sans-serif; color: ${WARM_WHITE}; }
      .canvas { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: #111; }
      .photo { position: absolute; inset: 0 auto 0 0; width: 620px; height: 1350px; object-fit: cover; }
      .photo-shade { position: absolute; left: 0; top: 0; width: 620px; height: 1350px; background: linear-gradient(90deg, rgba(0,0,0,.05), transparent 22%, transparent 78%, rgba(0,0,0,.16)); }
      .panel { position: absolute; left: 620px; top: 0; width: 460px; height: 1350px; background-image: linear-gradient(rgba(12,12,12,.08), rgba(12,12,12,.08)), url('${panelData}'); background-size: cover; border-left: 1px solid rgba(255,194,32,.35); }
      .logo { position: absolute; left: 650px; top: 40px; width: 148px; height: 152px; object-fit: contain; }
      .coord { position: absolute; right: 38px; top: 58px; width: 228px; display: flex; align-items: center; gap: 10px; color: ${YELLOW}; font: 700 13px Arial, sans-serif; direction: ltr; letter-spacing: .2px; }
      .coord::before { content: ''; width: 40px; height: 1px; background: ${YELLOW}; opacity: .8; }
      .coord-mark { width: 18px; height: 18px; border: 1px solid ${YELLOW}; border-radius: 50%; position: relative; flex: 0 0 auto; }
      .coord-mark::before, .coord-mark::after { content: ''; position: absolute; background: ${YELLOW}; }
      .coord-mark::before { width: 28px; height: 1px; left: -6px; top: 8px; }
      .coord-mark::after { width: 1px; height: 28px; left: 8px; top: -6px; }
      .slide-id { position: absolute; right: 42px; top: 128px; color: ${YELLOW}; font: 700 17px Arial, sans-serif; letter-spacing: 1.3px; direction: ltr; }
      .slide-id b { color: ${WARM_WHITE}; font-weight: 500; }
      .content { position: absolute; left: 660px; top: 218px; width: 370px; direction: rtl; text-align: right; }
      .category { color: ${YELLOW}; font: 700 14px Arial, sans-serif; letter-spacing: 2.2px; direction: ltr; text-align: right; margin-bottom: 18px; }
      .headline { font-size: ${design.headlineSize || 60}px; line-height: 1.32; font-weight: 800; letter-spacing: 0; color: ${WARM_WHITE}; text-wrap: balance; }
      .headline span { color: ${YELLOW}; }
      .rule { width: 92px; height: 2px; margin: 24px 0 22px auto; background: ${YELLOW}; }
      .support { font-size: 24px; line-height: 1.78; font-weight: 300; color: rgba(242,242,242,.94); }
      .features { margin-top: 30px; display: grid; gap: 12px; }
      .feature { min-height: 60px; display: flex; flex-direction: row; align-items: center; gap: 15px; }
      .feature-icon { flex: 0 0 54px; width: 54px; height: 54px; border: 1.5px solid ${YELLOW}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: ${YELLOW}; font: 500 27px Arial, sans-serif; }
      .feature-text { font-size: 22px; line-height: 1.45; color: ${WARM_WHITE}; font-weight: 400; }
      .ruler-left { position: absolute; left: 36px; top: 655px; width: 20px; height: 340px; border-left: 2px solid ${YELLOW}; background: repeating-linear-gradient(to bottom, transparent 0 13px, ${YELLOW} 13px 14px); opacity: .88; }
      .ruler-left::before, .ruler-left::after { content: ''; position: absolute; left: -6px; width: 12px; height: 1px; background: ${YELLOW}; }
      .ruler-left::before { top: 0; } .ruler-left::after { bottom: 0; }
      .ruler-label { position: absolute; left: 18px; top: 1010px; color: ${WARM_WHITE}; font: 600 13px Arial, sans-serif; writing-mode: vertical-rl; letter-spacing: 2px; opacity: .9; }
      .ruler-right { position: absolute; right: 24px; top: 615px; width: 16px; height: 330px; border-right: 2px solid ${YELLOW}; background: repeating-linear-gradient(to bottom, transparent 0 11px, ${YELLOW} 11px 12px); opacity: .78; }
      .cta-note { position: absolute; left: 72px; bottom: 172px; color: ${YELLOW}; font-size: 20px; font-weight: 700; direction: rtl; text-shadow: 0 1px 4px rgba(0,0,0,.7); }
      .contact { position: absolute; left: 48px; bottom: 62px; width: 984px; height: 92px; border: 2px solid ${YELLOW}; border-radius: 48px; background: rgba(10,10,10,.96); display: grid; grid-template-columns: 270px 2px 330px 2px 1fr; align-items: center; padding: 0 28px; direction: ltr; }
      .separator { width: 2px; height: 55px; background: ${YELLOW}; opacity: .9; }
      .contact-item { display: flex; align-items: center; justify-content: center; gap: 17px; color: ${WARM_WHITE}; font: 500 25px Arial, sans-serif; }
      .contact-item.phone { font-size: 39px; font-weight: 700; letter-spacing: 1px; }
      .contact-icon { width: 42px; height: 42px; border: 2px solid ${YELLOW}; border-radius: 13px; display: flex; align-items: center; justify-content: center; color: ${YELLOW}; position: relative; }
      .contact-icon.ig::before { content: ''; width: 17px; height: 17px; border: 2px solid ${YELLOW}; border-radius: 50%; }
      .contact-icon.ig::after { content: ''; position: absolute; width: 4px; height: 4px; right: 7px; top: 7px; background: ${YELLOW}; border-radius: 50%; }
      .contact-icon.wa { border-radius: 50%; }
      .contact-icon.wa::before { content: '☎'; font: 700 25px Arial, sans-serif; transform: rotate(-16deg); }
      .descriptor { direction: rtl; text-align: right; color: ${WARM_WHITE}; font-size: 17px; line-height: 1.5; font-weight: 300; padding-right: 20px; }
      .tagline { position: absolute; right: 84px; bottom: 18px; width: 360px; color: rgba(242,242,242,.78); text-align: center; font-size: 15px; font-weight: 300; letter-spacing: .3px; }
      .tagline::before, .tagline::after { content: ''; display: inline-block; width: 48px; height: 1px; background: ${YELLOW}; vertical-align: middle; margin: 0 13px; opacity: .7; }
    </style>
  </head>
  <body>
    <div class="canvas">
      <img class="photo" src="${visualData}" />
      <div class="photo-shade"></div>
      <div class="panel"></div>
      <img class="logo" src="${logoData}" />
      <div class="coord"><span class="coord-mark"></span><span>26.2239° N, 50.5876° E</span></div>
      <div class="slide-id">${design.count} <b>/ ${design.total}</b></div>
      <div class="content">
        <div class="category">${design.category}</div>
        <div class="headline">${design.headline}</div>
        <div class="rule"></div>
        <div class="support">${design.support}</div>
        <div class="features">${features}</div>
      </div>
      <div class="ruler-left"></div>
      <div class="ruler-label">ALIGNMENT</div>
      <div class="ruler-right"></div>
      <div class="cta-note">${design.footerCta || 'ناقش مشروعك معنا'}</div>
      <div class="contact">
        <div class="contact-item"><span class="contact-icon ig"></span><span>qobban.bh</span></div>
        <div class="separator"></div>
        <div class="contact-item phone"><span class="contact-icon wa"></span><span>39949004</span></div>
        <div class="separator"></div>
        <div class="descriptor">قبان لأعمال اللحام<br/>والديكور والصيانة</div>
      </div>
      <div class="tagline">جودة في كل تفصيلة</div>
    </div>
  </body>
  </html>`;
}

async function renderDesigns() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const logoData = dataUrl(path.join(ASSETS, 'qobban-logo-lockup.png'));
  const panelData = dataUrl(path.join(ASSETS, 'shared-charcoal-panel.png'));
  const fonts = {
    light: fontDataUrl(ALMARAI_LIGHT),
    regular: fontDataUrl(ALMARAI_REGULAR),
    bold: fontDataUrl(ALMARAI_BOLD),
    extrabold: fontDataUrl(ALMARAI_EXTRABOLD),
  };

  for (const design of designs) {
    const destination = path.join(OUT, design.folder, 'finals-4x5-v2', `${design.id}.png`);
    ensureDir(path.dirname(destination));
    const html = renderHtml(design, logoData, panelData, dataUrl(design.visual), fonts);
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: destination, type: 'png' });
    design.output = destination;
  }
  await browser.close();
}

async function createContactSheet() {
  const thumbW = 240;
  const thumbH = 300;
  const gutter = 18;
  const cols = 4;
  const rows = Math.ceil(designs.length / cols);
  const width = cols * thumbW + (cols + 1) * gutter;
  const height = rows * thumbH + (rows + 1) * gutter;
  const composites = [];
  for (let index = 0; index < designs.length; index += 1) {
    const buffer = await sharp(designs[index].output).resize(thumbW, thumbH).png().toBuffer();
    composites.push({ input: buffer, left: gutter + (index % cols) * (thumbW + gutter), top: gutter + Math.floor(index / cols) * (thumbH + gutter) });
  }
  await sharp({ create: { width, height, channels: 3, background: '#111111' } })
    .composite(composites)
    .png()
    .toFile(path.join(OUT, 'week-1-v2-master-contact-sheet.png'));
}

async function copyBaseImages() {
  const bases = [
    [path.join(V1, 'post-01-brand-intro', 'exports-4x5', 'post-01-brand-intro-base.png'), path.join(OUT, 'post-01-brand-intro', 'base-images', 'post-01-brand-intro-base.png')],
    [path.join(V1, 'post-03-service-carousel', 'exports-4x5', 'slide-01-cover-base.png'), path.join(OUT, 'post-03-service-carousel', 'base-images', 'slide-01-cover-base.png')],
    [path.join(V1, 'post-05-gate-lead', 'exports-4x5', 'post-05-gate-lead-base.png'), path.join(OUT, 'post-05-gate-lead', 'base-images', 'post-05-gate-lead-base.png')],
  ];
  for (const [source, destination] of bases) {
    ensureDir(path.dirname(destination));
    fs.copyFileSync(source, destination);
  }
}

async function main() {
  ensureDir(OUT);
  await prepareAssets();
  await renderDesigns();
  await createContactSheet();
  await copyBaseImages();
  console.log(`Rendered ${designs.length} locked-layout designs to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
