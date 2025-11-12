import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Layers, Package, PlayCircle, Upload, ImageIcon } from 'lucide-react';
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

  // Mock design elements for demo
  const mockDesignElements = [
    {
      id: 'elem-1',
      name: 'Corporate Logo Pack',
      description: 'Professional logo variations for different game contexts',
      element_type: 'logo',
      review_status: 'approved',
      is_published: true,
      usage_count: 12,
      preview_url: '/microsoft-logo.png',
      allowed_zones: ['header', 'footer', 'branding'],
    },
    {
      id: 'elem-2',
      name: 'Custom Button Set',
      description: 'Branded button styles with hover states',
      element_type: 'component',
      review_status: 'pending',
      is_published: false,
      usage_count: 0,
      preview_url: null,
      allowed_zones: ['ui', 'navigation'],
    },
    {
      id: 'elem-3',
      name: 'Background Pattern',
      description: 'Subtle branded texture for game backgrounds',
      element_type: 'background',
      review_status: 'approved',
      is_published: true,
      usage_count: 8,
      preview_url: null,
      allowed_zones: ['background', 'section'],
    }
  ];

  const getStatusBadge = (element: any) => {
    if (element.is_published) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
          Published
        </Badge>
      );
    }
    if (element.review_status === 'approved') {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
          Approved
        </Badge>
      );
    }
    if (element.review_status === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
          Pending Review
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
        Rejected
      </Badge>
    );
  };

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

        <TabsContent value="elements" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Upload custom design elements for use in game templates</p>
            <Button 
              className="gap-2"
              style={{ backgroundColor: 'hsl(var(--neon-purple))', color: 'black' }}
            >
              <Upload className="w-4 h-4" />
              Upload Element
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Elements</p>
                    <p className="text-2xl font-bold">{mockDesignElements.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-neon-purple opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Published</p>
                    <p className="text-2xl font-bold text-green-400">
                      {mockDesignElements.filter(e => e.is_published).length}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {mockDesignElements.filter(e => e.review_status === 'pending').length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-yellow-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Usage</p>
                    <p className="text-2xl font-bold text-neon-green">
                      {mockDesignElements.reduce((sum, e) => sum + e.usage_count, 0)}
                    </p>
                  </div>
                  <PlayCircle className="w-8 h-8 text-neon-green opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Design Elements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDesignElements.map((element) => (
              <Card key={element.id} className="bg-gray-900 border-gray-800 hover:border-neon-purple transition-colors">
                <div className="p-6">
                  {/* Preview */}
                  <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {element.preview_url ? (
                      <img src={element.preview_url} alt={element.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-600" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{element.name}</h3>
                      <p className="text-sm text-gray-400">{element.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                        {element.element_type}
                      </Badge>
                      {getStatusBadge(element)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <PlayCircle className="w-4 h-4" />
                        <span>{element.usage_count} uses</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-2">Allowed Zones:</p>
                      <div className="flex flex-wrap gap-1">
                        {element.allowed_zones.map((zone) => (
                          <Badge key={zone} variant="outline" className="text-xs bg-gray-800 text-gray-400 border-gray-700">
                            {zone}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 gap-2 border-gray-700 hover:border-neon-purple hover:text-neon-purple"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2 border-gray-700 hover:border-red-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Dialog with Demo Data */}
      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
        onSuccess={() => setDialogOpen(false)}
        demoMode={true}
      />
    </div>
  );
}
