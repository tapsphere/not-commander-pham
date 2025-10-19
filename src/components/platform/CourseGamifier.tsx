import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, FileText, Brain, Sparkles, History, Edit, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ValidatorTemplateCard } from "./ValidatorTemplateCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BrandGameGenerator } from "./BrandGameGenerator";

interface CompetencyMapping {
  domain: string;
  competency: string;
  sub_competency: string;
  alignment_summary: string;
  validator_type: string;
  action_cue?: string;
  game_mechanic?: string;
  evidence_metric: string;
  scoring_formula: string;
}

interface AnalysisResult {
  course_analysis: {
    summary: string;
    key_outcomes: string[];
  };
  competency_mappings: CompetencyMapping[];
  recommended_validators: Array<{
    validator_name: string;
    competencies_tested: string[];
    priority: string;
    reason: string;
  }>;
  summary: {
    total_competencies: number;
    domains_covered: string[];
    implementation_note: string;
  };
}

export function CourseGamifier() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [learningObjectives, setLearningObjectives] = useState<string[]>([""]);
  const [targetAudience, setTargetAudience] = useState("");
  const [keyTopics, setKeyTopics] = useState<string[]>([""]);
  const [assessmentMethods, setAssessmentMethods] = useState<string[]>([]);
  const [courseDuration, setCourseDuration] = useState("4");
  const [prerequisites, setPrerequisites] = useState("");
  const [industry, setIndustry] = useState(""); // Industry/Context field
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [existingAnalyses, setExistingAnalyses] = useState<any[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<CompetencyMapping | null>(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [brandId, setBrandId] = useState<string>('');

  // Check for existing analyses when course name changes
  useEffect(() => {
    const checkExistingAnalyses = async () => {
      if (!courseName.trim() || courseName.length < 3) {
        setExistingAnalyses([]);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setBrandId(user.id);

      const { data, error } = await supabase
        .from('course_gamification')
        .select('*')
        .eq('brand_id', user.id)
        .ilike('course_name', `%${courseName}%`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setExistingAnalyses(data);
      }
    };

    const debounce = setTimeout(checkExistingAnalyses, 500);
    return () => clearTimeout(debounce);
  }, [courseName]);

  const loadExistingAnalysis = (analysis: any) => {
    setSelectedAnalysisId(analysis.id);
    setAnalysisResult(analysis.analysis_results);
    setCourseDescription(analysis.course_description || "");
    setIndustry(analysis.industry || "");
    toast({
      title: "Analysis loaded",
      description: "Using saved analysis. You can edit it below.",
    });
  };

  const deleteAnalysis = async (analysisId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to delete analyses",
          variant: "destructive",
        });
        return;
      }

      console.log('Deleting analysis:', analysisId, 'for user:', user.id);

      const { error, count } = await supabase
        .from('course_gamification')
        .delete({ count: 'exact' })
        .eq('id', analysisId)
        .eq('brand_id', user.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Delete successful, rows affected:', count);

      // Update local state immediately
      setExistingAnalyses(prev => {
        const filtered = prev.filter(a => a.id !== analysisId);
        console.log('Remaining analyses:', filtered.length);
        return filtered;
      });
      
      if (selectedAnalysisId === analysisId) {
        setSelectedAnalysisId(null);
        setAnalysisResult(null);
      }

      toast({
        title: "Analysis deleted",
        description: "The saved analysis has been removed.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete analysis",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const extractAndPrefillFromPDF = async () => {
    if (!selectedFile) return;

    try {
      setExtracting(true);
      setProgress(20);

      // Extract text from PDF
      const extractedText = await extractTextFromFile(selectedFile);
      
      if (!extractedText) {
        toast({
          title: "Extraction failed",
          description: "Could not extract text from PDF. Please fill in manually.",
          variant: "destructive",
        });
        setShowReviewForm(true);
        return;
      }

      setProgress(50);

      // Use AI to extract structured data from the text
      const { data, error } = await supabase.functions.invoke('analyze-course', {
        body: {
          courseText: extractedText,
          courseName: courseName || "Untitled Course",
          courseDescription: "Extract structured course information",
          extractMode: true
        }
      });

      if (error) throw error;

      setProgress(80);

      // Pre-fill form fields with extracted data
      if (data.extractedInfo) {
        setCourseName(data.extractedInfo.courseName || courseName);
        setCourseDescription(data.extractedInfo.courseDescription || "");
        setLearningObjectives(data.extractedInfo.learningObjectives || [""]);
        setTargetAudience(data.extractedInfo.targetAudience || "");
        setKeyTopics(data.extractedInfo.keyTopics || [""]);
        setAssessmentMethods(data.extractedInfo.assessmentMethods || []);
        setCourseDuration(data.extractedInfo.estimatedDuration || "4");
        setPrerequisites(data.extractedInfo.prerequisites || "");
        setExtractedData(data.extractedInfo);
      }

      setProgress(100);
      setShowReviewForm(true);

      toast({
        title: "PDF extracted!",
        description: "Review the extracted information below and make any adjustments.",
      });

    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction failed",
        description: "Please fill in the course details manually.",
        variant: "destructive",
      });
      setShowReviewForm(true);
    } finally {
      setExtracting(false);
    }
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ""]);
  };

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      console.log('Extracting text from:', file.name, file.type);
      
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Call parse-document edge function
      const { data, error } = await supabase.functions.invoke('parse-document', {
        body: formData,
      });
      
      if (error) {
        console.error('Parse document error:', error);
        throw error;
      }
      
      console.log('Extracted content length:', data?.content?.length);
      
      if (!data?.content) {
        throw new Error('No content extracted from document');
      }
      
      return data.content;
    } catch (error) {
      console.error('Document parsing error:', error);
      toast({
        title: "Could not extract text",
        description: "The PDF parser had trouble reading your file. You can still fill in the details manually.",
        variant: "destructive",
      });
      return '';
    }
  };

  const handleAnalyze = async () => {
    if (!courseName.trim()) {
      toast({
        title: "Course name required",
        description: "Please enter a course name",
        variant: "destructive",
      });
      return;
    }

    if (showReviewForm) {
      // Validate review form fields
      if (learningObjectives.filter(o => o.trim()).length === 0) {
        toast({
          title: "Learning objectives required",
          description: "Please add at least one learning objective",
          variant: "destructive",
        });
        return;
      }
      if (!targetAudience.trim()) {
        toast({
          title: "Target audience required",
          description: "Please specify the target audience",
          variant: "destructive",
        });
        return;
      }
      if (!industry.trim()) {
        toast({
          title: "Industry/Context required",
          description: "Please select an industry or context",
          variant: "destructive",
        });
        return;
      }
      // Note: Assessment methods no longer required here - they're auto-determined from sub-competency matching
      const durationNum = parseInt(courseDuration);
      if (isNaN(durationNum) || durationNum < 3 || durationNum > 6) {
        toast({
          title: "Invalid duration",
          description: "Duration must be between 3-6 minutes",
          variant: "destructive",
        });
        return;
      }
    } else if (!courseDescription.trim() && !selectedFile) {
      toast({
        title: "Course content required",
        description: "Please upload a file or provide a description",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setAnalyzing(true);
      setProgress(0);

      const { data: { user } } = await supabase.auth.getUser();
      
      let fileUrl = null;
      let courseText = courseDescription;

      // Upload and parse file if selected
      if (selectedFile && user) {
        setProgress(20);
        setUploading(true);
        
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-files')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('course-files')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrl;
        
        // Extract text from the file
        toast({
          title: "Extracting content",
          description: "Reading your course file...",
        });
        
        const extractedText = await extractTextFromFile(selectedFile);
        if (extractedText) {
          courseText = extractedText + '\n\n' + courseDescription;
        }
        
        setUploading(false);
        setProgress(40);
      }

      // Prepare enhanced course text with structured details
      if (showReviewForm) {
        const structuredInfo = `
COURSE NAME: ${courseName}

LEARNING OBJECTIVES:
${learningObjectives.filter(o => o.trim()).map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

TARGET AUDIENCE:
${targetAudience}

KEY TOPICS COVERED:
${keyTopics.filter(t => t.trim()).map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

ASSESSMENT METHODS:
${assessmentMethods.join(', ')}

ESTIMATED DURATION: ${courseDuration} minutes

PREREQUISITES:
${prerequisites || 'None specified'}

ADDITIONAL DESCRIPTION:
${courseDescription}
`;
        courseText = structuredInfo;
      }

      // Call AI analysis
      setProgress(60);
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-course', {
        body: {
          courseText,
          courseName,
          courseDescription: showReviewForm ? courseText : courseDescription
        }
      });

      if (analysisError) throw analysisError;
      if (!analysisData.success) throw new Error(analysisData.error || "Analysis failed");

      setProgress(80);

      // Save to database
      if (user) {
        // Auto-extract assessment methods from competency mappings
        const autoAssessmentMethods = Array.from(
          new Set(analysisData.analysis.competency_mappings.map((m: CompetencyMapping) => m.validator_type))
        );

        const { error: saveError } = await supabase
          .from('course_gamification')
          .insert({
            brand_id: user.id,
            course_name: courseName,
            course_description: courseDescription,
            file_url: fileUrl,
            file_type: selectedFile?.type || 'text',
            industry: industry || null,
            analysis_results: analysisData.analysis,
            competency_mappings: analysisData.analysis.competency_mappings,
            recommended_validators: analysisData.analysis.recommended_validators
          });

        if (saveError) throw saveError;
      }

      setProgress(100);
      setAnalysisResult(analysisData.analysis);

      // Auto-populate assessment methods from matched sub-competencies
      const autoMethods: string[] = Array.from(
        new Set(
          analysisData.analysis.competency_mappings
            .map((m: CompetencyMapping) => m.validator_type)
            .filter((v: string | undefined): v is string => !!v)
        )
      );
      setAssessmentMethods(autoMethods);

      toast({
        title: "Analysis complete!",
        description: `Identified ${analysisData.analysis.summary.total_competencies} competencies with ${autoMethods.length} validator types`,
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Course Gamifier
          </CardTitle>
          <CardDescription>
            Upload your training course or lesson content, and we'll map it to C-BEN competencies
            and recommend PlayOps validators for measurable skill assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name *</Label>
            <Input
              id="courseName"
              placeholder="e.g., Power of Words®"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseFile">Upload Course File (PDF or DOCX)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="courseFile"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                disabled={loading}
                className="cursor-pointer"
              />
              {selectedFile && (
                <Button
                  onClick={extractAndPrefillFromPDF}
                  disabled={extracting}
                  variant="secondary"
                  size="sm"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Extract & Prefill
                    </>
                  )}
                </Button>
              )}
            </div>
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                {showReviewForm 
                  ? "Review and edit the course details below, or use AI to extract and prefill from your PDF" 
                  : "Fill in the course details below, or click 'AI Extract & Prefill' to automatically extract from your PDF"}
              </p>
            )}
          </div>

          {(selectedFile || courseName) && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Course Details for Analysis
              </h3>

              <div className="space-y-2">
                <Label>Learning Objectives *</Label>
                {learningObjectives.map((obj, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={obj}
                      onChange={(e) => updateArrayItem(setLearningObjectives, idx, e.target.value)}
                      placeholder={`Objective ${idx + 1}`}
                    />
                    {learningObjectives.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(setLearningObjectives, idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(setLearningObjectives)}
                >
                  + Add Objective
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Who is this course designed for?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry / Context *</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry" className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select industry or context..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="school">School / K-12 Education</SelectItem>
                    <SelectItem value="higher-ed">Higher Education / University</SelectItem>
                    <SelectItem value="corporate">Corporate Training</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="tech">Technology / IT</SelectItem>
                    <SelectItem value="finance">Finance / Banking</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="nonprofit">Non-Profit / NGO</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Key Topics Covered *</Label>
                {keyTopics.map((topic, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={topic}
                      onChange={(e) => updateArrayItem(setKeyTopics, idx, e.target.value)}
                      placeholder={`Topic ${idx + 1}`}
                    />
                    {keyTopics.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(setKeyTopics, idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(setKeyTopics)}
                >
                  + Add Topic
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Assessment Methods (Validators)</Label>
                <Alert>
                  <AlertDescription className="text-xs">
                    ℹ️ Assessment methods are automatically determined from matched sub-competencies. They will appear after analysis.
                  </AlertDescription>
                </Alert>
                {assessmentMethods.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                    {assessmentMethods.map((method) => (
                      <span key={method} className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded border border-neon-green/30">
                        {method}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseDuration">Estimated Duration (minutes) *</Label>
                <Input
                  id="courseDuration"
                  type="number"
                  min="3"
                  max="6"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  placeholder="3-6 minutes"
                />
                <p className="text-xs text-muted-foreground">Duration must be between 3-6 minutes</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="What should learners know before taking this course?"
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="courseDescription">Course Description</Label>
            <Textarea
              id="courseDescription"
              placeholder="Additional course details or context..."
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              disabled={loading}
              rows={4}
            />
          </div>

          {loading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {uploading && "Uploading file..."}
                {analyzing && !uploading && "Analyzing course content with AI..."}
                {progress === 100 && "Saving results..."}
              </p>
            </div>
          )}

          {existingAnalyses.length > 0 && !analysisResult && (
            <Alert>
              <History className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Found {existingAnalyses.length} previous analysis for similar courses:</p>
                  <div className="space-y-2">
                    {existingAnalyses.slice(0, 3).map((analysis) => (
                      <div key={analysis.id} className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 justify-start"
                          onClick={() => loadExistingAnalysis(analysis)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {analysis.course_name} ({new Date(analysis.created_at).toLocaleDateString()})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteAnalysis(analysis.id, e)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {analysisResult ? "Generate New Analysis" : "Analyze Course"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>{analysisResult.course_analysis.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <div className="space-y-1 text-sm">
                <p>Total Sub-Competencies: {analysisResult.summary.total_competencies}</p>
                <p>Across {analysisResult.summary.domains_covered.length} C-BEN Domains: {analysisResult.summary.domains_covered.join(', ')}</p>
                <p className="text-muted-foreground">{analysisResult.summary.implementation_note}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Competency Mappings</h3>
              <div className="space-y-4">
                {analysisResult.competency_mappings.map((mapping, idx) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{mapping.sub_competency}</p>
                          <p className="text-sm text-muted-foreground">{mapping.domain}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">
                            {mapping.validator_type}
                          </span>
                          <Button
                            onClick={() => {
                              setSelectedMapping(mapping);
                              setGeneratorOpen(true);
                            }}
                            size="sm"
                            className="bg-neon-green text-white hover:bg-neon-green/90 whitespace-nowrap"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Auto-Generate
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{mapping.alignment_summary}</p>
                      {mapping.action_cue && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Action Cue:</strong> {mapping.action_cue}
                        </p>
                      )}
                      {mapping.game_mechanic && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Game Mechanic:</strong> {mapping.game_mechanic}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        <strong>Evidence Metric:</strong> {mapping.evidence_metric}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Recommended Validators</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These validator templates match your course competencies. Select one to customize for your learners.
              </p>
              <div className="grid gap-4">
                {analysisResult.recommended_validators.map((validator, idx) => (
                  <ValidatorTemplateCard
                    key={idx}
                    validator={validator}
                    courseName={courseName}
                    competencyMappings={analysisResult.competency_mappings.filter(
                      m => m.validator_type === validator.validator_name
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brand Game Generator Dialog */}
      {selectedMapping && (
        <BrandGameGenerator
          open={generatorOpen}
          onOpenChange={setGeneratorOpen}
          courseName={courseName}
          mapping={selectedMapping}
          brandId={brandId}
        />
      )}
    </div>
  );
}
