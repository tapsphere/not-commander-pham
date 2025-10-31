import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Download, Brain, PlayCircle } from "lucide-react";

export default function DemoGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
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

  const analyzeDocument = async () => {
    if (!file) return;

    setLoading(true);
    setAnalyzing(true);

    try {
      // Parse the document
      const formData = new FormData();
      formData.append("file", file);

      const { data: parseData, error: parseError } = await supabase.functions.invoke(
        "parse-document",
        {
          body: formData,
        }
      );

      if (parseError) throw parseError;

      // Analyze the course content
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-course",
        {
          body: {
            courseText: parseData.text,
            courseName: file.name.replace(".pdf", ""),
            courseDescription: "",
            extractMode: true,
          },
        }
      );

      if (analysisError) throw analysisError;

      setExtractedData(analysisData);
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

  const generateGame = async () => {
    if (!extractedData) return;

    setLoading(true);
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-crisis-demo", {
        body: {
          brandName: extractedData.company_name || "Your Company",
          courseName: extractedData.course_name || "Leadership Training",
          courseDescription: extractedData.course_description || "",
          learningObjectives: extractedData.learning_objectives || [],
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
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-neon-green">
                  <Brain className="w-5 h-5" />
                  Course Gamifier
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upload your training course or lesson content, and we'll map it to C-BEN competencies and recommend PlayOps validators for measurable skill assessment.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center gap-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
              >
                <PlayCircle className="w-4 h-4" />
                Load Sample Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseName" className="text-white">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="e.g., Power of Words®"
                value={file?.name.replace('.pdf', '') || ''}
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
              </div>
              {file && (
                <p className="text-xs text-gray-400">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseDescription" className="text-white">Course Description</Label>
              <Textarea
                id="courseDescription"
                placeholder="Additional course details or context..."
                value={extractedData?.course_description || ''}
                disabled={loading}
                className="bg-black border-neon-green text-white placeholder:text-gray-500 min-h-[100px]"
              />
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
                    Analyzing Course...
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
                    Analysis Complete
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    AI has extracted key information from your content
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
                    {extractedData.learning_objectives.slice(0, 3).map((obj: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-300">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

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
