from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Dict, Any

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    
    class Config:
        from_attributes = True

# --- Profiles ---
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    company_logo_url: Optional[str] = None
    game_avatar_url: Optional[str] = None
    location: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    design_palette: Optional[Dict[str, Any]] = None
    default_particle_effect: Optional[str] = None
    mascot_animation_type: Optional[str] = None
    wallet_address: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    class Config:
        from_attributes = True

# --- Framework ---
class SubCompetencyCreate(BaseModel):
    competency_id: str
    statement: str
    display_order: Optional[int] = None

class SubCompetencyResponse(BaseModel):
    id: str
    competency_id: str
    statement: str
    action_cue: Optional[str] = None
    game_loop: Optional[str] = None
    game_mechanic: Optional[str] = None
    player_action: Optional[str] = None
    validator_type: Optional[str] = None
    scoring_logic: Optional[Dict[str, Any]] = None
    backend_data_captured: Optional[Any] = None
    gameplay_data: Optional[Dict[str, Any]] = None
    display_order: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True


class DesignElementBase(BaseModel):
    element_type: str
    element_subtype: Optional[str] = None
    name: str
    description: Optional[str] = None
    file_url: str
    preview_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    allowed_zones: Optional[List[str]] = []
    file_size_bytes: Optional[int] = 0
    is_published: Optional[bool] = False

class DesignElementCreate(DesignElementBase):
    pass

class DesignElementResponse(DesignElementBase):
    id: str
    creator_id: str
    review_status: str
    rejection_reason: Optional[str] = None
    usage_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MasterCompetencyCreate(BaseModel):
    name: str
    cbe_category: str
    departments: Optional[List[str]] = []

class MasterCompetencyResponse(BaseModel):
    id: str
    name: str
    cbe_category: str
    departments: Optional[Any] = None
    is_active: bool
    sub_competencies: Optional[List[SubCompetencyResponse]] = None
    class Config:
        from_attributes = True

# --- Templates ---
class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_prompt: Optional[str] = None
    template_type: str
    is_published: bool = False
    custom_game_url: Optional[str] = None
    cover_photo_url: Optional[str] = None
    preview_image: Optional[str] = None
    game_config: Optional[Dict[str, Any]] = {}
    design_settings: Optional[Dict[str, Any]] = None
    selected_sub_competencies: Optional[List[str]] = None
    competency_id: Optional[str] = None

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_prompt: Optional[str] = None
    template_type: Optional[str] = None
    is_published: Optional[bool] = None
    custom_game_url: Optional[str] = None
    cover_photo_url: Optional[str] = None
    preview_image: Optional[str] = None
    game_config: Optional[Dict[str, Any]] = None
    design_settings: Optional[Dict[str, Any]] = None
    selected_sub_competencies: Optional[List[str]] = None
    competency_id: Optional[str] = None

class TemplateResponse(TemplateBase):
    id: str
    creator_id: str
    created_at: Any
    updated_at: Any
    
    class Config:
        from_attributes = True

# --- Customizations ---
class CustomizationResponse(BaseModel):
    id: str
    brand_id: str
    template_id: Optional[str] = None
    customization_prompt: Optional[str] = None
    generated_game_html: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    background_color: Optional[str] = None
    unique_code: Optional[str] = None
    published_at: Optional[Any] = None
    created_at: Any
    updated_at: Any
    game_templates: Optional[Any] = None # Will be populated dynamically
    
    class Config:
        from_attributes = True

class CustomizationCreate(BaseModel):
    brand_id: str
    template_id: Optional[str] = None
    customization_prompt: Optional[str] = None
    generated_game_html: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    background_color: Optional[str] = None

# --- Results ---
class ValidatorTestResultResponse(BaseModel):
    id: str
    template_id: str
    sub_competency_id: Optional[str] = None
    tester_id: Optional[str] = None
    template_type: str
    test_version: str
    overall_status: Optional[str] = None
    approved_for_publish: Optional[bool] = None
    class Config:
        from_attributes = True

# --- Games edge functions ---
class GenerateGameRequest(BaseModel):
    templatePrompt: Optional[str] = None
    primaryColor: Optional[str] = None
    secondaryColor: Optional[str] = None
    accentColor: Optional[str] = None
    backgroundColor: Optional[str] = None
    highlightColor: Optional[str] = None
    textColor: Optional[str] = None
    fontFamily: Optional[str] = None
    logoUrl: Optional[str] = None
    avatarUrl: Optional[str] = None
    particleEffect: Optional[str] = None
    mascotAnimationType: Optional[str] = None
    customizationId: Optional[str] = None
    previewMode: Optional[bool] = False
    subCompetencies: Optional[list] = []

class PublishTemplateRequest(BaseModel):
    template_id: str

class SubmitScoreRequest(BaseModel):
    templateId: Optional[str] = None
    customizationId: Optional[str] = None
    competencyId: Optional[str] = None
    subCompetencyId: str
    scoringMetrics: dict
    gameplayData: Optional[dict] = None

class StressTestRequest(BaseModel):
    templateId: str
    subCompetencyId: Optional[str] = None
    testerId: str

# --- Users & Auth ---

class DesignElementBase(BaseModel):
    element_type: str
    element_subtype: Optional[str] = None
    name: str
    description: Optional[str] = None
    file_url: str
    preview_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    allowed_zones: Optional[List[str]] = []
    file_size_bytes: Optional[int] = 0
    is_published: Optional[bool] = False

class DesignElementCreate(DesignElementBase):
    pass

class DesignElementResponse(DesignElementBase):
    id: str
    creator_id: str
    review_status: str
    rejection_reason: Optional[str] = None
    usage_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
