import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateFormData, INDUSTRIES } from '../template-steps/types';
import { useStudioTheme } from './StudioThemeContext';
import { FileText, Upload } from 'lucide-react';

interface StudioTemplateInfoStepProps {
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
    name: 'Luxury Collection Audit', 
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

export function StudioTemplateInfoStep({
  formData,
  setFormData,
  coverImageFile,
  setCoverImageFile,
}: StudioTemplateInfoStepProps) {
  const { isDarkMode } = useStudioTheme();
  const placeholder = INDUSTRY_PLACEHOLDERS[formData.industry] || INDUSTRY_PLACEHOLDERS['default'];

  const cardStyles = isDarkMode 
    ? 'bg-white/5 border-white/10 backdrop-blur-sm' 
    : 'bg-white border-slate-200 shadow-sm';

  const labelStyles = isDarkMode ? 'text-white/80' : 'text-slate-700';
  const mutedStyles = isDarkMode ? 'text-white/40' : 'text-slate-500';
  const inputStyles = isDarkMode 
    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' 
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400';

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <FileText className={`h-5 w-5 ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`} />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Template Info
          </h2>
        </div>
        <p className={mutedStyles}>
          Give your validator a name and context
        </p>
      </div>

      <div className={`rounded-xl border p-5 ${cardStyles}`}>
        <div className="space-y-5">
          {/* Industry Selection */}
          <div className="space-y-2">
            <Label className={labelStyles}>Industry Context</Label>
            <Select 
              value={formData.industry} 
              onValueChange={(v) => setFormData({ ...formData, industry: v })}
            >
              <SelectTrigger className={`h-11 ${inputStyles}`}>
                <SelectValue placeholder="Select industry..." />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-slate-900 border-white/10' : ''}>
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
            <Label className={labelStyles}>Template Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className={`h-12 text-lg ${inputStyles}`}
              placeholder={placeholder.name}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className={labelStyles}>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`resize-none ${inputStyles}`}
              placeholder={placeholder.description}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label className={labelStyles}>Cover Image</Label>
            <input
              type="file"
              id="cover-image-info"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setCoverImageFile(file);
              }}
              className="hidden"
            />
            <label htmlFor="cover-image-info" className="cursor-pointer block">
              <div className={`
                h-24 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all
                ${isDarkMode 
                  ? 'border-white/20 hover:border-white/40 bg-white/5' 
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }
              `}>
                <Upload className={`h-5 w-5 ${mutedStyles}`} />
                <span className={mutedStyles}>
                  {coverImageFile ? coverImageFile.name : 'Upload cover image'}
                </span>
              </div>
            </label>
            <p className={`text-xs ${mutedStyles}`}>
              Auto-generated if not provided
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
