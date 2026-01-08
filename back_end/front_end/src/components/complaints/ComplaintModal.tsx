// src/components/complaints/ComplaintModal.tsx - DÜZELTİLMİŞ
import { useState } from 'react';
import { api } from '../../helper/api';
import { toast } from 'sonner';
import { Modal, ModalBody, ModalHeader, Button, Label, Select, Textarea } from 'flowbite-react';
import { HiOutlineFlag, HiOutlineExclamation } from 'react-icons/hi';

interface ComplaintModalProps {
  show: boolean;
  onClose: () => void;
  devlogId: number;
  devlogTitle: string;
}

const ComplaintModal = ({ show, onClose, devlogId, devlogTitle }: ComplaintModalProps) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Complaint error:', error);
      
      if (error.response?.status === 400) {
        toast.error('Bu sayfa için zaten bir şikayetiniz var');
      } else if (error.response?.status === 401) {
        toast.error('Şikayet etmek için giriş yapmalısınız');
      } else {
        toast.error(error.response?.data?.message || 'Şikayet gönderilirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  const reasonOptions = [
    { value: 'inappropriate', label: 'Uygunsuz İçerik' },
    { value: 'spam', label: 'Spam/Reklam' },
    { value: 'copyright', label: 'Telif Hakkı İhlali' },
    { value: 'harassment', label: 'Taciz/Neffret Söylemi' },
    { value: 'other', label: 'Diğer' },
  ];

  return (
    <Modal show={show} onClose={handleClose} size="md">
      <ModalHeader className="border-b border-gray-200">
        <div className="flex items-center">
          <HiOutlineFlag className="w-6 h-6 text-red-500 mr-2" />
          <span>İçerik Şikayeti</span>
        </div>
      </ModalHeader>
      
      <ModalBody className="py-6">
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-4">
              <span className="font-medium text-gray-800">"{devlogTitle}"</span> başlıklı içerik için şikayetinizi bildirin.
            </p>
          </div>

          <div>
            <div className="mb-2 block">
              {/* DÜZELTME: value prop'u yerine children kullanıldı */}
              <Label htmlFor="reason">Şikayet Nedeni *</Label>
            </div>
            <Select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">Seçiniz</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <div className="mb-2 block">
              {/* DÜZELTME: value prop'u yerine children kullanıldı */}
              <Label htmlFor="description">Açıklama *</Label>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Şikayetinizin detayını açıklayın (en az 20 karakter)..."
              rows={4}
              required
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${description.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                {description.length}/500 karakter
              </span>
              {description.length > 0 && description.length < 20 && (
                <span className="text-xs text-red-500">
                  En az 20 karakter gerekli
                </span>
              )}
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
              onClick={handleClose}
              disabled={loading}
              className="px-6"
            >
              İptal
            </Button>
            <Button
              color="failure"
              onClick={handleSubmit}
              disabled={!reason || !description.trim() || description.length < 20 || loading}
              className="px-6"
            >
              {loading ? 'Gönderiliyor...' : 'Şikayeti Gönder'}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ComplaintModal;