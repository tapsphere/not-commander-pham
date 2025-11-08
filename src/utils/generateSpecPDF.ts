import { jsPDF } from 'jspdf';

interface SubCompetencySpec {
  statement: string;
  sceneNumber: number;
  actionCue?: string;
  gameMechanic?: string;
  validatorType?: string;
  scoringFormula?: string;
}

interface GameSpecification {
  templateName: string;
  competency: string;
  subCompetencies: SubCompetencySpec[];
  scenario: string;
  playerActions: string;
  scenes: {
    scene1?: string;
    scene2?: string;
    scene3?: string;
    scene4?: string;
  };
  edgeCase: string;
  edgeCaseTiming: string;
  uiAesthetic: string;
  brandCustomizations: {
    description: string;
    elements: string[];
  };
}

export const generateSpecPDF = (spec: GameSpecification): void => {
  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 7;
  const pageHeight = 280;
  const margin = 20;

  const checkPageBreak = () => {
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }
  };

  const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
    checkPageBreak();
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, 170);
    lines.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
  };

  const addSection = (title: string, content: string) => {
    yPos += 5;
    addText(title, 14, true);
    yPos += 2;
    addText(content);
    yPos += 3;
  };

  // Header
  doc.setFillColor(200, 220, 220);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(45, 85, 86);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PlayOps Game Specification', margin, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(spec.templateName, margin, 23);
  doc.setTextColor(0, 0, 0);
  
  yPos = 40;

  // Competency Framework
  addSection('Competency Framework', spec.competency);
  
  // Sub-Competencies & Scene Mapping
  addText('Sub-Competencies (Scene Mapping):', 13, true);
  yPos += 2;
  
  spec.subCompetencies.forEach((sub, idx) => {
    addText(`Scene ${sub.sceneNumber}: ${sub.statement}`, 11, true);
    if (sub.actionCue) addText(`  Action Cue: ${sub.actionCue}`);
    if (sub.gameMechanic) addText(`  Game Mechanic: ${sub.gameMechanic}`);
    if (sub.validatorType) addText(`  Validator Type: ${sub.validatorType}`);
    yPos += 3;
  });

  // Scenario Design
  addSection('Scenario', spec.scenario);
  
  addSection('Player Actions', spec.playerActions);
  
  // Scene Breakdown
  addText('Scene Breakdown:', 13, true);
  yPos += 2;
  if (spec.scenes.scene1) addText(`Scene 1: ${spec.scenes.scene1}`);
  if (spec.scenes.scene2) addText(`Scene 2: ${spec.scenes.scene2}`);
  if (spec.scenes.scene3) addText(`Scene 3: ${spec.scenes.scene3}`);
  if (spec.scenes.scene4) addText(`Scene 4: ${spec.scenes.scene4}`);
  yPos += 3;

  // Edge Case
  addSection('Edge Case Configuration', `Timing: ${spec.edgeCaseTiming}\n\n${spec.edgeCase}`);
  
  // UI/UX
  addSection('UI Aesthetic', spec.uiAesthetic);

  // Brand Customization Requirements
  yPos += 5;
  addText('Brand Customization Elements:', 14, true);
  yPos += 2;
  addText(spec.brandCustomizations.description);
  yPos += 3;
  addText('Customizable Elements:', 12, true);
  spec.brandCustomizations.elements.forEach(element => {
    addText(`  • ${element}`);
  });

  // Technical Requirements
  checkPageBreak();
  yPos += 5;
  doc.setFillColor(240, 240, 240);
  doc.rect(margin - 5, yPos - 5, 180, 60, 'F');
  yPos += 2;
  addText('Technical Requirements:', 13, true);
  addText('  • Mobile-first responsive design');
  addText('  • Scene 0 (Intro) → Scene N (Gameplay) architecture');
  addText('  • START button required on Scene 0');
  addText('  • Support URL parameters for brand colors and logo');
  addText('  • Touch-friendly interactions');
  addText('  • Single HTML file or ZIP with index.html');

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, pageHeight + 10);
  doc.text('PlayOps Framework v3.1', 150, pageHeight + 10);

  // Save
  doc.save(`${spec.templateName.replace(/[^a-z0-9]/gi, '_')}_Spec.pdf`);
};
