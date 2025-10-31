import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Download, Brain, PlayCircle, Upload, Palette } from "lucide-react";

export default function DemoGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [competencyMappings, setCompetencyMappings] = useState<any>(null);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [mascotFile, setMascotFile] = useState<File | null>(null);
  const [mascotPreview, setMascotPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#0078D4');
  const [secondaryColor, setSecondaryColor] = useState('#50E6FF');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setExtractedData(null);
        setGameUrl(null);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMascotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Mascot image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setMascotFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setMascotPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setLoading(true);
    setAnalyzing(true);

    try {
      // Simulate AI extraction by loading demo data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      const demoData = {
        company_name: "Microsoft Corporation",
        course_name: "New Employee Onboarding",
        course_description: "A comprehensive onboarding guide for new Microsoft employees covering paperwork, training, team integration, and ongoing support.",
        learning_objectives: [
          "Complete all necessary paperwork and documentation",
          "Understand Microsoft's culture, values, and team dynamics",
          "Successfully integrate with your team and manager",
          "Navigate training resources and development opportunities"
        ],
      };

      setExtractedData(demoData);
      setCompetencyMappings(null);
      setGameUrl(null);
      
      toast({
        title: "Analysis Complete",
        description: "Your content has been analyzed successfully",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
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
          brandName: extractedData.company_name || "Your Company",
          courseName: extractedData.course_name || "Leadership Training",
          courseDescription: extractedData.course_description || "",
          learningObjectives: extractedData.learning_objectives || [],
          primaryColor,
          secondaryColor,
          logoUrl: logoPreview || null,
          mascotUrl: mascotPreview || null,
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

  const downloadGame = () => {
    if (!gameUrl) return;
    const a = document.createElement("a");
    a.href = gameUrl;
    a.download = `${extractedData?.course_name || "game"}-crisis-demo.html`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-neon-green">
              <Brain className="w-5 h-5" />
              Course Gamifier
            </CardTitle>
            <CardDescription className="text-gray-400">
              Upload your training course or lesson content, and we'll map it to C-BEN competencies and recommend PlayOps validators for measurable skill assessment.
            </CardDescription>
          </div>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseName" className="text-white">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="e.g., Power of Words®"
                value={extractedData?.course_name || file?.name.replace('.pdf', '') || ''}
                onChange={(e) => setExtractedData(prev => prev ? { ...prev, course_name: e.target.value } : { course_name: e.target.value })}
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
                        AI Extract & Prefill
                      </>
                    )}
                  </Button>
                )}
              </div>
              {file && (
                <p className="text-xs text-gray-400">
                  {extractedData 
                    ? "✓ Content extracted - review details below" 
                    : "Click 'AI Extract & Prefill' to automatically analyze your document"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseDescription" className="text-white">Course Description</Label>
              <Textarea
                id="courseDescription"
                placeholder="Additional course details or context..."
                value={extractedData?.course_description || ''}
                onChange={(e) => setExtractedData(prev => prev ? { ...prev, course_description: e.target.value } : { course_description: e.target.value })}
                disabled={loading}
                className="bg-black border-neon-green text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </div>

            {/* Brand Customization Section */}
            <div className="space-y-4 border-t border-gray-800 pt-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-neon-green">
                <Palette className="h-5 w-5" />
                Brand Customization
              </h3>
              
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-white">Brand Logo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={loading}
                    className="gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-400">
                    {logoFile ? logoFile.name : 'PNG, JPG, SVG (max 2MB)'}
                  </span>
                </div>
                
                {logoPreview && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-2">
                    <p className="text-sm text-gray-400 mb-2">Logo Preview:</p>
                    <img
                      src={logoPreview}
                      alt="Brand logo"
                      className="max-h-20 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Mascot Upload */}
              <div className="space-y-2">
                <Label htmlFor="mascot" className="text-white">Game Mascot / Character (Optional)</Label>
                <p className="text-xs text-gray-400">Upload a character that will appear in scene one (instructions/how to play)</p>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('mascot-upload')?.click()}
                    disabled={loading}
                    className="gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Mascot
                  </Button>
                  <input
                    id="mascot-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleMascotChange}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-400">
                    {mascotFile ? mascotFile.name : 'PNG, JPG, GIF (max 5MB)'}
                  </span>
                </div>
                
                {mascotPreview && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-2">
                    <p className="text-sm text-gray-400 mb-2">Mascot Preview:</p>
                    <img
                      src={mascotPreview}
                      alt="Game mascot"
                      className="max-h-32 object-contain mx-auto"
                    />
                  </div>
                )}
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-white">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      disabled={loading}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      disabled={loading}
                      className="flex-1 bg-black border-neon-green text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-white">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      disabled={loading}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      disabled={loading}
                      className="flex-1 bg-black border-neon-green text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-3">Color Preview:</p>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-lg border-2"
                      style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    />
                    <p className="text-xs text-gray-400 mt-2">Primary</p>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-lg border-2"
                      style={{ backgroundColor: secondaryColor, borderColor: secondaryColor }}
                    />
                    <p className="text-xs text-gray-400 mt-2">Secondary</p>
                  </div>
                </div>
              </div>
            </div>

            {file && !extractedData && (
              <Button
                onClick={analyzeDocument}
                disabled={loading}
                className="w-full bg-neon-green text-black hover:bg-neon-green/90"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Extracting Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Extract & Prefill
                  </>
                )}
              </Button>
            )}

            {extractedData && !competencyMappings && (
              <Button
                onClick={analyzeCompetencies}
                disabled={loading}
                className="w-full bg-neon-green text-black hover:bg-neon-green/90"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Competencies...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Course
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Extracted Data Preview */}
        {extractedData && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center border border-neon-green/30 bg-neon-green/10">
                  <Sparkles className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <CardTitle className="text-xl text-neon-green">
                    Content Extracted
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    AI has extracted key information from your document
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Company</p>
                  <p className="text-lg text-white">{extractedData.company_name || "Not detected"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Course Name</p>
                  <p className="text-lg text-white">{extractedData.course_name || "Not detected"}</p>
                </div>
              </div>

              {extractedData.learning_objectives && extractedData.learning_objectives.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Learning Objectives</p>
                  <ul className="list-disc list-inside space-y-1">
                    {extractedData.learning_objectives.map((obj: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-300">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Competency Mappings */}
        {competencyMappings && (
          <Card className="bg-gray-900 border-gray-800">
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

        {/* Game Preview & Download */}
        {gameUrl && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                <Button 
                  onClick={downloadGame} 
                  variant="outline" 
                  className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border border-gray-800 rounded-lg overflow-hidden bg-black/40">
                <iframe
                  src={gameUrl}
                  className="w-full h-[600px]"
                  title="Generated Game Preview"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={downloadGame} 
                  className="flex-1 bg-neon-green text-black hover:bg-neon-green/90" 
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Game
                </Button>
                <Button
                  onClick={() => window.open(gameUrl, "_blank")}
                  variant="outline"
                  className="flex-1 border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                  size="lg"
                >
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
