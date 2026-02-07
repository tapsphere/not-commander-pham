export { StudioThemeProvider, useStudioTheme } from './StudioThemeContext';
export { StudioLiveMirror } from './StudioLiveMirror';
export { StudioStepperNav } from './StudioStepperNav';
export { StudioIdentityStep } from './StudioIdentityStep';
export { StudioBrandStep } from './StudioBrandStep';
export { StudioTemplateInfoStep } from './StudioTemplateInfoStep';
export { MechanicPreview } from './MechanicPreview';
export { StudioFilmstrip } from './StudioFilmstrip';
export { StudioPropertiesSidebar } from './StudioPropertiesSidebar';
export { StudioCenterCanvas } from './StudioCenterCanvas';
export { StudioNavigator } from './StudioNavigator';

// Scene Assembler - DNA Library Mapping Engine
export {
  assembleScene,
  detectMechanicType,
  getComponentForMechanic,
  getTelemetryConfig,
  getAllBlueprints,
  initializeBiometricTrace,
  calculateJitterVariance,
  calculateProficiency,
} from './SceneAssembler';

export type {
  MechanicType,
  InteractionType,
  TelemetryConfig,
  MechanicBlueprint,
  AssembledScene,
  BiometricTrace,
  TelemetrySample,
  TripleGateResult,
  ProficiencyLevel,
} from './SceneAssembler';
