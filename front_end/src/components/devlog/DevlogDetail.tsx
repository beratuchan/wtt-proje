import { useState, useEffect, useRef, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useLoggedInUsersContext } from '../auth/LoggedInUserContext';
import { api, getFullImageUrl, getUserPhotoUrl } from '../../helper/api';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Badge,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
  Modal,
  ModalBody,
  ModalHeader,
  Textarea,
  Select,
  Label,
  Alert,
} from 'flowbite-react';
import {
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineBookOpen,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineDotsVertical,
  HiArrowLeft,
  HiOutlineFlag,
  HiOutlineExclamation,
  HiOutlineChat,
  HiOutlinePlus,
} from 'react-icons/hi';
import type { DevlogBlock } from '../../../../lesson5/src/types/devlog';

// ✅ YENİ: Fotoğraf cache yönetimi için hook
const useUserPhotoUrl = (photoUrl: string | null | undefined, userId?: number) => {
  const [url, setUrl] = useState('');
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!photoUrl || photoUrl.trim() === '') {
      setUrl('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop');
      return;
    }

    const lastUpdate = localStorage.getItem('lastProfileUpdate');
    const currentTime = Date.now();
    
    // Son 15 dakika içinde profil güncellemesi yapıldıysa cache'i bypass et
    const shouldForceRefresh = lastUpdate && 
      (currentTime - parseInt(lastUpdate)) < 15 * 60 * 1000;
    
    let photoUrlToUse = getUserPhotoUrl(photoUrl, shouldForceRefresh || shouldRefresh);
    
    // Aynı URL için 2 dakikadan daha kısa sürede tekrar istek yapma
    if (currentTime - lastUpdateRef.current < 2 * 60 * 1000) {
      photoUrlToUse = getUserPhotoUrl(photoUrl, true);
    }
    
    lastUpdateRef.current = currentTime;
    setUrl(photoUrlToUse);

    // ✅ YENİ: User profile güncelleme event'ini dinle
    const handleProfileUpdate = (event: any) => {
      if (event.detail.userId === userId) {
        console.log('🔄 DevlogDetail: Kullanıcı fotoğrafı güncellendi, yenileniyor');
        setShouldRefresh(true);
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [photoUrl, shouldRefresh, userId]);

  return url;
};

// Genişletilmiş DevlogBlock tipi (table tipini ekledik)
type ExtendedDevlogBlock = {
  type: 'paragraph' | 'heading' | 'code' | 'image' | 'quote' | 'table';
  content?: string;
  text?: string;
  level?: 2 | 3;
  language?: string;
  code?: string;
  src?: string;
  alt?: string;
  caption?: string;
  author?: string;
  className?: string;
  headers?: string[];
  rows?: string[][];
};

const DevlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUsersContext();
  const [devlog, setDevlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [parsedContent, setParsedContent] = useState<ExtendedDevlogBlock[]>([]);
  
  // Şikayet form state'leri
  const [complaintReason, setComplaintReason] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // YENİ: Deftere ekleme state'leri
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [showAddToNotebookModal, setShowAddToNotebookModal] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState('');

  // ✅ YENİ: Yazar fotoğrafı için hook
  const authorPhotoUrl = useUserPhotoUrl(devlog?.author?.photo, devlog?.author?.id);
  const loggedInUserPhotoUrl = useUserPhotoUrl(loggedInUser?.photo, loggedInUser?.id);

  useEffect(() => {
    if (id) {
      fetchDevlog();
      fetchNotebooks();
    }
  }, [id]);

  const fetchDevlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/devlogs/${id}`);
      console.log('✅ Devlog detayı:', response.data);
      
      // Görsel URL'lerini tam URL'ye çevir
      const devlogData = response.data;
      devlogData.coverImage = getFullImageUrl(devlogData.coverImage);
      
      // Yazar fotoğrafını tam URL'ye çevir
      if (devlogData.author?.photo) {
        devlogData.author.photo = getFullImageUrl(devlogData.author.photo);
      }
      
      // Content'i parse et ve görsel URL'lerini düzelt
      if (devlogData.content) {
        try {
          const parsed = JSON.parse(devlogData.content);
          // Image bloklarının src'sini tam URL yap
          const fixedContent = parsed.map((block: any) => {
            if (block.type === 'image' && block.src) {
              return {
                ...block,
                src: getFullImageUrl(block.src),
              };
            }
            return block;
          });
          setParsedContent(fixedContent);
        } catch (e) {
          console.error('Content parse error:', e);
          setParsedContent([]);
        }
      }
      
      setDevlog(devlogData);
    } catch (error: any) {
      console.error('🔴 Devlog fetch error:', error);
      
      if (error.response?.status === 404) {
        toast.error('Devlog sayfası bulunamadı');
      } else if (error.response?.status === 403) {
        toast.error('Bu sayfaya erişim izniniz yok');
      } else {
        toast.error('Devlog yüklenirken bir hata oluştu');
      }
      navigate('/devlogs');
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcının defterlerini getir
  const fetchNotebooks = async () => {
    try {
      const response = await api.get('/notebooks');
      setNotebooks(response.data);
    } catch (error) {
      console.error('Defterler alınırken hata:', error);
    }
  };

  // Deftere ekle
  const handleAddToNotebook = async () => {
    if (!selectedNotebookId) {
      toast.error('Lütfen bir defter seçin');
      return;
    }

    try {
      await api.post(`/notebooks/${selectedNotebookId}/devlogs/${id}`);
      toast.success('Devlog deftere eklendi');
      setShowAddToNotebookModal(false);
      setSelectedNotebookId('');
    } catch (error: any) {
      console.error('Deftere ekleme hatası:', error);
      toast.error(error.response?.data?.message || 'Deftere eklenirken bir hata oluştu');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/devlogs/${id}`);
      toast.success('Devlog başarıyla silindi');
      navigate('/devlogs');
    } catch (error: any) {
      console.error('🔴 Delete error:', error);
      toast.error(error.response?.data?.message || 'Silinirken bir hata oluştu');
    }
  };

  // Şikayet gönderme fonksiyonu
  const handleSubmitComplaint = async () => {
    if (!complaintReason || !complaintDescription.trim()) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (complaintDescription.length < 20) {
      toast.error('Açıklama en az 20 karakter olmalıdır');
      return;
    }

    try {
      setSubmittingComplaint(true);
      await api.post('/complaints', {
        devlogPageId: id,
        reason: complaintReason,
        description: complaintDescription,
      });
      
      toast.success('Şikayetiniz alındı. İncelenecektir.');
      setShowComplaintModal(false);
      resetComplaintForm();
    } catch (error: any) {
      console.error('🔴 Complaint error:', error);
      
      if (error.response?.status === 400) {
        toast.error('Bu sayfa için zaten bir şikayetiniz var');
      } else if (error.response?.status === 401) {
        toast.error('Şikayet etmek için giriş yapmalısınız');
      } else {
        toast.error(error.response?.data?.message || 'Şikayet gönderilirken bir hata oluştu');
      }
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Şikayet formunu sıfırlama
  const resetComplaintForm = () => {
    setComplaintReason('');
    setComplaintDescription('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContentBlock = (block: ExtendedDevlogBlock, index: number) => {
    switch (block.type) {
      case 'paragraph': {
        return (
          <p key={index} className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify mb-5">
            {block.content}
          </p>
        );
      }
      
      case 'heading': {
        const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            key={index} 
            className={block.className || `text-${block.level === 2 ? '2xl' : 'xl'} font-semibold bg-gradient-to-r from-cyan-600 to-rose-500 bg-clip-text text-transparent mt-8 mb-3`}
          >
            {block.text}
          </HeadingTag>
        );
      }
      
      case 'code': {
        return (
          <div key={index} className="mb-6 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-cyan-500 to-rose-500 px-4 py-2">
              <span className="text-white text-xs font-semibold">
                {block.language?.toUpperCase() || 'CODE'}
              </span>
            </div>
            <pre className="bg-gray-900 dark:bg-black text-gray-100 text-sm p-4 overflow-x-auto">
              <code>{block.code}</code>
            </pre>
          </div>
        );
      }
      
      case 'image': {
        const imageSrc = block.src ? getFullImageUrl(block.src) : '';
        return (
          <div key={index} className="mb-8">
            <img
              src={imageSrc}
              alt={block.alt}
              className="rounded-xl shadow-2xl mb-3 mx-auto border-4 border-gray-200 dark:border-gray-700 hover:shadow-cyan-500/50 transition-shadow duration-300"
              onError={(e) => {
                console.error('❌ Görsel yüklenemedi:', imageSrc);
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';
              }}
              onLoad={() => {
                console.log('✅ Görsel başarıyla yüklendi:', imageSrc);
              }}
            />
            {block.caption && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center font-medium">
                {block.caption}
              </p>
            )}
          </div>
        );
      }
      
      case 'table': {
        if (!block.headers || !block.rows) return null;
        
        return (
          <div key={index} className="mb-8 overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-cyan-500 to-rose-500 text-white">
                <tr>
                  {block.headers.map((header: string, i: number) => (
                    <th key={i} className="px-6 py-3 text-left font-bold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {block.rows.map((row: string[], i: number) => (
                  <tr 
                    key={i} 
                    className={`${
                      i % 2 === 0 
                        ? 'bg-white dark:bg-gray-800' 
                        : 'bg-gray-50 dark:bg-gray-900'
                    } hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors`}
                  >
                    {row.map((cell: string, j: number) => (
                      <td key={j} className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      case 'quote': {
        return (
          <blockquote 
            key={index} 
            className="relative border-l-4 pl-6 py-4 my-8 bg-gradient-to-r from-cyan-50 to-rose-50 dark:from-cyan-900/20 dark:to-rose-900/20 rounded-r-xl"
            style={{ borderImage: 'linear-gradient(180deg, #00bfff, #ff4c68) 1' }}
          >
            <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-2">
              "{block.text}"
            </p>
            {block.author && (
              <footer className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">
                — {block.author}
              </footer>
            )}
          </blockquote>
        );
      }
      
      default: {
        return null;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!devlog) {
    return null;
  }

  const isOwner = loggedInUser?.id === devlog.author?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Geri butonu */}
        <Button
          color="light"
          onClick={() => navigate('/devlogs')}
          className="mb-6"
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Devlog Listesine Dön
        </Button>

        {/* Ana kart */}
        <Card>
          {/* Başlık ve işlemler */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {devlog.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge color={devlog.isPublished ? 'green' : 'yellow'}>
                  {devlog.isPublished ? 'Yayında' : 'Taslak'}
                </Badge>
                {devlog.originalNotebook && (
                  <Badge color="blue">
                    <HiOutlineBookOpen className="w-4 h-4 mr-1" />
                    {devlog.originalNotebook.name}
                  </Badge>
                )}
              </div>
            </div>

            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Button color="light">
                  <HiOutlineDotsVertical className="w-5 h-5" />
                </Button>
              }
            >
              <DropdownHeader>
                <span className="block text-sm">Sayfa İşlemleri</span>
              </DropdownHeader>
              
              {isOwner && (
                <>
                  <DropdownItem onClick={() => navigate(`/devlogs/${id}/edit`)}>
                    <HiOutlinePencil className="w-4 h-4 mr-2" />
                    Düzenle
                  </DropdownItem>
                  <DropdownItem onClick={() => setShowAddToNotebookModal(true)}>
                    <HiOutlinePlus className="w-4 h-4 mr-2" />
                    Deftere Ekle
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={() => setShowDeleteModal(true)} className="text-red-600">
                    <HiOutlineTrash className="w-4 h-4 mr-2" />
                    Sil
                  </DropdownItem>
                </>
              )}
              
              {!isOwner && loggedInUser && (
                <>
                  <DropdownItem onClick={() => setShowAddToNotebookModal(true)}>
                    <HiOutlinePlus className="w-4 h-4 mr-2" />
                    Deftere Ekle
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem 
                    onClick={() => setShowComplaintModal(true)}
                    className="text-red-600"
                  >
                    <HiOutlineFlag className="w-4 h-4 mr-2" />
                    Tüm Sayfayı Şikayet Et
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </div>

          {/* Kapak görseli */}
          <div className="mb-8">
            <img
              src={devlog.coverImage}
              alt={devlog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
              onError={(e) => {
                console.error('❌ Kapak görseli yüklenemedi:', devlog.coverImage);
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';
              }}
              onLoad={() => {
                console.log('✅ Kapak görseli yüklendi:', devlog.coverImage);
              }}
            />
          </div>

          {/* İstatistikler ve Sosyal Butonlar */}
          <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-6">
              <span className="flex items-center text-gray-600">
                <HiOutlineEye className="w-5 h-5 mr-2" />
                {devlog.viewCount} görüntüleme
              </span>
              <span className="flex items-center text-gray-600">
                <HiOutlineCalendar className="w-5 h-5 mr-2" />
                {formatDate(devlog.createdAt)}
              </span>
            </div>
            
            {/* Sosyal Butonlar */}
            <div className="flex space-x-2">
              <Button
                color="light"
                onClick={() => setShowAddToNotebookModal(true)}
              >
                <HiOutlinePlus className="w-5 h-5 mr-2" />
                Deftere Ekle
              </Button>
              
              {!isOwner && loggedInUser && (
                <Button
                  color="warning"
                  onClick={() => setShowComplaintModal(true)}
                >
                  <HiOutlineFlag className="w-5 h-5 mr-2" />
                  Şikayet Et
                </Button>
              )}
            </div>
          </div>

          {/* Yazar bilgisi */}
          <div className="flex items-center mb-8 p-4 border-t border-b border-gray-200">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              {authorPhotoUrl ? (
                <img
                  src={authorPhotoUrl}
                  alt={devlog.author?.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('❌ Yazar fotoğrafı yüklenemedi:', authorPhotoUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parentDiv = (e.target as HTMLElement).closest('.w-12.h-12');
                    if (parentDiv) {
                      const fallback = parentDiv.querySelector('.author-fallback') as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Yazar fotoğrafı yüklendi:', authorPhotoUrl);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <HiOutlineUser className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div className="author-fallback hidden w-full h-full bg-blue-100 items-center justify-center absolute inset-0">
                <HiOutlineUser className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-800">{devlog.author?.username}</p>
              <p className="text-sm text-gray-500">{devlog.author?.email}</p>
            </div>
          </div>

          {/* İçerik */}
          <div className="mb-8">
            <div className="prose max-w-none">
              {parsedContent.map((block, index) => renderContentBlock(block, index))}
            </div>
          </div>

          {/* YENİ: İçerik Sonu Şikayet Uyarısı */}
          {!isOwner && loggedInUser && (
            <Alert color="warning" icon={HiOutlineExclamation} className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Uygunsuz içerik mi gördünüz?</span>
                  <p className="text-sm mt-1">
                    Eğer bu sayfada uygunsuz, spam, telif hakkı ihlali veya taciz içeren içerik varsa lütfen şikayet edin.
                  </p>
                </div>
                <Button
                  color="warning"
                  size="sm"
                  onClick={() => setShowComplaintModal(true)}
                >
                  <HiOutlineFlag className="w-4 h-4 mr-2" />
                  Tüm Sayfayı Şikayet Et
                </Button>
              </div>
            </Alert>
          )}

          {/* Etiketler */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Etiketler</h3>
            <div className="flex flex-wrap gap-2">
              <Badge color="gray">Geliştirme</Badge>
              <Badge color="gray">Notlar</Badge>
              <Badge color="gray">Proje</Badge>
              <Badge color="gray">Eğitim</Badge>
              <Badge color="gray">Deneyim</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Silme onay modalı */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>Devlog'u Sil</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <HiOutlineTrash className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bu devlog sayfasını silmek istediğinize emin misiniz?
            </h3>
            <p className="text-gray-500 mb-6">
              Bu işlem geri alınamaz. Sayfa ve tüm içeriği kalıcı olarak silinecektir.
            </p>
            <div className="flex justify-center space-x-3">
              <Button color="alternative" onClick={() => setShowDeleteModal(false)}>
                İptal
              </Button>
              <Button color="failure" onClick={handleDelete}>
                Sil
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Şikayet Modalı */}
      <Modal 
        show={showComplaintModal} 
        onClose={() => {
          setShowComplaintModal(false);
          resetComplaintForm();
        }}
        size="md"
      >
        <ModalHeader>
          <div className="flex items-center">
            <HiOutlineFlag className="w-6 h-6 text-red-500 mr-2" />
            İçerik Şikayeti
          </div>
        </ModalHeader>
        
        <ModalBody className="py-6">
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 mb-4">
                <span className="font-medium text-gray-800">"{devlog?.title}"</span> başlıklı içerik için şikayetinizi bildirin.
              </p>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="complaint-reason">Şikayet Nedeni *</Label>
              </div>
              <Select
                id="complaint-reason"
                value={complaintReason}
                onChange={(e) => setComplaintReason(e.target.value)}
                required
              >
                <option value="">Seçiniz</option>
                <option value="inappropriate">Uygunsuz İçerik</option>
                <option value="spam">Spam/Reklam</option>
                <option value="copyright">Telif Hakkı İhlali</option>
                <option value="harassment">Taciz/Neffret Söylemi</option>
                <option value="other">Diğer</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="complaint-description">Açıklama *</Label>
              </div>
              <Textarea
                id="complaint-description"
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                placeholder="Şikayetinizin detayını açıklayın (en az 20 karakter)..."
                rows={4}
                required
              />
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${complaintDescription.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                  {complaintDescription.length}/500 karakter
                </span>
                {complaintDescription.length > 0 && complaintDescription.length < 20 && (
                  <span className="text-xs text-red-500">
                    En az 20 karakter gerekli
                  </span>
                )}
              </div>
            </div>

            {/* ✅ YENİ: Şikayet eden kullanıcının fotoğrafı */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {loggedInUserPhotoUrl ? (
                    <img
                      src={loggedInUserPhotoUrl}
                      alt={loggedInUser?.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Kullanıcı fotoğrafı yüklenemedi:', loggedInUserPhotoUrl);
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parentDiv = (e.target as HTMLElement).closest('.w-10.h-10');
                        if (parentDiv) {
                          const fallback = parentDiv.querySelector('.complainer-fallback') as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <HiOutlineUser className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div className="complainer-fallback hidden w-full h-full bg-blue-100 items-center justify-center absolute inset-0">
                    <HiOutlineUser className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{loggedInUser?.username}</p>
                  <p className="text-sm text-gray-500">Şikayet eden kullanıcı</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <HiOutlineExclamation className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Şikayet Politikası</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Yanlış veya kötü niyetli şikayetler hesabınızı etkileyebilir. 
                    Şikayetler adminler tarafından incelenecek ve sonuç hakkında bilgilendirileceksiniz.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                color="alternative"
                onClick={() => {
                  setShowComplaintModal(false);
                  resetComplaintForm();
                }}
                disabled={submittingComplaint}
                className="px-6"
              >
                İptal
              </Button>
              <Button
                color="failure"
                onClick={handleSubmitComplaint}
                disabled={
                  !complaintReason || 
                  !complaintDescription.trim() || 
                  complaintDescription.length < 20 || 
                  submittingComplaint
                }
                className="px-6"
              >
                {submittingComplaint ? 'Gönderiliyor...' : 'Şikayeti Gönder'}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Deftere Ekleme Modalı */}
      <Modal show={showAddToNotebookModal} onClose={() => setShowAddToNotebookModal(false)}>
        <ModalHeader>Deftere Ekle</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notebook-select">Defter Seçin</Label>
              <Select
                id="notebook-select"
                value={selectedNotebookId}
                onChange={(e) => setSelectedNotebookId(e.target.value)}
              >
                <option value="">Bir defter seçin</option>
                {notebooks.map((notebook) => (
                  <option key={notebook.id} value={notebook.id}>
                    {notebook.name} {notebook.isDefault && '(Varsayılan)'}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button color="alternative" onClick={() => setShowAddToNotebookModal(false)}>
                İptal
              </Button>
              <Button onClick={handleAddToNotebook} disabled={!selectedNotebookId}>
                Ekle
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default DevlogDetail;