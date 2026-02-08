export { StudioThemeProvider, useStudioTheme } from './StudioThemeContext';
export { StudioLiveMirror } from './StudioLiveMirror';
export { StudioStepperNav } from './StudioStepperNav';
export { StudioIdentityStep } from './StudioIdentityStep';
export { StudioBrandStep } from './StudioBrandStep';
export { StudioTemplateInfoStep } from './StudioTemplateInfoStep';
export { MechanicPreview } from './MechanicPreview';
export { StudioFilmstrip } from './StudioFilmstrip';
export { StudioTrackRail } from './StudioTrackRail';
export { StudioPropertiesSidebar } from './StudioPropertiesSidebar';
export { StudioCenterCanvas } from './StudioCenterCanvas';
export { StudioNavigator } from './StudioNavigator';
export { TelegramNativeOverlay, TelegramPreviewToggle } from './TelegramNativeOverlay';
export { StudioLiveCodeEditor } from './StudioLiveCodeEditor';

// Scene Layout - 30/50/20 UX Constraints (DNA Library Section 5)
export { SceneLayout, ContextZone, InteractionZone } from './SceneLayout';

// Scene Assembler - 3-Way Stitch Engine (DNA Library Section 6)
export {
  assembleScene,
  performThreeWayStitch,
  detectMechanicType,
  getComponentForMechanic,
  getTelemetryConfig,
  getAllBlueprints,
  getUniversalLayout,
  initializeBiometricTrace,
  calculateJitterVariance,
  calculateProficiency,
  UNIVERSAL_LAYOUT,
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
  ThreeWayStitch,
  LayoutConfig,
} from './SceneAssembler';
