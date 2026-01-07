// src/components/homepage/Homepage.tsx - GÜNCELLENMİŞ
import { useState, useEffect } from 'react';
import { useLoggedInUsersContext } from '../auth/LoggedInUserContext';
import { api, getFullImageUrl } from '../../helper/api';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Badge,
  Select,
  Pagination,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from 'flowbite-react';
import {
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineFlag,
  HiOutlineBookOpen,
  HiOutlineFire,
  HiOutlineTrendingUp,
  HiOutlineExclamation,
} from 'react-icons/hi';

const Homepage = () => {
  const { loggedInUser } = useLoggedInUsersContext();
  const [devlogs, setDevlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedDevlog, setSelectedDevlog] = useState<any>(null);

  useEffect(() => {
    fetchDevlogs();
  }, [sortBy, page]);

  const fetchDevlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/devlogs');
      
      // ✅ DEĞİŞTİRİLDİ: Sadece başkalarının devloglarını filtrele
      let filtered = response.data.filter((devlog: any) => 
        devlog.author?.id !== loggedInUser?.id && devlog.isPublished
      );
      
      // Eğer hiç devlog yoksa
      if (filtered.length === 0) {
        setDevlogs([]);
        setLoading(false);
        return;
      }
      
      // Sıralama
      filtered.sort((a: any, b: any) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'popular':
            return b.viewCount - a.viewCount;
          default:
            return 0;
        }
      });
      
      // Görsel URL'lerini tam URL'ye çevir
      const devlogsWithFullUrls = filtered.map((devlog: any) => ({
        ...devlog,
        coverImage: getFullImageUrl(devlog.coverImage),
        author: devlog.author ? {
          ...devlog.author,
          photo: getFullImageUrl(devlog.author.photo)
        } : devlog.author
      }));
      
      setDevlogs(devlogsWithFullUrls);
      setTotalPages(Math.ceil(devlogsWithFullUrls.length / 12));
    } catch (error: any) {
      console.error('Devlogs fetch error:', error);
      toast.error('Sayfalar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleComplaint = (devlog: any) => {
    if (!loggedInUser) {
      toast.error('Şikayet etmek için giriş yapmalısınız');
      return;
    }
    setSelectedDevlog(devlog);
    setShowComplaintModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'newest': return <HiOutlineCalendar className="w-5 h-5" />;
      case 'popular': return <HiOutlineFire className="w-5 h-5" />;
      default: return <HiOutlineTrendingUp className="w-5 h-5" />;
    }
  };

  if (loading && devlogs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Topluluk Devlog'ları
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Diğer geliştiricilerin deneyimlerini, projelerini ve öğrendiklerini keşfedin
          </p>
        </div>

        {/* Kontroller */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getSortIcon()}
                <span className="font-medium text-gray-700">Sırala:</span>
              </div>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-48"
              >
                <option value="newest">En Yeni</option>
                <option value="popular">En Popüler</option>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Badge color="blue" className="px-3 py-1">
                <HiOutlineBookOpen className="w-4 h-4 mr-1" />
                {devlogs.length} Paylaşım
              </Badge>
            </div>
          </div>
        </div>

        {/* Devlog Grid */}
        {devlogs.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Henüz paylaşım yok
            </h3>
            <p className="text-gray-500">
              Diğer kullanıcılar henüz devlog paylaşmamış. 
              Siz ilk devlog'unuzu oluşturarak başlayabilirsiniz!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {devlogs.map((devlog) => (
              <Card key={devlog.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Kapak Görseli */}
                <div className="h-48 overflow-hidden rounded-lg mb-4 relative">
                  <img
                    src={devlog.coverImage}
                    alt={devlog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Kapak görseli yüklenemedi:', devlog.coverImage);
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';
                    }}
                  />
                </div>

                {/* Başlık ve Yazar */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">
                    {devlog.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      {devlog.author?.photo ? (
                        <img
                          src={devlog.author.photo}
                          alt={devlog.author.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <HiOutlineUser className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {devlog.author?.username}
                    </span>
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <HiOutlineEye className="w-4 h-4 mr-1" />
                      {devlog.viewCount}
                    </span>
                  </div>
                  <span className="flex items-center">
                    <HiOutlineCalendar className="w-4 h-4 mr-1" />
                    {formatDate(devlog.createdAt)}
                  </span>
                </div>

                {/* Notebook Etiketleri */}
                {devlog.originalNotebook && (
                  <div className="mb-4">
                    <Badge color="blue" className="inline-flex items-center">
                      <HiOutlineBookOpen className="w-3 h-3 mr-1" />
                      {devlog.originalNotebook.name}
                    </Badge>
                  </div>
                )}

                {/* Action Butonları */}
                <div className="flex space-x-2">
                  <Button
                    color="blue"
                    className="flex-1"
                    onClick={() => window.open(`/devlogs/${devlog.id}`, '_blank')}
                  >
                    Görüntüle
                  </Button>
                  
                  <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                      <Button color="light" className="px-3">
                        •••
                      </Button>
                    }
                  >
                    <DropdownDivider />
                    <DropdownItem onClick={() => handleComplaint(devlog)} className="text-red-600">
                      <HiOutlineFlag className="w-4 h-4 mr-2" />
                      Şikayet Et
                    </DropdownItem>
                  </Dropdown>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showIcons
            />
          </div>
        )}
      </div>

      {/* Complaint Modal */}
      {showComplaintModal && selectedDevlog && (
        <ComplaintModal
          show={showComplaintModal}
          onClose={() => {
            setShowComplaintModal(false);
            setSelectedDevlog(null);
          }}
          devlogId={selectedDevlog.id}
          devlogTitle={selectedDevlog.title}
        />
      )}
    </div>
  );
};

// ComplaintModal component'i aynı kalacak
const ComplaintModal = ({ show, onClose, devlogId, devlogTitle }: any) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { loggedInUser } = useLoggedInUsersContext();

  const handleSubmit = async () => {
    if (!loggedInUser) {
      toast.error('Şikayet etmek için giriş yapmalısınız');
      return;
    }

    if (!reason || !description.trim()) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (description.length < 20) {
      toast.error('Açıklama en az 20 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      await api.post('/complaints', {
        devlogPageId: devlogId,
        reason,
        description,
      });
      
      toast.success('Şikayetiniz alındı. İncelenecektir.');
      onClose();
    } catch (error: any) {
      console.error('Complaint error:', error);
      toast.error(error.response?.data?.message || 'Şikayet gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            İçerik Şikayeti
          </h3>
          <p className="text-gray-600 mb-6">
            <span className="font-medium">"{devlogTitle}"</span> başlıklı içerik için şikayetinizi bildirin.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şikayet Nedeni *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="inappropriate">Uygunsuz İçerik</option>
                <option value="spam">Spam/Reklam</option>
                <option value="copyright">Telif Hakkı İhlali</option>
                <option value="harassment">Taciz/Neffret Söylemi</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Şikayetinizin detayını açıklayın (en az 20 karakter)..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 karakter
              </p>
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start">
                <HiOutlineExclamation className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800 mb-1">Şikayet Politikası:</p>
                  <ul className="list-disc pl-4 space-y-1 text-yellow-700">
                    <li>Yanlış şikayetler hesabınızı etkileyebilir</li>
                    <li>Şikayetler adminler tarafından incelenecektir</li>
                    <li>Sonuç hakkında bilgilendirileceksiniz</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={loading}
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason || !description.trim() || description.length < 20 || loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Gönderiliyor...' : 'Şikayeti Gönder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;