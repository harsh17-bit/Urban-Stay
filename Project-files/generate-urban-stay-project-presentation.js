const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Urban Stay Team';
pptx.company = 'Urban Stay';
pptx.subject = 'Urban Stay real estate platform project presentation';
pptx.title = 'Urban Stay - Real Estate Platform';
pptx.lang = 'en-US';

const COLORS = {
  bg: 'F4F8FC',
  navy: '0B1F33',
  blue: '1F4E79',
  teal: '0F766E',
  tealSoft: 'E7F5F3',
  green: '2E8B57',
  gold: 'C97C00',
  red: 'B42318',
  text: '1F2937',
  muted: '64748B',
  light: 'D9E2EC',
  white: 'FFFFFF',
  card: 'FFFFFF',
  panel: 'EDF4FB',
};

const OUTPUT_FILE = path.join(
  __dirname,
  'Urban-Stay-Project-Presentation-Simple.pptx'
);

function svgData(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function iconSvg(kind, stroke = `#${COLORS.teal}`) {
  const common = `fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`;

  switch (kind) {
    case 'home':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path ${common} d="M8 22 24 9l16 13"/><path ${common} d="M12 20v18h24V20"/><path ${common} d="M19 38V28h10v10"/></svg>`;
    case 'search':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle ${common} cx="21" cy="21" r="9"/><path ${common} d="m28 28 10 10"/></svg>`;
    case 'lock':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path ${common} d="M15 22h18a2 2 0 0 1 2 2v14H13V24a2 2 0 0 1 2-2z"/><path ${common} d="M18 22v-5a6 6 0 0 1 12 0v5"/><circle ${common} cx="24" cy="31" r="2"/></svg>`;
    case 'building':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect ${common} x="10" y="9" width="14" height="30" rx="1.5"/><rect ${common} x="24" y="16" width="14" height="23" rx="1.5"/><path ${common} d="M16 14h2M16 20h2M16 26h2M16 32h2M30 20h2M30 26h2M30 32h2"/></svg>`;
    case 'workflow':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect ${common} x="6" y="18" width="10" height="10" rx="2"/><rect ${common} x="19" y="10" width="10" height="10" rx="2"/><rect ${common} x="32" y="18" width="10" height="10" rx="2"/><path ${common} d="M16 23h3M29 15h3M29 23h3"/><path ${common} d="m17 23 2 2-2 2M30 15 32 17l-2 2"/></svg>`;
    case 'chart':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path ${common} d="M10 38h28"/><path ${common} d="M14 33V23"/><path ${common} d="M22 33V15"/><path ${common} d="M30 33V20"/><path ${common} d="M38 33V11"/></svg>`;
    case 'message':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path ${common} d="M9 11h30v19H23l-9 8v-8H9z"/><path ${common} d="M15 19h18M15 24h12"/></svg>`;
    case 'shield':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path ${common} d="M24 8 37 13v10c0 9-5.8 15.4-13 17-7.2-1.6-13-8-13-17V13z"/><path ${common} d="m18.5 24 3.5 3.5L30 19.5"/></svg>`;
    case 'checklist':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path ${common} d="M14 10h22v28H14z"/><path ${common} d="M18 18h14M18 24h14M18 30h8"/><path ${common} d="m10 18 2 2 4-5"/></svg>`;
    case 'warning':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path ${common} d="m24 8 17 29H7z"/><path ${common} d="M24 18v9"/><circle ${common} cx="24" cy="32" r="1.2"/></svg>`;
    case 'trophy':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path ${common} d="M15 10h18v6c0 6-4 11-9 11s-9-5-9-11z"/><path ${common} d="M18 35h12M20 27v8M28 27v8"/><path ${common} d="M15 12H9c0 5 2 9 6 11M33 12h6c0 5-2 9-6 11"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle ${common} cx="24" cy="24" r="14"/></svg>`;
  }
}

function addImageIcon(
  slide,
  kind,
  x,
  y,
  size,
  circleColor = COLORS.tealSoft,
  iconStroke = COLORS.teal
) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y,
    w: size,
    h: size,
    fill: { color: circleColor },
    line: { color: circleColor },
  });
  slide.addImage({
    data: svgData(iconSvg(kind, `#${iconStroke}`)),
    x: x + size * 0.18,
    y: y + size * 0.18,
    w: size * 0.64,
    h: size * 0.64,
  });
}

function addHeader(slide, title, subtitle = '') {
  slide.background = { color: COLORS.bg };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.82,
    fill: { color: COLORS.navy },
    line: { color: COLORS.navy },
  });

  slide.addText(title, {
    x: 0.42,
    y: 0.17,
    w: 8.8,
    h: 0.34,
    color: COLORS.white,
    bold: true,
    fontFace: 'Calibri',
    fontSize: 21,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 8.6,
      y: 0.2,
      w: 4.2,
      h: 0.25,
      color: 'C7D2FE',
      align: 'right',
      fontFace: 'Calibri',
      fontSize: 10.5,
      italic: true,
    });
  }

  slide.addShape(pptx.ShapeType.line, {
    x: 0,
    y: 0.82,
    w: 13.333,
    h: 0,
    line: { color: COLORS.teal, pt: 1.5 },
  });
}

