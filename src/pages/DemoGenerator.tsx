import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Sparkles, Download } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Custom Demo Generator</h1>
          <p className="text-muted-foreground text-lg">
            Upload your training content and generate a custom crisis communication validator game
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-12 space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Upload Training PDF</p>
                <p className="text-sm text-muted-foreground">
                  Upload your course materials, onboarding docs, or training content
                </p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {file && !extractedData && (
              <Button
                onClick={analyzeDocument}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze & Extract Competencies
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Extracted Data Preview */}
        {extractedData && (
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Analysis Complete</h3>
                <p className="text-sm text-muted-foreground">
                  AI has extracted key information from your content
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-lg">{extractedData.company_name || "Not detected"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Course Name</p>
                <p className="text-lg">{extractedData.course_name || "Not detected"}</p>
              </div>
            </div>

            {extractedData.learning_objectives && extractedData.learning_objectives.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Learning Objectives</p>
                <ul className="list-disc list-inside space-y-1">
                  {extractedData.learning_objectives.slice(0, 3).map((obj: string, idx: number) => (
                    <li key={idx} className="text-sm">{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {!gameUrl && (
              <Button
                onClick={generateGame}
                disabled={loading}
                className="w-full"
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
          </Card>
        )}

        {/* Game Preview & Download */}
        {gameUrl && (
          <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Game Ready!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your custom validator game has been generated
                  </p>
                </div>
              </div>
              <Button onClick={downloadGame} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={gameUrl}
                className="w-full h-[600px]"
                title="Generated Game Preview"
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={downloadGame} className="flex-1" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download Game
              </Button>
              <Button
                onClick={() => window.open(gameUrl, "_blank")}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Open in New Tab
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
