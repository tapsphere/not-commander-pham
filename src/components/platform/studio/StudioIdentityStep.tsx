import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateFormData, INDUSTRIES } from '../template-steps/types';
import { useStudioTheme } from './StudioThemeContext';
import { Sparkles, Upload } from 'lucide-react';

interface StudioIdentityStepProps {
  formData: TemplateFormData;
  setFormData: (data: TemplateFormData) => void;
  coverImageFile: File | null;
  setCoverImageFile: (file: File | null) => void;
}

// Industry-specific placeholders
const INDUSTRY_PLACEHOLDERS: Record<string, { name: string; description: string }> = {
  'Marketing': { 
    name: 'Brand Campaign Audit', 
    description: 'Evaluate campaign effectiveness, ROI metrics, and brand messaging alignment' 
  },
  'Finance': { 
    name: 'Budget Allocation Challenge', 
    description: 'Strategic financial decision-making under time pressure and resource constraints' 
  },
  'Healthcare': { 
    name: 'Patient Care Protocol', 
    description: 'Clinical decision-making scenarios with patient safety priorities' 
  },
  'Retail': { 
    name: 'Luxury Brand Experience', 
    description: 'Customer journey optimization and premium service delivery' 
  },
  'Technology': { 
    name: 'Security Threat Response', 
    description: 'Identify, assess, and respond to cybersecurity threats in real-time' 
  },
  'Sales': { 
    name: 'Enterprise Deal Navigator', 
    description: 'Navigate complex B2B sales scenarios and stakeholder management' 
  },
  'Human Resources': { 
    name: 'Talent Assessment Suite', 
    description: 'Evaluate candidate fit, culture alignment, and team dynamics' 
  },
  'Operations': { 
    name: 'Supply Chain Crisis Manager', 
    description: 'Handle logistics disruptions and optimize operational efficiency' 
  },
  'default': { 
    name: 'Competency Validator', 
    description: 'Test critical thinking and decision-making skills' 
  },
};

export function StudioIdentityStep({
  formData,
  setFormData,
  coverImageFile,
  setCoverImageFile,
}: StudioIdentityStepProps) {
  const { isDarkMode } = useStudioTheme();
  const placeholder = INDUSTRY_PLACEHOLDERS[formData.industry] || INDUSTRY_PLACEHOLDERS['default'];

  const glassStyles = isDarkMode 
    ? 'bg-white/5 border-white/10 focus:border-white/30' 
    : 'bg-background border-border focus:border-primary/50';

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className={`h-5 w-5 ${isDarkMode ? 'text-white/70' : 'text-primary'}`} />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
            Template Identity
          </h2>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-muted-foreground'}`}>
          Start by defining your validator's core identity
        </p>
      </div>

      <div className="space-y-5">
        {/* Industry Selection - Affects Placeholders */}
        <div className="space-y-2">
          <Label className={isDarkMode ? 'text-white/70' : 'text-foreground'}>
            Industry Context
          </Label>
          <Select 
            value={formData.industry} 
            onValueChange={(v) => setFormData({ ...formData, industry: v })}
          >
            <SelectTrigger className={`${glassStyles} backdrop-blur-sm h-11`}>
              <SelectValue placeholder="Select industry..." />
            </SelectTrigger>
            <SelectContent className={isDarkMode ? 'bg-gray-900 border-white/10' : ''}>
              {INDUSTRIES.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Name */}
        <div className="space-y-2">
          <Label className={isDarkMode ? 'text-white/70' : 'text-foreground'}>
            Template Name *
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className={`${glassStyles} backdrop-blur-sm h-12 text-lg ${
              isDarkMode ? 'text-white placeholder:text-white/30' : ''
            }`}
            placeholder={placeholder.name}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className={isDarkMode ? 'text-white/70' : 'text-foreground'}>
            Description
          </Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className={`${glassStyles} backdrop-blur-sm resize-none ${
              isDarkMode ? 'text-white placeholder:text-white/30' : ''
            }`}
            placeholder={placeholder.description}
          />
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label className={isDarkMode ? 'text-white/70' : 'text-foreground'}>
            Cover Image
          </Label>
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
            <label htmlFor="cover-image" className="cursor-pointer block">
              <div className={`
                w-full h-32 rounded-xl border-2 border-dashed 
                flex flex-col items-center justify-center gap-2 transition-all
                ${isDarkMode 
                  ? 'border-white/20 hover:border-white/40 bg-white/5' 
                  : 'border-border hover:border-primary bg-muted/30'
                }
              `}>
                <Upload className={`w-8 h-8 ${isDarkMode ? 'text-white/40' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-muted-foreground'}`}>
                  {coverImageFile ? coverImageFile.name : 'Click to upload cover image'}
                </span>
              </div>
            </label>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-white/30' : 'text-muted-foreground'}`}>
            Auto-generated if not provided
          </p>
        </div>
      </div>
    </div>
  );
}
