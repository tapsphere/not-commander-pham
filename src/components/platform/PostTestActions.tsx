import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, Download, Upload, FileCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostTestActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    template_type: string;
    custom_game_url?: string;
    game_config?: any;
  };
  onPublish: () => void;
  onReTest: () => void;
}

export function PostTestActions({
  open,
  onOpenChange,
  template,
  onPublish,
  onReTest
}: PostTestActionsProps) {
  const [mode, setMode] = useState<'choice' | 'customize'>('choice');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDownloadCode = async () => {
    try {
      let htmlContent = '';
      
      // Get HTML based on template type
      if (template.template_type === 'custom_upload' && template.custom_game_url) {
        const response = await fetch(template.custom_game_url);
        htmlContent = await response.text();
      } else if (template.game_config?.generated_html) {
        htmlContent = template.game_config.generated_html;
      } else {
        toast.error('No game code available to download');
        return;
      }

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-game.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Game code downloaded!');
      setMode('customize');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download code: ' + error.message);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.zip')) {
      toast.error('Please upload an HTML file or ZIP archive');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    setUploadedFile(file);
  };

  const handleUploadAndReTest = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const fileName = `${template.id}-${Date.now()}.html`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('custom-games')
        .upload(fileName, uploadedFile, {
          contentType: 'text/html',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('custom-games')
        .getPublicUrl(fileName);

      // Update template with new URL
      const { error: updateError } = await supabase
        .from('game_templates')
        .update({ custom_game_url: publicUrl })
        .eq('id', template.id);

      if (updateError) throw updateError;

      toast.success('✅ Code uploaded! Now re-running tests...');
      
      // Close this dialog and trigger re-test
      onOpenChange(false);
      onReTest();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Tests Passed!
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'choice' 
              ? 'Choose to publish immediately or customize the code first'
              : 'Upload your customized code to re-test before publishing'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'choice' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Publish Now */}
              <Card className="bg-gray-800 border-gray-700 p-6 hover:border-green-500 transition-colors cursor-pointer group"
                    onClick={onPublish}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Publish Now</h3>
                  <p className="text-sm text-gray-400">
                    Your validator is ready! Publish immediately to the marketplace.
                  </p>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    Publish to Marketplace
                  </Button>
                </div>
              </Card>

              {/* Download to Customize */}
              <Card className="bg-gray-800 border-gray-700 p-6 hover:border-cyan-400 transition-colors cursor-pointer group"
                    onClick={() => setMode('customize')}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-cyan-400/10 rounded-full flex items-center justify-center group-hover:bg-cyan-400/20 transition-colors">
                    <Download className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Download to Customize</h3>
                  <p className="text-sm text-gray-400">
                    Download the code, customize it locally, then re-upload and re-test.
                  </p>
                  <Button variant="outline" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                    Customize Code
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {mode === 'customize' && (
          <div className="space-y-6">
            {/* Download Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-400" />
                Step 1: Download Files
              </h3>
              <Button 
                onClick={handleDownloadCode}
                className="w-full bg-cyan-400 text-black hover:bg-cyan-500"
              >
                <FileCode className="w-4 h-4 mr-2" />
                Download Game Code
              </Button>
              <p className="text-xs text-gray-400">
                Download the game code to customize locally.
              </p>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-500" />
                Step 2: Upload Customized Code
              </h3>
              <div className="space-y-3">
                <Label htmlFor="custom-upload" className="text-gray-300">
                  Upload your customized HTML file
                </Label>
                <input
                  id="custom-upload"
                  type="file"
                  accept=".html,.zip"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:text-black hover:file:bg-cyan-500 file:cursor-pointer"
                />
                {uploadedFile && (
                  <p className="text-sm text-green-500 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              <Button
                onClick={handleUploadAndReTest}
                disabled={!uploadedFile || uploading}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                {uploading ? 'Uploading...' : 'Upload & Re-Test Validator'}
              </Button>
              <p className="text-xs text-gray-400">
                After uploading, the validator will be tested again. If it passes, you can publish.
              </p>
            </div>

            <div className="flex justify-start">
              <Button
                variant="ghost"
                onClick={() => setMode('choice')}
                className="text-gray-400 hover:text-white"
              >
                ← Back to Options
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
