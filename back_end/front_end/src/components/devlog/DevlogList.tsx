// src/components/devlog/DevlogList.tsx - GÜNCELLENMİŞ
import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { useLoggedInUsersContext } from '../auth/LoggedInUserContext';
import { api, getFullImageUrl } from '../../helper/api';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Badge,
  Pagination,
} from 'flowbite-react';
import {
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineBookOpen,
  HiOutlinePlus,
  HiOutlinePencil,
} from 'react-icons/hi';

const DevlogList = () => {
  const { loggedInUser } = useLoggedInUsersContext();
  const [devlogs, setDevlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDevlogs();
  }, [page]);

  // ✅ DEĞİŞTİRİLDİ: Sadece kendi devloglarımızı getir
  const fetchDevlogs = async () => {
    if (!loggedInUser) {
      return <Navigate to="/login" />;
    }

    try {
      setLoading(true);
      // ✅ Backend'de mine=true parametresi ile istek yapıyoruz
      const response = await api.get('/devlogs?mine=true');
      
      // Görsel URL'lerini tam URL'ye çevir
      const devlogsWithFullUrls = response.data.map((devlog: any) => ({
        ...devlog,
        coverImage: getFullImageUrl(devlog.coverImage),
        author: devlog.author ? {
          ...devlog.author,
          photo: getFullImageUrl(devlog.author.photo)
        } : devlog.author
      }));
      
      setDevlogs(devlogsWithFullUrls);
      setTotalPages(Math.ceil(devlogsWithFullUrls.length / 9));
    } catch (error: any) {
      console.error('Devlogs fetch error:', error);
      toast.error('Devlog\'lar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!loggedInUser) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Benim Devlog'larım</h1>
            <p className="text-gray-600">Oluşturduğunuz tüm geliştirme günlüğü sayfaları</p>
          </div>
          <Link to="/devlogs/create">
            <Button>
              <HiOutlinePlus className="w-5 h-5 mr-2" />
              Yeni Devlog
            </Button>
          </Link>
        </div>

        {/* Devlog Listesi */}
        {devlogs.length === 0 ? (
          <Card className="text-center py-12">
            <HiOutlineBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Henüz devlog sayfanız yok
            </h3>
            <p className="text-gray-500 mb-6">
              İlk devlog'unuzu oluşturarak başlayın!
            </p>
            <Link to="/devlogs/create">
              <Button>
                <HiOutlinePlus className="w-5 h-5 mr-2" />
                İlk Devlog'u Oluştur
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devlogs.map((devlog) => (
                <Card key={devlog.id} className="h-full hover:shadow-lg transition-shadow">
                  {/* Kapak Görseli */}
                  <div className="h-48 overflow-hidden rounded-lg mb-4">
                    <img
                      src={devlog.coverImage}
                      alt={devlog.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Kapak görseli yüklenemedi:', devlog.coverImage);
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';
                      }}
                      onLoad={() => {
                        console.log('✅ Kapak görseli yüklendi:', devlog.coverImage);
                      }}
                    />
                  </div>

                  {/* Başlık ve Durum */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {devlog.title}
                    </h3>
                    <div className="mb-4">
                      <Badge color={devlog.isPublished ? 'green' : 'yellow'} className="mr-2">
                        {devlog.isPublished ? 'Yayında' : 'Taslak'}
                      </Badge>
                      {devlog.originalNotebook && (
                        <Badge color="blue">
                          {devlog.originalNotebook.name}
                        </Badge>
                      )}
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

                    {/* Yazar (her zaman kendiniz) */}
                    <div className="flex items-center pt-4 border-t border-gray-200">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 relative">
                        {devlog.author?.photo ? (
                          <img
                            src={getFullImageUrl(devlog.author.photo)}
                            alt={devlog.author.username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('❌ Yazar fotoğrafı yüklenemedi:', devlog.author?.photo);
                              const imgElement = e.target as HTMLImageElement;
                              imgElement.style.display = 'none';
                              const parentDiv = imgElement.closest('.w-8.h-8');
                              if (parentDiv) {
                                const fallback = parentDiv.querySelector('.author-fallback') as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }
                            }}
                          />
                        ) : null}
                        <div className={`author-fallback ${devlog.author?.photo ? 'hidden' : 'flex'} w-full h-full bg-blue-100 items-center justify-center absolute inset-0`}>
                          <HiOutlineUser className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {devlog.author?.username} 
                      </span>
                    </div>
                  </div>

                  {/* Action Butonları */}
                  <div className="mt-4 flex space-x-2">
                    <Link to={`/devlogs/${devlog.id}`} className="flex-1">
                      <Button color="blue" className="w-full">
                        Görüntüle
                      </Button>
                    </Link>
                    <Link to={`/devlogs/${devlog.id}/edit`} className="flex-1">
                      <Button color="light" className="w-full">
                        <HiOutlinePencil className="w-4 h-4 mr-1" />
                        Düzenle
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  showIcons
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DevlogList;