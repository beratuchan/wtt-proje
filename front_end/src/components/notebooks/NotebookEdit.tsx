// src/components/notebooks/NotebookEdit.tsx - GÜNCEL (isPublic kaldırıldı)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useLoggedInUsersContext } from '../auth/LoggedInUserContext';
import { api } from '../../helper/api';
import { toast } from 'sonner';
import {
  Card,
  Button,
  TextInput,
  Label,
  Textarea,
  ToggleSwitch,
} from 'flowbite-react';
import { HiArrowLeft, HiSave } from 'react-icons/hi';

const NotebookEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUsersContext();

  // isPublic KALDIRILDI
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotebook();
  }, [id]);

  const fetchNotebook = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/notebooks/${id}`);
      const notebook = response.data;
      
      setFormData({
        name: notebook.name,
        description: notebook.description || '',
        isDefault: notebook.isDefault,
      });
    } catch (error: any) {
      console.error('Fetch notebook error:', error);
      
      if (error.response?.status === 404) {
        toast.error('Defter bulunamadı');
      } else if (error.response?.status === 403) {
        toast.error('Bu defteri düzenleme yetkiniz yok');
      } else {
        toast.error('Defter yüklenirken bir hata oluştu');
      }
      navigate('/notebooks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Defter adı gereklidir');
      return;
    }

    try {
      setSaving(true);
      
      await api.put(`/notebooks/${id}`, formData);
      
      toast.success('Defter başarıyla güncellendi');
      navigate(`/notebooks/${id}`);
    } catch (error: any) {
      console.error('Update notebook error:', error);
      
      if (error.response?.status === 404) {
        toast.error('Defter bulunamadı');
      } else if (error.response?.status === 403) {
        toast.error('Bu defteri düzenleme yetkiniz yok');
      } else {
        toast.error(error.response?.data?.message || 'Defter güncellenirken bir hata oluştu');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <div className="flex items-center mb-6">
            <Button
              color="light"
              onClick={() => navigate(`/notebooks/${id}`)}
              className="mr-4"
            >
              <HiArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              Defteri Düzenle
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Defter Adı *</Label>
              <TextInput
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Proje Notları"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Defterin amacını, içeriğini açıklayın..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* isPublic toggle KALDIRILDI, sadece isDefault kaldı */}
            <div className="space-y-4">
              <div className="flex items-center">
                <ToggleSwitch
                  checked={formData.isDefault}
                  label="Varsayılan Defter"
                  onChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
                <span className="ml-2 text-sm text-gray-600">
                  {formData.isDefault ? 'Varsayılan olarak ayarlandı' : 'Varsayılan değil'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Varsayılan defter, yeni sayfaların otomatik ekleneceği defterdir.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                color="alternative"
                onClick={() => navigate(`/notebooks/${id}`)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.name.trim()}
              >
                <HiSave className="w-5 h-5 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Güncelle'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NotebookEdit;