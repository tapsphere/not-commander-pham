import { useEffect } from 'react';
import { generateCreatorFlowV31PDF } from '@/utils/generateCreatorFlowV31PDF';
import { generateBaseLayerPDF } from '@/utils/generateBaseLayerPDF';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

const GeneratePDF = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-xl w-full">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Documentation Downloads</h1>
          <p className="text-muted-foreground text-lg">
            Download PDF versions of key documentation
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="p-6 border rounded-lg space-y-3 hover:border-primary transition-colors">
            <h2 className="text-xl font-bold">Creator Flow V3.1</h2>
            <p className="text-sm text-muted-foreground">
              Complete creator journey for developing and publishing interactive templates
            </p>
            <Button 
              onClick={generateCreatorFlowV31PDF}
              size="lg"
              className="w-full gap-2"
            >
              <FileDown className="w-5 h-5" />
              Download Creator Flow PDF
            </Button>
          </div>
          
          <div className="p-6 border rounded-lg space-y-3 hover:border-primary transition-colors">
            <h2 className="text-xl font-bold">BASE LAYER 1 v3.1</h2>
            <p className="text-sm text-muted-foreground">
              Global game architecture and production-ready blueprint specifications
            </p>
            <Button 
              onClick={generateBaseLayerPDF}
              size="lg"
              className="w-full gap-2"
              variant="secondary"
            >
              <FileDown className="w-5 h-5" />
              Download BASE LAYER 1 PDF
            </Button>
          </div>
        </div>
        
        <Button 
          variant="outline"
          onClick={() => navigate('/platform/creator-demo')}
          className="mt-4"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default GeneratePDF;
