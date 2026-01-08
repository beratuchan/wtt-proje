// src/components/notebooks/NotebookCreate.tsx - GÜNCEL (isPublic kaldırıldı)
import { useState } from 'react';
import { useNavigate } from 'react-router';
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

const NotebookCreate = () => {
  const navigate = useNavigate();

  // isPublic KALDIRILDI
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Defter adı gereklidir');
      return;
    }

    try {
      setSaving(true);
      const response = await api.post('/notebooks', formData);
      toast.success('Defter başarıyla oluşturuldu');
      navigate(`/notebooks/${response.data.id}`);
    } catch (error: any) {
      console.error('Create notebook error:', error);
      toast.error(error.response?.data?.message || 'Defter oluşturulurken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <div className="flex items-center mb-6">
            <Button
              color="light"
              onClick={() => navigate('/notebooks')}
              className="mr-4"
            >
              <HiArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              Yeni Defter Oluştur
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
                onClick={() => navigate('/notebooks')}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.name.trim()}
              >
                <HiSave className="w-5 h-5 mr-2" />
                {saving ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NotebookCreate;