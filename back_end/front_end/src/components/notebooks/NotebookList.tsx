// src/components/notebooks/NotebookList.tsx - GÜNCEL VERSİYON (isPublic kaldırıldı)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../helper/api';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Badge,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
  Label,
  Textarea,
  ToggleSwitch,
} from 'flowbite-react';
import {
  HiPlus,
  HiOutlineBookOpen,
  HiTrash,
  HiPencil,
  HiEye,
  HiCalendar,
} from 'react-icons/hi';

const NotebookList = () => {
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState<any>(null);

  // Yeni defter form state (isPublic KALDIRILDI)
  const [newNotebook, setNewNotebook] = useState({
    name: '',
    description: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notebooks');
      setNotebooks(response.data);
    } catch (error: any) {
      console.error('Notebooks fetch error:', error);
      toast.error('Defterler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async () => {
    try {
      console.log('🟡 Notebook oluşturuluyor:', newNotebook);

      const response = await api.post('/notebooks', newNotebook);
      console.log('✅ Notebook oluşturma başarılı:', response.data);
      
      toast.success('Defter başarıyla oluşturuldu');
      setShowCreateModal(false);
      setNewNotebook({ name: '', description: '', isDefault: false });
      fetchNotebooks();
    } catch (error: any) {
      console.error('🔴 Notebook oluşturma hatası:', error);
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(error.response.data.message);
        }
      } else if (error.response?.status === 401) {
        toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      } else if (!error.response) {
        toast.error('Sunucuya bağlanılamadı.');
      } else {
        toast.error('Defter oluşturulurken bir hata oluştu');
      }
    }
  };

  const handleDeleteNotebook = async () => {
    if (!selectedNotebook) return;

    try {
      console.log('🟡 Silinecek notebook ID:', selectedNotebook.id);
      
      await api.delete(`/notebooks/${selectedNotebook.id}`);
      
      toast.success('Defter başarıyla silindi');
      setShowDeleteModal(false);
      setSelectedNotebook(null);
      fetchNotebooks();
    } catch (error: any) {
      console.error('🔴 Delete notebook error:', error);
      
      if (error.response?.status === 404) {
        toast.error('Defter bulunamadı');
      } else if (error.response?.status === 403) {
        toast.error('Bu defteri silme yetkiniz yok');
      } else {
        toast.error(error.response?.data?.message || 'Defter silinirken bir hata oluştu');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Defterlerim</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <HiPlus className="w-5 h-5 mr-2" />
          Yeni Defter
        </Button>
      </div>

      {notebooks.length === 0 ? (
        <Card className="text-center py-12">
          <HiOutlineBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz defteriniz yok</h3>
          <p className="text-gray-500 mb-6">İlk defterinizi oluşturarak başlayın</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <HiPlus className="w-5 h-5 mr-2" />
            İlk Defterini Oluştur
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((notebook) => (
            <Card key={notebook.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    {notebook.name}
                    {notebook.isDefault && (
                      <Badge color="blue" className="ml-2">
                        Varsayılan
                      </Badge>
                    )}
                  </h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{notebook.description}</p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="xs"
                    color="light"
                    onClick={() => navigate(`/notebooks/${notebook.id}`)}
                  >
                    <HiEye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="xs"
                    color="light"
                    onClick={() => navigate(`/notebooks/${notebook.id}/edit`)}
                  >
                    <HiPencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => {
                      setSelectedNotebook(notebook);
                      setShowDeleteModal(true);
                    }}
                    disabled={notebook.isDefault}
                  >
                    <HiTrash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <HiOutlineBookOpen className="w-4 h-4 mr-1" />
                    <span>{notebook.devlogPages?.length || 0} sayfa</span>
                  </div>
                  <div className="flex items-center">
                    <HiCalendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(notebook.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  color="blue"
                  className="w-full"
                  onClick={() => navigate(`/notebooks/${notebook.id}`)}
                >
                  Defteri Aç
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Yeni Defter Modalı - isPublic KALDIRILDI */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} size="md">
        <ModalHeader>Yeni Defter Oluştur</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Defter Adı *</Label>
              <TextInput
                id="name"
                value={newNotebook.name}
                onChange={(e) => setNewNotebook({ ...newNotebook, name: e.target.value })}
                placeholder="Örn: Proje Notları"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                value={newNotebook.description}
                onChange={(e) => setNewNotebook({ ...newNotebook, description: e.target.value })}
                placeholder="Defterin amacını açıklayın..."
                rows={3}
              />
            </div>
            <div className="flex items-center">
              <ToggleSwitch
                checked={newNotebook.isDefault}
                label="Varsayılan Defter"
                onChange={(checked) => setNewNotebook({ ...newNotebook, isDefault: checked })}
              />
              <span className="ml-2 text-sm text-gray-600">
                {newNotebook.isDefault ? 'Yeni sayfalar bu deftere eklenecek' : 'Varsayılan defter değil'}
              </span>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button color="alternative" onClick={() => setShowCreateModal(false)}>
                İptal
              </Button>
              <Button
                onClick={handleCreateNotebook}
                disabled={!newNotebook.name.trim()}
              >
                Oluştur
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Silme Onay Modalı */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="md">
        <ModalHeader>Defteri Sil</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <HiOutlineBookOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              "{selectedNotebook?.name}" defterini silmek istediğinize emin misiniz?
            </h3>
            <p className="text-gray-500 mb-6">
              Bu işlem geri alınamaz. Defter içindeki sayfalar silinmez, sadece defter kaldırılır.
            </p>
            <div className="flex justify-center space-x-3">
              <Button color="alternative" onClick={() => setShowDeleteModal(false)}>
                İptal
              </Button>
              <Button color="failure" onClick={handleDeleteNotebook}>
                Sil
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default NotebookList;