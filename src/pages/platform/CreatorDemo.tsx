import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Layers, Package, PlayCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateDialog } from '@/components/platform/TemplateDialog';
import { Badge } from '@/components/ui/badge';

export default function CreatorDemo() {
  const [dialogOpen, setDialogOpen] = useState(true); // Open by default for demo
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Mock templates for demo
  const mockTemplates = [
    {
      id: 'demo-1',
      name: 'Crisis Communication Manager',
      description: 'Navigate ethical dilemmas in high-pressure crisis scenarios',
      template_type: 'ai_generated',
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              🎬 Demo Mode - Pre-filled Sample Data
            </Badge>
          </div>
          <h2 className="text-3xl font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
            Creator Studio
          </h2>
          <p className="text-gray-400 mt-2">Manage your game templates and design elements</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="games" className="gap-2">
            <Layers className="w-4 h-4" />
            My Games
          </TabsTrigger>
          <TabsTrigger value="elements" className="gap-2">
            <Package className="w-4 h-4" />
            Design Elements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Create game templates with CBE competencies built in</p>
            <Button 
              onClick={() => setDialogOpen(true)} 
              className="gap-2"
              style={{ backgroundColor: 'hsl(var(--neon-green))', color: 'black' }}
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>

          {/* Template Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.map((template) => (
              <Card key={template.id} className="bg-gray-900 border-gray-800 hover:border-neon-purple transition-colors">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      {template.template_type === 'ai_generated' ? '🤖 AI Generated' : '📤 Custom Upload'}
                    </Badge>
                    {template.is_published ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        Draft
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setDialogOpen(true);
                      }}
                      className="flex-1 gap-2 border-gray-700 hover:border-neon-purple hover:text-neon-purple"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setDialogOpen(true);
                      }}
                      className="flex-1 gap-2 border-gray-700 hover:border-neon-green hover:text-neon-green"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="elements">
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Design Elements section (not part of this demo)</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Dialog with Demo Data */}
      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
        onSuccess={() => setDialogOpen(false)}
      />
    </div>
  );
}