function addFooterNumber(slide, number) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 12.25,
    y: 6.95,
    w: 0.55,
    h: 0.34,
    rectRadius: 0.05,
    fill: { color: COLORS.blue },
    line: { color: COLORS.blue },
  });
  slide.addText(String(number), {
    x: 12.25,
    y: 6.99,
    w: 0.55,
    h: 0.18,
    color: COLORS.white,
    bold: true,
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 11,
  });
}

function addSectionTag(slide, text, x, y, w, color = COLORS.teal) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.3,
    rectRadius: 0.05,
    fill: { color },
    line: { color },
  });
  slide.addText(text, {
    x,
    y: y + 0.03,
    w,
    h: 0.16,
    color: COLORS.white,
    align: 'center',
    bold: true,
    fontFace: 'Calibri',
    fontSize: 10,
  });
}

function addCard(slide, options) {
  const {
    x,
    y,
    w,
    h,
    title,
    body,
    icon = 'default',
    accent = COLORS.teal,
    titleSize = 16,
    bodySize = 12.5,
  } = options;

  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.06,
    fill: { color: COLORS.card },
    line: { color: COLORS.light, pt: 1 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 0.12,
    h,
    fill: { color: accent },
    line: { color: accent },
  });
  addImageIcon(slide, icon, x + 0.18, y + 0.18, 0.48, COLORS.tealSoft, accent);
  slide.addText(title, {
    x: x + 0.74,
    y: y + 0.16,
    w: w - 0.92,
    h: 0.3,
    color: COLORS.text,
    bold: true,
    fontFace: 'Calibri',
    fontSize: titleSize,
  });
  slide.addText(body, {
    x: x + 0.22,
    y: y + 0.74,
    w: w - 0.34,
    h: h - 0.92,
    color: COLORS.muted,
    fontFace: 'Calibri',
    fontSize: bodySize,
    margin: 0,
    valign: 'top',
  });
}

function addStepBox(
  slide,
  step,
  title,
  body,
  x,
  y,
  w,
  h,
  accent = COLORS.teal
) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.04,
    fill: { color: COLORS.white },
    line: { color: COLORS.light, pt: 1 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.13,
    y: y + 0.14,
    w: 0.42,
    h: 0.42,
    rectRadius: 0.06,
    fill: { color: accent },
    line: { color: accent },
  });
  slide.addText(String(step), {
    x: x + 0.13,
    y: y + 0.17,
    w: 0.42,
    h: 0.15,
    color: COLORS.white,
    bold: true,
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 11,
  });
  slide.addText(title, {
    x: x + 0.62,
    y: y + 0.12,
    w: w - 0.76,
    h: 0.25,
    color: COLORS.text,
    bold: true,
    fontFace: 'Calibri',
    fontSize: 12.5,
  });
  slide.addText(body, {
    x: x + 0.13,
    y: y + 0.6,
    w: w - 0.26,
    h: h - 0.7,
    color: COLORS.muted,
    fontFace: 'Calibri',
    fontSize: 11,
    margin: 0,
  });
}

function addPill(slide, text, x, y, w, fill = COLORS.teal) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.34,
    rectRadius: 0.05,
    fill: { color: fill },
    line: { color: fill },
  });
  slide.addText(text, {
    x,
    y: y + 0.04,
    w,
    h: 0.16,
    color: COLORS.white,
    align: 'center',
    bold: true,
    fontFace: 'Calibri',
    fontSize: 10,
  });
}

function addTwoColumnBullets(
  slide,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  x,
  y,
  w,
  h
) {
  const columnW = (w - 0.3) / 2;
  addCard(slide, {
    x,
    y,
    w: columnW,
    h,
    title: leftTitle,
    body: leftItems.map((item) => `- ${item}`).join('\n'),
    icon: 'checklist',
    accent: COLORS.teal,
    titleSize: 15,
    bodySize: 12,
  });
  addCard(slide, {
    x: x + columnW + 0.3,
    y,
    w: columnW,
    h,
    title: rightTitle,
    body: rightItems.map((item) => `- ${item}`).join('\n'),
    icon: 'workflow',
    accent: COLORS.blue,
    titleSize: 15,
    bodySize: 12,
  });
}

function addMatrixTable(slide, x, y, w, h, rows) {
  const columns = [0.42, 0.22, 0.18, 0.18];
  const colX = [x];
  for (let i = 0; i < columns.length; i += 1) {
    colX.push(colX[i] + w * columns[i]);
  }

  const rowH = h / (rows.length + 1);

  const headers = ['Feature', 'User', 'Seller', 'Admin'];
  for (let i = 0; i < headers.length; i += 1) {
    slide.addShape(pptx.ShapeType.rect, {
      x: colX[i],
      y,
      w: w * columns[i],
      h: rowH,
      fill: { color: COLORS.navy },
      line: { color: COLORS.navy, pt: 0.5 },
    });
    slide.addText(headers[i], {
      x: colX[i] + 0.04,
      y: y + 0.08,
      w: w * columns[i] - 0.08,
      h: rowH - 0.12,
      color: COLORS.white,
      bold: true,
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 11.5,
    });
  }

  rows.forEach((row, index) => {
    const rowY = y + rowH * (index + 1);
    const fill = index % 2 === 0 ? COLORS.white : 'F7FAFC';
    [0, 1, 2, 3].forEach((col) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: colX[col],
        y: rowY,
        w: w * columns[col],
        h: rowH,
        fill: { color: fill },
        line: { color: COLORS.light, pt: 0.5 },
      });
    });
    slide.addText(row.feature, {
      x: colX[0] + 0.06,
      y: rowY + 0.06,
      w: w * columns[0] - 0.12,
      h: rowH - 0.1,
      color: COLORS.text,
      fontFace: 'Calibri',
      fontSize: 11,
    });
    slide.addText(row.user, {
      x: colX[1],
      y: rowY + 0.06,
      w: w * columns[1],
      h: rowH - 0.1,
      color: row.user.includes('Yes') ? COLORS.green : COLORS.red,
      bold: true,
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 11,
    });
    slide.addText(row.seller, {
      x: colX[2],
      y: rowY + 0.06,
      w: w * columns[2],
      h: rowH - 0.1,
      color: row.seller.includes('Yes') ? COLORS.green : COLORS.red,
      bold: true,
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 11,
    });
    slide.addText(row.admin, {
      x: colX[3],
      y: rowY + 0.06,
      w: w * columns[3],
      h: rowH - 0.1,
      color: row.admin.includes('Yes') ? COLORS.green : COLORS.red,
      bold: true,
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 11,
    });
  });
}

