import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../helper/api';
import { toast } from 'sonner';
import {
  Card,
  Button,
  TextInput,
  Label,
  Textarea,
  Select,
  ToggleSwitch,
  Alert,
  Modal,
  FileInput,
} from 'flowbite-react';
import {
  HiExclamationCircle,
  HiTrash,
  HiArrowUp,
  HiArrowDown,
} from 'react-icons/hi';
import type { DevlogBlock } from '../../types/devlog';

const DevlogCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form state'leri
  const [title, setTitle] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [content, setContent] = useState<DevlogBlock[]>([
    { type: 'paragraph', content: '' }
  ]);

  // Yükleme state'leri
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [imagePreviewsMap, setImagePreviewsMap] = useState<Map<number, string>>(new Map());

  const blockTypes = [
    { value: 'paragraph', label: 'Paragraf', icon: '📝' },
    { value: 'heading', label: 'Başlık', icon: '🔰' },
    { value: 'code', label: 'Kod Bloğu', icon: '💻' },
    { value: 'image', label: 'Görsel', icon: '🖼️' },
    { value: 'quote', label: 'Alıntı', icon: '💬' },
  ];

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const response = await api.get('/notebooks');
      setNotebooks(response.data);
      const defaultNotebook = response.data.find((n: any) => n.isDefault);
      if (defaultNotebook) {
        setSelectedNotebookId(defaultNotebook.id.toString());
      }
    } catch (error) {
      console.error('Notebooks fetch error:', error);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('cover', file);

      const response = await api.post('/devlogs/upload-cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Kapak görseli yüklendi:', response.data.url);
      toast.success('Kapak görseli yüklendi');
      return response.data.url;
    } catch (error: any) {
      console.error('Cover upload error:', error);
      toast.error('Kapak görseli yüklenirken hata oluştu');
      return null;
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/devlogs/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ İçerik görseli yüklendi:', response.data.url);
      return response.data.url;
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error('Görsel yüklenirken hata oluştu');
      return null;
    }
  };

  const addBlock = (type: DevlogBlock['type']) => {
    const newBlock: DevlogBlock = (() => {
      switch (type) {
        case 'paragraph':
          return { type: 'paragraph', content: '' };
        case 'heading':
          return { type: 'heading', level: 2, text: '' };
        case 'code':
          return { type: 'code', language: 'javascript', code: '' };
        case 'image':
          return { type: 'image', src: '', alt: '', caption: '' };
        case 'quote':
          return { type: 'quote', text: '', author: '' };
        default:
          return { type: 'paragraph', content: '' };
      }
    })();
    setContent([...content, newBlock]);
  };

  const removeBlock = (index: number) => {
    if (content.length > 1) {
      const newContent = [...content];
      newContent.splice(index, 1);
      setContent(newContent);
    }
  };

  const moveBlockUp = (index: number) => {
    if (index > 0) {
      const newContent = [...content];
      [newContent[index], newContent[index - 1]] = [
        newContent[index - 1],
        newContent[index],
      ];
      setContent(newContent);
    }
  };

  const moveBlockDown = (index: number) => {
    if (index < content.length - 1) {
      const newContent = [...content];
      [newContent[index], newContent[index + 1]] = [
        newContent[index + 1],
        newContent[index],
      ];
      setContent(newContent);
    }
  };

  const updateBlock = (index: number, updates: Partial<DevlogBlock>) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], ...updates } as DevlogBlock;
    setContent(newContent);
  };

  const handleImageFileChange = async (index: number, file: File) => {
    try {
      setUploadingImage(`image-${index}`);
      
      // ✅ Base64 önizleme oluştur (ANINDA göster)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreviewsMap(prev => new Map(prev).set(index, base64));
        console.log('✅ Base64 önizleme oluşturuldu');
      };
      reader.readAsDataURL(file);
      
      // ✅ Sunucuya yükle (arka planda)
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        updateBlock(index, { src: imageUrl });
        console.log('✅ Sunucu URL\'si kaydedildi:', imageUrl);
      }
    } catch (error) {
      console.error('❌ Görsel yükleme hatası:', error);
      toast.error('Görsel yüklenirken hata oluştu');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Başlık gereklidir!');
      return;
    }

    if (content.length === 0) {
      toast.error('En az bir içerik bloğu ekleyin!');
      return;
    }

    for (const block of content) {
      if (block.type === 'paragraph' && !block.content?.trim()) {
        toast.error('Paragraf içeriği boş olamaz!');
        return;
      }
      if (block.type === 'heading' && !block.text?.trim()) {
        toast.error('Başlık metni boş olamaz!');
        return;
      }
      if (block.type === 'image' && !block.src?.trim()) {
        toast.error('Görsel boş olamaz!');
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setIsLoading(true);
    try {
      let finalCoverImage =
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop';

      if (coverImageFile) {
        const uploadedUrl = await handleCoverImageUpload(coverImageFile);
        if (uploadedUrl) {
          finalCoverImage = uploadedUrl;
        }
      }

      const devlogData = {
        title,
        content,
        coverImage: finalCoverImage,
        isPublished,
        originalNotebookId: selectedNotebookId
          ? parseInt(selectedNotebookId)
          : undefined,
      };

      const response = await api.post('/devlogs', devlogData);
      toast.success('Devlog başarıyla oluşturuldu!');
      navigate(`/devlogs/${response.data.id}`);
    } catch (error: any) {
      console.error('Devlog create error:', error);
      toast.error(
        error.response?.data?.message || 'Devlog oluşturulurken hata oluştu'
      );
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  const renderBlock = (block: DevlogBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <div key={index} className="mb-4">
            <Label htmlFor={`paragraph-${index}`}>Paragraf</Label>
            <Textarea
              id={`paragraph-${index}`}
              value={block.content}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              rows={4}
              placeholder="Paragrafınızı yazın..."
              className="mt-1"
            />
          </div>
        );

      case 'heading':
        return (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor={`heading-${index}`}>Başlık</Label>
              <Select
                value={block.level}
                onChange={(e) =>
                  updateBlock(index, { level: parseInt(e.target.value) as 2 | 3 })
                }
                className="w-32"
              >
                <option value={2}>Ana Başlık (H2)</option>
                <option value={3}>Alt Başlık (H3)</option>
              </Select>
            </div>
            <TextInput
              id={`heading-${index}`}
              value={block.text}
              onChange={(e) => updateBlock(index, { text: e.target.value })}
              placeholder="Başlığınızı yazın..."
              className="mt-1"
            />
          </div>
        );

      case 'code':
        return (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor={`code-${index}`}>Kod Bloğu</Label>
              <Select
                value={block.language}
                onChange={(e) => updateBlock(index, { language: e.target.value })}
                className="w-40"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
              </Select>
            </div>
            <Textarea
              id={`code-${index}`}
              value={block.code}
              onChange={(e) => updateBlock(index, { code: e.target.value })}
              rows={6}
              placeholder="Kodunuzu yazın..."
              className="font-mono text-sm mt-1"
            />
          </div>
        );

      case 'image':
        const previewSrc = imagePreviewsMap.get(index) || block.src;
        return (
          <div key={index} className="mb-4">
            <Label htmlFor={`image-file-${index}`}>Görsel Yükle</Label>
            <div className="mt-2 space-y-4">
              <div className="flex items-center space-x-4">
                <FileInput
                  id={`image-file-${index}`}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageFileChange(index, file);
                    }
                  }}
                  disabled={uploadingImage === `image-${index}`}
                />
                {uploadingImage === `image-${index}` && (
                  <div className="flex items-center text-blue-600">
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sunucuya yükleniyor...
                  </div>
                )}
              </div>

              {previewSrc && (
                <div className="mt-2">
                  <Label>Görsel Önizleme:</Label>
                  <div className="mt-2 border-2 border-blue-300 rounded-lg overflow-hidden max-w-md bg-gray-50 p-2">
                    <img
                      key={previewSrc}
                      src={previewSrc}
                      alt={block.alt || 'Görsel önizleme'}
                      className="w-full h-auto object-contain rounded"
                      style={{ maxHeight: '400px' }}
                      onError={(e) => {
                        console.error('❌ Önizleme hatası:', previewSrc.substring(0, 50));
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent && !parent.querySelector('.error-message')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'error-message flex items-center justify-center h-48 text-red-500';
                          errorDiv.innerHTML = '<div class="text-center"><p class="text-lg">❌</p><p>Görsel yüklenemedi</p></div>';
                          parent.appendChild(errorDiv);
                        }
                      }}
                      onLoad={() => {
                        console.log('✅ Önizleme gösteriliyor');
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    {previewSrc.startsWith('data:') ? (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        📷 Yerel Önizleme (Henüz yüklenmedi)
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        ✅ Sunucuya yüklendi
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`image-alt-${index}`}>Alt Metin *</Label>
                  <TextInput
                    id={`image-alt-${index}`}
                    value={block.alt}
                    onChange={(e) => updateBlock(index, { alt: e.target.value })}
                    placeholder="Görsel açıklaması"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`image-caption-${index}`}>
                    Altyazı (Opsiyonel)
                  </Label>
                  <TextInput
                    id={`image-caption-${index}`}
                    value={block.caption || ''}
                    onChange={(e) =>
                      updateBlock(index, { caption: e.target.value })
                    }
                    placeholder="Altyazı"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div key={index} className="mb-4">
            <Label htmlFor={`quote-text-${index}`}>Alıntı Metni</Label>
            <Textarea
              id={`quote-text-${index}`}
              value={block.text}
              onChange={(e) => updateBlock(index, { text: e.target.value })}
              rows={3}
              placeholder="Alıntı metnini yazın..."
              className="mt-1 mb-2"
            />
            <Label htmlFor={`quote-author-${index}`}>Yazar (Opsiyonel)</Label>
            <TextInput
              id={`quote-author-${index}`}
              value={block.author || ''}
              onChange={(e) => updateBlock(index, { author: e.target.value })}
              placeholder="Yazar adı"
              className="mt-1"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Yeni Devlog Oluştur
              </h1>
              <Button color="light" onClick={() => navigate('/devlogs')}>
                İptal
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <TextInput
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Devlog başlığınız"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="coverImageFile">
                    Kapak Görseli (Opsiyonel)
                  </Label>
                  <div className="mt-2 space-y-4">
                    <FileInput
                      id="coverImageFile"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCoverImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {coverImagePreview && (
                      <div className="mt-2">
                        <Label>Kapak Görseli Önizleme:</Label>
                        <div className="mt-2 border rounded-lg overflow-hidden max-w-md">
                          <img
                            src={coverImagePreview}
                            alt="Kapak görseli önizleme"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-500">
                      • Dosya yükleme tercih edilir (JPG, PNG, GIF, WebP)
                      <br />
                      • Maksimum dosya boyutu: 10MB
                      <br />• Boş bırakırsanız varsayılan görsel kullanılacak
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notebook">Notebook Seç (Opsiyonel)</Label>
                  <Select
                    id="notebook"
                    value={selectedNotebookId}
                    onChange={(e) => setSelectedNotebookId(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">Notebook seçin</option>
                    {notebooks.map((notebook) => (
                      <option key={notebook.id} value={notebook.id}>
                        {notebook.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center">
                  <ToggleSwitch
                    checked={isPublished}
                    label="Hemen yayınla"
                    onChange={setIsPublished}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {isPublished
                      ? 'Sayfa herkese açık olacak'
                      : 'Sayfa taslak olarak kaydedilecek'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    İçerik Blokları
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {blockTypes.map((type) => (
                      <Button
                        key={type.value}
                        size="xs"
                        color="light"
                        onClick={() =>
                          addBlock(type.value as DevlogBlock['type'])
                        }
                        className="flex items-center"
                      >
                        <span className="mr-1">{type.icon}</span>
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {content.length === 0 ? (
                  <Alert color="info" icon={HiExclamationCircle}>
                    Henüz içerik bloğu eklemediniz.
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {content.map((block, index) => (
                      <Card key={index} className="relative">
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            size="xs"
                            color="light"
                            onClick={() => moveBlockUp(index)}
                            disabled={index === 0}
                          >
                            <HiArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="xs"
                            color="light"
                            onClick={() => moveBlockDown(index)}
                            disabled={index === content.length - 1}
                          >
                            <HiArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => removeBlock(index)}
                            disabled={content.length === 1}
                          >
                            <HiTrash className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {blockTypes.find((t) => t.value === block.type)?.icon}{' '}
                            {blockTypes.find((t) => t.value === block.type)?.label}
                          </span>
                        </div>

                        {renderBlock(block, index)}
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  color="success"
                  disabled={isLoading || !title.trim() || content.length === 0}
                >
                  {isLoading ? 'Kaydediliyor...' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <Modal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
      >
        <div className="p-6">
          <div className="text-center">
            <HiExclamationCircle className="mx-auto mb-4 h-12 w-12 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Devlog sayfasını oluşturmak istediğinize emin misiniz?
            </h3>
            <p className="text-gray-500 mb-6">
              {isPublished
                ? 'Sayfa herkese açık olarak yayınlanacak.'
                : 'Sayfa taslak olarak kaydedilecek.'}
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                color="alternative"
                onClick={() => setShowConfirmModal(false)}
                className="px-6"
              >
                İptal
              </Button>
              <Button
                color="success"
                onClick={confirmSubmit}
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? 'Oluşturuluyor...' : 'Evet, Oluştur'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DevlogCreate;