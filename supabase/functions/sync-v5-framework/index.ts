import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * V5 MASTER FRAMEWORK DATA
 * 
 * This is the SINGLE SOURCE OF TRUTH from CBEN_PlayOps_Framework_Finale_V5.xlsx
 * Page 3 (Tab 3) contains the competency mapping with:
 * - Cluster/Domain (Column A)
 * - Competency (Column B) 
 * - Sub-Competency (Column C)
 * - Action Cue (Column K)
 * - Game Mechanic (Column L)
 * - Mobile Interaction (mapped to validator_type)
 */

const V5_FRAMEWORK_DATA = [
  // ========== COGNITIVE & ANALYTICAL ==========
  {
    cluster: "Cognitive & Analytical",
    competency: "Analytical Thinking",
    departments: ["Ops", "Data/BI", "Product", "Finance", "Strategy"],
    subCompetencies: [
      {
        statement: "Break complex information into component parts",
        action_cue: "Select the correct decomposition within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Identify patterns or trends in provided data",
        action_cue: "Select the correct pattern within 60 s.",
        game_mechanic: "Pattern Grid",
        validator_type: "Drag-to-Highlight",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Compare sources for accuracy and credibility",
        action_cue: "Select the credible source within 60 s.",
        game_mechanic: "Noise Filter",
        validator_type: "Continuous Scrub",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Identify assumptions or logical gaps",
        action_cue: "Select the missing assumption within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Draw valid conclusions from incomplete data",
        action_cue: "Select the valid conclusion within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Test conclusions against constraints or edge cases",
        action_cue: "Select the correct edge-case result within 60 s.",
        game_mechanic: "Trade-Off Evaluator",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },
  {
    cluster: "Cognitive & Analytical",
    competency: "Problem Solving",
    departments: ["Operations", "Strategy", "Engineering", "Product Design", "Consulting", "Data Analysis", "Tech Ops", "Product Mgmt", "Quality Assurance", "Leadership"],
    subCompetencies: [
      {
        statement: "Identify the core problem by separating root causes from symptoms",
        action_cue: "Select the correct root cause within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Continuous Scrub",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Analyze relevant information and constraints",
        action_cue: "Select the correct constraint set within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Drag-to-Connect",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Generate multiple solution paths",
        action_cue: "Select the best solution path within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Drag-to-Highlight",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Evaluate trade-offs to select the most viable option",
        action_cue: "Select the best trade-off option within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Adjust solution when new information appears",
        action_cue: "Select the correct updated decision within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Validate solutions using edge cases or scenario checks",
        action_cue: "Select the correct solution validation within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },
  {
    cluster: "Cognitive & Analytical",
    competency: "Creative Thinking",
    departments: ["Product Design", "Marketing", "Innovation Labs", "Strategy", "Consulting", "Design Thinking", "Product Innovation", "R&D", "Product Mgmt", "Operations", "Design", "UX/UI", "Engineering", "Leadership"],
    subCompetencies: [
      {
        statement: "Generate multiple innovative ideas under defined constraints",
        action_cue: "Produce ≥3 novel ideas within realistic limits within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Reframe problems from new perspectives",
        action_cue: "Restate challenge using alternate framing within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Combine unrelated concepts to form new solutions",
        action_cue: "Merge ≥2 unrelated inputs into coherent prototype within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Evaluate creative options against feasibility and impact",
        action_cue: "Rank ≥3 options by feasibility & impact within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Iterate and improve upon initial prototypes",
        action_cue: "Show ≥2 iterations with measurable improvement within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Communicate creative rationale and process clearly",
        action_cue: "Deliver summary scoring ≥90% clarity rubric within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },
  {
    cluster: "Cognitive & Analytical",
    competency: "Critical Reasoning",
    departments: ["Strategy", "Law", "Operations", "Data Analysis", "Journalism", "Research", "Policy Analysis", "Communications", "Data Science", "Marketing", "Leadership"],
    subCompetencies: [
      {
        statement: "Identify assumptions underlying an argument",
        action_cue: "Detect and list ≥3 hidden assumptions within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Distinguish fact, inference, and opinion",
        action_cue: "Categorize ≥10 statements correctly within 60 s.",
        game_mechanic: "Pattern Grid",
        validator_type: "Drag-to-Highlight",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Evaluate evidence quality and relevance",
        action_cue: "Rank ≥5 sources by credibility within 60 s.",
        game_mechanic: "Noise Filter",
        validator_type: "Continuous Scrub",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Detect logical fallacies in complex reasoning",
        action_cue: "Identify ≥4 fallacies in scenario within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Draw valid conclusions from incomplete data",
        action_cue: "Select valid conclusion ≥85% of time within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Communicate logical reasoning clearly and persuasively",
        action_cue: "Present argument ≥90% clarity rubric score within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },

  // ========== COMMUNICATION & INTERPERSONAL ==========
  {
    cluster: "Communication & Interpersonal",
    competency: "Communication & Clarity",
    departments: ["Marketing", "Leadership", "Strategy", "Customer Success", "Sales"],
    subCompetencies: [
      {
        statement: "Generate a concise message by selecting essential information and excluding non-essential details",
        action_cue: "Select the correct summary within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Identify the main point and its supporting details",
        action_cue: "Select the correct main idea within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Select language that is clear and appropriate for the intended audience",
        action_cue: "Select the correct rewrite within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Sequence information logically from headline to supporting points",
        action_cue: "Select the correct structure within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Detect ambiguity or unclear statements",
        action_cue: "Select the ambiguous statement within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Select the appropriate tone for the situation",
        action_cue: "Select the correct tone choice within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },
  {
    cluster: "Communication & Interpersonal",
    competency: "Collaboration & Teamwork",
    departments: ["Operations", "Product", "Engineering", "Customer Success", "Leadership"],
    subCompetencies: [
      {
        statement: "Identify team roles and responsibilities",
        action_cue: "Select the correct role-task match within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Choose effective coordination steps with peers",
        action_cue: "Select the correct coordination step within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Resolve minor conflicts using fair, respectful options",
        action_cue: "Select the correct conflict-resolution option within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Prioritize shared goals when demands or trade-offs arise",
        action_cue: "Select the correct shared-goal choice within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Offer specific, constructive feedback to teammates",
        action_cue: "Select the correct feedback statement within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Adapt actions to support team needs under pressure",
        action_cue: "Select the correct adaptive team action within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },

  // ========== DIGITAL & TECHNICAL ==========
  {
    cluster: "Digital & Technical",
    competency: "Digital & AI Fluency",
    departments: ["Technology", "Data", "Product", "Operations", "Marketing"],
    subCompetencies: [
      {
        statement: "Select the correct digital tool or feature for a given task",
        action_cue: "Select the correct tool within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Interpret data from system outputs, dashboards, or AI results",
        action_cue: "Select the correct interpretation within 60 s.",
        game_mechanic: "Noise Filter",
        validator_type: "Continuous Scrub",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Select the correct AI prompt or instruction for the intended outcome",
        action_cue: "Select the correct prompt within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Spot anomalies or detect contradictions in digital or AI outputs",
        action_cue: "Select the incorrect or biased output within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Sequence or adjust workflow steps to increase efficiency",
        action_cue: "Select the correct automation within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Assess risk and validate safe digital and AI practices",
        action_cue: "Select the correct safe-action choice within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },

  // ========== PERSONAL EFFECTIVENESS ==========
  {
    cluster: "Personal Effectiveness",
    competency: "Adaptability & Resilience",
    departments: ["Operations", "Strategy", "Leadership", "Customer Success", "Sales"],
    subCompetencies: [
      {
        statement: "Adjust approach when priorities or conditions change",
        action_cue: "Select the correct updated action within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Identify the highest-priority task during shifting demands",
        action_cue: "Select the correct re-prioritized task within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Decide on appropriate actions to sustain performance under pressure",
        action_cue: "Select the correct stabilizing action within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Adjust behavior or strategy based on feedback",
        action_cue: "Select the correct feedback-based adjustment within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Assess risk early under changing conditions",
        action_cue: "Select the correct risk-mitigation action within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Select productive actions when encountering unexpected barriers",
        action_cue: "Select the correct barrier-response action within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },
  {
    cluster: "Personal Effectiveness",
    competency: "Ethical Reasoning & Judgment",
    departments: ["Compliance", "Legal", "Operations", "Leadership", "HR"],
    subCompetencies: [
      {
        statement: "Identify ethical issues or conflicts in a scenario",
        action_cue: "Select the correct ethical conflict within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Evaluate choices using principles of fairness and responsibility",
        action_cue: "Select the fair, responsible choice within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Assess risk or potential harm to stakeholders",
        action_cue: "Select the correct harm-prevention option within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Verify honesty, accuracy, and truth in communication",
        action_cue: "Select the truthful, accurate response within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Validate actions against rules, policies, or codes of conduct",
        action_cue: "Select the correct policy-based action within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Select the option that minimizes bias and maximizes fairness",
        action_cue: "Select the least-biased, fair option within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },

  // ========== CREATIVITY & INNOVATION ==========
  {
    cluster: "Creativity & Innovation",
    competency: "Creativity & Innovation",
    departments: ["Product Design", "Marketing", "R&D", "Innovation Labs", "Strategy"],
    subCompetencies: [
      {
        statement: "Generate multiple ideas or approaches to a challenge",
        action_cue: "Select the most relevant idea within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Generate a new solution by combining existing concepts",
        action_cue: "Select the correct concept combination within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Recognize patterns or spot anomalies in information",
        action_cue: "Select the correct insight within 60 s.",
        game_mechanic: "Noise Filter",
        validator_type: "Continuous Scrub",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Adjust an initial idea to improve effectiveness or fit",
        action_cue: "Select the best improved version within 60 s.",
        game_mechanic: "Headline Builder",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Allocate constraints creatively to solve a problem",
        action_cue: "Select the correct constraint-based solution within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Select the idea with the highest potential value or impact",
        action_cue: "Select the highest-impact idea within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },

  // ========== BUSINESS & SYSTEMS ==========
  {
    cluster: "Business & Systems",
    competency: "Growth Design",
    departments: ["Marketing", "Community Growth", "Product", "UX Design", "Growth"],
    subCompetencies: [
      {
        statement: "Identify UI friction points that impact conversion",
        action_cue: "Identify the specific UI bottleneck causing drop-off in the funnel within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Analyze A/B test results for design efficacy",
        action_cue: "Select the winning variant based on performance data within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Implement retention triggers in user journey",
        action_cue: "Assign the 'Notification' trigger to the churn-risk touchpoint within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Optimize page layouts for search intent",
        action_cue: "Reorder 5 page elements to prioritize the primary CTA within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Map referral loops for organic acquisition",
        action_cue: "Identify the viral-entry point in the provided user flow within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Synthesize user data to inform growth strategies",
        action_cue: "Select the growth opportunity supported by 3 data trends within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },

  // ========== DATA & ANALYSIS ==========
  {
    cluster: "Data & Analysis",
    competency: "Information Architecture",
    departments: ["UX/UI Design", "Product", "Engineering", "Content Strategy"],
    subCompetencies: [
      {
        statement: "Organize information into structural hierarchies",
        action_cue: "Arrange 12 navigation nodes into a 3-level hierarchy within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Assign intuitive category labels to UI elements",
        action_cue: "Select the correct category label for the 10-item UI group within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Map user search queries to intended destinations",
        action_cue: "Match the 5 user search queries to the 5 landing pages within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Determine the shortest path to a user goal",
        action_cue: "Identify the shortest click-path to the target goal within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Sequence UI components to match mental models",
        action_cue: "Order 5 UI elements to match the standard e-commerce pattern within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Identify and eliminate redundant navigation nodes",
        action_cue: "Remove the one redundant navigation node from the sitemap within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },

  // ========== LEADERSHIP & INFLUENCE ==========
  {
    cluster: "Leadership & Influence",
    competency: "Strategic Persuasion",
    departments: ["Leadership", "Sales", "Marketing", "Strategy", "Consulting"],
    subCompetencies: [
      {
        statement: "Select business rationales to defend design decisions",
        action_cue: "Select the strongest business rationale to defend the design direction within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Use evidence to support design recommendations",
        action_cue: "Match the 3 design changes to the specific research insights within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Address stakeholder objections during design reviews",
        action_cue: "Select the best response to the technical feasibility objection within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Align design goals with broader business objectives",
        action_cue: "Match the design KPI to the corresponding revenue goal within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Build consensus among cross-functional team members",
        action_cue: "Identify the compromise satisfying both Eng and Product within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Pitch a design vision to executive leadership",
        action_cue: "Order the 5 pitch-deck slides to maximize persuasive impact within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },
  {
    cluster: "Leadership & Influence",
    competency: "Design Mentorship",
    departments: ["Leadership", "Design", "UX/UI", "Product", "HR"],
    subCompetencies: [
      {
        statement: "Provide objective feedback based on heuristics",
        action_cue: "Critique the junior layout based on 4 objective heuristics within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Identify skill gaps in junior portfolios",
        action_cue: "Mark the missing competency in the junior profile within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Coach peers on design methodologies",
        action_cue: "Select the correct step-by-step guide for Affinity Mapping within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Set measurable growth goals for team members",
        action_cue: "Match the growth goal to the 2-year proficiency level within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Maintain standards across the design team",
        action_cue: "Identify 3 components violating shared library rules within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Encourage objective design critique culture",
        action_cue: "Select the most constructive phrasing for the team session within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },

  // ========== OPERATIONS & COMPLIANCE ==========
  {
    cluster: "Operations & Compliance",
    competency: "Workflow Management",
    departments: ["Project Management", "Operations", "UX Design", "Engineering"],
    subCompetencies: [
      {
        statement: "Document technical specs for engineering handoff",
        action_cue: "Label the margin, padding, and hex-code specs within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Audit design assets for export readiness",
        action_cue: "Identify 5 assets with incorrect naming conventions within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Match UI elements to design system tokens",
        action_cue: "Select the correct 'brand-primary' token for the UI element within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Sequence design tasks into an agile sprint board",
        action_cue: "Order 5 design tickets to reflect a logical build sequence within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Identify bottlenecks in the design review cycle",
        action_cue: "Remove the redundant approval step in the workflow within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Validate version control consistency",
        action_cue: "Select the most recent master-file version from the list within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  },
  {
    cluster: "Operations & Compliance",
    competency: "Resource Logistics",
    departments: ["Project Management", "Operations", "Finance", "HR"],
    subCompetencies: [
      {
        statement: "Rank project tasks by business impact vs. effort",
        action_cue: "Rank 6 design tickets into the high-impact quadrant within 60 s.",
        game_mechanic: "Sequence Validator",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Estimate time requirements for complex UI components",
        action_cue: "Match the time-estimate tag to the 4 UI components within 60 s.",
        game_mechanic: "Alignment Puzzle",
        validator_type: "Drag & Drop",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Allocate design team bandwidth based on priority",
        action_cue: "Assign the 'Urgent' ticket to the designer with capacity within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Identify resource gaps in project timelines",
        action_cue: "Mark the date where resource over-allocation occurs within 60 s.",
        game_mechanic: "Data Panel",
        validator_type: "Quick Tap",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Match external vendor capabilities to project needs",
        action_cue: "Select the vendor meeting the 3D-modeling requirement within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      },
      {
        statement: "Adjust project milestones based on new information",
        action_cue: "Shift the milestone marker to account for the delay within 60 s.",
        game_mechanic: "Decision Tree",
        validator_type: "Toggle / Slide",
        game_loop: "Binary Gate: [30s/45s/60s] Standard"
      }
    ]
  }
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting V5 Master Framework Sync...');
    console.log(`📊 Framework contains ${V5_FRAMEWORK_DATA.length} competencies`);

    // Step 0: Clear dependent tables first (FK constraints)
    console.log('🗑️ Step 0: Clearing validator_test_results (FK dependency)...');
    const { error: testResultsDeleteError } = await supabase
      .from('validator_test_results')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (testResultsDeleteError) {
      console.warn('Warning clearing validator_test_results:', testResultsDeleteError.message);
      // Continue anyway - might be RLS blocking
    }

    // Clear game_results that reference sub_competencies
    console.log('🗑️ Clearing game_results (FK dependency)...');
    const { error: gameResultsDeleteError } = await supabase
      .from('game_results')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (gameResultsDeleteError) {
      console.warn('Warning clearing game_results:', gameResultsDeleteError.message);
    }

    // Step 1: PURGE - Delete all existing sub-competencies first (due to FK constraints)
    console.log('🗑️ Step 1: Purging existing sub_competencies...');
    const { error: subDeleteError } = await supabase
      .from('sub_competencies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (subDeleteError) {
      console.error('Error deleting sub_competencies:', subDeleteError);
      throw new Error(`Failed to purge sub_competencies: ${subDeleteError.message}`);
    }

    // Step 2: Delete all existing master competencies
    console.log('🗑️ Step 2: Purging existing master_competencies...');
    const { error: compDeleteError } = await supabase
      .from('master_competencies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (compDeleteError) {
      console.error('Error deleting master_competencies:', compDeleteError);
      throw new Error(`Failed to purge master_competencies: ${compDeleteError.message}`);
    }

    console.log('✅ Purge complete. Database cleared.');

    // Step 3: INSERT new V5 competencies
    console.log('📥 Step 3: Inserting V5 competencies...');
    
    let totalCompetencies = 0;
    let totalSubCompetencies = 0;
    const insertedCompetencies: string[] = [];

    for (const comp of V5_FRAMEWORK_DATA) {
      // Insert master competency
      const { data: insertedComp, error: insertError } = await supabase
        .from('master_competencies')
        .insert({
          name: comp.competency,
          cbe_category: comp.cluster,
          departments: comp.departments,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Error inserting competency ${comp.competency}:`, insertError);
        throw new Error(`Failed to insert ${comp.competency}: ${insertError.message}`);
      }

      totalCompetencies++;
      insertedCompetencies.push(comp.competency);
      console.log(`  ✅ Inserted: ${comp.competency}`);

      // Insert sub-competencies for this competency
      for (let i = 0; i < comp.subCompetencies.length; i++) {
        const sub = comp.subCompetencies[i];
        
        const { error: subInsertError } = await supabase
          .from('sub_competencies')
          .insert({
            competency_id: insertedComp.id,
            statement: sub.statement,
            action_cue: sub.action_cue,
            game_mechanic: sub.game_mechanic,
            validator_type: sub.validator_type,
            game_loop: sub.game_loop,
            display_order: i + 1
          });

        if (subInsertError) {
          console.error(`Error inserting sub-competency:`, subInsertError);
          throw new Error(`Failed to insert sub-competency: ${subInsertError.message}`);
        }

        totalSubCompetencies++;
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🎉 V5 MASTER SYNC COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Competencies inserted: ${totalCompetencies}`);
    console.log(`📋 Sub-competencies inserted: ${totalSubCompetencies}`);
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('Competencies now in database:');
    insertedCompetencies.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'V5 Master Framework Sync Complete',
        stats: {
          competencies_inserted: totalCompetencies,
          sub_competencies_inserted: totalSubCompetencies,
          competency_names: insertedCompetencies
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ V5 Sync Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during V5 sync'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