// Slide 1 - Title
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: COLORS.navy },
    line: { color: COLORS.navy },
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.75,
    y: 1.0,
    w: 11.85,
    h: 5.35,
    rectRadius: 0.08,
    fill: { color: '133B5C', transparency: 7 },
    line: { color: '2A70A5', pt: 1.5 },
  });

  slide.addText('URBAN STAY', {
    x: 1.15,
    y: 1.55,
    w: 11.0,
    h: 0.7,
    color: '9FD5FF',
    bold: true,
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 42,
  });

  slide.addText('Real Estate Platform Project Presentation', {
    x: 1.15,
    y: 2.35,
    w: 11.0,
    h: 0.45,
    color: COLORS.white,
    bold: true,
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 25,
  });

  slide.addText(
    'Full-stack property discovery, listing, inquiry, and dashboard workflow',
    {
      x: 1.15,
      y: 2.93,
      w: 11.0,
      h: 0.3,
      color: 'D6E2F0',
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 14,
    }
  );

  slide.addText(
    'React + Vite  |  Node.js + Express  |  MongoDB  |  JWT  |  Cloudinary  |  Razorpay  |  Leaflet',
    {
      x: 1.0,
      y: 3.48,
      w: 11.35,
      h: 0.3,
      color: 'B8D6EA',
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 12,
    }
  );

  const icons = [
    { kind: 'home', label: 'Discovery' },
    { kind: 'search', label: 'Search' },
    { kind: 'lock', label: 'Secure Auth' },
    { kind: 'building', label: 'Listings' },
    { kind: 'workflow', label: 'Workflow' },
  ];
  const startX = 1.55;
  icons.forEach((item, index) => {
    const x = startX + index * 2.05;
    addImageIcon(slide, item.kind, x, 4.15, 0.62, 'EAF4FF', '1F4E79');
    slide.addText(item.label, {
      x: x - 0.18,
      y: 4.86,
      w: 0.98,
      h: 0.2,
      color: 'DDEBFA',
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 10,
      bold: true,
    });
  });

  slide.addText('Clean academic presentation layout', {
    x: 1.15,
    y: 5.58,
    w: 11.0,
    h: 0.22,
    color: 'AFCBE1',
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 11,
  });
}

// Slide 2 - Table of Contents
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Table of Contents', 'Urban Stay Project Overview');

  addCard(slide, {
    x: 0.78,
    y: 1.24,
    w: 11.8,
    h: 5.25,
    title: 'Presentation Flow',
    body: '',
    icon: 'workflow',
    accent: COLORS.blue,
    titleSize: 18,
    bodySize: 1,
  });

  const items = [
    ['01', 'Project Background'],
    ['02', 'Introduction and Objectives'],
    ['03', 'Development Activities'],
    ['04', 'Project Profile'],
    ['05', 'Tools and Technologies'],
    ['06', 'Core Features'],
    ['07', 'Authentication and RBAC'],
    ['08', 'Property Workflow'],
    ['09', 'Search Intelligence and AI Price Match'],
    ['10', 'UI Screens and Architecture'],
    ['11', 'Work Completed and Status'],
    ['12', 'Challenges and Learnings'],
    ['13', 'Role Matrix and Conclusion'],
    ['14', 'Project Delivery and Thank You'],
  ];

  const leftX = 1.2;
  const rightX = 7.05;
  const startY = 1.75;
  const rowGap = 0.55;

  items.forEach((item, index) => {
    const column = index < 7 ? 0 : 1;
    const localIndex = column === 0 ? index : index - 7;
    const x = column === 0 ? leftX : rightX;
    const y = startY + localIndex * rowGap;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 0.55,
      h: 0.34,
      rectRadius: 0.05,
      fill: { color: column === 0 ? COLORS.teal : COLORS.blue },
      line: { color: column === 0 ? COLORS.teal : COLORS.blue },
    });
    slide.addText(item[0], {
      x,
      y: y + 0.05,
      w: 0.55,
      h: 0.14,
      color: COLORS.white,
      bold: true,
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 10,
    });
    slide.addText(item[1], {
      x: x + 0.72,
      y: y + 0.02,
      w: 4.95,
      h: 0.22,
      color: COLORS.text,
      fontFace: 'Calibri',
      fontSize: 13.5,
    });
  });

  addPill(
    slide,
    'Urban Stay - 14 Section Report',
    9.8,
    5.95,
    2.18,
    COLORS.teal
  );
  addFooterNumber(slide, 2);
}

