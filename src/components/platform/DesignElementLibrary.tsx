import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Package, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

type DesignElement = {
  id: string;
  element_type: string;
  element_subtype: string | null;
  name: string;
  description: string | null;
  file_url: string;
  preview_url: string | null;
  thumbnail_url: string | null;
  allowed_zones: string[];
  review_status: string;
  rejection_reason: string | null;
  is_published: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export const DesignElementLibrary = () => {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadElements();
  }, []);

  const loadElements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('design_elements')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setElements(data || []);
    } catch (error: any) {
      console.error('Failed to load elements:', error);
      toast.error('Failed to load design elements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this element? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('design_elements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Element deleted successfully');
      loadElements();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete element');
    }
  };

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (status === 'approved' && isPublished) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>;
    }
    if (status === 'approved' && !isPublished) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Approved</Badge>;
    }
    if (status === 'pending_review') {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending Review</Badge>;
    }
    if (status === 'rejected') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const filteredElements = elements.filter(el => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'published') return el.is_published && el.review_status === 'approved';
    if (filterStatus === 'pending') return el.review_status === 'pending_review';
    if (filterStatus === 'rejected') return el.review_status === 'rejected';
    return true;
  });

  const stats = {
    total: elements.length,
    published: elements.filter(e => e.is_published && e.review_status === 'approved').length,
    pending: elements.filter(e => e.review_status === 'pending_review').length,
    totalUsage: elements.reduce((sum, e) => sum + (e.usage_count || 0), 0),
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading elements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-neon-purple" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400">Total Elements</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.published}</p>
              <p className="text-sm text-gray-400">Published</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-sm text-gray-400">Pending Review</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-neon-green" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalUsage}</p>
              <p className="text-sm text-gray-400">Total Uses</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
          size="sm"
        >
          All ({stats.total})
        </Button>
        <Button
          variant={filterStatus === 'published' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('published')}
          size="sm"
        >
          Published ({stats.published})
        </Button>
        <Button
          variant={filterStatus === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('pending')}
          size="sm"
        >
          Pending ({stats.pending})
        </Button>
        <Button
          variant={filterStatus === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('rejected')}
          size="sm"
        >
          Rejected
        </Button>
      </div>

      {/* Elements Grid */}
      {filteredElements.length === 0 ? (
        <Card className="p-12 text-center bg-gray-900 border-gray-800">
          <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No design elements yet</p>
          <p className="text-sm text-gray-500">Upload your first design element above</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElements.map((element) => (
            <Card key={element.id} className="bg-gray-900 border-gray-800 overflow-hidden hover:border-neon-purple transition-colors">
              {/* Preview */}
              <div className="aspect-video bg-gray-800 relative">
                {element.preview_url || element.file_url ? (
                  element.element_type === 'audio' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-600" />
                    </div>
                  ) : (
                    <img
                      src={element.preview_url || element.file_url}
                      alt={element.name}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(element.review_status, element.is_published)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white truncate">{element.name}</h3>
                  <p className="text-sm text-gray-400">
                    {element.element_type.replace('_', ' ').toUpperCase()}
                    {element.element_subtype && ` • ${element.element_subtype.toUpperCase()}`}
                  </p>
                </div>

                {element.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{element.description}</p>
                )}

                {/* Usage Stats */}
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-neon-green" />
                  <span className="text-gray-400">
                    {element.usage_count || 0} uses
                  </span>
                </div>

                {/* Zones */}
                <div className="flex flex-wrap gap-1">
                  {element.allowed_zones.slice(0, 2).map((zone) => (
                    <Badge key={zone} variant="outline" className="text-xs">
                      {zone.split('_')[0]}
                    </Badge>
                  ))}
                  {element.allowed_zones.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{element.allowed_zones.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Rejection Reason */}
                {element.review_status === 'rejected' && element.rejection_reason && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                    <p className="text-xs text-red-400">{element.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(element.file_url, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {!element.is_published && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(element.id)}
                      className="text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Uploaded {formatDistanceToNow(new Date(element.created_at), { addSuffix: true })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
