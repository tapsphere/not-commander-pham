import jsPDF from 'jspdf';

export const generateCreatorFlowV31PDF = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const addPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (requiredSpace: number = 10) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      addPage();
    }
  };

  const addText = (text: string, fontSize: number, isBold: boolean = false, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    const lineHeight = fontSize * 0.4;
    
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      doc.text(line, margin + indent, yPos);
      yPos += lineHeight;
    });
  };

  const addHeading = (text: string, level: number) => {
    yPos += 5;
    checkPageBreak(15);
    
    const fontSize = level === 1 ? 18 : level === 2 ? 14 : 12;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, yPos);
    yPos += fontSize * 0.5;
    
    if (level === 1 || level === 2) {
      doc.setDrawColor(0, 120, 212);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 3;
    }
  };

  const addBullet = (text: string, indent: number = 0) => {
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('•', margin + indent, yPos);
    
    const lines = doc.splitTextToSize(text, maxWidth - indent - 5);
    lines.forEach((line: string, index: number) => {
      if (index > 0) checkPageBreak(4);
      doc.text(line, margin + indent + 5, yPos);
      yPos += 4;
    });
  };

  // Cover Page
  doc.setFillColor(0, 120, 212);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('CREATOR FLOW', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Complete Journey', pageWidth / 2, 50, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Version 3.1', pageWidth / 2, 65, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos = 100;

  // Table of Contents
  addHeading('TABLE OF CONTENTS', 1);
  yPos += 5;
  
  const toc = [
    '1. Access & Dashboard',
    '2. Template Creation (Unified Flow)',
    '3. Design Element Upload',
    '4. Validator Testing (8 Automated Checks)',
    '5. Review & Fix',
    '6. Approval & Publishing',
    '7. Key Rules',
    'Template Creation Form Reference',
    'Summary of V3.1 Changes'
  ];
  
  toc.forEach(item => {
    addBullet(item);
  });

  // Main Content
  addPage();
  
  addHeading('1. ACCESS & DASHBOARD', 1);
  
  addHeading('1.1 Authentication', 2);
  addText('Creators log in via email/password or OAuth.', 10);
  addText('Role: "creator" assigned in database.', 10);
  addText('Redirected to Creator Dashboard.', 10);
  yPos += 5;

  addHeading('1.2 Creator Dashboard', 2);
  addText('The landing page after login shows:', 10, true);
  yPos += 3;
  
  addText('Tabbed Interface:', 10, true);
  addBullet('My Games tab — Templates + statistics', 3);
  addBullet('Design Elements tab — Upload portal + Element Library', 3);
  yPos += 3;

  addText('My Games Tab Features:', 10, true);
  addBullet('All created templates (published + draft)', 3);
  addBullet('Template statistics (plays, avg score, completions)', 3);
  addBullet('Times customized by brands', 3);
  addBullet('Player completion count', 3);
  addBullet('Test status for each template', 3);
  addBullet('Filter by Published vs. Draft templates', 3);
  yPos += 3;

  addText('Design Elements Tab Features:', 10, true);
  addBullet('Upload Portal for design assets', 3);
  addBullet('Element Library with status badges', 3);
  addBullet('Usage tracking and statistics', 3);
  addBullet('Filter by status: All, Published, Pending Review, Approved, Rejected', 3);
  yPos += 3;

  addText('Header Actions:', 10, true);
  addBullet('Access "Test Validators" dashboard', 3);
  addBullet('Edit Profile to set default design preferences', 3);

  addPage();
  addHeading('2. TEMPLATE CREATION (UNIFIED FLOW)', 1);
  addText('Path: Dashboard → "Create New Template"', 10, true);
  yPos += 3;
  
  addText('Important: AI-Generated and Custom Upload templates now use the SAME UNIFIED FORM. No separate type selection at the start.', 10);
  yPos += 5;

  addHeading('2.1 Template Form (All Creators Fill This)', 2);
  
  addHeading('Step 1: PlayOps Framework Structure Guide', 3);
  addText('Before creation, creators see a guide outlining:', 10);
  yPos += 3;
  
  addText('REQUIRED Scene Structure:', 10, true);
  addBullet('Scene 0: Loading Screen (2.5s) with brand/creator logo', 3);
  addBullet('Instructions Screen with mascot (if uploaded) - Scene 0 only', 3);
  addBullet('Scene 1-4: Gameplay (one per sub-competency, 1-4 scenes supported)', 3);
  addBullet('Results Screen', 3);
  yPos += 3;

  addText('What Brands Can EDIT:', 10, true);
  addBullet('Brand Logo (Scene 0 loading screen)', 3);
  addBullet('Mascot/Avatar (Scene 0 instructions only)', 3);
  addBullet('Particle effects (URL parameter)', 3);
  addBullet('Colors (primary, secondary, accent, background, text)', 3);
  addBullet('Font family', 3);
  yPos += 3;

  addText('What is LOCKED:', 10, true);
  addBullet('Scene structure (Scene 0 → Instructions → Gameplay → Results)', 3);
  addBullet('Core game mechanics', 3);
  addBullet('Scoring logic', 3);
  addBullet('Mascot placement (Scene 0 instructions only)', 3);
  yPos += 5;

  addHeading('Step 2: Template Name & Description', 3);
  addBullet('Template Name (required)');
  addBullet('Description (optional)');
  yPos += 3;

  addHeading('Step 3: Competency Framework', 3);
  addBullet('Primary Competency (required)');
  addBullet('Sub-Competencies: Select 1-4 (each maps to one gameplay scene)');
  addBullet('PlayOps structure guide displays once subs are selected');
  yPos += 3;

  addHeading('Step 4: Customize Your Scenario', 3);
  addBullet('Industry/Context: Marketing, Operations, Sales, Finance, etc.');
  addBullet('Your Role/Scenario: max 150 characters');
  addBullet('Key Element: What player works with, max 100 characters');
  addBullet('Edge Case Details: max 80 characters');
  addBullet('Visual Theme: Modern/Clean, Executive Dashboard, Casual/Friendly, etc.');
  addBullet('Interaction Method: Contextual to sub-competency');
  yPos += 3;

  addHeading('Step 5: Scene Descriptions', 3);
  addBullet('Scenario context');
  addBullet('Player actions');
  addBullet('Scene progression (1-4 scenes based on sub-competencies)');
  yPos += 3;

  addHeading('Step 6: Edge Case Configuration', 3);
  addBullet('Edge-case timing (Beginning, Early, Mid, Late)');
  addBullet('Edge-case moment description');
  yPos += 3;

  addHeading('Step 7: UI Aesthetic', 3);
  addBullet('Visual style description');
  yPos += 3;

  addHeading('Step 8: Design Customization (Optional)', 3);
  addBullet('Check "Customize colors & font for this game" to override defaults');
  addBullet('Per-game color palette, font, avatar, particles');
  yPos += 3;

  addHeading('Step 9: File Uploads', 3);
  addBullet('Cover Image (optional - generated if not provided)');
  addBullet('Custom Game HTML (optional - for customization after download)');
  yPos += 5;

  addText('After form submission:', 10, true);
  addBullet('Template saved (all creators fill the same form)', 3);
  addBullet('Validation Test Wizard opens automatically', 3);
  addBullet('Creator runs required tests', 3);

  addPage();
  addHeading('2.2 Post-Test Options (NEW FLOW)', 2);
  addText('After passing all validation tests, creators have 2 choices:', 10);
  yPos += 3;

  addText('Option 1: Publish Now', 10, true);
  addBullet('Template goes live in marketplace immediately', 3);
  addBullet('Brands can discover and customize', 3);
  yPos += 3;

  addText('Option 2: Download to Customize', 10, true);
  addBullet('Download generated game HTML/code', 3);
  addBullet('Download spec PDF with framework requirements (optional)', 3);
  addBullet('Make custom modifications offline', 3);
  addBullet('Re-upload customized version', 3);
  addBullet('MUST re-run validation tests on re-upload', 3);
  addBullet('Once tests pass again → can publish', 3);
  yPos += 3;

  addText('Important Note: Custom HTML uploads still possible via file upload field in form. These follow the same test → publish/download flow.', 10, true);

  addPage();
  addHeading('3. DESIGN ELEMENT UPLOAD (NEW FEATURE)', 1);
  addText('Path: Creator Dashboard → Design Elements tab → "Upload New Element"', 10, true);
  yPos += 5;

  addHeading('3.1 Element Types Supported', 2);
  const elements = [
    'Mascot/Avatar (PNG, SVG, GIF)',
    'Background (JPG, PNG, SVG)',
    'UI Component (SVG, PNG)',
    'Particle Effect (JSON, PNG sprite sheet)',
    'Sound Effect (MP3, WAV, OGG)',
    'Font File (TTF, WOFF, WOFF2)',
    'Animation (NEW) - Sub-types: lottie, sprite_sheet, css, gif'
  ];
  elements.forEach((el, i) => addBullet(`${i + 1}. ${el}`));
  yPos += 5;

  addHeading('3.2 Upload Process', 2);
  addText('Step 1: Select element type', 10, true);
  addText('Step 2: Upload file(s)', 10, true);
  addText('Step 3: Add metadata:', 10, true);
  addBullet('Element name', 3);
  addBullet('Description', 3);
  addBullet('Tags (searchable)', 3);
  addBullet('License type (free, premium, custom)', 3);
  yPos += 3;
  addText('Step 4: Preview & optimization check', 10, true);
  addBullet('File size validation', 3);
  addBullet('Format compatibility check', 3);
  addBullet('Telegram Mini-Game optimization tips', 3);
  yPos += 3;
  addText('Step 5: Submit for review', 10, true);
  yPos += 5;

  addHeading('3.3 Format & Size Requirements', 2);
  addBullet('Mascots/Avatars: Max 500KB, recommended 256×256 to 512×512px');
  addBullet('Backgrounds: Max 1MB, recommended 1920×1080px or smaller');
  addBullet('UI Components: Max 200KB, vector formats preferred');
  addBullet('Particle Effects: Max 300KB for JSON, 400KB for sprite sheets');
  addBullet('Sound Effects: Max 500KB, MP3 recommended');
  addBullet('Fonts: Max 200KB per weight');
  addBullet('Animations: Max 500KB');
  yPos += 5;

  addHeading('3.4 Telegram Mini-Game Optimization', 2);
  addBullet('Total asset bundle should stay under 5MB');
  addBullet('Use WebP for raster images when possible');
  addBullet('Compress audio to lower bitrates (64-128kbps)');
  addBullet('Prefer vector graphics for scalable elements');

  addPage();
  addHeading('4. VALIDATOR TESTING (V3.1 — 8 AUTOMATED CHECKS)', 1);
  addText('Path: Creator Dashboard → Select Template → "Run Validator Test"', 10, true);
  yPos += 5;

  addHeading('Overview', 2);
  addText('V3.1 introduces 8 automated programmatic checks that validate templates against the PlayOps Framework. Each check returns:', 10);
  yPos += 3;
  addBullet('PASSED — No issues detected');
  addBullet('NEEDS REVIEW — Minor issues or warnings');
  addBullet('FAILED — Critical issues that must be fixed');
  yPos += 5;

  addHeading('4.1 The 8 Automated Checks', 2);
  
  const checks = [
    {
      name: 'Check 1: Scene Structure Validation',
      points: [
        'Presence of all 3 required scenes (Intro, Gameplay, Results)',
        'Correct scene identifiers in HTML/JS',
        'Proper scene transition logic'
      ]
    },
    {
      name: 'Check 2: UX/UI Integrity',
      points: [
        'Responsive design across viewport sizes',
        'Touch targets meet minimum size (44×44px)',
        'Text readability (contrast ratios)',
        'Loading states and error handling'
      ]
    },
    {
      name: 'Check 3: Telegram Mini-App Compliance',
      points: [
        'Total bundle size under 5MB',
        'No external CDN dependencies (all assets bundled)',
        'WebApp API integration if applicable',
        'Proper viewport meta tags'
      ]
    },
    {
      name: 'Check 4: Embedded Configuration Objects',
      points: [
        'brandConfig object exists in JavaScript',
        'Contains required fields: logoUrl, primaryColor, secondaryColor',
        'Object is properly accessible and modifiable'
      ]
    },
    {
      name: 'Check 5: Action Cue & Mechanic Alignment',
      points: [
        'Game actions map correctly to competency being tested',
        'Action cues are clear and contextually appropriate',
        'Mechanics align with learning objectives'
      ]
    },
    {
      name: 'Check 6: Scoring Formula Verification',
      points: [
        'Scoring logic is mathematically sound',
        'Score calculation includes all sub-competencies',
        'Min/max score boundaries are enforced',
        'Proof object emits correctly on completion'
      ]
    },
    {
      name: 'Check 7: Accessibility & Mobile Readiness',
      points: [
        'Keyboard navigation support',
        'ARIA labels for interactive elements',
        'Mobile gesture support (tap, swipe)',
        'Performance on mid-range mobile devices'
      ]
    },
    {
      name: 'Check 8: Proof Emission & Telemetry',
      points: [
        'Proof object structure matches specification',
        'Timestamp and session ID included',
        'Sub-competency scores properly formatted',
        'Telemetry events fire at key moments (start, complete, error)'
      ]
    }
  ];

  checks.forEach(check => {
    checkPageBreak(20);
    addHeading(check.name, 3);
    addText('Verifies:', 10, true);
    check.points.forEach(point => addBullet(point, 3));
    yPos += 3;
  });

  addPage();
  addHeading('4.2 Result Classification', 2);
  
  addText('PASSED:', 10, true);
  addBullet('All 8 checks return green status', 3);
  addBullet('Template is ready for publishing', 3);
  yPos += 3;

  addText('NEEDS REVIEW:', 10, true);
  addBullet('1-2 checks return warnings', 3);
  addBullet('Creator can choose to fix or proceed with explanation', 3);
  yPos += 3;

  addText('FAILED:', 10, true);
  addBullet('3+ checks fail OR any critical check fails', 3);
  addBullet('Template cannot be published until issues are resolved', 3);
  yPos += 5;

  addText('Note: The old 3-phase manual testing (UX/UI Flow, Action Cue Validation, Scoring Formula Test) has been replaced by these 8 automated checks.', 10, true);

  addPage();
  addHeading('5. REVIEW & FIX', 1);
  
  addHeading('Test Results Dashboard', 2);
  addBullet('View overall status per template');
  addBullet('Access detailed check results (Check 1-8)');
  addBullet('Review notes and test history');
  yPos += 3;

  addText('If Passed:', 10, true);
  addBullet('"Approve for Publish" unlocks', 3);
  yPos += 3;

  addText('If Failed:', 10, true);
  addBullet('Fix issues and click "Re-test"', 3);
  yPos += 3;

  addText('If Needs Review:', 10, true);
  addBullet('Address warnings and re-test', 3);

  addPage();
  addHeading('6. APPROVAL & PUBLISHING', 1);
  
  addHeading('6.1 Final Review', 2);
  addBullet('Creator reviews all test results');
  addBullet('Confirms template metadata is accurate');
  yPos += 5;

  addHeading('6.2 Publish to Marketplace', 2);
  addBullet('Click "Publish Template"');
  addBullet('System generates two game modes:');
  addBullet('Training Mode (practice, no scoring)', 5);
  addBullet('Testing Mode (scored, proof emission)', 5);
  addBullet('Template becomes discoverable in marketplace');
  addBullet('Brands can now customize and deploy');

  addPage();
  addHeading('7. KEY RULES', 1);
  
  addHeading('Publishing Requirements', 2);
  addBullet('Must pass all 8 automated validator checks');
  addBullet('Must include cover image');
  addBullet('Must define scoring formula');
  addBullet('Must follow PlayOps Framework structure');
  yPos += 5;

  addHeading('Design Elements', 2);
  addBullet('Must pass technical review before appearing in library');
  addBullet('Must meet size/format requirements');
  addBullet('Can be used across multiple templates');
  yPos += 5;

  addHeading('Custom HTML Games', 2);
  addBullet('Must support URL parameters: ?avatar=URL&particles=TYPE');
  addBullet('Must embed brandConfig object for color/logo customization');
  addBullet('Must follow 3-scene structure (Intro → Gameplay → Results)');
  yPos += 5;

  addHeading('Brand Customization', 2);
  addBullet('Templates define what brands can customize');
  addBullet('Locked elements (mechanics, scoring) cannot be changed by brands');
  addBullet('Editable elements include: logo, mascot/avatar, particles, colors');

  addPage();
  addHeading('SUMMARY OF V3.1 CHANGES', 1);
  yPos += 3;

  const changes = [
    {
      title: '1. Unified Template Form',
      desc: 'Single form for both AI-Generated and Custom Upload templates with streamlined creator experience and consistent validation workflow.'
    },
    {
      title: '2. Scene 0 Enhancements',
      desc: 'Loading Screen (2.5s) with brand/creator logo, separate Instructions Screen with mascot, mascot placement restricted to Scene 0 instructions only.'
    },
    {
      title: '3. 8 Automated Validation Checks',
      desc: 'Replaces old 3-phase manual testing with programmatic validation against PlayOps Framework and clear pass/fail criteria for each check.'
    },
    {
      title: '4. Post-Test Download/Customize Flow',
      desc: 'Download game code after passing tests, download spec PDF with requirements, re-upload customized version, must re-test before publishing.'
    },
    {
      title: '5. Design Element Upload System',
      desc: 'New tab on Creator Dashboard, 7 element types supported (including Animation), Telegram Mini-Game optimization requirements, review and approval workflow.'
    },
    {
      title: '6. Enhanced Brand Customization',
      desc: 'URL parameter system for all customizable elements, embedded brandConfig object requirement, clear documentation of editable vs. locked zones, mascot/avatar support with placement guidelines.'
    }
  ];

  changes.forEach(change => {
    checkPageBreak(15);
    addText(change.title, 11, true);
    yPos += 2;
    addText(change.desc, 10);
    yPos += 5;
  });

  // Footer on all pages
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Creator Flow V3.1 - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save('Creator_Flow_V3.1.pdf');
};