// Slide 3 - Background
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Project Background', 'Why Urban Stay was built');

  addCard(slide, {
    x: 0.8,
    y: 1.28,
    w: 7.0,
    h: 5.55,
    title: 'About Urban Stay',
    body:
      'Urban Stay is a full-stack real estate platform built to make property discovery and listing management simpler, faster, and more transparent. The project combines user-facing search tools with seller and admin workflows so every role can interact with the same property ecosystem in a structured way.\n\n' +
      'Instead of scattered listings and manual follow-up, the platform centralizes property posting, filtering, inquiry handling, verification, reviews, alerts, and dashboard-based control. That gives buyers a cleaner search experience and gives sellers and admins a reliable operational view.',
    icon: 'home',
    accent: COLORS.blue,
    titleSize: 17,
    bodySize: 12.6,
  });

  addCard(slide, {
    x: 8.05,
    y: 1.28,
    w: 4.45,
    h: 2.3,
    title: 'Pain Points Solved',
    body: '- Fragmented property discovery\n- Slow inquiry follow-up\n- Poor listing quality control\n- No role-aware workflow',
    icon: 'warning',
    accent: COLORS.gold,
    titleSize: 15,
    bodySize: 12.2,
  });

  addCard(slide, {
    x: 8.05,
    y: 3.78,
    w: 4.45,
    h: 3.05,
    title: 'Project Outcome',
    body: '- Public search and detail pages\n- Seller posting and editing flow\n- Admin verification and feature control\n- Saved alerts, reviews, and inquiries\n- AI price match and utility tools',
    icon: 'trophy',
    accent: COLORS.green,
    titleSize: 15,
    bodySize: 12.1,
  });

  addFooterNumber(slide, 3);
}

// Slide 4 - Introduction
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Introduction to the Project',
    'Scope, objective, and value'
  );

  addCard(slide, {
    x: 0.78,
    y: 1.28,
    w: 3.96,
    h: 2.0,
    title: 'Purpose',
    body: 'Create a single digital platform for property browsing, listing, inquiry handling, and platform-level control.',
    icon: 'home',
    accent: COLORS.teal,
    titleSize: 15,
    bodySize: 12,
  });
  addCard(slide, {
    x: 4.68,
    y: 1.28,
    w: 3.96,
    h: 2.0,
    title: 'Users',
    body: 'User, seller, and admin roles with different access levels and dashboards.',
    icon: 'shield',
    accent: COLORS.blue,
    titleSize: 15,
    bodySize: 12,
  });
  addCard(slide, {
    x: 8.58,
    y: 1.28,
    w: 3.96,
    h: 2.0,
    title: 'Outcome',
    body: 'A responsive project that demonstrates a practical end-to-end real estate workflow.',
    icon: 'chart',
    accent: COLORS.green,
    titleSize: 15,
    bodySize: 12,
  });

  addTwoColumnBullets(
    slide,
    'Project Objectives',
    [
      'Build secure login, register, and password recovery flows.',
      'Support property listing creation, edits, and image uploads.',
      'Allow search, filter, and detailed property exploration.',
      'Provide inquiry, review, alert, and dashboard workflows.',
    ],
    'Why It Matters',
    [
      'Reduces manual coordination between buyers and sellers.',
      'Improves listing transparency and verification.',
      'Makes the platform easier to operate for admins.',
      'Shows a complete full-stack product architecture.',
    ],
    0.78,
    3.5,
    11.8,
    3.0
  );

  addFooterNumber(slide, 4);
}

// Slide 5 - Development activities
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Development Activities', 'How the project was built');

  const phases = [
    [
      '1',
      'UI planning',
      'Created the page structure, component layout, and responsive home sections.',
    ],
    [
      '2',
      'Auth flow',
      'Implemented register, login, forgot password, reset password, and session restoration.',
    ],
    [
      '3',
      'Property modules',
      'Built listing pages, property details, search filters, and seller posting flow.',
    ],
    [
      '4',
      'Role dashboards',
      'Added user, seller, and admin dashboards with route-based access control.',
    ],
    [
      '5',
      'Integrations',
      'Connected Cloudinary, Razorpay, Leaflet, and the ML price match service.',
    ],
    [
      '6',
      'Testing and polishing',
      'Reviewed validation, error handling, and deployment readiness across modules.',
    ],
  ];

  phases.forEach((phase, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    addStepBox(
      slide,
      phase[0],
      phase[1],
      phase[2],
      col === 0 ? 0.82 : 6.88,
      1.22 + row * 1.56,
      5.62,
      1.25,
      col === 0 ? COLORS.teal : COLORS.blue
    );
  });

  addPill(
    slide,
    'Iterative full-stack delivery',
    9.75,
    6.25,
    2.15,
    COLORS.green
  );
  addFooterNumber(slide, 5);
}

