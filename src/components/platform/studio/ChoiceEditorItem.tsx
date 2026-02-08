/**
 * ChoiceEditorItem - High-Fidelity Asset Upload Component
 * 
 * Features:
 * - Upload button next to each choice for brand assets
 * - Apple-style image preview with drop-shadow and rounded corners
 * - Scientific correct + Brand-aligned checkboxes
 * - Supports hybrid mode (mix of images and icons)
 */

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, Trash2, EyeOff, Eye, ImageIcon, X 
} from 'lucide-react';
import { ChoiceData } from '../template-steps/types';

interface ChoiceEditorItemProps {
  choice: ChoiceData;
  idx: number;
  isDarkMode: boolean;
  inputBg: string;
  textColor: string;
  mutedColor: string;
  canDelete: boolean;
  onUpdate: (updates: Partial<ChoiceData>) => void;
  onRemove: () => void;
  onImageUpload: (file: File) => void;
}

export function ChoiceEditorItem({
  choice,
  idx,
  isDarkMode,
  inputBg,
  textColor,
  mutedColor,
  canDelete,
  onUpdate,
  onRemove,
  onImageUpload,
}: ChoiceEditorItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    onUpdate({ imageUrl: undefined, imageLabel: undefined });
  };

  return (
    <div className={`p-2.5 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
      {/* Row 1: Choice Number + Text + Upload + Delete */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-medium ${mutedColor}`}>#{idx + 1}</span>
        
        {/* Text Input */}
        <Input
          value={choice.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className={`text-sm h-8 flex-1 ${inputBg}`}
          placeholder={`Choice ${idx + 1}...`}
        />
        
        {/* Upload Asset Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isDarkMode 
              ? 'hover:bg-primary/20 text-primary' 
              : 'hover:bg-primary/10 text-primary'
          }`}
          title="Upload brand asset"
        >
          <Upload className="h-3 w-3" />
        </button>
        
        {/* Delete Button */}
        <button
          onClick={onRemove}
          disabled={!canDelete}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            !canDelete 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-red-500/10 text-red-400'
          }`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      
      {/* Row 2: Image Preview (if uploaded) */}
      {choice.imageUrl && (
        <div className="mb-2 ml-4 flex items-center gap-2">
          {/* Apple-style image preview */}
          <div 
            className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white"
              style={{
                backgroundImage: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
                backgroundSize: '6px 6px',
                backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
                opacity: 0.4,
              }}
            />
            <img 
              src={choice.imageUrl} 
              alt={choice.imageLabel || 'Asset'} 
              className="absolute inset-0 w-full h-full object-contain p-0.5 drop-shadow-lg"
            />
          </div>
          
          {/* Label + Remove */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <ImageIcon className={`h-2.5 w-2.5 ${mutedColor}`} />
              <span className={`text-[10px] truncate ${mutedColor}`}>
                {choice.imageLabel || 'Brand Asset'}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleRemoveImage}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500/10 text-red-400"
            title="Remove image"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
      
      {/* Row 3: Alignment Checkboxes */}
      <div className="flex items-center gap-4 pl-4">
        {/* Scientific Correct (Hidden from creator in final UI, shown here for testing) */}
        <div className="flex items-center gap-1.5">
          <Checkbox
            id={`correct-${choice.id}`}
            checked={choice.isCorrect}
            onCheckedChange={(checked) => onUpdate({ isCorrect: !!checked })}
            className="h-3.5 w-3.5"
          />
          <label 
            htmlFor={`correct-${choice.id}`} 
            className={`text-[10px] ${mutedColor} flex items-center gap-1`}
          >
            <EyeOff className="h-2.5 w-2.5" />
            Scientific
          </label>
        </div>
        
        {/* Brand-Aligned (Visible to creator) */}
        <div className="flex items-center gap-1.5">
          <Checkbox
            id={`brand-${choice.id}`}
            checked={choice.brandAligned || false}
            onCheckedChange={(checked) => onUpdate({ brandAligned: !!checked })}
            className="h-3.5 w-3.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <label 
            htmlFor={`brand-${choice.id}`} 
            className={`text-[10px] ${mutedColor} flex items-center gap-1`}
          >
            <Eye className="h-2.5 w-2.5" />
            Brand-Aligned
          </label>
        </div>
      </div>
    </div>
  );
}