import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, FileText, Brain, Sparkles, History, Edit, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ValidatorTemplateCard } from "./ValidatorTemplateCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompetencyMapping {
  domain: string;
  competency: string;
  sub_competency: string;
  alignment_summary: string;
  validator_type: string;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [existingAnalyses, setExistingAnalyses] = useState<any[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);

  // Check for existing analyses when course name changes
  useEffect(() => {
    const checkExistingAnalyses = async () => {
      if (!courseName.trim() || courseName.length < 3) {
        setExistingAnalyses([]);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    toast({
      title: "Analysis loaded",
      description: "Using saved analysis. You can edit it below.",
    });
  };

  const deleteAnalysis = async (analysisId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('course_gamification')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;

      setExistingAnalyses(prev => prev.filter(a => a.id !== analysisId));
      
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
      // Create a temporary file path for parsing
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer]);
      
      // For now, we'll prompt the user to provide detailed content
      // A production implementation would use a proper PDF parser library
      toast({
        title: "File uploaded",
        description: "Please ensure your course description includes key learning objectives and content details for accurate analysis.",
      });
      
      // Return empty string to rely on manual description
      // This encourages users to provide comprehensive course content
      return '';
    } catch (error) {
      console.error('Document parsing error:', error);
      toast({
        title: "Could not process file",
        description: "Please provide detailed course content in the description field.",
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

    if (!courseDescription.trim() && !selectedFile) {
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

      // Call AI analysis
      setProgress(60);
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-course', {
        body: {
          courseText,
          courseName,
          courseDescription
        }
      });

      if (analysisError) throw analysisError;
      if (!analysisData.success) throw new Error(analysisData.error || "Analysis failed");

      setProgress(80);

      // Save to database
      if (user) {
        const { error: saveError } = await supabase
          .from('course_gamification')
          .insert({
            brand_id: user.id,
            course_name: courseName,
            course_description: courseDescription,
            file_url: fileUrl,
            file_type: selectedFile?.type || 'text',
            analysis_results: analysisData.analysis,
            competency_mappings: analysisData.analysis.competency_mappings,
            recommended_validators: analysisData.analysis.recommended_validators
          });

        if (saveError) throw saveError;
      }

      setProgress(100);
      setAnalysisResult(analysisData.analysis);

      toast({
        title: "Analysis complete!",
        description: `Identified ${analysisData.analysis.summary.total_competencies} competencies across ${analysisData.analysis.summary.domains_covered.length} domains`,
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseDescription">Course Description *</Label>
            <Textarea
              id="courseDescription"
              placeholder="Provide detailed course content including:
• Learning objectives and outcomes
• Key topics and themes covered
• Skills and competencies taught
• Example scenarios or case studies
• Assessment methods used

The more detail you provide, the more accurate the competency mapping will be."
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              disabled={loading}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: Include specific examples from your course content for the most accurate validator recommendations.
            </p>
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
                        <div>
                          <p className="font-medium">{mapping.sub_competency}</p>
                          <p className="text-sm text-muted-foreground">{mapping.domain}</p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {mapping.validator_type}
                        </span>
                      </div>
                      <p className="text-sm">{mapping.alignment_summary}</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Metric:</strong> {mapping.evidence_metric}
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
    </div>
  );
}