// Slide 6 - Project profile
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Project Profile',
    'Problem statement, objectives, and workflow'
  );

  addCard(slide, {
    x: 0.78,
    y: 1.28,
    w: 4.0,
    h: 2.3,
    title: 'Problem Statement',
    body: 'Real estate search is often fragmented, with inconsistent listing quality, delayed responses, and weak control over verified content. Buyers need a cleaner way to discover properties, while sellers and admins need structured workflows to manage listings and inquiries.',
    icon: 'warning',
    accent: COLORS.gold,
    titleSize: 15,
    bodySize: 12.1,
  });

  addCard(slide, {
    x: 4.94,
    y: 1.28,
    w: 3.66,
    h: 2.3,
    title: 'Objectives',
    body: '- Easy browsing and filtering\n- Verified listing management\n- Inquiry and review support\n- Saved alerts and role dashboards',
    icon: 'checklist',
    accent: COLORS.teal,
    titleSize: 15,
    bodySize: 11.8,
  });

  addCard(slide, {
    x: 8.86,
    y: 1.28,
    w: 3.66,
    h: 2.3,
    title: 'System Scope',
    body: '- Web app for users, sellers, and admins\n- Frontend, backend, and ML integration\n- Local and cloud deployment ready',
    icon: 'workflow',
    accent: COLORS.blue,
    titleSize: 15,
    bodySize: 11.8,
  });

  const workflow = [
    ['1', 'Register / Login', 'Secure access through JWT-based auth.'],
    ['2', 'Browse / Search', 'Filter by city, price, type, and listing mode.'],
    ['3', 'Open Property', 'View images, map, amenities, and details.'],
    ['4', 'Send Inquiry', 'Create a request for the selected property.'],
    [
      '5',
      'Seller Reviews',
      'Seller or admin handles the inquiry and listing updates.',
    ],
    ['6', 'Track Result', 'Users track status from dashboard and alerts.'],
  ];

  workflow.forEach((step, index) => {
    const x = 0.82 + (index % 3) * 4.18;
    const y = 3.92 + Math.floor(index / 3) * 1.26;
    addStepBox(
      slide,
      step[0],
      step[1],
      step[2],
      x,
      y,
      3.95,
      1.08,
      index % 2 === 0 ? COLORS.teal : COLORS.blue
    );
  });

  addFooterNumber(slide, 6);
}

// Slide 7 - Tech stack
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Tools and Technologies Used',
    'Complete stack for Urban Stay'
  );

  addCard(slide, {
    x: 0.82,
    y: 1.3,
    w: 3.92,
    h: 5.3,
    title: 'Frontend',
    body: '- React 18\n- Vite\n- React Router v7\n- Tailwind CSS\n- Framer Motion\n- Axios\n- Zod validation',
    icon: 'home',
    accent: COLORS.blue,
    titleSize: 16,
    bodySize: 12.1,
  });
  addCard(slide, {
    x: 4.7,
    y: 1.3,
    w: 3.92,
    h: 5.3,
    title: 'Backend and Data',
    body: '- Node.js and Express 5\n- MongoDB Atlas and Mongoose\n- JWT and bcryptjs\n- Nodemailer\n- Multer and Cloudinary\n- Razorpay integration',
    icon: 'building',
    accent: COLORS.teal,
    titleSize: 16,
    bodySize: 12.1,
  });
  addCard(slide, {
    x: 8.58,
    y: 1.3,
    w: 3.92,
    h: 5.3,
    title: 'Maps and Utilities',
    body: '- Leaflet and React Leaflet\n- AI price match service\n- API proxy route for ML service\n- Area converter\n- EMI calculator\n- Cookie consent banner',
    icon: 'chart',
    accent: COLORS.green,
    titleSize: 16,
    bodySize: 12.1,
  });

  addFooterNumber(slide, 7);
}

// Slide 8 - Features
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Application Features',
    'Core functions available in the platform'
  );

  const features = [
    [
      'User Authentication',
      'Secure login, registration, forgot/reset password, and session restoration.',
      'lock',
      COLORS.blue,
    ],
    [
      'Property Listings',
      'Browse featured and general listings with images, location, and specifications.',
      'building',
      COLORS.teal,
    ],
    [
      'Search and Filters',
      'Sort and filter by price, city, type, and listing category.',
      'search',
      COLORS.blue,
    ],
    [
      'Inquiry System',
      'Send requests to property owners and track inquiry status.',
      'message',
      COLORS.teal,
    ],
    [
      'Reviews and Ratings',
      'Property feedback through star ratings and comments.',
      'checklist',
      COLORS.green,
    ],
    [
      'Saved Alerts',
      'Save search conditions for future matching properties.',
      'shield',
      COLORS.gold,
    ],
  ];

  features.forEach((feature, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    addCard(slide, {
      x: col === 0 ? 0.8 : 6.92,
      y: 1.28 + row * 1.62,
      w: 5.6,
      h: 1.36,
      title: feature[0],
      body: feature[1],
      icon: feature[2],
      accent: feature[3],
      titleSize: 14.5,
      bodySize: 11.7,
    });
  });

  addFooterNumber(slide, 8);
}

