import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayCircle, CheckCircle, XCircle, AlertCircle, Bot, Upload, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { ValidatorTestWizard } from '@/components/platform/ValidatorTestWizard';

interface Template {
  id: string;
  name: string;
  template_type: string; // Changed from strict union to string
  selected_sub_competencies: string[];
  is_published: boolean;
}

interface SubCompetency {
  id: string;
  statement: string;
  action_cue: string;
}

interface TestResult {
  id: string;
  template_id: string;
  overall_status: string;
  phase1_status: string;
  phase2_status: string;
  phase3_status: string;
  approved_for_publish: boolean;
  tested_at: string;
}

export default function ValidatorTest() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<Map<string, SubCompetency>>(new Map());
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'ai_generated' | 'custom_upload'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'not_started' | 'in_progress' | 'passed' | 'failed'>('all');
  const [testingTemplate, setTestingTemplate] = useState<Template | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    // TEMP: Check if user is creator (in demo mode, check URL path)
    // In production, this will check the actual user role from database
    if (window.location.pathname.includes('brand')) {
      toast.error('Access denied: Only creators can test validators');
      navigate('/platform/brand');
      return;
    }

    /* ORIGINAL CODE - Re-enable after demo:
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'creator') {
      toast.error('Access denied: Only creators can test validators');
      navigate('/platform/brand');
      return;
    }
    */

    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user's templates
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: templatesData, error: templatesError } = await supabase
        .from('game_templates')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      // Fetch all sub-competencies
      const { data: subComps, error: subError } = await supabase
        .from('sub_competencies')
        .select('id, statement, action_cue');

      if (subError) throw subError;

      const subMap = new Map(subComps?.map(s => [s.id, s]) || []);
      setSubCompetencies(subMap);

      // Fetch test results
      const { data: results, error: resultsError } = await supabase
        .from('validator_test_results')
        .select('*')
        .order('tested_at', { ascending: false });

      if (resultsError) throw resultsError;

      const resultsMap = new Map(results?.map(r => [r.template_id, r]) || []);
      setTestResults(resultsMap);

      setTemplates(templatesData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      not_started: { icon: AlertCircle, color: 'bg-muted text-muted-foreground', label: 'Not Tested' },
      in_progress: { icon: PlayCircle, color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400', label: 'In Progress' },
      passed: { icon: CheckCircle, color: 'bg-green-500/20 text-green-600 dark:text-green-400', label: 'Passed' },
      failed: { icon: XCircle, color: 'bg-red-500/20 text-red-600 dark:text-red-400', label: 'Failed' },
      needs_review: { icon: AlertCircle, color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400', label: 'Needs Review' },
    };

    const { icon: Icon, color, label } = variants[status as keyof typeof variants] || variants.not_started;

    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getPhaseStatus = (testResult: TestResult | undefined) => {
    if (!testResult) return { p1: 'not_started', p2: 'not_started', p3: 'not_started' };
    return {
      p1: testResult.phase1_status,
      p2: testResult.phase2_status,
      p3: testResult.phase3_status,
    };
  };

  const startTest = (template: Template) => {
    setTestingTemplate(template);
    setWizardOpen(true);
  };

  const filteredTemplates = templates.filter(t => {
    const typeMatch = filterType === 'all' || t.template_type === filterType;
    const statusMatch = filterStatus === 'all' || 
      (testResults.get(t.id)?.overall_status || 'not_started') === filterStatus;
    return typeMatch && statusMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Validator Testing Dashboard</h1>
            <p className="text-muted-foreground">
              Stress test all validators before publishing • Ensure quality and C-BEN compliance
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open('/platform/testing-guide', '_blank')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Testing Guide
          </Button>
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Template Type</label>
              <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ai_generated">🤖 AI Generated</SelectItem>
                  <SelectItem value="custom_upload">📤 Custom Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Test Status</label>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not_started">Not Tested</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Validators', value: templates.length, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Not Tested', value: templates.filter(t => !testResults.has(t.id)).length, color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Passed', value: Array.from(testResults.values()).filter(r => r.overall_status === 'passed').length, color: 'text-green-600 dark:text-green-400' },
            { label: 'Failed', value: Array.from(testResults.values()).filter(r => r.overall_status === 'failed').length, color: 'text-red-600 dark:text-red-400' },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Templates List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading validators...</p>
          ) : filteredTemplates.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="pt-6 text-center text-muted-foreground">
                No validators found. Create a validator template first.
              </CardContent>
            </Card>
          ) : (
            filteredTemplates.map((template) => {
              const testResult = testResults.get(template.id);
              const phases = getPhaseStatus(testResult);
              const subComp = template.selected_sub_competencies[0] 
                ? subCompetencies.get(template.selected_sub_competencies[0])
                : null;

              return (
                <Card key={template.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {template.template_type === 'ai_generated' ? (
                            <Bot className="w-5 h-5 text-purple-500" />
                          ) : (
                            <Upload className="w-5 h-5 text-blue-500" />
                          )}
                          <CardTitle className="text-foreground">{template.name}</CardTitle>
                        </div>
                        {subComp && (
                          <CardDescription>
                            Sub: {subComp.statement}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(testResult?.overall_status || 'not_started')}
                        {template.is_published && (
                          <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                            Published
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Phase Progress */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Phase 1: UX Flow</p>
                          {getStatusBadge(phases.p1)}
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Phase 2: Action Cue</p>
                          {getStatusBadge(phases.p2)}
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Phase 3: Scoring</p>
                          {getStatusBadge(phases.p3)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startTest(template)}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {testResult ? 'Re-test' : 'Start Test'}
                        </Button>
                        {testResult && (
                          <Button 
                            variant="outline" 
                            onClick={() => startTest(template)}
                          >
                            View Results
                          </Button>
                        )}
                        {testResult?.overall_status === 'passed' && !testResult.approved_for_publish && (
                          <Button variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                            Approve for Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Test Wizard */}
        {testingTemplate && (
          <ValidatorTestWizard
            open={wizardOpen}
            onOpenChange={setWizardOpen}
            template={testingTemplate}
            subCompetency={
              testingTemplate.selected_sub_competencies[0]
                ? subCompetencies.get(testingTemplate.selected_sub_competencies[0]) || null
                : null
            }
            onComplete={fetchData}
          />
        )}
    </div>
  );
}
