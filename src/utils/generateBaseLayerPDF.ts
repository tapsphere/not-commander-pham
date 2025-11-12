import jsPDF from 'jspdf';

export const generateBaseLayerPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const addNewPageIfNeeded = (requiredSpace: number = 10) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const addText = (text: string, size: number = 10, style: 'normal' | 'bold' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      addNewPageIfNeeded(size * 0.5);
      doc.text(line, margin, yPos);
      yPos += size * 0.5;
    });
  };

  // Title
  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('BASE LAYER 1 = BAKED & LOCKED', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('v3.1 - Global Game Architecture', pageWidth / 2, 30, { align: 'center' });
  
  yPos = 55;
  doc.setTextColor(0, 0, 0);

  // Introduction
  addText('GLOBAL GAME ARCHITECTURE (Production-Ready Blueprint)', 16, 'bold');
  yPos += 5;
  addText('This document defines the non-negotiable structure for all validator mini-games. These requirements are LOCKED and must be followed exactly to ensure compliance with scoring, accessibility, mobile optimization, and brand customization standards.', 10);
  yPos += 8;

  // Scene Structure
  addText('SCENE STRUCTURE (NON-NEGOTIABLE)', 14, 'bold');
  yPos += 5;

  addText('Scene 0: Intro Screen', 12, 'bold');
  yPos += 3;
  addText('Purpose: Set context and prepare player', 10);
  addText('Required elements:', 10, 'bold');
  const scene0Elements = [
    '• Competency name (large, prominent heading)',
    '• Sub-competency being measured (smaller subheading)',
    '• Brief description (2-3 sentences max)',
    '• Game instructions (bullet points preferred)',
    '• "Start Game" button (minimum 48px tall, full-width on mobile)',
    '• Brand logo in top-left corner',
    '• Avatar/mascot visible if configured'
  ];
  scene0Elements.forEach(element => addText(element, 10));
  yPos += 5;

  addText('Scene 1: First Action', 12, 'bold');
  yPos += 3;
  addText('Purpose: Core gameplay begins. Must track timestamps, validate against GOLD_KEY, support keyboard navigation, and provide haptic feedback.', 10);
  yPos += 5;

  addText('Scene 2+: Subsequent Actions', 12, 'bold');
  yPos += 3;
  addText('Purpose: Multi-step challenges or decision trees with consistent UI, transition animations, and progress tracking.', 10);
  yPos += 5;

  addText('Final: Results Screen', 12, 'bold');
  yPos += 3;
  addText('Purpose: Performance feedback and XP award with all required metrics and action buttons.', 10);
  yPos += 8;

  // Scoring System
  addNewPageIfNeeded(40);
  addText('SCORING SYSTEM (LOCKED v3.1)', 14, 'bold');
  yPos += 5;

  addText('1. Mastery (90%+ optimal)', 12, 'bold');
  addText('   • XP: 100', 10);
  addText('   • Color: hsl(142, 71%, 45%) - Green', 10);
  addText('   • Criteria: ≥90% accuracy AND time ≤ Ttight', 10);
  addText('   • Badge: Gold star icon', 10);
  yPos += 3;

  addText('2. Proficient (60-89% optimal)', 12, 'bold');
  addText('   • XP: 60', 10);
  addText('   • Color: hsl(48, 96%, 53%) - Yellow', 10);
  addText('   • Criteria: 60-89% accuracy OR time between Ttight and Tlimit', 10);
  addText('   • Badge: Silver star icon', 10);
  yPos += 3;

  addText('3. Needs Work (<60% optimal)', 12, 'bold');
  addText('   • XP: 20', 10);
  addText('   • Color: hsl(0, 84%, 60%) - Red', 10);
  addText('   • Criteria: <60% accuracy OR time > Tlimit', 10);
  addText('   • Badge: Bronze icon', 10);
  yPos += 5;

  addText('Time Formulas', 12, 'bold');
  yPos += 3;
  addText('• Tlimit = optimal_time × 2.0 (absolute maximum)', 10);
  addText('• Ttight = optimal_time × 1.2 (mastery threshold)', 10);
  yPos += 3;
  addText('Example: If optimal_time = 60 seconds', 10, 'bold');
  addText('  • Ttight = 72 seconds (need to finish within this for mastery)', 10);
  addText('  • Tlimit = 120 seconds (exceed this = needs work)', 10);
  yPos += 8;

  // Telemetry
  addNewPageIfNeeded(40);
  addText('TELEMETRY (AUTOMATIC EMISSION)', 14, 'bold');
  yPos += 5;

  addText('window.__RESULT__ (Emit on results screen load)', 12, 'bold');
  yPos += 3;
  addText('Contains: level, xp, time_ms, score, competency_id, subcompetency_id, timestamp, mode, player_id', 10);
  yPos += 5;

  addText('window.__PROOF__ (Emit before results screen)', 12, 'bold');
  yPos += 3;
  addText('Contains: timestamp, actions array, accuracy, efficiency, total_time_ms, gold_key_match, edge_case_handled', 10);
  yPos += 8;

  // Mobile Requirements
  addNewPageIfNeeded(40);
  addText('MOBILE & RESPONSIVE REQUIREMENTS', 14, 'bold');
  yPos += 5;
  addText('• Touch targets: Minimum 48px × 48px with 8px spacing', 10);
  addText('• Scrolling: All scenes support vertical scroll with overflow-y: auto', 10);
  addText('• Viewport: Design for 375px width minimum, use 100vh for full-screen', 10);
  addText('• Gestures: Support touch, mouse, and keyboard with haptic feedback', 10);
  yPos += 8;

  // Modal Requirements
  addText('MODAL & DIALOG REQUIREMENTS', 14, 'bold');
  yPos += 5;
  addText('• Use Radix Dialog or semantic HTML <dialog> element', 10);
  addText('• Must include close button, ESC key support, focus trapping', 10);
  addText('• Semi-transparent overlay with blur effect', 10);
  addText('• Max-width: 500px on desktop, full-width with padding on mobile', 10);
  yPos += 8;

  // Accessibility
  addNewPageIfNeeded(40);
  addText('ACCESSIBILITY (WCAG 2.1 Level AA)', 14, 'bold');
  yPos += 5;
  addText('• Keyboard navigation: Logical tab order, Enter/Space activation, ESC to close', 10);
  addText('• Focus indicators: Visible 2px outline with 3:1 contrast ratio', 10);
  addText('• Screen readers: ARIA labels, semantic HTML, status announcements', 10);
  addText('• Visual: 4.5:1 contrast for normal text, 3:1 for large text', 10);
  yPos += 8;

  // Brand Customization
  addText('BRAND CUSTOMIZATION (CONFIGURABLE)', 14, 'bold');
  yPos += 5;
  addText('Customizable: Primary/Secondary/Accent colors (HSL), font families, logo URL, avatar URL, particle effect type, brand name', 10);
  yPos += 3;
  addText('Non-Customizable (Locked): Scene structure, scoring thresholds (90%/60%), XP values (100/60/20), time formulas, telemetry objects, accessibility requirements', 10);
  yPos += 8;

  // Window Objects
  addNewPageIfNeeded(40);
  addText('EMBEDDED CONFIGURATION OBJECTS', 14, 'bold');
  yPos += 5;

  addText('window.__CONFIG__', 12, 'bold');
  yPos += 3;
  addText('Defines: competency_id, subcompetency_id, mode, avatar_url, particle_effect, brand_name, optimal_time, difficulty', 10);
  yPos += 5;

  addText('window.__GOLD_KEY__', 12, 'bold');
  yPos += 3;
  addText('Defines: optimal_path array, optimal_time, optimal_score, acceptable_variations', 10);
  yPos += 5;

  addText('window.__EDGE__', 12, 'bold');
  yPos += 3;
  addText('Optional: enabled, scenario, expected_behavior, trigger_condition, scoring_impact', 10);
  yPos += 8;

  // Avatar Implementation
  addNewPageIfNeeded(30);
  addText('AVATAR/MASCOT IMPLEMENTATION', 14, 'bold');
  yPos += 5;
  addText('Position: Fixed at bottom-right (20px, 80px size, z-index 100)', 10);
  addText('Animations: Bounce (idle), Celebrate (on success), Wave (on hover), Pulse (on hint)', 10);
  yPos += 8;

  // Particle Effects
  addText('PARTICLE EFFECTS', 14, 'bold');
  yPos += 5;
  addText('Confetti: Using canvas-confetti, triggered on mastery results', 10);
  addText('Sparkles: Custom CSS animation, triggered on correct actions', 10);
  addText('None: No effects for minimal/professional brands', 10);
  yPos += 8;

  // Loading Screen
  addNewPageIfNeeded(25);
  addText('BRAND LOADING SCREEN', 14, 'bold');
  yPos += 5;
  addText('Requirements: Brand logo centered, "Loading game..." text, animated spinner, fade out transition (300ms), uses brand primary color', 10);
  yPos += 8;

  // Checklist
  addNewPageIfNeeded(50);
  addText('SELF-VALIDATION CHECKLIST', 14, 'bold');
  yPos += 5;
  const checklistItems = [
    'Scene Structure: All scenes present with required elements',
    'Scoring & Telemetry: All window objects (__CONFIG__, __GOLD_KEY__, __EDGE__, __RESULT__, __PROOF__) defined',
    'Mobile & Touch: Touch targets ≥48px, scrollable scenes, no horizontal scroll',
    'Modals & Dialogs: Close button, ESC key, focus trapping',
    'Buttons & Forms: Proper states, error handling',
    'Accessibility: Keyboard navigation, focus indicators, ARIA labels, WCAG 2.1 AA',
    'Brand Customization: CSS variables, logo display, avatar positioning, particle effects'
  ];
  checklistItems.forEach(item => addText('✓ ' + item, 10));
  yPos += 8;

  // Version History
  addNewPageIfNeeded(30);
  addText('VERSION HISTORY', 14, 'bold');
  yPos += 5;
  addText('v3.1 (Current):', 11, 'bold');
  addText('Updated scoring thresholds to 90%/60%, increased XP to 100/60/20, added __PROOF__ object, enhanced edge case handling, added brand loading screen and avatar animations, added time formulas (Tlimit, Ttight)', 10);
  yPos += 5;
  addText('v3.0:', 11, 'bold');
  addText('Introduced locked scoring system, Telegram integration, mandatory scene structure, brand customization framework', 10);
  yPos += 5;
  addText('v2.0:', 11, 'bold');
  addText('Added accessibility requirements, mobile-first design principles, self-validation checklist', 10);
  yPos += 5;
  addText('v1.0:', 11, 'bold');
  addText('Initial framework definition, basic scene structure, simple scoring system', 10);

  // Save
  doc.save('BASE_LAYER_1_BAKED_LOCKED_v3.1.pdf');
};