// Slide 9 - Authentication deep dive
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Feature Deep-Dive: User Authentication',
    'JWT-based role access control'
  );

  addCard(slide, {
    x: 0.8,
    y: 1.28,
    w: 5.05,
    h: 5.35,
    title: 'How It Works',
    body: '1. User registers or logs in from the frontend.\n2. Backend validates credentials and creates a JWT token.\n3. Token and user data are stored in local storage for session persistence.\n4. Protected routes redirect users according to their role.\n5. Dashboard selection is based on user, seller, or admin access.',
    icon: 'lock',
    accent: COLORS.blue,
    titleSize: 16,
    bodySize: 12.2,
  });

  addCard(slide, {
    x: 6.05,
    y: 1.28,
    w: 6.48,
    h: 5.35,
    title: 'Role Capabilities',
    body:
      'User - Browse properties, save alerts, send inquiries, and leave reviews.\n\n' +
      'Seller - Post and edit properties, respond to inquiries, and manage own listings.\n\n' +
      'Admin - Verify listings, feature properties, view stats, and manage platform quality.',
    icon: 'shield',
    accent: COLORS.teal,
    titleSize: 16,
    bodySize: 12.15,
  });

  addPill(slide, 'Routes guarded in App.jsx', 9.95, 6.05, 2.15, COLORS.gold);
  addFooterNumber(slide, 9);
}

// Slide 10 - Property workflow
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Property Listing Workflow',
    'End-to-end property posting and inquiry flow'
  );

  const steps = [
    ['1', 'Seller signs in', 'Seller or admin opens the post-property flow.'],
    [
      '2',
      'Add details',
      'Title, price, type, location, amenities, and media are entered.',
    ],
    [
      '3',
      'Upload images',
      'Images are processed through Cloudinary and stored securely.',
    ],
    ['4', 'Publish or verify', 'Admin can verify and feature the property.'],
    [
      '5',
      'User searches',
      'Buyer filters listings and opens the property page.',
    ],
    ['6', 'Send inquiry', 'User submits a request to the seller or admin.'],
    ['7', 'Track progress', 'Status updates appear in dashboards and alerts.'],
  ];

  steps.forEach((step, index) => {
    const x = 0.8 + (index % 2) * 6.1;
    const y = 1.3 + Math.floor(index / 2) * 1.18;
    addStepBox(
      slide,
      step[0],
      step[1],
      step[2],
      x,
      y,
      5.75,
      0.98,
      index % 2 === 0 ? COLORS.teal : COLORS.blue
    );
  });

  addFooterNumber(slide, 10);
}

// Slide 11 - Smart search and AI
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Feature Deep-Dive: Search Intelligence and AI Price Match',
    'Smart discovery and backend-proxied ML support'
  );

  addCard(slide, {
    x: 0.82,
    y: 1.26,
    w: 5.15,
    h: 5.4,
    title: 'Discovery Layer',
    body: '- Search by city, property type, and listing type\n- Filter by price, area, bedrooms, and bathrooms\n- Featured projects surface important listings first\n- Saved alerts help users revisit matching properties\n- Property cards and details show images, map, and amenities',
    icon: 'search',
    accent: COLORS.blue,
    titleSize: 16,
    bodySize: 12,
  });

  addCard(slide, {
    x: 6.22,
    y: 1.26,
    w: 5.95,
    h: 2.12,
    title: 'AI Price Match',
    body: 'The AI price match section helps compare a listing with nearby market signals. The browser does not call the Flask service directly; requests are proxied through the backend using the ML service URL, which avoids browser CORS and mixed-content issues.',
    icon: 'chart',
    accent: COLORS.green,
    titleSize: 15,
    bodySize: 11.8,
  });

  addCard(slide, {
    x: 6.22,
    y: 3.58,
    w: 5.95,
    h: 3.08,
    title: 'User Outcome',
    body: '- Faster property comparison\n- Cleaner search experience\n- More relevant featured suggestions\n- Better price understanding before inquiry',
    icon: 'workflow',
    accent: COLORS.teal,
    titleSize: 15,
    bodySize: 12,
  });

  addFooterNumber(slide, 11);
}

// Slide 12 - UI Screens
{
  const slide = pptx.addSlide();
  addHeader(slide, 'User Interface Screens', 'Key pages and dashboard views');

  const screens = [
    [
      'Home',
      'Hero, featured projects, tools, and testimonials.',
      'home',
      COLORS.blue,
    ],
    [
      'Login and Register',
      'Authentication and password recovery pages.',
      'lock',
      COLORS.teal,
    ],
    [
      'Search Results',
      'Property grid with filters and query controls.',
      'search',
      COLORS.blue,
    ],
    [
      'Property Details',
      'Gallery, map, amenities, and inquiry controls.',
      'building',
      COLORS.teal,
    ],
    [
      'User Dashboard',
      'Saved alerts, inquiries, and profile actions.',
      'checklist',
      COLORS.green,
    ],
    [
      'Seller Dashboard',
      'Post, edit, and manage property listings.',
      'workflow',
      COLORS.blue,
    ],
    [
      'Admin Dashboard',
      'Verify listings, feature properties, and view stats.',
      'shield',
      COLORS.teal,
    ],
    [
      'Tools Pages',
      'EMI calculator, area converter, and home interior pages.',
      'chart',
      COLORS.gold,
    ],
  ];

  screens.forEach((screen, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    addCard(slide, {
      x: 0.82 + col * 3.13,
      y: 1.3 + row * 2.25,
      w: 2.72,
      h: 1.92,
      title: screen[0],
      body: screen[1],
      icon: screen[2],
      accent: screen[3],
      titleSize: 13.3,
      bodySize: 10.4,
    });
  });

  addFooterNumber(slide, 12);
}

