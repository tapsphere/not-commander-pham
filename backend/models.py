from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    auth_provider = Column(String, default="email")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    templates = relationship("GameTemplate", back_populates="creator")
    profile = relationship("Profile", back_populates="user", uselist=False)
    roles = relationship("UserRole", back_populates="user")


class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    role = Column(String, nullable=False) # "creator", "brand", "player"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="roles")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    company_name = Column(String, nullable=True)
    company_description = Column(Text, nullable=True)
    company_logo_url = Column(String, nullable=True)
    game_avatar_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    primary_color = Column(String, nullable=True)
    secondary_color = Column(String, nullable=True)
    design_palette = Column(JSON, nullable=True)
    default_particle_effect = Column(String, nullable=True)
    mascot_animation_type = Column(String, nullable=True)
    wallet_address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class MasterCompetency(Base):
    __tablename__ = "master_competencies"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cbe_category = Column(String, nullable=False)
    departments = Column(JSON, nullable=True) # Array of strings stored as JSON
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    sub_competencies = relationship("SubCompetency", back_populates="competency")


class SubCompetency(Base):
    __tablename__ = "sub_competencies"
    
    id = Column(String, primary_key=True, index=True)
    competency_id = Column(String, ForeignKey("master_competencies.id"))
    statement = Column(String, nullable=False)
    action_cue = Column(String, nullable=True)

    tags = Column(JSON, nullable=True)  # ["communication", "verbal"]

    game_loop = Column(String, nullable=True)
    game_mechanic = Column(String, nullable=True)
    player_action = Column(String, nullable=True)
    validator_type = Column(String, nullable=True)
    scoring_formula_level_1 = Column(String, nullable=True)
    scoring_formula_level_2 = Column(String, nullable=True)
    scoring_formula_level_3 = Column(String, nullable=True)
    scoring_logic = Column(JSON, nullable=True)
    backend_data_captured = Column(JSON, nullable=True)
    display_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    

    competency = relationship("MasterCompetency", back_populates="sub_competencies")


class GameTemplate(Base):
    __tablename__ = "game_templates"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    base_prompt = Column(Text, nullable=True)
    template_type = Column(String, nullable=False)
    is_published = Column(Boolean, default=False)
    custom_game_url = Column(String, nullable=True)
    cover_photo_url = Column(String, nullable=True)
    preview_image = Column(String, nullable=True)
    game_config = Column(JSON, nullable=False, default={})
    design_settings = Column(JSON, nullable=True)
    selected_sub_competencies = Column(JSON, nullable=True) # Array stored as JSON
    competency_id = Column(String, ForeignKey("master_competencies.id"), nullable=True)
    creator_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    creator = relationship("User", back_populates="templates")
    customizations = relationship("BrandCustomization", back_populates="template")


class BrandCustomization(Base):
    __tablename__ = "brand_customizations"

    id = Column(String, primary_key=True, index=True)
    brand_id = Column(String, ForeignKey("users.id"))
    template_id = Column(String, ForeignKey("game_templates.id"), nullable=True)
    unique_code = Column(String, nullable=True, unique=True)
    customization_prompt = Column(Text, nullable=True)
    generated_game_html = Column(Text, nullable=True)
    primary_color = Column(String, nullable=True)
    secondary_color = Column(String, nullable=True)
    accent_color = Column(String, nullable=True)
    background_color = Column(String, nullable=True)
    highlight_color = Column(String, nullable=True)
    text_color = Column(String, nullable=True)
    font_family = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    cover_photo_url = Column(String, nullable=True)
    particle_effect = Column(String, nullable=True)
    mascot_animation_type = Column(String, nullable=True)
    custom_config = Column(JSON, nullable=True)
    visibility = Column(String, default="public")
    live_start_date = Column(DateTime(timezone=True), nullable=True)
    live_end_date = Column(DateTime(timezone=True), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    template = relationship("GameTemplate", back_populates="customizations")


class ValidatorTestResult(Base):
    __tablename__ = "validator_test_results"
    
    id = Column(String, primary_key=True, index=True)
    template_id = Column(String, ForeignKey("game_templates.id"))
    sub_competency_id = Column(String, ForeignKey("sub_competencies.id"))
    tester_id = Column(String, ForeignKey("users.id"))
    template_type = Column(String, nullable=False)
    test_version = Column(String, nullable=False)
    overall_status = Column(String, nullable=True)
    approved_for_publish = Column(Boolean, nullable=True)
    
    phase1_status = Column(String, nullable=True)
    phase1_notes = Column(Text, nullable=True)
    phase1_checklist = Column(JSON, nullable=True)
    
    phase2_status = Column(String, nullable=True)
    phase2_notes = Column(Text, nullable=True)
    
    phase3_status = Column(String, nullable=True)
    phase3_notes = Column(Text, nullable=True)
    phase3_test_runs = Column(JSON, nullable=True)
    
    v3_1_check_results = Column(JSON, nullable=True)
    backend_data_captured = Column(JSON, nullable=True)
    
    tested_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ValidatorRuntime(Base):
    __tablename__ = "validators_runtime"
    
    id = Column(String, primary_key=True, index=True)
    template_id = Column(String, ForeignKey("game_templates.id"))
    mode = Column(String, nullable=False)
    feedback_mode = Column(String, nullable=False)
    attempts = Column(String, nullable=False)
    time_limit_s = Column(Integer, nullable=True)
    sessions_required = Column(Integer, nullable=True)
    accuracy_threshold = Column(Float, nullable=True)
    edge_threshold = Column(Float, nullable=True)
    proof_log = Column(Boolean, default=False)
    randomize = Column(Boolean, default=False)
    seed = Column(String, nullable=True)
    ui_theme = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, index=True)
    runtime_id = Column(String, ForeignKey("validators_runtime.id"))
    user_id = Column(String, ForeignKey("users.id"))
    mode = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    edge_score = Column(Float, nullable=True)
    time_s = Column(Integer, nullable=True)
    level = Column(Integer, nullable=True)
    passed = Column(Boolean, nullable=True)
    metrics = Column(JSON, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=False)
    finished_at = Column(DateTime(timezone=True), nullable=True)


class GameResult(Base):
    __tablename__ = "game_results"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    template_id = Column(String, ForeignKey("game_templates.id"), nullable=True)
    customization_id = Column(String, ForeignKey("brand_customizations.id"), nullable=True)
    competency_id = Column(String, ForeignKey("master_competencies.id"), nullable=True)
    sub_competency_id = Column(String, ForeignKey("sub_competencies.id"), nullable=True)
    passed = Column(Boolean, nullable=False)
    proficiency_level = Column(String, nullable=True)
    scoring_metrics = Column(JSON, nullable=False)
    gameplay_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DesignElement(Base):
    __tablename__ = "design_elements"

    id = Column(String, primary_key=True, index=True)
    creator_id = Column(String, ForeignKey("users.id"))
    element_type = Column(String, nullable=False)
    element_subtype = Column(String, nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String, nullable=False)
    preview_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    allowed_zones = Column(JSON, nullable=True) # Array stored as JSON
    review_status = Column(String, default="pending_review")
    rejection_reason = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    file_size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    creator = relationship("User")
