import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Brain, PlayCircle, Store, Play, FileText, Zap } from "lucide-react";
import { MobileViewport } from "@/components/MobileViewport";
import { useNavigate } from "react-router-dom";

export default function DemoGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [competencyMappings, setCompetencyMappings] = useState<any>(null);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Form fields
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [learningObjectives, setLearningObjectives] = useState<string[]>([""]);
  const [targetAudience, setTargetAudience] = useState("");
  const [keyTopics, setKeyTopics] = useState<string[]>([""]);
  const [courseDuration, setCourseDuration] = useState("4");
  const [prerequisites, setPrerequisites] = useState("");
  const [industry, setIndustry] = useState("");
  
  // Brand profile data loaded from database
  const [brandProfile, setBrandProfile] = useState<{
    company_logo_url?: string;
    game_avatar_url?: string;
    primary_color?: string;
    secondary_color?: string;
    company_name?: string;
  } | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadBrandProfile();
    ensureDemoTemplateUploaded();
  }, []);

  const ensureDemoTemplateUploaded = async () => {
    try {
      console.log('Checking for demo template in storage...');
      
      // Check if demo template exists in storage
      const { data: files, error: listError } = await supabase
        .storage
        .from('custom-games')
        .list('', {
          search: 'demo-crisis-template.html'
        });

      if (listError) {
        console.error('Error listing files:', listError);
        toast({
          title: "Storage Error",
          description: listError.message,
          variant: "destructive",
        });
        return;
      }

      if (!files || files.length === 0) {
        console.log('Demo template not found in storage, uploading...');
        
        // Fetch the demo HTML from the public directory
        const response = await fetch('/demo/demo-crisis-communication.html');
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.status}`);
        }
        
        const htmlContent = await response.text();
        console.log(`Fetched template, size: ${htmlContent.length} bytes`);
        
        // Upload to Supabase storage
        const { error: uploadError } = await supabase
          .storage
          .from('custom-games')
          .upload('demo-crisis-template.html', new Blob([htmlContent], { type: 'text/html' }), {
            contentType: 'text/html',
            upsert: true
          });

        if (uploadError) {
          console.error('Failed to upload demo template:', uploadError);
          toast({
            title: "Upload Failed",
            description: uploadError.message,
            variant: "destructive",
          });
        } else {
          console.log('Demo template uploaded successfully');
          toast({
            title: "Template Ready",
            description: "Demo template is now available",
          });
        }
      } else {
        console.log('Demo template already exists in storage');
      }
    } catch (error) {
      console.error('Error ensuring demo template:', error);
      toast({
        title: "Template Error",
        description: error instanceof Error ? error.message : "Failed to prepare template",
        variant: "destructive",
      });
    }
  };

  const loadBrandProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('company_logo_url, game_avatar_url, primary_color, secondary_color, company_name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setBrandProfile(data);
      }
    } catch (error) {
      console.error('Failed to load brand profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setExtractedData(null);
        setGameUrl(null);
        setHasGenerated(false);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const analyzeDocument = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please upload a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalyzing(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Pre-fill form with Microsoft onboarding demo data
      const microsoftDemoData = {
        courseName: "Welcoming New Employees to the Team",
        courseDescription: "A comprehensive onboarding program designed to help new employees integrate smoothly into Microsoft, covering essential paperwork, team introductions, workspace setup, and initial project assignments during their first week.",
        learningObjectives: [
          "Complete all required onboarding paperwork and documentation",
          "Meet and connect with team members and key stakeholders",
          "Set up workspace, technology, and access to necessary systems",
          "Understand initial project assignments and team workflows"
        ],
        targetAudience: "New hires joining Microsoft during their first week of employment",
        keyTopics: [
          "Paperwork and administrative tasks",
          "Team introductions and relationship building",
          "Workspace and technology setup",
          "Initial project orientation"
        ],
        estimatedDuration: "4",
        prerequisites: "None - designed for day one employees",
        industry: "tech"
      };

      setCourseName(microsoftDemoData.courseName);
      setCourseDescription(microsoftDemoData.courseDescription);
      setLearningObjectives(microsoftDemoData.learningObjectives);
      setTargetAudience(microsoftDemoData.targetAudience);
      setKeyTopics(microsoftDemoData.keyTopics);
      setCourseDuration(microsoftDemoData.estimatedDuration);
      setPrerequisites(microsoftDemoData.prerequisites);
      setIndustry(microsoftDemoData.industry);
      
      setExtractedData(microsoftDemoData);
      setShowReviewForm(true);
      setCompetencyMappings(null);
      setGameUrl(null);
      setHasGenerated(true);
      
      toast({
        title: "PDF extracted!",
        description: "Review the extracted information below and make any adjustments.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });
      setShowReviewForm(true);
    } finally {
      setLoading(false);
      setAnalyzing(false);
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

  const analyzeCompetencies = async () => {
    if (!extractedData) return;

    setLoading(true);
    setAnalyzing(true);

    try {
      // Simulate competency analysis by loading demo competencies
      await new Promise(resolve => setTimeout(resolve, 2500));

      const demoCompetencies = {
        competency_mappings: [
          {
            domain: "Professional Excellence & Initiative",
            competency: "Initiative",
            sub_competency: "Proactive Action Taking",
            alignment_summary: "The course emphasizes taking initiative in completing paperwork, accessing documents, and organizing onboarding tasks proactively on day one.",
            validator_type: "Task Completion Simulation",
            evidence_metric: "Tasks completed proactively and accurately"
          },
          {
            domain: "Collaboration & Teamwork",
            competency: "Team Connection",
            sub_competency: "Building Team Relationships",
            alignment_summary: "The onboarding process focuses on integrating new hires with colleagues, scheduling team meetings, and creating channels for connection.",
            validator_type: "Relationship Building Simulation",
            evidence_metric: "Quality of team interactions and connections established"
          },
          {
            domain: "Leadership & Development",
            competency: "Coaching & Mentorship",
            sub_competency: "Guiding and Supporting Others",
            alignment_summary: "The course covers planning training sessions, sharing training materials, and providing ongoing support to new employees.",
            validator_type: "Coaching Scenario Simulation",
            evidence_metric: "Quality of coaching and support provided"
          },
          {
            domain: "Communication & Reflection",
            competency: "Feedback & Reflection",
            sub_competency: "Providing and Receiving Feedback",
            alignment_summary: "The onboarding emphasizes frequent check-ins, discussing job progress, asking questions, and maintaining open communication channels.",
            validator_type: "Communication Simulation",
            evidence_metric: "Quality and frequency of feedback interactions"
          }
        ],
        summary: {
          total_competencies: 4,
          domains_covered: ["Professional Excellence & Initiative", "Collaboration & Teamwork", "Leadership & Development", "Communication & Reflection"]
        }
      };

      setCompetencyMappings(demoCompetencies);
      setHasGenerated(true);
      
      toast({
        title: "Competency Analysis Complete",
        description: `Identified ${demoCompetencies.summary.total_competencies} competencies across ${demoCompetencies.summary.domains_covered.length} domains`,
      });
    } catch (error) {
      console.error("Competency analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze competencies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const generateGame = async () => {
    if (!extractedData || !competencyMappings) return;

    setLoading(true);
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-crisis-demo", {
        body: {
          brandName: brandProfile?.company_name || extractedData.company_name || "Your Company",
          courseName: extractedData.course_name || "Leadership Training",
          courseDescription: extractedData.course_description || "",
          learningObjectives: extractedData.learning_objectives || [],
          primaryColor: brandProfile?.primary_color || '#0078D4',
          secondaryColor: brandProfile?.secondary_color || '#50E6FF',
          logoUrl: brandProfile?.company_logo_url || null,
          mascotUrl: brandProfile?.game_avatar_url || null,
        },
      });

      if (error) throw error;

      // Create a blob URL for the generated HTML
      const blob = new Blob([data.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setGameUrl(url);

      toast({
        title: "Game Generated!",
        description: "Your custom crisis communication game is ready",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };


  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--neon-green))' }}>
          Brand Dashboard
        </h2>
        <p className="text-gray-400">Manage your company profile and game experiences</p>
      </div>

      {/* Company Profile Section */}
      {!profileLoading && brandProfile && (
        <Card className="bg-[#1e293b] border-[#334155] p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Company Profile</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/platform/brand/profile-edit')}
            >
              Edit Profile
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Company Logo:</span>
              <span className="ml-2 text-white">
                {brandProfile.company_logo_url ? '✓ Set' : '✗ Not set'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Mascot:</span>
              <span className="ml-2 text-white">
                {brandProfile.game_avatar_url ? '✓ Set' : '✗ Not set'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Primary Color:</span>
              {brandProfile.primary_color && (
                <span 
                  className="ml-2 inline-block w-6 h-6 rounded border border-gray-600 align-middle"
                  style={{ backgroundColor: brandProfile.primary_color }}
                />
              )}
            </div>
            <div>
              <span className="text-gray-400">Secondary Color:</span>
              {brandProfile.secondary_color && (
                <span 
                  className="ml-2 inline-block w-6 h-6 rounded border border-gray-600 align-middle"
                  style={{ backgroundColor: brandProfile.secondary_color }}
                />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Course Information Card */}
      <Card className="bg-[#1e293b] border-[#334155] mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-xl">
            <Brain className="w-5 h-5" style={{ color: 'hsl(var(--neon-green))' }} />
            Course
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Upload your training course or lesson content to create a custom branded game demo
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseName" className="text-white">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="e.g., Power of Words®"
                value={courseName || file?.name.replace('.pdf', '') || ''}
                onChange={(e) => setCourseName(e.target.value)}
                disabled={loading}
                className="bg-black border-neon-green text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseFile" className="text-white">Upload Course File (PDF or DOCX)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="courseFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="cursor-pointer bg-black border-neon-green text-white file:text-neon-green"
                />
                {file && !extractedData && (
                  <Button
                    onClick={analyzeDocument}
                    disabled={analyzing}
                    className="bg-neon-purple text-white hover:bg-neon-purple/90"
                    size="sm"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Extract & Prefill
                      </>
                    )}
                  </Button>
                )}
              </div>
              {file && (
                <p className="text-xs text-gray-400">
                  {extractedData 
                    ? "✓ Content extracted - review details below" 
                    : "Click 'Extract & Prefill' to automatically analyze your document"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseDescription" className="text-white">Course Description</Label>
              <Textarea
                id="courseDescription"
                placeholder="Additional course details or context..."
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                disabled={loading}
                className="bg-black border-neon-green text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </div>
            
            {/* Review Form - shows after extraction */}
            {showReviewForm && (
              <>
                <div className="space-y-2">
                  <Label className="text-white">Learning Objectives *</Label>
                  {learningObjectives.map((obj, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Learning objective ${index + 1}`}
                        value={obj}
                        onChange={(e) => updateArrayItem(setLearningObjectives, index, e.target.value)}
                        className="bg-black border-neon-green text-white placeholder:text-gray-500"
                      />
                      {learningObjectives.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem(setLearningObjectives, index)}
                          className="border-gray-700 text-gray-400 hover:text-white"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(setLearningObjectives)}
                    className="border-neon-green text-neon-green hover:bg-neon-green/10"
                  >
                    + Add Objective
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-white">Target Audience *</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., New employees, Managers, All staff"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="bg-black border-neon-green text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Key Topics</Label>
                  {keyTopics.map((topic, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Key topic ${index + 1}`}
                        value={topic}
                        onChange={(e) => updateArrayItem(setKeyTopics, index, e.target.value)}
                        className="bg-black border-neon-green text-white placeholder:text-gray-500"
                      />
                      {keyTopics.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem(setKeyTopics, index)}
                          className="border-gray-700 text-gray-400 hover:text-white"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(setKeyTopics)}
                    className="border-neon-green text-neon-green hover:bg-neon-green/10"
                  >
                    + Add Topic
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-white">Industry / Context *</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="industry" className="bg-black border-neon-green text-white">
                      <SelectValue placeholder="Select industry or context..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-neon-green text-white">
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="communications">Communications</SelectItem>
                      <SelectItem value="customer-service">Customer Service</SelectItem>
                      <SelectItem value="tech">Technology / IT</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="school">School / K-12 Education</SelectItem>
                      <SelectItem value="higher-ed">Higher Education / University</SelectItem>
                      <SelectItem value="corporate">Corporate Training</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="supply-chain">Supply Chain</SelectItem>
                      <SelectItem value="nonprofit">Non-Profit / NGO</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="3"
                    max="6"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    className="bg-black border-neon-green text-white"
                  />
                  <p className="text-xs text-gray-400">Duration must be between 3-6 minutes</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites" className="text-white">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    placeholder="Any prerequisites or prior knowledge required..."
                    value={prerequisites}
                    onChange={(e) => setPrerequisites(e.target.value)}
                    className="bg-black border-neon-green text-white placeholder:text-gray-500"
                  />
                </div>
              </>
            )}
        </CardContent>
      </Card>

      {/* Three Column Grid - Actions */}
      {!profileLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Gamifier */}
          <Card className="p-6 bg-[#1e293b] border-[#334155]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neon-green/10 rounded-lg">
                  <Play className="w-6 h-6" style={{ color: 'hsl(var(--neon-green))' }} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active Gamifier</p>
                  <p className="text-2xl font-bold text-white">{file ? '1' : '0'}</p>
                </div>
              </div>
              {file && !extractedData && (
                <Button
                  onClick={analyzeDocument}
                  disabled={analyzing}
                  className="w-full bg-neon-green text-slate-900 hover:bg-neon-green/90"
                  size="sm"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* In Progress */}
          <Card className="p-6 bg-[#1e293b] border-[#334155]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neon-purple/10 rounded-lg">
                  <Loader2 className="w-6 h-6" style={{ color: 'hsl(var(--neon-purple))' }} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-white">{competencyMappings ? '1' : '0'}</p>
                </div>
              </div>
              {extractedData && competencyMappings && !gameUrl && (
                <Button
                  onClick={generateGame}
                  disabled={generating}
                  className="w-full bg-neon-purple text-white hover:bg-neon-purple/90"
                  size="sm"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Marketplace */}
          <Card className="p-6 bg-[#1e293b] border-[#334155]">
            <button
              onClick={() => navigate('/platform/marketplace')}
              className="w-full text-left flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Store className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Marketplace</p>
                  <p className="text-white font-semibold">Browse Games</p>
                </div>
              </div>
            </button>
          </Card>
        </div>
      )}

      {/* Review and Analyze Button */}
      {showReviewForm && !competencyMappings && (
        <Card className="bg-[#1e293b] border-[#334155] mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center border border-neon-purple/30 bg-neon-purple/10">
                <Brain className="h-5 w-5 text-neon-purple" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">
                  Ready to Analyze
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Review the extracted information above and click below to analyze competencies
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={analyzeCompetencies}
              disabled={loading || !courseName || learningObjectives.filter(o => o.trim()).length === 0 || !targetAudience || !industry}
              className="w-full bg-neon-purple text-white hover:bg-neon-purple/90"
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Competencies...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Analyze Competencies & Validators
                </>
              )}
            </Button>
            {(!courseName || learningObjectives.filter(o => o.trim()).length === 0 || !targetAudience || !industry) && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please fill in all required fields (marked with *)
              </p>
            )}
          </CardContent>
        </Card>
      )}

        {/* Competency Mappings */}
        {competencyMappings && hasGenerated && (
          <Card className="bg-[#1e293b] border-[#334155] mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center border border-neon-purple/30 bg-neon-purple/10">
                  <Brain className="h-5 w-5 text-neon-purple" />
                </div>
                <div>
                  <CardTitle className="text-xl text-neon-purple">
                    Competency Analysis Complete
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {competencyMappings.summary.total_competencies} competencies mapped across {competencyMappings.summary.domains_covered.length} domains
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {competencyMappings.competency_mappings.map((mapping: any, idx: number) => (
                <div key={idx} className="bg-black/40 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-neon-green font-semibold">{mapping.sub_competency}</h4>
                      <p className="text-sm text-gray-400">{mapping.domain} • {mapping.competency}</p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full border border-neon-purple/30">
                      {mapping.validator_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{mapping.alignment_summary}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Evidence:</strong> {mapping.evidence_metric}
                  </p>
                </div>
              ))}

              {!gameUrl && (
                <Button
                  onClick={generateGame}
                  disabled={loading}
                  className="w-full bg-neon-green text-black hover:bg-neon-green/90"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Custom Game...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Crisis Communication Game
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Preview */}
        {gameUrl && (
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center border border-neon-green/30 bg-neon-green/10">
                  <Sparkles className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <CardTitle className="text-xl text-neon-green">
                    Game Ready!
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your custom validator game has been generated
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <MobileViewport>
                  <iframe
                    src={gameUrl}
                    className="w-full h-full"
                    title="Generated Game Preview"
                  />
                </MobileViewport>
              </div>

              <Button
                onClick={() => window.open(gameUrl, "_blank")}
                variant="outline"
                className="w-full border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                size="lg"
              >
                Open in New Tab
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