// Slide 13 - Architecture
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'System Architecture',
    'Layered design for scalability and maintainability'
  );

  const layers = [
    {
      title: 'Layer 1 - User Interface',
      body: 'React pages and components: home, search, property details, dashboards, and utility pages.',
      icon: 'home',
      accent: COLORS.blue,
    },
    {
      title: 'Layer 2 - State and Services',
      body: 'Auth context, API service wrappers, route protection, form validation, and UI state handling.',
      icon: 'workflow',
      accent: COLORS.teal,
    },
    {
      title: 'Layer 3 - API and Business Logic',
      body: 'Express routes and controllers for auth, properties, inquiries, reviews, alerts, projects, payments, and ML.',
      icon: 'building',
      accent: COLORS.green,
    },
    {
      title: 'Layer 4 - Data and Integrations',
      body: 'MongoDB collections, Cloudinary uploads, Nodemailer, Razorpay, Leaflet, and the ML service.',
      icon: 'shield',
      accent: COLORS.gold,
    },
  ];

  layers.forEach((layer, index) => {
    addCard(slide, {
      x: 0.95,
      y: 1.24 + index * 1.2,
      w: 11.35,
      h: 1.0,
      title: layer.title,
      body: layer.body,
      icon: layer.icon,
      accent: layer.accent,
      titleSize: 14.3,
      bodySize: 11.2,
    });
  });

  addPill(
    slide,
    'UI -> Services -> API -> Database / External APIs',
    8.05,
    6.45,
    4.1,
    COLORS.navy
  );
  addFooterNumber(slide, 13);
}

// Slide 14 - Completed modules
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Work Completed and System Status',
    'Core modules already integrated'
  );

  addCard(slide, {
    x: 0.82,
    y: 1.25,
    w: 5.25,
    h: 5.42,
    title: 'Implemented Modules',
    body: '- Authentication and protected routes\n- Property listing CRUD and image upload\n- Search, filter, and featured listings\n- Inquiries and property reviews\n- Saved alerts and dashboard views\n- Payments, maps, and AI price match\n- Admin verification and feature controls',
    icon: 'checklist',
    accent: COLORS.green,
    titleSize: 16,
    bodySize: 12,
  });

  addCard(slide, {
    x: 6.35,
    y: 1.25,
    w: 5.95,
    h: 2.25,
    title: 'Status Summary',
    body: 'The platform is functionally complete for core workflows and ready for presentation, review, and iterative refinement.',
    icon: 'trophy',
    accent: COLORS.blue,
    titleSize: 16,
    bodySize: 12,
  });

  addCard(slide, {
    x: 6.35,
    y: 3.78,
    w: 5.95,
    h: 2.89,
    title: 'Evidence of Completion',
    body: '- Clean route structure in App.jsx\n- Controllers and models for each resource\n- Upload and API integration configured\n- Frontend pages wired to the backend services',
    icon: 'workflow',
    accent: COLORS.teal,
    titleSize: 15,
    bodySize: 12,
  });

  addFooterNumber(slide, 14);
}

// Slide 15 - Challenges
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Challenges and Solutions',
    'Technical issues encountered during development'
  );

  const challenges = [
    [
      'Route protection and role logic',
      'Solved by creating a dedicated protected-route wrapper and role checks in App.jsx.',
      'warning',
      COLORS.gold,
    ],
    [
      'Search filter reliability',
      'Solved by synchronizing query parameters with the active filter object.',
      'search',
      COLORS.blue,
    ],
    [
      'Token and session consistency',
      'Solved by using local storage and a shared auth context across tabs.',
      'lock',
      COLORS.teal,
    ],
    [
      'Image upload handling',
      'Solved by using multer and Cloudinary for structured image processing.',
      'building',
      COLORS.green,
    ],
    [
      'ML service connectivity',
      'Solved by proxying requests through the backend instead of calling localhost directly.',
      'chart',
      COLORS.blue,
    ],
  ];

  challenges.forEach((item, index) => {
    addCard(slide, {
      x: 0.82,
      y: 1.2 + index * 1.06,
      w: 11.75,
      h: 0.92,
      title: item[0],
      body: item[1],
      icon: item[2],
      accent: item[3],
      titleSize: 13.2,
      bodySize: 10.8,
    });
  });

  addFooterNumber(slide, 15);
}

// Slide 16 - Learnings
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Key Learnings and Skills Acquired',
    'What the project reinforced technically'
  );

  addCard(slide, {
    x: 0.82,
    y: 1.3,
    w: 5.7,
    h: 2.0,
    title: 'Frontend Architecture',
    body: 'Component reuse, route composition, responsive sections, and clean page-level state handling in React.',
    icon: 'home',
    accent: COLORS.blue,
    titleSize: 15,
    bodySize: 12,
  });
  addCard(slide, {
    x: 6.8,
    y: 1.3,
    w: 5.7,
    h: 2.0,
    title: 'Backend and API Design',
    body: 'Express controllers, middleware, route organization, and validation patterns for a modular service layer.',
    icon: 'building',
    accent: COLORS.teal,
    titleSize: 15,
    bodySize: 12,
  });
  addCard(slide, {
    x: 0.82,
    y: 3.52,
    w: 5.7,
    h: 2.0,
    title: 'Database and Authentication',
    body: 'MongoDB modeling, JWT sessions, role-based access control, and secure password flow management.',
    icon: 'lock',
    accent: COLORS.green,
    titleSize: 15,
    bodySize: 12,
  });
  addCard(slide, {
    x: 6.8,
    y: 3.52,
    w: 5.7,
    h: 2.0,
    title: 'Integration and Debugging',
    body: 'Working with maps, uploads, payments, emails, and ML services while tracing issues across the stack.',
    icon: 'workflow',
    accent: COLORS.gold,
    titleSize: 15,
    bodySize: 12,
  });

  addFooterNumber(slide, 16);
}

