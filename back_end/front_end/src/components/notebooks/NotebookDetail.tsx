import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useLoggedInUsersContext } from '../auth/LoggedInUserContext';
import { api, getFullImageUrl } from '../../helper/api';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Badge,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
} from 'flowbite-react';
import {
  HiOutlineBookOpen,
  HiLockOpen,
  HiLockClosed,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlinePlus,
  HiDotsVertical,
} from 'react-icons/hi';

const NotebookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUsersContext();
  const [notebook, setNotebook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [availablePages, setAvailablePages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState('');

  useEffect(() => {
    if (id) {
      fetchNotebookDetails();
      fetchAvailablePages();
    }
  }, [id]);

  const fetchNotebookDetails = async () => {
    try {
      setLoading(true);
      console.log('🟡 Notebook detayları alınıyor, ID:', id);
      
      const response = await api.get(`/notebooks/${id}`);
      console.log('✅ Notebook detayları alındı:', response.data);
      
      // Görsel URL'lerini tam URL'ye çevir
      const notebookData = response.data;
      
      // Notebook'daki sayfaların coverImage'larını düzelt
      if (notebookData.devlogPages) {
        notebookData.devlogPages = notebookData.devlogPages.map((page: any) => ({
          ...page,
          coverImage: getFullImageUrl(page.coverImage),
          author: page.author ? {
            ...page.author,
            photo: getFullImageUrl(page.author.photo)
          } : page.author
        }));
      }
      
      setNotebook(notebookData);
    } catch (error: any) {
      console.error('🔴 Notebook details error:', error);
      console.error('🔴 Hata detayı:', error.response?.data);
      console.error('🔴 Hata status:', error.response?.status);
      
      if (error.response?.status === 404) {
        toast.error('Defter bulunamadı');
      } else if (error.response?.status === 403) {
        toast.error('Bu deftere erişim izniniz yok');
      } else {
        toast.error('Defter detayları yüklenirken bir hata oluştu');
      }
      navigate('/notebooks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePages = async () => {
    try {
      const response = await api.get('/devlogs');
      // Sadece kullanıcının kendi sayfalarını ve public sayfaları getir
      const userPages = response.data.filter((page: any) => 
        page.author?.id === loggedInUser?.id || page.isPublished
      );
      
      // Görsel URL'lerini tam URL'ye çevir
      const pagesWithFullUrls = userPages.map((page: any) => ({
        ...page,
        coverImage: getFullImageUrl(page.coverImage),
        author: page.author ? {
          ...page.author,
          photo: getFullImageUrl(page.author.photo)
        } : page.author
      }));
      
      setAvailablePages(pagesWithFullUrls);
    } catch (error) {
      console.error('Available pages error:', error);
    }
  };

  const handleAddPage = async () => {
    if (!selectedPage) {
      toast.error('Lütfen bir sayfa seçin');
      return;
    }

    try {
      await api.post(`/notebooks/${id}/devlogs/${selectedPage}`);
      toast.success('Sayfa deftere eklendi');
      setShowAddPageModal(false);
      setSelectedPage('');
      fetchNotebookDetails();
    } catch (error: any) {
      console.error('Add page error:', error);
      toast.error(error.response?.data?.message || 'Sayfa eklenirken bir hata oluştu');
    }
  };

  const handleRemovePage = async (pageId: number) => {
    try {
      await api.delete(`/notebooks/${id}/devlogs/${pageId}`);
      toast.success('Sayfa defterden kaldırıldı');
      fetchNotebookDetails();
    } catch (error: any) {
      console.error('Remove page error:', error);
      toast.error(error.response?.data?.message || 'Sayfa kaldırılırken bir hata oluştu');
    }
  };

  const handleDeleteNotebook = async () => {
    try {
      console.log('🟡 Notebook siliniyor, ID:', id);
      
      await api.delete(`/notebooks/${id}`);
      
      toast.success('Defter silindi');
      navigate('/notebooks');
    } catch (error: any) {
      console.error('🔴 Delete notebook error:', error);
      console.error('🔴 Hata detayı:', error.response?.data);
      
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
      month: 'long',
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

  if (!notebook) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{notebook.name}</h1>
                {notebook.isDefault && (
                  <Badge color="blue">Varsayılan</Badge>
                )}
                {notebook.isPublic ? (
                  <Badge color="green" icon={HiLockOpen}>Herkese Açık</Badge>
                ) : (
                  <Badge color="gray" icon={HiLockClosed}>Özel</Badge>
                )}
              </div>
              <p className="text-gray-600">{notebook.description}</p>
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <HiOutlineUser className="w-4 h-4 mr-1" />
                  {notebook.user?.username}
                </span>
                <span className="flex items-center">
                  <HiOutlineCalendar className="w-4 h-4 mr-1" />
                  {formatDate(notebook.createdAt)}
                </span>
                <span className="flex items-center">
                  <HiOutlineBookOpen className="w-4 h-4 mr-1" />
                  {notebook.devlogPages?.length || 0} sayfa
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => setShowAddPageModal(true)}>
                <HiOutlinePlus className="w-5 h-5 mr-2" />
                Sayfa Ekle
              </Button>
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <Button color="light">
                    <HiDotsVertical className="w-5 h-5" />
                  </Button>
                }
              >
                <DropdownHeader>
                  <span className="block text-sm">Defter İşlemleri</span>
                </DropdownHeader>
                <DropdownItem onClick={() => navigate(`/notebooks/${id}/edit`)}>
                  <HiOutlinePencil className="w-4 h-4 mr-2" />
                  Düzenle
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleDeleteNotebook} className="text-red-600">
                  <HiOutlineTrash className="w-4 h-4 mr-2" />
                  Sil
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Sayfa Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebook.devlogPages?.length === 0 ? (
            <div className="col-span-3">
              <Card className="text-center py-12">
                <HiOutlineBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Bu defterde henüz sayfa yok
                </h3>
                <p className="text-gray-500 mb-6">Yeni sayfalar ekleyerek başlayın</p>
                <Button onClick={() => setShowAddPageModal(true)}>
                  <HiOutlinePlus className="w-5 h-5 mr-2" />
                  Sayfa Ekle
                </Button>
              </Card>
            </div>
          ) : (
            notebook.devlogPages?.map((page: any) => (
              <Card key={page.id} className="hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={page.coverImage}
                    alt={page.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Görsel yüklenemedi:', page.coverImage);
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {page.title}
                  </h3>
                  <div className="mb-4">
                    <Badge color={page.isPublished ? 'green' : 'yellow'} className="mr-2">
                      {page.isPublished ? 'Yayında' : 'Taslak'}
                    </Badge>
                    <Badge color="blue">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-1 relative">
                          {page.author?.photo ? (
                            <img
                              src={getFullImageUrl(page.author.photo)}
                              alt={page.author.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('❌ Yazar fotoğrafı yüklenemedi:', page.author?.photo);
                                const imgElement = e.target as HTMLImageElement;
                                imgElement.style.display = 'none';
                                const parentDiv = imgElement.closest('.w-6.h-6');
                                if (parentDiv) {
                                  const fallback = parentDiv.querySelector('.author-fallback') as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }
                              }}
                              onLoad={() => {
                                console.log('✅ Yazar fotoğrafı yüklendi:', getFullImageUrl(page.author?.photo));
                              }}
                            />
                          ) : null}
                          <div className={`author-fallback ${page.author?.photo ? 'hidden' : 'flex'} w-full h-full bg-blue-100 items-center justify-center absolute inset-0`}>
                            <HiOutlineUser className="w-3 h-3 text-blue-600" />
                          </div>
                        </div>
                        <span>{page.author?.username}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <HiOutlineEye className="w-4 h-4 mr-1" />
                        {page.viewCount}
                      </span>
                    </div>
                    <span>{formatDate(page.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button
                    color="light"
                    className="flex-1"
                    onClick={() => navigate(`/devlogs/${page.id}`)}
                  >
                    Görüntüle
                  </Button>
                  <Button
                    color="failure"
                    className="flex-1"
                    onClick={() => handleRemovePage(page.id)}
                  >
                    Çıkar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sayfa Ekleme Modalı */}
        <Modal show={showAddPageModal} onClose={() => setShowAddPageModal(false)} size="lg">
          <ModalHeader>Deftere Sayfa Ekle</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Sayfalar
                </label>
                {availablePages.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Ekleyebileceğiniz sayfa bulunmuyor
                  </p>
                ) : (
                  <Select
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                  >
                    <option value="">Sayfa seçin...</option>
                    {availablePages.map((page: any) => (
                      <option key={page.id} value={page.id}>
                        {page.title} - {page.author?.username} 
                        {!page.isPublished && ' (Taslak)'}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button color="alternative" onClick={() => setShowAddPageModal(false)}>
                  İptal
                </Button>
                <Button
                  onClick={handleAddPage}
                  disabled={!selectedPage}
                >
                  Ekle
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default NotebookDetail;