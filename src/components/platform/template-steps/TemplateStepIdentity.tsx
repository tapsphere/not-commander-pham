import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TemplateFormData } from './types';

interface TemplateStepIdentityProps {
  formData: TemplateFormData;
  setFormData: (data: TemplateFormData) => void;
  coverImageFile: File | null;
  setCoverImageFile: (file: File | null) => void;
}

export function TemplateStepIdentity({
  formData,
  setFormData,
  coverImageFile,
  setCoverImageFile,
}: TemplateStepIdentityProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Template Identity</h2>
        <p className="text-sm text-muted-foreground">
          Start by giving your validator a name and description
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-foreground">Template Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-muted border-border"
            placeholder="e.g., Crisis Communication Manager"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-foreground">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="bg-muted border-border"
            placeholder="Brief overview of what this validator tests..."
          />
        </div>

        <div>
          <Label className="text-foreground">Cover Image</Label>
          <div className="mt-2">
            <input
              type="file"
              id="cover-image"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setCoverImageFile(file);
              }}
              className="hidden"
            />
            <label htmlFor="cover-image" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 border-dashed border-2 hover:border-primary"
                asChild
              >
                <span className="flex flex-col items-center justify-center gap-2">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">
                    {coverImageFile ? coverImageFile.name : 'Click to upload cover image'}
                  </span>
                </span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            If not provided, a default cover will be generated with your profile info
          </p>
        </div>
      </div>
    </div>
  );
}