// Slide 17 - RBAC matrix
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Role-Based Access Control Summary',
    'What each role can access in Urban Stay'
  );

  addMatrixTable(slide, 0.82, 1.34, 11.65, 4.95, [
    {
      feature: 'Browse and search properties',
      user: 'Yes',
      seller: 'Yes',
      admin: 'Yes',
    },
    { feature: 'Send inquiry', user: 'Yes', seller: 'Yes', admin: 'Yes' },
    {
      feature: 'Post or edit property',
      user: 'No',
      seller: 'Yes',
      admin: 'Yes',
    },
    {
      feature: 'Verify and feature property',
      user: 'No',
      seller: 'No',
      admin: 'Yes',
    },
    { feature: 'Access dashboards', user: 'Yes', seller: 'Yes', admin: 'Yes' },
    {
      feature: 'Manage alerts and reviews',
      user: 'Yes',
      seller: 'Yes',
      admin: 'Yes',
    },
  ]);

  addFooterNumber(slide, 17);
}

// Slide 18 - Conclusion
{
  const slide = pptx.addSlide();
  addHeader(slide, 'Conclusion', 'Summary of outcomes and future scope');

  addCard(slide, {
    x: 0.82,
    y: 1.28,
    w: 5.65,
    h: 4.95,
    title: 'Project Achievements',
    body: '- Built a full-stack real estate platform\n- Implemented multi-role workflows\n- Connected search, inquiry, review, and alert flows\n- Added AI price match and utility pages\n- Structured the system for future scaling',
    icon: 'trophy',
    accent: COLORS.green,
    titleSize: 16,
    bodySize: 12.2,
  });

  addCard(slide, {
    x: 6.76,
    y: 1.28,
    w: 5.75,
    h: 4.95,
    title: 'Future Scope',
    body: '- Stronger analytics and reporting\n- More personalized property recommendations\n- Additional notification channels\n- Further deployment hardening and monitoring',
    icon: 'chart',
    accent: COLORS.blue,
    titleSize: 16,
    bodySize: 12.2,
  });

  addFooterNumber(slide, 18);
}

// Slide 19 - Delivery
{
  const slide = pptx.addSlide();
  addHeader(
    slide,
    'Project Delivery and Handover',
    'What is included in the final submission'
  );

  addCard(slide, {
    x: 0.82,
    y: 1.32,
    w: 5.7,
    h: 4.96,
    title: 'Final Deliverables',
    body: '- Frontend React application\n- Express and MongoDB backend\n- ML service integration plan\n- Database models and routes\n- Documentation and presentation deck\n- Sample data and deployment notes',
    icon: 'checklist',
    accent: COLORS.teal,
    titleSize: 16,
    bodySize: 12.2,
  });

  addCard(slide, {
    x: 6.84,
    y: 1.32,
    w: 5.67,
    h: 4.96,
    title: 'Demo Readiness',
    body: 'The project can be demonstrated across all main flows: login, browse, search, property details, inquiry, seller actions, admin verification, and dashboard tracking.',
    icon: 'workflow',
    accent: COLORS.gold,
    titleSize: 16,
    bodySize: 12.2,
  });

  addFooterNumber(slide, 19);
}

// Slide 20 - Thank you
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: COLORS.navy },
    line: { color: COLORS.navy },
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.0,
    w: 11.75,
    h: 5.35,
    rectRadius: 0.08,
    fill: { color: '12304B', transparency: 8 },
    line: { color: '2A70A5', pt: 1.2 },
  });

  slide.addText('THANK YOU', {
    x: 1.2,
    y: 1.8,
    w: 11.0,
    h: 0.6,
    color: '9FD5FF',
    bold: true,
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 40,
  });

  slide.addText('Urban Stay - Real Estate Platform', {
    x: 1.2,
    y: 2.55,
    w: 11.0,
    h: 0.35,
    color: COLORS.white,
    bold: true,
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 22,
  });

  slide.addText('Project presentation', {
    x: 1.2,
    y: 3.03,
    w: 11.0,
    h: 0.28,
    color: 'D8E6F3',
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 13,
  });

  const tags = [
    ['React', 'home'],
    ['Node.js', 'building'],
    ['MongoDB', 'workflow'],
    ['JWT', 'lock'],
    ['Cloudinary', 'chart'],
  ];

  tags.forEach((tag, index) => {
    const x = 1.45 + index * 2.25;
    addImageIcon(slide, tag[1], x, 4.0, 0.6, 'EAF4FF', '1F4E79');
    slide.addText(tag[0], {
      x: x - 0.18,
      y: 4.68,
      w: 0.96,
      h: 0.2,
      color: 'DDEBFA',
      align: 'center',
      fontFace: 'Calibri',
      fontSize: 10,
      bold: true,
    });
  });

  slide.addText('Simple and ready for review', {
    x: 1.2,
    y: 5.55,
    w: 11.0,
    h: 0.2,
    color: 'AFCBE1',
    align: 'center',
    fontFace: 'Calibri',
    fontSize: 11,
  });
}

async function main() {
  await pptx.writeFile({ fileName: OUTPUT_FILE });
  console.log(`Presentation written to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
