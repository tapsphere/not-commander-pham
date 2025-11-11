import jsPDF from 'jspdf';

export const generateCreatorFlowPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  const addText = (text: string, fontSize: number, isBold: boolean = false, isBlue: boolean = false, isUnderline: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    if (isBlue) {
      doc.setTextColor(0, 102, 204); // Blue color
    } else {
      doc.setTextColor(0, 0, 0); // Black color
    }

    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.5;
    
    checkPageBreak(lines.length * lineHeight);
    
    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      if (isUnderline) {
        const textWidth = doc.getTextWidth(line);
        doc.line(margin, yPosition + 1, margin + textWidth, yPosition + 1);
      }
      yPosition += lineHeight;
    });
    
    doc.setTextColor(0, 0, 0); // Reset to black
  };

  const addSpacing = (space: number) => {
    yPosition += space;
  };

  // Title
  addText('CREATOR FLOW — Complete Journey (Updated)', 18, true, false, false);
  addSpacing(5);
  addText('Original → V3.1 Comparison', 12, false, false, false);
  addSpacing(10);

  // Legend
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, maxWidth, 15, 'F');
  yPosition += 5;
  addText('Black Text = Original   •   Blue Text = New or Changed', 10, false, false, false);
  yPosition += 5;
  addSpacing(10);

  // Section 1
  addText('1. ACCESS & DASHBOARD', 14, true, false, true);
  addSpacing(5);
  
  addText('1.1 Authentication', 12, true, false, false);
  addText('• Creators log in via email/password or OAuth', 11, false, false, false);
  addSpacing(5);

  addText('1.2 Creator Dashboard', 12, true, false, false);
  addText('The landing page after login. Shows:', 11, false, false, false);
  addText('• My Templates (list of published + draft games)', 11, false, false, false);
  addText('• Template statistics (plays, avg score, completions)', 11, false, false, false);
  addText('• Profile settings', 11, false, false, false);
  addSpacing(3);
  addText('NEW: Tabbed Interface', 11, false, true, false);
  addText('• My Games tab — Templates + stats', 11, false, true, false);
  addText('• Design Elements tab — Upload portal + Element Library', 11, false, true, false);
  addSpacing(10);

  // Section 2
  addText('2. TEMPLATE CREATION', 14, true, false, true);
  addSpacing(5);

  addText('2.1 AI-Generated Templates', 12, true, false, false);
  addText('Path: Dashboard → "Create New Template" → Choose "AI-Generated"', 11, false, false, false);
  addSpacing(3);
  addText('Step 1: PlayOps Framework Structure Guide', 11, true, true, false);
  addText('Before AI generation, creators see a guide outlining:', 11, false, true, false);
  addText('• REQUIRED 3-scene structure: Intro → Gameplay → Results', 11, false, true, false);
  addText('• Brand Customization Zones', 11, false, true, false);
  addSpacing(2);
  addText('What Brands Can EDIT:', 11, false, true, false);
  addText('  - Logo URL', 11, false, true, false);
  addText('  - Mascot/Avatar (URL parameter)', 11, false, true, false);
  addText('  - Particle effects (URL parameter)', 11, false, true, false);
  addText('  - Colors (via embedded config object)', 11, false, true, false);
  addSpacing(2);
  addText('What is LOCKED:', 11, false, true, false);
  addText('  - Scene structure', 11, false, true, false);
  addText('  - Core game mechanics', 11, false, true, false);
  addText('  - Scoring logic', 11, false, true, false);
  addSpacing(5);

  addText('Step 2: Core Info (Expanded)', 11, true, false, false);
  addText('• Template Name', 11, false, false, false);
  addText('• Description', 11, false, false, false);
  addText('• Industry & Context (expanded options)', 11, false, true, false);
  addSpacing(3);

  addText('Step 3: Competency Framework (Expanded)', 11, true, true, false);
  addText('• Primary Competency (required)', 11, false, false, false);
  addText('• Sub-Competencies: Now supports 1-4 sub-competencies (previously 1-3)', 11, false, true, false);
  addSpacing(3);

  addText('Step 4: Scenario & Scene Breakdown', 11, true, false, false);
  addText('• Brief description of scenario', 11, false, false, false);
  addText('• Intro scene description', 11, false, false, false);
  addText('• Gameplay scene description', 11, false, false, false);
  addText('• Results scene description', 11, false, false, false);
  addSpacing(3);

  addText('Step 5: Edge Case Handling', 11, true, false, false);
  addText('• Define what happens if user makes unexpected choices', 11, false, false, false);
  addSpacing(3);

  addText('Step 6: UI Aesthetic', 11, true, false, false);
  addText('• Visual style preferences', 11, false, false, false);
  addSpacing(3);

  addText('Step 7: Brand Customization Options', 11, true, false, false);
  addText('• Choose what brands can customize (logo, colors, etc.)', 11, false, false, false);
  addSpacing(3);

  addText('Step 8: Technical Requirements', 11, true, false, false);
  addText('• Platform compatibility', 11, false, false, false);
  addText('• Performance constraints', 11, false, false, false);
  addSpacing(5);

  checkPageBreak(40);
  addText('After form submission:', 11, true, false, false);
  addText('→ AI generates a complete game template (HTML/CSS/JS)', 11, false, false, false);
  addText('→ System embeds a config object for brand customization', 11, false, true, false);
  addText('→ System adds URL parameter support for ?avatar=URL&particles=TYPE', 11, false, true, false);
  addText('→ Creator can preview the generated game immediately', 11, false, false, false);
  addSpacing(10);

  // Section 2.2
  addText('2.2 Custom Upload Templates', 12, true, false, false);
  addText('Path: Dashboard → "Create New Template" → Choose "Custom Upload"', 11, false, false, false);
  addSpacing(3);

  addText('Requirements:', 11, true, false, false);
  addText('• Must follow PlayOps Framework structure (3 scenes)', 11, false, true, false);
  addText('• Must include embedded config object for brand customization', 11, false, true, false);
  addText('• Must support URL parameters: ?avatar=URL&particles=TYPE', 11, false, true, false);
  addText('• Must emit proof object on game completion', 11, false, false, false);
  addSpacing(3);

  addText('Updated Form Flow:', 11, true, true, false);
  addText('1. Template Name & Description', 11, false, false, false);
  addText('2. Industry & Context (expanded)', 11, false, true, false);
  addText('3. Competency Framework (1-4 sub-competencies)', 11, false, true, false);
  addText('4. Scoring Formula', 11, false, false, false);
  addText('5. Brand Customization Options', 11, false, false, false);
  addText('6. File Uploads (moved to end)', 11, false, true, false);
  addText('   • Upload HTML file', 11, false, true, false);
  addText('   • Upload cover image', 11, false, true, false);
  addSpacing(10);

  // Section 3 - Design Element Upload
  checkPageBreak(60);
  addText('3. DESIGN ELEMENT UPLOAD (NEW FEATURE)', 14, true, true, true);
  addSpacing(5);

  addText('Path: Creator Dashboard → Design Elements tab → "Upload New Element"', 11, false, true, false);
  addSpacing(3);

  addText('3.1 Element Types Supported:', 12, true, true, false);
  addText('1. Mascot/Avatar (PNG, SVG, GIF)', 11, false, true, false);
  addText('2. Background (JPG, PNG, SVG)', 11, false, true, false);
  addText('3. UI Component (SVG, PNG)', 11, false, true, false);
  addText('4. Particle Effect (JSON, PNG sprite sheet)', 11, false, true, false);
  addText('5. Sound Effect (MP3, WAV, OGG)', 11, false, true, false);
  addText('6. Font File (TTF, WOFF, WOFF2)', 11, false, true, false);
  addText('7. Animation (NEW)', 11, false, true, false);
  addText('   • Sub-types: lottie, sprite_sheet, css, gif', 11, false, true, false);
  addSpacing(5);

  addText('3.2 Upload Process:', 12, true, true, false);
  addText('Step 1: Select element type', 11, false, true, false);
  addText('Step 2: Upload file(s)', 11, false, true, false);
  addText('Step 3: Add metadata:', 11, false, true, false);
  addText('   • Element name', 11, false, true, false);
  addText('   • Description', 11, false, true, false);
  addText('   • Tags (searchable)', 11, false, true, false);
  addText('   • License type (free, premium, custom)', 11, false, true, false);
  addText('Step 4: Preview & optimization check', 11, false, true, false);
  addText('   • File size validation', 11, false, true, false);
  addText('   • Format compatibility check', 11, false, true, false);
  addText('   • Telegram Mini-Game optimization tips', 11, false, true, false);
  addText('Step 5: Submit for review', 11, false, true, false);
  addSpacing(5);

  addText('3.3 Format & Size Requirements:', 12, true, true, false);
  addText('• Mascots/Avatars: Max 500KB, recommended 256×256 to 512×512px', 11, false, true, false);
  addText('• Backgrounds: Max 1MB, recommended 1920×1080px or smaller', 11, false, true, false);
  addText('• UI Components: Max 200KB, vector formats preferred', 11, false, true, false);
  addText('• Particle Effects: Max 300KB for JSON, 400KB for sprite sheets', 11, false, true, false);
  addText('• Sound Effects: Max 500KB, MP3 recommended', 11, false, true, false);
  addText('• Fonts: Max 200KB per weight', 11, false, true, false);
  addText('• Animations: Max 500KB', 11, false, true, false);
  addSpacing(5);

  addText('3.4 Telegram Mini-Game Optimization:', 12, true, true, false);
  addText('• Total asset bundle should stay under 5MB', 11, false, true, false);
  addText('• Use WebP for raster images when possible', 11, false, true, false);
  addText('• Compress audio to lower bitrates (64-128kbps)', 11, false, true, false);
  addText('• Prefer vector graphics for scalable elements', 11, false, true, false);
  addSpacing(5);

  addText('3.5 Review & Approval:', 12, true, true, false);
  addText('• Elements enter "Pending Review" status', 11, false, true, false);
  addText('• Platform reviews for:', 11, false, true, false);
  addText('   - Technical compliance', 11, false, true, false);
  addText('   - Quality standards', 11, false, true, false);
  addText('   - Appropriate content', 11, false, true, false);
  addText('• Once approved → visible in Element Library', 11, false, true, false);
  addText('• Creators and brands can browse/use in templates', 11, false, true, false);
  addSpacing(10);

  // Section 4 - Validator Testing
  checkPageBreak(80);
  addText('4. VALIDATOR TESTING (V3.1 — 8 AUTOMATED CHECKS)', 14, true, true, true);
  addSpacing(5);

  addText('Path: Creator Dashboard → Select Template → "Run Validator Test"', 11, false, false, false);
  addSpacing(3);

  addText('Overview:', 11, true, true, false);
  addText('V3.1 introduces 8 automated programmatic checks that validate templates', 11, false, true, false);
  addText('against the PlayOps Framework. Each check returns:', 11, false, true, false);
  addText('• PASSED — No issues detected', 11, false, true, false);
  addText('• NEEDS REVIEW — Minor issues or warnings', 11, false, true, false);
  addText('• FAILED — Critical issues that must be fixed', 11, false, true, false);
  addSpacing(5);

  addText('4.1 The 8 Automated Checks:', 12, true, true, false);
  addSpacing(3);

  addText('Check 1: Scene Structure Validation', 11, true, true, false);
  addText('Verifies:', 11, false, true, false);
  addText('• Presence of all 3 required scenes (Intro, Gameplay, Results)', 11, false, true, false);
  addText('• Correct scene identifiers in HTML/JS', 11, false, true, false);
  addText('• Proper scene transition logic', 11, false, true, false);
  addSpacing(3);

  addText('Check 2: UX/UI Integrity', 11, true, true, false);
  addText('Verifies:', 11, false, true, false);
  addText('• Responsive design across viewport sizes', 11, false, true, false);
  addText('• Touch targets meet minimum size (44×44px)', 11, false, true, false);
  addText('• Text readability (contrast ratios)', 11, false, true, false);
  addText('• Loading states and error handling', 11, false, true, false);
  addSpacing(3);

  addText('Check 3: Telegram Mini-App Compliance', 11, true, true, false);
  addText('Verifies:', 11, false, true, false);
  addText('• Total bundle size under 5MB', 11, false, true, false);
  addText('• No external CDN dependencies (all assets bundled)', 11, false, true, false);
  addText('• WebApp API integration if applicable', 11, false, true, false);
  addText('• Proper viewport meta tags', 11, false, true, false);
  addSpacing(3);

  addText('Check 4: Embedded Configuration Objects', 11, true, true, false);
  addText('Verifies:', 11, false, true, false);
  addText('• brandConfig object exists in JavaScript', 11, false, true, false);
  addText('• Contains required fields: logoUrl, primaryColor, secondaryColor', 11, false, true, false);
  addText('• Object is properly accessible and modifiable', 11, false, true, false);
  addSpacing(3);

  addText('Check 5: Action Cue & Mechanic Alignment', 11, true, true, false);
  addText('Verifies:', 11, false, true, false);
  addText('• Game actions map correctly to competency being tested', 11, false, true, false);
  addText('• Action cues are clear and contextually appropriate', 11, false, true, false);
  addText('• Mechanics align with learning objectives', 11, false, true, false);
  addSpacing(3);

  addText('Check 6: Scoring Formula Verification', 11, true, true, false);
  addText('Verifies:', 11, false, true, false);
  addText('• Scoring logic is mathematically sound', 11, false, true, false);
  addText('• Score calculation includes all sub-competencies', 11, false, true, false);
  addText('• Min/max score boundaries are enforced', 11, false, true, false);
  addText('• Proof object emits correctly on completion', 11, false, true, false);
  addSpacing(3);

  addText('Check 7: Accessibility & Mobile Readiness', 11, true, true, false);
  addText('Verifies:', 11, false, true, false);
  addText('• Keyboard navigation support', 11, false, true, false);
  addText('• ARIA labels for interactive elements', 11, false, true, false);
  addText('• Mobile gesture support (tap, swipe)', 11, false, true, false);
  addText('• Performance on mid-range mobile devices', 11, false, true, false);
  addSpacing(3);

  addText('Check 8: Proof Emission & Telemetry', 11, true, true, false);
  addText('Verifies:', 11, false, true, false);
  addText('• Proof object structure matches specification', 11, false, true, false);
  addText('• Timestamp and session ID included', 11, false, true, false);
  addText('• Sub-competency scores properly formatted', 11, false, true, false);
  addText('• Telemetry events fire at key moments (start, complete, error)', 11, false, true, false);
  addSpacing(10);

  checkPageBreak(40);
  addText('4.2 Result Classification:', 12, true, true, false);
  addSpacing(3);

  addText('PASSED:', 11, true, true, false);
  addText('• All 8 checks return green status', 11, false, true, false);
  addText('• Template is ready for publishing', 11, false, true, false);
  addSpacing(3);

  addText('NEEDS REVIEW:', 11, true, true, false);
  addText('• 1-2 checks return warnings', 11, false, true, false);
  addText('• Creator can choose to fix or proceed with explanation', 11, false, true, false);
  addSpacing(3);

  addText('FAILED:', 11, true, true, false);
  addText('• 3+ checks fail OR any critical check fails', 11, false, true, false);
  addText('• Template cannot be published until issues are resolved', 11, false, true, false);
  addSpacing(5);

  addText('Deprecated:', 11, true, true, false);
  addText('The old 3-phase manual testing (UX/UI Flow, Action Cue Validation,', 11, false, true, false);
  addText('Scoring Formula Test) has been replaced by these 8 automated checks.', 11, false, true, false);
  addSpacing(10);

  // Section 5
  addText('5. REVIEW & FIX', 14, true, false, true);
  addSpacing(5);
  addText('• If validator test finds issues → creator receives detailed report', 11, false, false, false);
  addText('• Report now includes specific check results (Check 1-8)', 11, false, true, false);
  addText('• Creator can edit template code or metadata', 11, false, false, false);
  addText('• Re-run validator test after fixes', 11, false, false, false);
  addSpacing(10);

  // Section 6
  addText('6. APPROVAL & PUBLISHING', 14, true, false, true);
  addSpacing(5);
  addText('6.1 Final Review', 12, true, false, false);
  addText('• Creator reviews all test results', 11, false, false, false);
  addText('• Confirms template metadata is accurate', 11, false, false, false);
  addSpacing(3);

  addText('6.2 Publish to Marketplace', 12, true, false, false);
  addText('• Click "Publish Template"', 11, false, false, false);
  addText('• System generates two game modes:', 11, false, false, false);
  addText('   - Training Mode (practice, no scoring)', 11, false, false, false);
  addText('   - Testing Mode (scored, proof emission)', 11, false, false, false);
  addText('• Template becomes discoverable in marketplace', 11, false, false, false);
  addText('• Brands can now customize and deploy', 11, false, false, false);
  addSpacing(10);

  // Section 7
  checkPageBreak(50);
  addText('7. KEY RULES', 14, true, false, true);
  addSpacing(5);

  addText('Publishing Requirements:', 11, true, false, false);
  addText('• Must pass all 8 automated validator checks', 11, false, true, false);
  addText('• Must include cover image', 11, false, false, false);
  addText('• Must define scoring formula', 11, false, false, false);
  addText('• Must follow PlayOps Framework structure', 11, false, true, false);
  addSpacing(5);

  addText('Design Elements:', 11, true, true, false);
  addText('• Must pass technical review before appearing in library', 11, false, true, false);
  addText('• Must meet size/format requirements', 11, false, true, false);
  addText('• Can be used across multiple templates', 11, false, true, false);
  addSpacing(5);

  addText('Custom HTML Games:', 11, true, true, false);
  addText('• Must support URL parameters: ?avatar=URL&particles=TYPE', 11, false, true, false);
  addText('• Must embed brandConfig object for color/logo customization', 11, false, true, false);
  addText('• Must follow 3-scene structure (Intro → Gameplay → Results)', 11, false, true, false);
  addSpacing(5);

  addText('Brand Customization:', 11, true, false, false);
  addText('• Templates define what brands can customize', 11, false, false, false);
  addText('• Locked elements (mechanics, scoring) cannot be changed by brands', 11, false, false, false);
  addText('• Editable elements include: logo, mascot/avatar, particles, colors', 11, false, true, false);

  // Save PDF
  doc.save('Creator_Flow_V3.1_Comparison.pdf');
};
