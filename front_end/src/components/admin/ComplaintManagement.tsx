import { useState, useEffect } from 'react';
import { useLoggedInUsersContext } from '../auth/LoggedInUserContext';
import { api, getFullImageUrl } from '../../helper/api';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Modal,
  ModalBody,
  ModalHeader,
  Pagination,
} from 'flowbite-react';
import {
  HiOutlineFlag,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineExclamation,
} from 'react-icons/hi';
import { Navigate } from 'react-router';

const ComplaintManagement = () => {
  const { loggedInUser } = useLoggedInUsersContext();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  // Sadece admin erişebilir
  if (loggedInUser?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, [filter, page]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const endpoint = filter !== 'all' 
        ? `/complaints?status=${filter}&page=${page}`
        : `/complaints?page=${page}`;
      
      const response = await api.get(endpoint);
      setComplaints(response.data);
      setTotalPages(Math.ceil(response.data.length / 10));
    } catch (error: any) {
      console.error('Complaints fetch error:', error);
      toast.error('Şikayetler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/complaints/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  // Şikayeti kabul et ve sayfayı sil
  const handleResolveComplaint = async (complaintId: number, devlogPageId?: number) => {
    try {
      const confirmDelete = window.confirm(
        'Bu şikayeti kabul edip sayfayı SİLMEK istediğinize emin misiniz?\n\n' +
        'BU İŞLEM GERİ ALINAMAZ! Sayfa ve tüm içeriği kalıcı olarak silinecektir.'
      );
      
      if (!confirmDelete) return;

      // Önce sayfayı sil
      if (devlogPageId) {
        await api.delete(`/devlogs/${devlogPageId}`);
        toast.success('Sayfa kalıcı olarak silindi');
      }

      // Şikayet durumunu güncelle
      await api.put(`/complaints/${complaintId}`, { status: 'resolved' });
      toast.success('Şikayet kabul edildi ve sayfa silindi');
      
      // Listeyi yenile
      fetchComplaints();
      fetchStats();
    } catch (error: any) {
      console.error('Resolve complaint error:', error);
      toast.error(error.response?.data?.message || 'İşlem sırasında bir hata oluştu');
    }
  };

  // Şikayeti reddet
  const handleRejectComplaint = async (complaintId: number) => {
    try {
      const confirmReject = window.confirm(
        'Bu şikayeti reddetmek istediğinize emin misiniz?\n\n' +
        'Şikayet reddedilecek ve sayfa yayında kalmaya devam edecektir.'
      );
      
      if (!confirmReject) return;

      // Şikayet durumunu güncelle
      await api.put(`/complaints/${complaintId}`, { status: 'rejected' });
      toast.success('Şikayet reddedildi');
      
      // Listeyi yenile
      fetchComplaints();
      fetchStats();
    } catch (error: any) {
      console.error('Reject complaint error:', error);
      toast.error(error.response?.data?.message || 'İşlem sırasında bir hata oluştu');
    }
  };

  const handleDeleteComplaint = async (complaintId: number) => {
    try {
      await api.delete(`/complaints/${complaintId}`);
      toast.success('Şikayet başarıyla silindi');
      fetchComplaints();
      fetchStats();
    } catch (error: any) {
      console.error('Delete complaint error:', error);
      toast.error('Şikayet silinirken bir hata oluştu');
    }
  };

  const viewComplaintDetails = (complaint: any) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };

  const viewDevlogPage = (devlogId: number) => {
    window.open(`/devlogs/${devlogId}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'resolved': return 'success';
      case 'rejected': return 'failure';
      default: return 'gray';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'inappropriate': return 'failure';
      case 'spam': return 'warning';
      case 'copyright': return 'purple';
      case 'harassment': return 'pink';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !stats) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Şikayet Yönetimi</h1>
          <p className="text-gray-600">Kullanıcıların bildirdiği şikayetleri inceleyin ve yönetin</p>
        </div>

        {/* İstatistik Kartları */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <HiOutlineFlag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                  <p className="text-sm text-gray-600">Toplam Şikayet</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <HiOutlineClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.stats?.pending || 0}</p>
                  <p className="text-sm text-gray-600">Bekleyen</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <HiOutlineEye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.stats?.reviewed || 0}</p>
                  <p className="text-sm text-gray-600">İncelenen</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.stats?.resolved || 0}</p>
                  <p className="text-sm text-gray-600">Çözülen</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <HiOutlineXCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.stats?.rejected || 0}</p>
                  <p className="text-sm text-gray-600">Reddedilen</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filtreler */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Badge
              color={filter === 'all' ? 'blue' : 'light'}
              onClick={() => setFilter('all')}
              className="cursor-pointer"
            >
              Tümü ({stats?.total || 0})
            </Badge>
            <Badge
              color={filter === 'pending' ? 'warning' : 'light'}
              onClick={() => setFilter('pending')}
              className="cursor-pointer"
            >
              Bekleyen ({stats?.stats?.pending || 0})
            </Badge>
            <Badge
              color={filter === 'reviewed' ? 'info' : 'light'}
              onClick={() => setFilter('reviewed')}
              className="cursor-pointer"
            >
              İncelenen ({stats?.stats?.reviewed || 0})
            </Badge>
            <Badge
              color={filter === 'resolved' ? 'success' : 'light'}
              onClick={() => setFilter('resolved')}
              className="cursor-pointer"
            >
              Çözülen ({stats?.stats?.resolved || 0})
            </Badge>
            <Badge
              color={filter === 'rejected' ? 'failure' : 'light'}
              onClick={() => setFilter('rejected')}
              className="cursor-pointer"
            >
              Reddedilen ({stats?.stats?.rejected || 0})
            </Badge>
          </div>
        </Card>

        {/* Şikayet Tablosu */}
        <Card>
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineFlag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Henüz şikayet yok
              </h3>
              <p className="text-gray-500">
                {filter !== 'all' 
                  ? `"${filter}" durumunda şikayet bulunamadı`
                  : 'Sistemde henüz hiç şikayet bulunmuyor'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table hoverable>
                  <TableHead>
                    <TableHeadCell>ID</TableHeadCell>
                    <TableHeadCell>Sayfa</TableHeadCell>
                    <TableHeadCell>Şikayet Eden</TableHeadCell>
                    <TableHeadCell>Neden</TableHeadCell>
                    <TableHeadCell>Durum</TableHeadCell>
                    <TableHeadCell>Tarih</TableHeadCell>
                    <TableHeadCell>İşlemler</TableHeadCell>
                  </TableHead>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">#{complaint.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded overflow-hidden">
                              {complaint.devlogPage?.coverImage ? (
                                <img
                                  src={getFullImageUrl(complaint.devlogPage.coverImage)}
                                  alt={complaint.devlogPage.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('❌ Görsel yüklenemedi:', complaint.devlogPage?.coverImage);
                                    const imgElement = e.target as HTMLImageElement;
                                    imgElement.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <HiOutlineDocumentText className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium truncate max-w-[150px]">
                              {complaint.devlogPage?.title || 'Silinmiş Sayfa'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <HiOutlineUser className="w-4 h-4 text-gray-400" />
                            <span>{complaint.user?.username || 'Silinmiş Kullanıcı'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge color={getReasonColor(complaint.reason)}>
                            {complaint.reason}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge color={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-500">
                            <HiOutlineCalendar className="w-4 h-4 mr-1" />
                            {formatDate(complaint.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="xs"
                              color="light"
                              onClick={() => viewComplaintDetails(complaint)}
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </Button>
                            
                            {complaint.status === 'pending' && (
                              <>
                                <Button
                                  size="xs"
                                  color="success"
                                  onClick={() => handleResolveComplaint(
                                    complaint.id,
                                    complaint.devlogPage?.id
                                  )}
                                  title="Şikayeti kabul et ve sayfayı sil"
                                >
                                  <HiOutlineCheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="xs"
                                  color="failure"
                                  onClick={() => handleRejectComplaint(
                                    complaint.id
                                  )}
                                  title="Şikayeti reddet"
                                >
                                  <HiOutlineXCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => handleDeleteComplaint(complaint.id)}
                              title="Şikayeti sil"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
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
        </Card>
      </div>

      {/* Şikayet Detay Modalı */}
      {showDetailsModal && selectedComplaint && (
        <Modal
          show={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          size="xl"
        >
          <ModalHeader>
            <div className="flex items-center">
              <HiOutlineFlag className="w-6 h-6 text-red-500 mr-2" />
              Şikayet Detayı (#{selectedComplaint.id})
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-6">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <h3 className="font-semibold text-gray-700 mb-2">Şikayet Bilgileri</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durum:</span>
                      <Badge color={getStatusColor(selectedComplaint.status)}>
                        {selectedComplaint.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Neden:</span>
                      <Badge color={getReasonColor(selectedComplaint.reason)}>
                        {selectedComplaint.reason}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Oluşturulma:</span>
                      <span>{formatDate(selectedComplaint.createdAt)}</span>
                    </div>
                    {selectedComplaint.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Son Güncelleme:</span>
                        <span>{formatDate(selectedComplaint.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 className="font-semibold text-gray-700 mb-2">İlgili Sayfa</h3>
                  {selectedComplaint.devlogPage ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded overflow-hidden">
                          <img
                            src={getFullImageUrl(selectedComplaint.devlogPage.coverImage)}
                            alt={selectedComplaint.devlogPage.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('❌ Görsel yüklenemedi:', selectedComplaint.devlogPage?.coverImage);
                              const imgElement = e.target as HTMLImageElement;
                              imgElement.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{selectedComplaint.devlogPage.title}</p>
                          <p className="text-sm text-gray-500">
                            {selectedComplaint.devlogPage.author?.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          color="blue"
                          size="xs"
                          onClick={() => viewDevlogPage(selectedComplaint.devlogPage.id)}
                        >
                          Sayfayı Görüntüle
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Sayfa silinmiş</p>
                  )}
                </Card>
              </div>

              {/* Şikayet Eden Kullanıcı */}
              <Card>
                <h3 className="font-semibold text-gray-700 mb-2">Şikayet Eden Kullanıcı</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                    {selectedComplaint.user?.photo ? (
                      <img
                        src={getFullImageUrl(selectedComplaint.user.photo)}
                        alt={selectedComplaint.user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Kullanıcı fotoğrafı yüklenemedi:', selectedComplaint.user?.photo);
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.display = 'none';
                          const parentDiv = imgElement.closest('.w-10.h-10');
                          if (parentDiv) {
                            const fallback = parentDiv.querySelector('.user-fallback') as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }
                        }}
                      />
                    ) : null}
                    <div className={`user-fallback ${selectedComplaint.user?.photo ? 'hidden' : 'flex'} w-full h-full bg-blue-100 items-center justify-center absolute inset-0`}>
                      <HiOutlineUser className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{selectedComplaint.user?.username || 'Silinmiş Kullanıcı'}</p>
                    <p className="text-sm text-gray-500">{selectedComplaint.user?.email || '-'}</p>
                  </div>
                </div>
              </Card>

              {/* Açıklama */}
              <Card>
                <h3 className="font-semibold text-gray-700 mb-2">Şikayet Açıklaması</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>
              </Card>

              {/* Uyarı Mesajı */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <HiOutlineExclamation className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Yönetici Notu</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      • "Kabul Et & Sil" seçeneği geri alınamaz bir şekilde sayfayı siler<br/>
                      • "Reddet" seçeneği şikayeti reddeder ve sayfa yayında kalmaya devam eder
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Butonları */}
              {selectedComplaint.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    color="success"
                    onClick={() => {
                      handleResolveComplaint(
                        selectedComplaint.id,
                        selectedComplaint.devlogPage?.id
                      );
                      setShowDetailsModal(false);
                    }}
                  >
                    <HiOutlineCheckCircle className="w-5 h-5 mr-2" />
                    Kabul Et & Sil
                  </Button>
                  <Button
                    color="failure"
                    onClick={() => {
                      handleRejectComplaint(selectedComplaint.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <HiOutlineXCircle className="w-5 h-5 mr-2" />
                    Şikayeti Reddet
                  </Button>
                </div>
              )}
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default ComplaintManagement;