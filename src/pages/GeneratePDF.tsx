import { useEffect } from 'react';
import { generateCreatorFlowV31PDF } from '@/utils/generateCreatorFlowV31PDF';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

const GeneratePDF = () => {
  const navigate = useNavigate();

  const handleDownload = () => {
    generateCreatorFlowV31PDF();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-3xl font-bold">Creator Flow V3.1</h1>
        <p className="text-muted-foreground">
          Download the complete Creator Flow documentation as a professionally formatted PDF.
        </p>
        <Button 
          onClick={handleDownload}
          size="lg"
          className="gap-2"
        >
          <FileDown className="w-5 h-5" />
          Download PDF
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/platform/creator-demo')}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default GeneratePDF;
