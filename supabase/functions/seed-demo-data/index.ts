import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Seeding demo data for user:', user.id);

    // Check if data already exists
    const { data: existingCustomizations } = await supabase
      .from('brand_customizations')
      .select('id')
      .eq('brand_id', user.id)
      .limit(1);

    if (existingCustomizations && existingCustomizations.length > 0) {
      console.log('User already has customizations, skipping seed');
      return new Response(
        JSON.stringify({ message: 'Demo data already exists', alreadySeeded: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Update profile with NexaCorp data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        company_name: 'NexaCorp',
        company_description: 'Global leader in digital transformation and workforce development solutions. Empowering enterprises to build future-ready teams through innovative learning technology.',
        full_name: 'NexaCorp Demo',
        design_palette: {
          font: 'Inter, sans-serif',
          text: '#1a1a1a',
          accent: '#0078D4',
          primary: '#0078D4',
          highlight: '#50E6FF',
          secondary: '#005A9E',
          background: '#FFFFFF'
        }
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // 2. Get a published template to use
    const { data: templates } = await supabase
      .from('game_templates')
      .select('id')
      .eq('is_published', true)
      .limit(3);

    if (!templates || templates.length === 0) {
      console.log('No published templates found');
    }

    // 3. Create brand customizations
    const customizations = [];
    
    // Published customization 1 - Crisis Communication
    if (templates && templates[0]) {
      const code1 = Math.random().toString(36).substring(2, 8).toUpperCase();
      customizations.push({
        brand_id: user.id,
        template_id: templates[0].id,
        primary_color: '#0078D4',
        secondary_color: '#005A9E',
        accent_color: '#50E6FF',
        background_color: '#FFFFFF',
        text_color: '#1a1a1a',
        highlight_color: '#50E6FF',
        font_family: 'Inter, sans-serif',
        unique_code: code1,
        published_at: new Date().toISOString(),
        visibility: 'public',
        custom_config: {
          brandName: 'NexaCorp',
          gameName: 'Crisis Leadership Challenge'
        }
      });
    }

    // Published customization 2 - Budget Allocation
    if (templates && templates[1]) {
      const code2 = Math.random().toString(36).substring(2, 8).toUpperCase();
      customizations.push({
        brand_id: user.id,
        template_id: templates[1].id,
        primary_color: '#0078D4',
        secondary_color: '#005A9E',
        accent_color: '#50E6FF',
        background_color: '#FFFFFF',
        text_color: '#1a1a1a',
        highlight_color: '#50E6FF',
        font_family: 'Inter, sans-serif',
        unique_code: code2,
        published_at: new Date().toISOString(),
        visibility: 'public',
        custom_config: {
          brandName: 'NexaCorp',
          gameName: 'Strategic Resource Planning'
        }
      });
    }

    // Draft customization - in progress
    if (templates && templates[2]) {
      customizations.push({
        brand_id: user.id,
        template_id: templates[2].id,
        primary_color: '#0078D4',
        secondary_color: '#005A9E',
        accent_color: '#50E6FF',
        background_color: '#FFFFFF',
        text_color: '#1a1a1a',
        highlight_color: '#50E6FF',
        font_family: 'Inter, sans-serif',
        visibility: 'draft',
        custom_config: {
          brandName: 'NexaCorp',
          gameName: 'Data Analytics Assessment'
        }
      });
    }

    if (customizations.length > 0) {
      const { error: customError } = await supabase
        .from('brand_customizations')
        .insert(customizations);

      if (customError) {
        console.error('Customization error:', customError);
      }
    }

    // 4. Create sample course gamification data
    const { error: courseError } = await supabase
      .from('course_gamification')
      .insert([
        {
          brand_id: user.id,
          course_name: 'Microsoft New Employee Onboarding',
          course_description: 'Comprehensive onboarding program for new Microsoft employees',
          industry: 'Technology',
          file_type: 'pdf',
          analysis_results: {
            topics: ['System Training', 'Team Integration', 'Ongoing Support', 'Performance Feedback'],
            duration: '4 weeks',
            skillLevel: 'Beginner'
          },
          competency_mappings: [
            {
              domain: '5. Onboarding & Integration',
              action_cue: 'Demonstrate proactive behavior in learning new systems',
              competency: 'INITIATIVE',
              game_mechanic: 'Task Completion Tracker',
              sub_competency: 'Takes proactive steps to learn new systems and processes',
              validator_type: 'N/A',
              evidence_metric: 'Completion rate of assigned training modules and system setup tasks.',
              scoring_formula: 'N/A',
              alignment_summary: 'The course content emphasizes training and learning new systems, directly aligning with the need for new employees to proactively engage with these learning opportunities.'
            },
            {
              domain: '5. Onboarding & Integration',
              action_cue: 'Show initiative in seeking information',
              competency: 'INITIATIVE',
              game_mechanic: 'Resource Discovery Challenge',
              sub_competency: 'Seeks out resources and information independently',
              validator_type: 'N/A',
              evidence_metric: 'Successful navigation and utilization of internal knowledge bases, FAQs, and support channels.',
              scoring_formula: 'N/A',
              alignment_summary: 'The ongoing support aspect of the course implies that new employees will need to independently seek out resources and information as they encounter challenges or need further guidance.'
            },
            {
              domain: '5. Onboarding & Integration',
              action_cue: 'Engage with team members during onboarding',
              competency: 'TEAM CONNECTION',
              game_mechanic: 'Relationship Building Network',
              sub_competency: 'Actively engages with team members and builds relationships',
              validator_type: 'N/A',
              evidence_metric: 'Participation in team introductions, informal meetings, and collaborative tasks.',
              scoring_formula: 'N/A',
              alignment_summary: 'The course explicitly mentions team integration, indicating a focus on new employees actively connecting with their colleagues and establishing working relationships.'
            },
            {
              domain: '5. Onboarding & Integration',
              action_cue: 'Seek guidance when needed',
              competency: 'COACHING & MENTORSHIP',
              game_mechanic: 'Mentor Connection Flow',
              sub_competency: 'Seeks guidance from mentors and managers when needed',
              validator_type: 'N/A',
              evidence_metric: 'Documented instances of seeking advice or clarification from assigned mentors or managers.',
              scoring_formula: 'N/A',
              alignment_summary: 'The ongoing support element also suggests that new employees will be encouraged to leverage available mentorship and management guidance for their development and problem-solving.'
            },
            {
              domain: '5. Onboarding & Integration',
              action_cue: 'Provide and receive constructive feedback',
              competency: 'FEEDBACK & REFLECTION',
              game_mechanic: 'Feedback Loop Tracker',
              sub_competency: 'Actively participates in feedback exchanges',
              validator_type: 'N/A',
              evidence_metric: 'Frequency and quality of feedback given and received during onboarding check-ins and peer reviews.',
              scoring_formula: 'N/A',
              alignment_summary: 'The performance feedback component of onboarding requires new employees to engage in regular reflection on their progress and actively participate in feedback sessions.'
            },
            {
              domain: '5. Onboarding & Integration',
              action_cue: 'Reflect on learning and adapt approach',
              competency: 'FEEDBACK & REFLECTION',
              game_mechanic: 'Self-Assessment Journal',
              sub_competency: 'Regularly reflects on performance and adjusts behavior',
              validator_type: 'N/A',
              evidence_metric: 'Completion of self-reflection exercises and documented adjustments to learning strategies.',
              scoring_formula: 'N/A',
              alignment_summary: 'The course structure encourages continuous reflection and adaptation as employees learn new systems and integrate into the team culture.'
            }
          ],
          recommended_validators: [
            { name: 'Task Completion Tracker', type: 'activity-based' },
            { name: 'Relationship Building Network', type: 'social-interaction' },
            { name: 'Mentor Connection Flow', type: 'guidance-seeking' },
            { name: 'Feedback Loop Tracker', type: 'communication-based' }
          ]
        },
        {
          brand_id: user.id,
          course_name: 'Data Analytics Fundamentals',
          course_description: 'Introduction to business intelligence and data-driven decision making',
          industry: 'Technology',
          analysis_results: {
            topics: ['Data Visualization', 'Pattern Recognition', 'Statistical Analysis'],
            duration: '4 weeks',
            skillLevel: 'Beginner'
          },
          recommended_validators: [
            { name: 'Data Pattern Detective', type: 'analytical' }
          ]
        }
      ]);

    if (courseError) {
      console.error('Course gamification error:', courseError);
    }

    console.log('Demo data seeded successfully for user:', user.id);

    return new Response(
      JSON.stringify({ 
        message: 'Demo data seeded successfully',
        customizations: customizations.length,
        courses: 2
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding demo data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
