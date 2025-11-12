import jsPDF from 'jspdf';

export const generateDocUsagePDF = () => {
  const doc = new jsPDF();
  let yPos = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const maxWidth = 170;

  const checkPageBreak = (requiredSpace: number = 10) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }
  };

  const addText = (
    text: string,
    size: number = 10,
    bold: boolean = false,
    spacing: number = 5,
    color: [number, number, number] = [0, 0, 0]
  ) => {
    checkPageBreak();
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * (size / 2) + spacing;
  };

  const addSection = (title: string, emoji: string = '') => {
    checkPageBreak(20);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin - 5, yPos - 5, maxWidth + 10, 12, 'F');
    addText(`${emoji} ${title}`, 14, true, 10, [0, 0, 0]);
  };

  const addBullet = (text: string, indent: number = 0) => {
    checkPageBreak();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, maxWidth - indent - 5);
    doc.text('•', margin + indent, yPos);
    doc.text(lines, margin + indent + 5, yPos);
    yPos += lines.length * 5 + 3;
  };

  const addCodeBlock = (text: string) => {
    checkPageBreak(15);
    doc.setFillColor(245, 245, 245);
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    const lines = doc.splitTextToSize(text, maxWidth - 10);
    const blockHeight = lines.length * 4 + 6;
    doc.rect(margin, yPos - 3, maxWidth, blockHeight, 'F');
    doc.text(lines, margin + 5, yPos);
    yPos += blockHeight + 5;
  };

  // Title Page
  doc.setFillColor(45, 85, 86);
  doc.rect(0, 0, 210, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Documentation Usage Guide', margin, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('How PlayOps Platform Documents Are Currently Used', margin, 40);
  
  yPos = 60;
  doc.setTextColor(0, 0, 0);

  // Overview
  addSection('Overview');
  addText(
    'This guide explains how each documentation file in the PlayOps platform is currently being used, where it\'s referenced in the codebase, and its importance for system functionality.',
    10,
    false,
    10
  );

  // ACTIVELY USED IN CODE
  addSection('ACTIVELY USED IN CODE', '📊');
  
  // Document 1: Excel Framework
  doc.setFillColor(255, 243, 205);
  doc.rect(margin - 3, yPos - 3, maxWidth + 6, 8, 'F');
  addText('1. CBEN_PlayOps_Framework_Finale.xlsx', 12, true, 5, [180, 0, 0]);
  addText('CRITICAL - Core Data Source', 11, true, 8, [180, 0, 0]);
  
  addText('Location:', 10, true, 3);
  addText('framework-files/CBEN_PlayOps_Framework_Finale.xlsx (Supabase Storage)', 9, false, 8);
  
  addText('Used By:', 10, true, 3);
  addBullet('supabase/functions/analyze-course/index.ts (Lines 199-208)', 5);
  addText('- Fetches Excel file from storage at runtime', 9, false, 3, [60, 60, 60]);
  addText('- Reads Page 3 (Sub-Competencies) for available competencies', 9, false, 3, [60, 60, 60]);
  addText('- Used when brands upload course documents', 9, false, 8, [60, 60, 60]);
  
  addBullet('supabase/functions/generate-game/index.ts (Lines 63-140)', 5);
  addText('- References Page 3: Action Cue, Game Mechanic, Game Loop, Scoring', 9, false, 3, [60, 60, 60]);
  addText('- References Page 4: XP Awards (L1: 100, L2: 250, L3: 500)', 9, false, 8, [60, 60, 60]);
  
  addBullet('src/utils/v3Validator.ts (Lines 282-291)', 5);
  addText('- Uses Tab 4 XP: Mastery: 15, Proficient: 10, Needs Work: 5', 9, false, 8, [60, 60, 60]);
  
  addText('Impact if Missing:', 10, true, 3);
  addText('❌ Course analysis will fail', 10, false, 3, [180, 0, 0]);
  addText('❌ Game generation will not have correct mechanics/scoring', 10, false, 3, [180, 0, 0]);
  addText('❌ XP calculations will be incorrect', 10, false, 10, [180, 0, 0]);

  // Document 2: Custom Game Template
  doc.setFillColor(255, 243, 205);
  doc.rect(margin - 3, yPos - 3, maxWidth + 6, 8, 'F');
  addText('2. CUSTOM_GAME_TEMPLATE_GUIDE.md', 12, true, 5, [0, 100, 180]);
  addText('IMPORTANT - User-Facing Guide', 11, true, 8, [0, 100, 180]);
  
  addText('Location:', 10, true, 3);
  addText('public/CUSTOM_GAME_TEMPLATE_GUIDE.md', 9, false, 8);
  
  addText('Linked In:', 10, true, 3);
  addBullet('src/components/platform/CustomGameUpload.tsx (Lines 135-140)', 5);
  addText('- Shows link: "View Complete Custom Game Template Guide"', 9, false, 8, [60, 60, 60]);
  
  addBullet('src/components/platform/PlayOpsStructureGuide.tsx (Lines 262-268)', 5);
  addText('- Displayed in structure guide dialog', 9, false, 8, [60, 60, 60]);
  
  addText('Impact if Missing:', 10, true, 3);
  addText('⚠️ Creators won\'t see template guide (404 error)', 10, false, 3, [200, 100, 0]);
  addText('⚠️ Custom uploads may not follow required structure', 10, false, 10, [200, 100, 0]);

  // REFERENCE DOCUMENTATION
  addSection('REFERENCE DOCUMENTATION (Not Loaded by Code)', '📖');
  
  addText('3. BASE_LAYER_1_BAKED_LOCKED_v3.0.md', 11, true, 5);
  addText('Purpose: Architecture specification for all validator games', 10, false, 3);
  addText('Content: Scene structure, scoring system, mobile requirements, customization rules', 10, false, 10);
  
  addText('4. V31_IMPLEMENTATION_GUIDE.md', 11, true, 5);
  addText('Purpose: Developer guide for v3.1 scoring/validation', 10, false, 3);
  addText('Content: v3Validator.ts, useGameIframe.ts, GamePlayer.tsx, window objects', 10, false, 10);
  
  addText('5. VALIDATOR_TESTING_v3.1.md', 11, true, 5);
  addText('Purpose: Automated testing pipeline for validators', 10, false, 3);
  addText('Content: 8-step validation checks, pass/fail classification', 10, false, 10);
  
  addText('6. PLAYOPS_FRAMEWORK_SOURCE.md', 11, true, 5);
  addText('Purpose: How to interpret the Excel framework file', 10, false, 3);
  addText('Content: Tab explanations, database schema mapping, update process', 10, false, 10);
  
  addText('7. DEMO_CBE_COMPETENCY_DOCUMENTATION.md', 11, true, 5);
  addText('Purpose: Example competency definitions for demos', 10, false, 10);
  
  addText('8. CREATOR_FLOW_COMPARISON.md / CREATOR_FLOW_UPDATED.md', 11, true, 5);
  addText('Purpose: Documents old vs. new creator workflows (historical)', 10, false, 10);
  
  addText('9. ANSWER_VALIDATION_GUIDE.md', 11, true, 5);
  addText('Purpose: Guidelines for validating player answers', 10, false, 10);
  
  addText('10. AI_GENERATION_PROMPT.md', 11, true, 5);
  addText('Purpose: Template prompts for AI game generation', 10, false, 10);

  // HANDOFF CHECKLIST
  addSection('HANDOFF CHECKLIST', '📋');
  
  addText('Critical Files (System Won\'t Work Without):', 11, true, 5);
  addText('✅ CBEN_PlayOps_Framework_Finale.xlsx in framework-files storage', 10, false, 3);
  addText('✅ CUSTOM_GAME_TEMPLATE_GUIDE.md in /public folder', 10, false, 10);
  
  addText('Important Reference Docs (Developers Need):', 11, true, 5);
  addText('✅ BASE_LAYER_1_BAKED_LOCKED_v3.0.md', 10, false, 3);
  addText('✅ V31_IMPLEMENTATION_GUIDE.md', 10, false, 3);
  addText('✅ VALIDATOR_TESTING_v3.1.md', 10, false, 3);
  addText('✅ PLAYOPS_FRAMEWORK_SOURCE.md', 10, false, 10);

  // SEARCH PATTERNS
  addSection('How to Find Document References in Code', '🔍');
  
  addText('Search Patterns:', 11, true, 5);
  addCodeBlock('# Find Excel file usage\ngrep -r "CBEN_PlayOps_Framework" supabase/functions/');
  addCodeBlock('# Find custom game guide references\ngrep -r "CUSTOM_GAME_TEMPLATE_GUIDE" src/');
  addCodeBlock('# Find XP calculation references\ngrep -r "calculateV31XP" src/');

  // COMMON ISSUES
  addSection('COMMON ISSUES', '🚨');
  
  addText('Issue: "Excel file not found" error in course analysis', 11, true, 5);
  addText('Solution:', 10, true, 3);
  addText('1. Check framework-files storage bucket exists', 10, false, 3);
  addText('2. Verify file named exactly: CBEN_PlayOps_Framework_Finale.xlsx', 10, false, 3);
  addText('3. Confirm file is in root of bucket (not subfolder)', 10, false, 10);
  
  addText('Issue: Custom game template guide shows 404', 11, true, 5);
  addText('Solution:', 10, true, 3);
  addText('1. Verify CUSTOM_GAME_TEMPLATE_GUIDE.md exists in /public', 10, false, 3);
  addText('2. Check file name spelling matches exactly', 10, false, 10);
  
  addText('Issue: XP values don\'t match expectations', 11, true, 5);
  addText('Solution:', 10, true, 3);
  addText('1. Check Excel file Tab 4 values', 10, false, 3);
  addText('2. Verify v3Validator.ts matches Excel', 10, false, 3);
  addText('3. Confirm generate-game function uses correct XP values', 10, false, 10);

  // UPDATE WORKFLOW
  addSection('DOCUMENT UPDATE WORKFLOW', '📝');
  
  addText('Updating CBEN_PlayOps_Framework_Finale.xlsx:', 11, true, 5);
  addText('1. Update Excel file with new competencies/scoring', 10, false, 3);
  addText('2. Upload to framework-files storage bucket (overwrites existing)', 10, false, 3);
  addText('3. Test course analysis function with new data', 10, false, 3);
  addText('4. Test game generation with affected competencies', 10, false, 3);
  addText('5. Update PLAYOPS_FRAMEWORK_SOURCE.md to document changes', 10, false, 10);
  
  addText('Updating Architecture Docs:', 11, true, 5);
  addText('1. Edit markdown file in /public folder', 10, false, 3);
  addText('2. Update any code that references changed behavior', 10, false, 3);
  addText('3. Update implementation guides if APIs changed', 10, false, 3);
  addText('4. Test affected components', 10, false, 10);

  // HANDOFF QUESTIONS
  addSection('QUESTIONS TO ASK DURING HANDOFF', '📞');
  
  addText('Excel Framework:', 11, true, 5);
  addBullet('Where is the master Excel file stored outside of the app?', 5);
  addBullet('Who has permission to update competency definitions?', 5);
  addBullet('What\'s the process for adding new sub-competencies?', 5);
  yPos += 5;
  
  addText('Documentation Maintenance:', 11, true, 5);
  addBullet('Who is responsible for keeping architecture docs updated?', 5);
  addBullet('Are there other documentation sources not in this repo?', 5);
  addBullet('Should old comparison docs be archived or deleted?', 5);
  yPos += 5;
  
  addText('Testing Documentation:', 11, true, 5);
  addBullet('Are there additional testing procedures not documented?', 5);
  addBullet('Should VALIDATOR_TESTING_v3.1.md be linked in the UI?', 5);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Last Updated: 2025-11-12 | Version: 1.0', margin, pageHeight - 10);

  // Save
  doc.save('PlayOps_Documentation_Usage_Guide.pdf');
};
