import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { kecamatanList, desaByKecamatan } from '../../lib/bogor-regions';

const recommendationTypes = [
  { value: 'praktek_dokter_hewan', label: 'Rekomendasi Praktek Dokter Hewan', icon: '👨‍⚕️', description: 'Permohonan rekomendasi untuk praktek dokter hewan' },
  { value: 'nomor_kontrol_veteriner', label: 'Rekomendasi Nomor Kontrol Veteriner', icon: '🔢', description: 'Permohonan rekomendasi nomor kontrol veteriner' },
];

// Daftar KBLI untuk Nomor Kontrol Veteriner (sesuai OSS)
const kbliOptions = [
  { 
    code: '47214', 
    label: '47214 - Perdagangan Eceran Hasil Peternakan',
    description: 'Usaha perdagangan eceran khusus hasil peternakan seperti susu, telur, dan daging ternak/unggas'
  },
  { 
    code: '01462', 
    label: '01462 - Budidaya Ayam Ras Petelur',
    description: 'Usaha peternakan yang menyelenggarakan budidaya ayam ras untuk menghasilkan telur konsumsi'
  },
  { 
    code: '01412', 
    label: '01412 - Pembibitan dan Budidaya Sapi Perah',
    description: 'Usaha peternakan yang melakukan kegiatan pembibitan sapi perah untuk menghasilkan ternak bibit sapi perah, semen, embrio, serta susu'
  },
  { 
    code: '01497', 
    label: '01497 - Pembibitan dan Budidaya Burung Walet',
    description: 'Usaha pembibitan dan budidaya burung walet untuk menghasilkan sarang walet'
  },
  { 
    code: '10801', 
    label: '10801 - Industri Ransum Makanan Hewan',
    description: 'Industri yang memproduksi ransum makanan hewan'
  },
  { 
    code: '10802', 
    label: '10802 - Industri Konsentrat Makanan Hewan',
    description: 'Industri yang memproduksi konsentrat makanan hewan'
  },
  { 
    code: '01411', 
    label: '01411 - Pembibitan dan Budidaya Sapi Potong',
    description: 'Usaha pembibitan dan budidaya sapi potong untuk menghasilkan daging dan ternak bibit'
  },
  { 
    code: '01461', 
    label: '01461 - Budidaya Ayam Ras Pedaging',
    description: 'Usaha peternakan yang menyelenggarakan budidaya ayam ras untuk menghasilkan daging ayam'
  },
  { 
    code: '01463', 
    label: '01463 - Budidaya Ayam Buras',
    description: 'Usaha peternakan yang menyelenggarakan budidaya ayam buras untuk menghasilkan telur dan daging'
  },
  { 
    code: '01421', 
    label: '01421 - Pembibitan dan Budidaya Kambing',
    description: 'Usaha pembibitan dan budidaya kambing untuk menghasilkan daging, susu, dan ternak bibit'
  },
  { 
    code: '01422', 
    label: '01422 - Pembibitan dan Budidaya Domba',
    description: 'Usaha pembibitan dan budidaya domba untuk menghasilkan daging, wol, dan ternak bibit'
  },
  { 
    code: '01431', 
    label: '01431 - Pembibitan dan Budidaya Babi',
    description: 'Usaha pembibitan dan budidaya babi untuk menghasilkan daging dan ternak bibit'
  },
  { 
    code: '01441', 
    label: '01441 - Pembibitan dan Budidaya Itik',
    description: 'Usaha pembibitan dan budidaya itik untuk menghasilkan telur dan daging'
  },
  { 
    code: '01442', 
    label: '01442 - Pembibitan dan Budidaya Entog',
    description: 'Usaha pembibitan dan budidaya entog untuk menghasilkan telur dan daging'
  },
  { 
    code: '01451', 
    label: '01451 - Pembibitan dan Budidaya Kelinci',
    description: 'Usaha pembibitan dan budidaya kelinci untuk menghasilkan daging dan ternak bibit'
  },
];

export default function LayananRekomendasiPage() {
  const [selectedType, setSelectedType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  const [formData, setFormData] = useState({
    // Informasi Pribadi
    name: '',
    birthPlace: '',
    birthDate: '',
    nik: '',
    phone: '',
    email: '',
    address: '',
    kecamatan: '',
    desa: '',
    npwp: '',
    
    // Informasi Pendidikan
    institutionName: '',
    graduationYear: '',
    diplomaNumber: '',
    
    // Informasi Kegiatan Usaha (KBLI 75000)
    kbli_praktek: '',
    deskripsiKegiatanUsaha_praktek: '',
    pbumku_praktek: 'rekomendasi_praktek_dokter_hewan', // Tetap rekomendasi praktek dokter hewan
    
    // Informasi Praktik
    practiceAddress: '',
    practiceType: '', // 'mandiri' or 'instansi'
    workingHours: '',
    institutionName_practice: '', // jika praktik di instansi
    position: '', // jika praktik di instansi
    
    // Dokumen (file paths)
    suratPermohonan: null as File | null,
    nib_file_praktek: null as File | null,
    ktp: null as File | null,
    npwp_file: null as File | null,
    pasFoto: null as File | null,
    ijazah: null as File | null,
    sertifikatKompetensi: null as File | null,
    suratRekomendasiOrganisasi: null as File | null,
    suratIzinInstansi: null as File | null,
    suratIzinLama: null as File | null, // untuk perpanjangan
    
    description: '',
    isRenewal: false, // apakah perpanjangan atau baru
    
    // Data untuk Nomor Kontrol Veteriner (sesuai OSS)
    namaPerusahaan: '',
    nib: '',
    alamatUsaha: '',
    kecamatanUsaha: '',
    desaUsaha: '',
    kontakPerson: '',
    jabatanKontakPerson: '',
    namaPenanggungJawab: '',
    jabatanPenanggungJawab: '',
    nikPenanggungJawab: '',
    phonePenanggungJawab: '',
    emailPenanggungJawab: '',
    kbli: '',
    deskripsiKegiatanUsaha: '',
    
    // Dokumen NKV
    suratPermohonanNKV: null as File | null,
    aktaPendirian: null as File | null,
    nib_file: null as File | null,
    izinUsaha: null as File | null,
    ktpPenanggungJawab: null as File | null,
    suratKuasa: null as File | null,
    dokumenTeknis: null as File | null,
  });
  
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    // Reset form when type changes
    setFormData({
      name: '',
      birthPlace: '',
      birthDate: '',
      nik: '',
      phone: '',
      email: '',
      address: '',
      kecamatan: '',
      desa: '',
      npwp: '',
      institutionName: '',
      graduationYear: '',
      diplomaNumber: '',
      kbli_praktek: '',
      deskripsiKegiatanUsaha_praktek: '',
      pbumku_praktek: 'rekomendasi_praktek_dokter_hewan',
      practiceAddress: '',
      practiceType: '',
      workingHours: '',
      institutionName_practice: '',
      position: '',
      suratPermohonan: null,
      nib_file_praktek: null,
      ktp: null,
      npwp_file: null,
      pasFoto: null,
      ijazah: null,
      sertifikatKompetensi: null,
      suratRekomendasiOrganisasi: null,
      suratIzinInstansi: null,
      suratIzinLama: null,
      description: '',
      isRenewal: false,
      namaPerusahaan: '',
      nib: '',
      alamatUsaha: '',
      kecamatanUsaha: '',
      desaUsaha: '',
      kontakPerson: '',
      jabatanKontakPerson: '',
      namaPenanggungJawab: '',
      jabatanPenanggungJawab: '',
      nikPenanggungJawab: '',
      phonePenanggungJawab: '',
      emailPenanggungJawab: '',
      kbli: '',
      deskripsiKegiatanUsaha: '',
      suratPermohonanNKV: null,
      aktaPendirian: null,
      nib_file: null,
      izinUsaha: null,
      ktpPenanggungJawab: null,
      suratKuasa: null,
      dokumenTeknis: null,
    });
    setUploadedDocs({});
  };
  
  const handleKecamatanUsahaChange = (value: string) => {
    setFormData({
      ...formData,
      kecamatanUsaha: value,
      desaUsaha: '', // Reset desa when kecamatan changes
    });
  };
  
  const handleFileUpload = async (fieldName: string, file: File | null) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10MB');
      return;
    }
    
    setUploadingDocs({ ...uploadingDocs, [fieldName]: true });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `recommendations/${selectedType}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('service-documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('service-documents')
        .getPublicUrl(filePath);
      
      setUploadedDocs({ ...uploadedDocs, [fieldName]: urlData.publicUrl });
      toast.success(`Dokumen ${fieldName} berhasil diunggah`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Gagal mengunggah ${fieldName}`);
    } finally {
      setUploadingDocs({ ...uploadingDocs, [fieldName]: false });
    }
  };
  
  const handleFileChange = (fieldName: string, file: File | null) => {
    setFormData({ ...formData, [fieldName]: file });
    if (file) {
      handleFileUpload(fieldName, file);
    }
  };

  const generateSuratPermohonanPDF = () => {
    if (selectedType !== 'praktek_dokter_hewan') {
      toast.error('Template surat permohonan hanya tersedia untuk Rekomendasi Praktek Dokter Hewan');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Header - Kop Surat
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERINTAH KABUPATEN BOGOR', pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DINAS PERIKANAN DAN PETERNAKAN', pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Bersih, Kel Tengah, Kec Cibinong, Kab. Bogor, Prov. Jawa Barat', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    doc.text(`Telp: (021) 8765311 | Email: diskanak@bogorkab.go.id`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Garis pemisah
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Nomor dan Perihal
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    doc.text('Nomor     : -', margin, yPos);
    yPos += 6;
    doc.text('Perihal   : Permohonan Rekomendasi Praktek Dokter Hewan', margin, yPos);
    yPos += 15;

    // Salam Pembuka
    doc.text('Kepada Yth.', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Kepala Dinas Perikanan dan Peternakan', margin, yPos);
    yPos += 6;
    doc.text('Kabupaten Bogor', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('di', margin, yPos);
    yPos += 6;
    doc.text('Tempat', margin, yPos);
    yPos += 10;

    // Isi Surat
    doc.text('Dengan hormat,', margin, yPos);
    yPos += 8;

    doc.text('Yang bertanda tangan di bawah ini:', margin, yPos);
    yPos += 8;

    // Data Pemohon
    const dataPemohon = [
      ['Nama', ':', formData.name || '_________________________'],
      ['Tempat/Tanggal Lahir', ':', `${formData.birthPlace || '_______'} / ${formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('id-ID') : '_______'}`],
      ['NIK', ':', formData.nik || '_________________________'],
      ['NPWP', ':', formData.npwp || '_________________________'],
      ['Alamat', ':', formData.address || '_________________________'],
      ['Kecamatan', ':', formData.kecamatan || '_________________________'],
      ['Desa/Kelurahan', ':', formData.desa || '_________________________'],
      ['No. Telepon', ':', formData.phone || '_________________________'],
      ['Email', ':', formData.email || '_________________________'],
    ];

    dataPemohon.forEach((row, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(row[0], margin, yPos);
      doc.text(row[1], margin + 60, yPos);
      doc.text(row[2], margin + 70, yPos, { maxWidth: maxWidth - 70 });
      yPos += 6;
    });

    yPos += 5;

    // Informasi Pendidikan
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Pendidikan:', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    const dataPendidikan = [
      ['Nama Institusi', ':', formData.institutionName || '_________________________'],
      ['Tahun Lulus', ':', formData.graduationYear || '_______'],
      ['Nomor Ijazah', ':', formData.diplomaNumber || '_________________________'],
    ];

    dataPendidikan.forEach((row) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(row[0], margin, yPos);
      doc.text(row[1], margin + 60, yPos);
      doc.text(row[2], margin + 70, yPos, { maxWidth: maxWidth - 70 });
      yPos += 6;
    });

    yPos += 5;

    // Informasi Kegiatan Usaha (KBLI 75000)
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Kegiatan Usaha:', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    
    const dataKegiatanUsaha = [
      ['Kode KBLI', ':', '75000'],
      ['Jenis PBUMKU', ':', 'Rekomendasi Praktek Dokter Hewan'],
      ['Deskripsi', ':', 'Aktivitas kesehatan hewan, termasuk perawatan dan pemeriksaan kesehatan hewan ternak dan hewan piaraan yang dilakukan oleh dokter hewan, kegiatan asisten dokter hewan, klinik patologi, diagnosis hewan, ambulans hewan, vaksinasi hewan, dan laboratorium penelitian kesehatan hewan.'],
    ];

    dataKegiatanUsaha.forEach((row) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(row[0], margin, yPos);
      doc.text(row[1], margin + 60, yPos);
      doc.text(row[2], margin + 70, yPos, { maxWidth: maxWidth - 70 });
      yPos += 6;
    });

    yPos += 5;

    // Informasi Praktik
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Praktik:', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    const jenisPraktik = formData.practiceType === 'mandiri' ? 'Praktik Mandiri' : 
                        formData.practiceType === 'instansi' ? 'Praktik di Instansi' : '_______';
    
    const dataPraktik = [
      ['Alamat Tempat Praktik', ':', formData.practiceAddress || '_________________________'],
      ['Jenis Praktik', ':', jenisPraktik],
      ['Jam Operasional', ':', formData.workingHours || '_________________________'],
    ];

    if (formData.practiceType === 'instansi') {
      dataPraktik.push(['Nama Instansi', ':', formData.institutionName_practice || '_________________________']);
      dataPraktik.push(['Jabatan', ':', formData.position || '_________________________']);
    }

    dataPraktik.forEach((row) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(row[0], margin, yPos);
      doc.text(row[1], margin + 60, yPos);
      doc.text(row[2], margin + 70, yPos, { maxWidth: maxWidth - 70 });
      yPos += 6;
    });

    yPos += 8;

    // Isi Permohonan
    const isPerpanjangan = formData.isRenewal ? 'perpanjangan ' : '';
    doc.text(`Berdasarkan ketentuan Peraturan Menteri Pertanian Nomor 3 Tahun 2019 tentang Pelayanan Jasa Medik Veteriner, dengan ini saya mengajukan permohonan ${isPerpanjangan}rekomendasi untuk praktek dokter hewan.`, margin, yPos, { maxWidth: maxWidth, align: 'justify' });
    yPos += 12;

    doc.text('Sebagai bahan pertimbangan, bersama surat ini saya lampirkan:', margin, yPos);
    yPos += 8;

    // Daftar Lampiran
    const lampiran = [
      '1. Fotokopi Kartu Tanda Penduduk (KTP);',
      '2. Fotokopi Nomor Pokok Wajib Pajak (NPWP);',
      '3. Pas Foto Berwarna ukuran 4x6 (2 lembar);',
      '4. Fotokopi Ijazah Dokter Hewan;',
      '5. Fotokopi Sertifikat Kompetensi Dokter Hewan;',
      '6. Fotokopi Surat Rekomendasi dari Organisasi Profesi Kedokteran Hewan Cabang Setempat;',
    ];

    if (formData.practiceType === 'instansi') {
      lampiran.push('7. Surat Izin dari Pimpinan Instansi Tempat Bekerja;');
    }

    if (formData.isRenewal) {
      lampiran.push(`${formData.practiceType === 'instansi' ? '8' : '7'}. Surat Izin Praktik Dokter Hewan yang Lama;`);
    }

    lampiran.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin, yPos);
      yPos += 6;
    });

    yPos += 8;

    doc.text('Demikian surat permohonan ini saya sampaikan, atas perhatian dan kebijaksanaan Bapak/Ibu saya ucapkan terima kasih.', margin, yPos, { maxWidth: maxWidth, align: 'justify' });
    yPos += 15;

    // Tanda Tangan
    if (yPos > 240) {
      doc.addPage();
      yPos = margin;
    }

    doc.text('Hormat saya,', margin, yPos);
    yPos += 15;

    doc.text('Pemohon,', margin, yPos);
    yPos += 30;

    doc.text('_________________________', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(formData.name || '(Nama Pemohon)', margin, yPos);

    // Save PDF
    const fileName = `Surat_Permohonan_${formData.name || 'Template'}_${Date.now()}.pdf`;
    doc.save(fileName);
    toast.success('Template surat permohonan berhasil diunduh!');
  };

  const generateSuratPermohonanNKVPDF = () => {
    if (selectedType !== 'nomor_kontrol_veteriner') {
      toast.error('Template surat permohonan hanya tersedia untuk Rekomendasi Nomor Kontrol Veteriner');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Header - Kop Surat
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERINTAH KABUPATEN BOGOR', pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DINAS PERIKANAN DAN PETERNAKAN', pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Bersih, Kel Tengah, Kec Cibinong, Kab. Bogor, Prov. Jawa Barat', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    doc.text(`Telp: (021) 8765311 | Email: diskanak@bogorkab.go.id`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Garis pemisah
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Nomor dan Perihal
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Nomor     : -', margin, yPos);
    yPos += 6;
    doc.text('Perihal   : Permohonan Rekomendasi Nomor Kontrol Veteriner', margin, yPos);
    yPos += 15;

    // Salam Pembuka
    doc.text('Kepada Yth.', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Kepala Dinas Perikanan dan Peternakan', margin, yPos);
    yPos += 6;
    doc.text('Kabupaten Bogor', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('di', margin, yPos);
    yPos += 6;
    doc.text('Tempat', margin, yPos);
    yPos += 10;

    // Isi Surat
    doc.text('Dengan hormat,', margin, yPos);
    yPos += 8;

    doc.text('Yang bertanda tangan di bawah ini:', margin, yPos);
    yPos += 8;

    // Data Pelaku Usaha
    doc.setFont('helvetica', 'bold');
    doc.text('Data Pelaku Usaha:', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    const dataPelakuUsaha = [
      ['Nama Perusahaan', ':', formData.namaPerusahaan || '_________________________'],
      ['Nomor Induk Berusaha (NIB)', ':', formData.nib || '_________________________'],
      ['Alamat Usaha', ':', formData.alamatUsaha || '_________________________'],
      ['Kecamatan', ':', formData.kecamatanUsaha || '_________________________'],
      ['Desa/Kelurahan', ':', formData.desaUsaha || '_________________________'],
      ['Kontak Person', ':', formData.kontakPerson || '_________________________'],
      ['Jabatan Kontak Person', ':', formData.jabatanKontakPerson || '_________________________'],
    ];

    dataPelakuUsaha.forEach((row) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(row[0], margin, yPos);
      doc.text(row[1], margin + 60, yPos);
      doc.text(row[2], margin + 70, yPos, { maxWidth: maxWidth - 70 });
      yPos += 6;
    });

    yPos += 5;

    // Data Penanggung Jawab
    doc.setFont('helvetica', 'bold');
    doc.text('Data Penanggung Jawab:', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    const dataPenanggungJawab = [
      ['Nama', ':', formData.namaPenanggungJawab || '_________________________'],
      ['Jabatan', ':', formData.jabatanPenanggungJawab || '_________________________'],
      ['NIK', ':', formData.nikPenanggungJawab || '_________________________'],
      ['No. Telepon', ':', formData.phonePenanggungJawab || '_________________________'],
      ['Email', ':', formData.emailPenanggungJawab || '_________________________'],
    ];

    dataPenanggungJawab.forEach((row) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(row[0], margin, yPos);
      doc.text(row[1], margin + 60, yPos);
      doc.text(row[2], margin + 70, yPos, { maxWidth: maxWidth - 70 });
      yPos += 6;
    });

    yPos += 5;

    // Informasi Kegiatan Usaha
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Kegiatan Usaha:', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    const dataKegiatanUsahaNKV = [
      ['Kode KBLI', ':', formData.kbli || '_________________________'],
      ['Deskripsi Kegiatan Usaha', ':', formData.deskripsiKegiatanUsaha || '_________________________'],
    ];

    dataKegiatanUsahaNKV.forEach((row) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(row[0], margin, yPos);
      doc.text(row[1], margin + 60, yPos);
      doc.text(row[2], margin + 70, yPos, { maxWidth: maxWidth - 70 });
      yPos += 6;
    });

    yPos += 8;

    // Isi Permohonan
    doc.text('Berdasarkan ketentuan yang berlaku, dengan ini kami mengajukan permohonan rekomendasi Nomor Kontrol Veteriner untuk kegiatan usaha sebagaimana tersebut di atas.', margin, yPos, { maxWidth: maxWidth, align: 'justify' });
    yPos += 12;

    doc.text('Sebagai bahan pertimbangan, bersama surat ini kami lampirkan:', margin, yPos);
    yPos += 8;

    // Daftar Lampiran
    const lampiran = [
      '1. Fotokopi Akta Pendirian / Akta Perubahan;',
      '2. Fotokopi Nomor Induk Berusaha (NIB);',
      '3. Fotokopi Izin Usaha (jika ada);',
      '4. Fotokopi KTP Penanggung Jawab;',
      '5. Surat Kuasa (jika ada);',
      '6. Dokumen Teknis lainnya;',
    ];

    lampiran.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });

    yPos += 10;

    // Penutup
    doc.text('Demikian surat permohonan ini kami sampaikan, atas perhatian dan kebijaksanaan Bapak/Ibu, kami ucapkan terima kasih.', margin, yPos, { maxWidth: maxWidth, align: 'justify' });
    yPos += 15;

    // Tanda Tangan
    doc.text('Hormat kami,', margin, yPos);
    yPos += 20;

    doc.text(formData.namaPenanggungJawab || '_________________________', margin, yPos);
    doc.text(formData.jabatanPenanggungJawab || '_________________________', margin, yPos + 6);

    doc.save('Surat-Permohonan-Rekomendasi-Nomor-Kontrol-Veteriner.pdf');
    toast.success('Template surat permohonan berhasil diunduh!');
  };

  const generateDokumenTeknisPDF = () => {
    if (selectedType !== 'nomor_kontrol_veteriner') {
      toast.error('Template dokumen teknis hanya tersedia untuk Rekomendasi Nomor Kontrol Veteriner');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Halaman Cover
    doc.setFillColor(34, 139, 34); // Green color
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('DOKUMEN TEKNIS', pageWidth / 2, pageHeight / 2 - 40, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Nomor Kontrol Veteriner', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.namaPerusahaan || 'Nama Perusahaan', pageWidth / 2, pageHeight / 2, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Alamat: ' + (formData.alamatUsaha || 'Alamat Usaha'), pageWidth / 2, pageHeight / 2 + 15, { align: 'center', maxWidth: maxWidth });
    doc.text((formData.kecamatanUsaha || 'Kecamatan') + ', ' + (formData.desaUsaha || 'Desa/Kelurahan'), pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });
    doc.text('Kabupaten Bogor', pageWidth / 2, pageHeight / 2 + 35, { align: 'center' });
    
    doc.setFontSize(10);
    const today = new Date();
    const year = today.getFullYear();
    doc.text(`Tahun ${year}`, pageWidth / 2, pageHeight - 40, { align: 'center' });

    // Halaman 2 - Daftar Isi
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    yPos = margin;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DAFTAR ISI', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const daftarIsi = [
      '1. PENDAHULUAN',
      '2. DIAGRAM ALUR PROSES',
      '3. PROSEDUR OPERASIONAL STANDAR',
      '   3.1. Penerimaan Produk',
      '   3.2. Pemeriksaan dan Pengujian',
      '   3.3. Penyimpanan',
      '   3.4. Distribusi',
      '4. KONTROL KUALITAS',
      '5. PENANGANAN PRODUK RUSAK/TERCEMAR',
      '6. DOKUMENTASI DAN PENCATATAN',
      '7. PERSONALIA',
      '8. FASILITAS DAN SARANA',
      '9. PENUTUP',
    ];

    daftarIsi.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin, yPos);
      if (item.trim().match(/^\d+\./)) {
        // Halaman referensi (placeholder)
        const pageNum = String(Math.floor(index / 2) + 2);
        doc.text('... ' + pageNum, pageWidth - margin - 20, yPos, { align: 'right' });
      }
      yPos += 7;
    });

    // Halaman 3 - Pendahuluan
    doc.addPage();
    yPos = margin;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PENDAHULUAN', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const pendahuluan = [
      `Dokumen Teknis ini disusun untuk memberikan informasi mengenai tata cara operasional, prosedur, dan sistem yang diterapkan oleh ${formData.namaPerusahaan || 'Nama Perusahaan'} dalam kegiatan usaha terkait produk hewan dan/atau hasil olahan hewan yang memerlukan Nomor Kontrol Veteriner.`,
      '',
      'Dokumen ini mencakup:',
      '• Diagram alur proses kegiatan usaha',
      '• Prosedur Operasional Standar (POS)',
      '• Sistem kontrol kualitas',
      '• Penanganan produk rusak/tercemar',
      '• Dokumentasi dan pencatatan',
      '• Kualifikasi dan pelatihan personel',
      '• Spesifikasi fasilitas dan sarana',
      '',
      `Perusahaan ini berlokasi di ${formData.alamatUsaha || 'Alamat Usaha'}, Kecamatan ${formData.kecamatanUsaha || 'Kecamatan'}, Desa/Kelurahan ${formData.desaUsaha || 'Desa/Kelurahan'}, Kabupaten Bogor.`,
      '',
      `Kegiatan usaha sesuai dengan KBLI ${formData.kbli || 'Kode KBLI'}: ${formData.deskripsiKegiatanUsaha || 'Deskripsi Kegiatan Usaha'}.`,
    ];

    pendahuluan.forEach((paragraf) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      if (paragraf.trim() === '') {
        yPos += 3;
      } else {
        doc.text(paragraf, margin, yPos, { maxWidth: maxWidth, align: 'justify' });
        yPos += 7;
      }
    });

    // Halaman 4 - Diagram Alur
    doc.addPage();
    yPos = margin;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2. DIAGRAM ALUR PROSES', margin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Diagram alur proses kegiatan usaha yang menunjukkan tahapan dari penerimaan bahan baku hingga distribusi produk:', margin, yPos);
    yPos += 10;

    // Box untuk diagram (placeholder - user bisa menambahkan diagram sendiri)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    const diagramHeight = 100;
    const diagramWidth = maxWidth;
    doc.rect(margin, yPos, diagramWidth, diagramHeight);
    
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('[Tempatkan diagram alur proses di sini]', margin + diagramWidth / 2, yPos + diagramHeight / 2, { align: 'center' });
    doc.text('Contoh: Penerimaan → Pemeriksaan → Pengolahan → Pengujian → Penyimpanan → Distribusi', margin + diagramWidth / 2, yPos + diagramHeight / 2 + 10, { align: 'center', maxWidth: diagramWidth - 10 });
    
    yPos += diagramHeight + 15;
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('Catatan: Diagram alur di atas adalah template. Silakan sesuaikan dengan proses yang diterapkan di perusahaan Anda.', margin, yPos, { maxWidth: maxWidth, align: 'justify' });
    doc.setFont('helvetica', 'normal');

    // Halaman 5 - Prosedur Operasional Standar
    doc.addPage();
    yPos = margin;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. PROSEDUR OPERASIONAL STANDAR (POS)', margin, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3.1. Penerimaan Produk/Bahan Baku', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const posPenerimaan = [
      'a. Semua produk/bahan baku yang masuk harus dilengkapi dengan dokumen pendukung:',
      '   • Surat jalan/surat angkut',
      '   • Sertifikat kesehatan hewan (jika berlaku)',
      '   • Label dan identifikasi produk',
      '',
      'b. Pemeriksaan awal dilakukan oleh petugas yang berwenang untuk memastikan:',
      '   • Kesesuaian jenis dan jumlah produk',
      '   • Kondisi produk (tidak rusak, tidak tercemar)',
      '   • Kelengkapan dokumen',
      '',
      'c. Produk yang tidak memenuhi syarat ditolak dan dicatat dalam buku register penolakan.',
      '',
      'd. Produk yang diterima dicatat dalam buku register penerimaan dengan detail:',
      '   • Tanggal dan waktu penerimaan',
      '   • Nama produk/jenis',
      '   • Jumlah/kuantitas',
      '   • Asal/sumber',
      '   • Nomor batch/lot (jika ada)',
      '   • Nama petugas penerima',
    ];

    posPenerimaan.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin + (item.startsWith('   ') ? 10 : 0), yPos, { maxWidth: maxWidth - (item.startsWith('   ') ? 10 : 0) });
      yPos += 6;
    });

    // Halaman 6 - POS Pemeriksaan
    yPos += 5;
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3.2. Pemeriksaan dan Pengujian', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const posPemeriksaan = [
      'a. Pemeriksaan dilakukan sesuai standar yang berlaku untuk memastikan produk aman untuk dikonsumsi.',
      '',
      'b. Parameter yang diperiksa meliputi:',
      '   • Karakteristik fisik (warna, tekstur, bau)',
      '   • Parameter kimia (jika diperlukan)',
      '   • Parameter mikrobiologi (jika diperlukan)',
      '   • Kontaminan fisik, kimia, dan biologi',
      '',
      'c. Hasil pemeriksaan dicatat dalam formulir pemeriksaan yang berisi:',
      '   • Identitas produk',
      '   • Parameter yang diperiksa',
      '   • Hasil pemeriksaan',
      '   • Nama pemeriksa dan tanggal',
      '   • Tanda tangan pemeriksa',
      '',
      'd. Produk yang lulus pemeriksaan dapat diproses lebih lanjut.',
      'e. Produk yang tidak lulus diperlakukan sesuai prosedur penanganan produk tidak memenuhi syarat.',
    ];

    posPemeriksaan.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin + (item.startsWith('   ') ? 10 : 0), yPos, { maxWidth: maxWidth - (item.startsWith('   ') ? 10 : 0) });
      yPos += 6;
    });

    // Halaman 7 - POS Penyimpanan dan Distribusi
    yPos += 5;
    if (yPos > 240) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3.3. Penyimpanan', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const posPenyimpanan = [
      'a. Produk disimpan dalam kondisi yang sesuai dengan persyaratan produk:',
      '   • Suhu dan kelembaban yang terkontrol',
      '   • Kebersihan ruang penyimpanan',
      '   • Sistem FIFO (First In First Out)',
      '',
      'b. Setiap produk harus memiliki label yang jelas dengan informasi:',
      '   • Nama produk',
      '   • Tanggal penerimaan/produksi',
      '   • Tanggal kadaluarsa (jika berlaku)',
      '   • Nomor batch/lot',
      '',
      'c. Pencatatan kondisi penyimpanan dilakukan secara rutin.',
    ];

    posPenyimpanan.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin + (item.startsWith('   ') ? 10 : 0), yPos, { maxWidth: maxWidth - (item.startsWith('   ') ? 10 : 0) });
      yPos += 6;
    });

    yPos += 5;
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3.4. Distribusi', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const posDistribusi = [
      'a. Distribusi produk dilakukan dengan memperhatikan:',
      '   • Kondisi produk saat pengiriman',
      '   • Alat angkut yang memenuhi syarat',
      '   • Dokumen pengiriman yang lengkap',
      '',
      'b. Setiap pengiriman harus dicatat dengan detail:',
      '   • Tanggal pengiriman',
      '   • Produk yang dikirim',
      '   • Jumlah',
      '   • Tujuan/penerima',
      '   • Nomor surat jalan',
      '',
      'c. Dokumentasi distribusi disimpan minimal 2 tahun.',
    ];

    posDistribusi.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin + (item.startsWith('   ') ? 10 : 0), yPos, { maxWidth: maxWidth - (item.startsWith('   ') ? 10 : 0) });
      yPos += 6;
    });

    // Halaman 8 - Kontrol Kualitas dan Penanganan
    yPos += 10;
    if (yPos > 240) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. KONTROL KUALITAS', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const kontrolKualitas = [
      'Sistem kontrol kualitas diterapkan untuk memastikan produk yang dihasilkan/didistribusikan memenuhi standar yang berlaku. Hal-hal yang dilakukan:',
      '',
      'a. Pemeriksaan berkala terhadap kondisi produk',
      'b. Kalibrasi alat ukur dan peralatan secara berkala',
      'c. Pelatihan personel terkait prosedur kontrol kualitas',
      'd. Audit internal secara berkala',
      'e. Pencatatan dan dokumentasi hasil kontrol kualitas',
      '',
      'Semua temuan dan tindak lanjut hasil kontrol kualitas didokumentasikan dan disimpan.',
    ];

    kontrolKualitas.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin, yPos, { maxWidth: maxWidth, align: 'justify' });
      yPos += 7;
    });

    yPos += 5;
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('5. PENANGANAN PRODUK RUSAK/TERCEMAR', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const penangananRusak = [
      'a. Produk yang teridentifikasi rusak, tidak memenuhi syarat, atau tercemar harus:',
      '   • Segera dipisahkan dari produk yang layak',
      '   • Diberi label/tanda khusus',
      '   • Dicatat dalam register produk tidak layak',
      '',
      'b. Produk yang tidak layak ditangani sesuai ketentuan:',
      '   • Dikembalikan ke supplier (jika masih baru diterima)',
      '   • Dimusnahkan dengan cara yang aman (jika sudah tidak layak)',
      '   • Dilaporkan kepada pihak berwenang jika diperlukan',
      '',
      'c. Semua tindakan penanganan produk tidak layak didokumentasikan dengan lengkap.',
    ];

    penangananRusak.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin + (item.startsWith('   ') ? 10 : 0), yPos, { maxWidth: maxWidth - (item.startsWith('   ') ? 10 : 0) });
      yPos += 6;
    });

    // Halaman 9 - Dokumentasi dan Personalia
    yPos += 10;
    if (yPos > 240) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('6. DOKUMENTASI DAN PENCATATAN', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const dokumentasi = [
      'Semua kegiatan operasional didokumentasikan dan dicatat dengan lengkap, termasuk:',
      '',
      'a. Buku register penerimaan produk',
      'b. Formulir pemeriksaan/pengujian',
      'c. Buku register penyimpanan',
      'd. Buku register distribusi',
      'e. Catatan kontrol kualitas',
      'f. Catatan penanganan produk tidak layak',
      'g. Sertifikat dan dokumen pendukung lainnya',
      '',
      'Dokumentasi disimpan minimal 2 tahun dan dapat diakses untuk keperluan audit atau pemeriksaan.',
    ];

    dokumentasi.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin, yPos, { maxWidth: maxWidth, align: 'justify' });
      yPos += 6;
    });

    yPos += 5;
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('7. PERSONALIA', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const personalia = [
      'a. Personel yang menangani produk harus memiliki kualifikasi dan kompetensi yang sesuai.',
      '',
      'b. Personel wajib mengikuti pelatihan berkala terkait:',
      '   • Prosedur operasional standar',
      '   • Higiene dan sanitasi',
      '   • Keamanan pangan',
      '   • Penanganan produk',
      '',
      'c. Record pelatihan personel didokumentasikan dan disimpan.',
      '',
      `d. Penanggung Jawab: ${formData.namaPenanggungJawab || 'Nama Penanggung Jawab'}`,
      `   Jabatan: ${formData.jabatanPenanggungJawab || 'Jabatan'}`,
    ];

    personalia.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin + (item.startsWith('   ') ? 10 : 0), yPos, { maxWidth: maxWidth - (item.startsWith('   ') ? 10 : 0) });
      yPos += 6;
    });

    // Halaman 10 - Fasilitas dan Penutup
    yPos += 5;
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('8. FASILITAS DAN SARANA', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const fasilitas = [
      'Fasilitas dan sarana yang dimiliki perusahaan:',
      '',
      `a. Lokasi: ${formData.alamatUsaha || 'Alamat Usaha'}, Kecamatan ${formData.kecamatanUsaha || 'Kecamatan'}, Desa/Kelurahan ${formData.desaUsaha || 'Desa/Kelurahan'}`,
      '',
      'b. Ruang penyimpanan yang memenuhi syarat (suhu, kelembaban, kebersihan)',
      'c. Alat pemeriksaan/pengujian (sesuai kebutuhan)',
      'd. Peralatan untuk penanganan produk',
      'e. Sistem pencatatan dan dokumentasi',
      '',
      'Fasilitas dan sarana dijaga kebersihannya dan dirawat secara berkala. Pemeliharaan dan perbaikan dicatat dalam buku pemeliharaan.',
    ];

    fasilitas.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(item, margin, yPos, { maxWidth: maxWidth, align: 'justify' });
      yPos += 6;
    });

    // Halaman Penutup
    yPos += 10;
    if (yPos > 240) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('9. PENUTUP', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const penutup = [
      `Dokumen Teknis ini disusun untuk memberikan informasi lengkap mengenai tata cara operasional ${formData.namaPerusahaan || 'Nama Perusahaan'} dalam kegiatan usaha terkait Nomor Kontrol Veteriner.`,
      '',
      'Dokumen ini akan dievaluasi oleh pihak berwenang sebagai bagian dari proses penerbitan Nomor Kontrol Veteriner.',
      '',
      'Demikian dokumen teknis ini disusun untuk dapat digunakan sebagai bahan evaluasi dan pertimbangan.',
      '',
      'Hormat kami,',
      '',
      '',
      formData.namaPenanggungJawab || '_________________________',
      formData.jabatanPenanggungJawab || '_________________________',
      '',
      '',
      `Kabupaten Bogor, ${today.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    ];

    penutup.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      if (item.trim() === '') {
        yPos += 5;
      } else {
        doc.text(item, margin, yPos, { maxWidth: maxWidth, align: item.includes('Hormat kami') ? 'left' : 'justify' });
        yPos += 7;
      }
    });

    doc.save('Dokumen-Teknis-NKV.pdf');
    toast.success('Template dokumen teknis berhasil diunduh!');
  };

  const handleKecamatanChange = (value: string) => {
    setFormData({ ...formData, kecamatan: value, desa: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast.error('Harap pilih jenis rekomendasi');
      return;
    }

    // Validasi khusus untuk praktek dokter hewan (Permentan 3/2019)
    if (selectedType === 'praktek_dokter_hewan') {
      if (!formData.name || !formData.birthPlace || !formData.birthDate || !formData.nik || 
          !formData.phone || !formData.address || !formData.kecamatan || !formData.desa ||
          !formData.npwp || !formData.institutionName || !formData.graduationYear || 
          !formData.diplomaNumber || !formData.practiceAddress || !formData.practiceType) {
        toast.error('Harap isi semua field yang wajib');
        return;
      }
      
      if (formData.practiceType === 'instansi' && (!formData.institutionName_practice || !formData.position)) {
        toast.error('Harap isi nama instansi dan jabatan jika praktik di instansi');
        return;
      }
      
      // Validasi dokumen wajib
      const requiredDocs = ['suratPermohonan', 'nib_file_praktek', 'ktp', 'npwp_file', 'pasFoto', 'ijazah', 'sertifikatKompetensi', 'suratRekomendasiOrganisasi'];
      const missingDocs = requiredDocs.filter(doc => !formData[doc as keyof typeof formData] && !uploadedDocs[doc]);
      
      if (missingDocs.length > 0) {
        toast.error(`Harap unggah dokumen: ${missingDocs.join(', ')}`);
        return;
      }
      
      if (formData.practiceType === 'instansi' && !formData.suratIzinInstansi && !uploadedDocs['suratIzinInstansi']) {
        toast.error('Harap unggah Surat Izin dari Pimpinan Instansi');
        return;
      }
      
      if (formData.isRenewal && !formData.suratIzinLama && !uploadedDocs['suratIzinLama']) {
        toast.error('Harap unggah Surat Izin Praktik Dokter Hewan yang Lama untuk perpanjangan');
        return;
      }
    } else if (selectedType === 'nomor_kontrol_veteriner') {
      // Validasi untuk nomor kontrol veteriner (sesuai OSS)
      if (!formData.namaPerusahaan || !formData.nib || !formData.alamatUsaha || 
          !formData.kecamatanUsaha || !formData.desaUsaha || !formData.kontakPerson || 
          !formData.jabatanKontakPerson || !formData.namaPenanggungJawab || 
          !formData.jabatanPenanggungJawab || !formData.nikPenanggungJawab || 
          !formData.phonePenanggungJawab || !formData.kbli || !formData.deskripsiKegiatanUsaha) {
        toast.error('Harap isi semua field yang wajib');
        return;
      }
      
      // Validasi dokumen wajib NKV
      const requiredDocsNKV = ['suratPermohonanNKV', 'aktaPendirian', 'nib_file', 'ktpPenanggungJawab'];
      const missingDocsNKV = requiredDocsNKV.filter(doc => !formData[doc as keyof typeof formData] && !uploadedDocs[doc]);
      
      if (missingDocsNKV.length > 0) {
        toast.error(`Harap unggah dokumen wajib: ${missingDocsNKV.join(', ')}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const trackingCodeValue = 'REK' + Date.now().toString().slice(-8);
      
      const recommendationLabel = recommendationTypes.find(t => t.value === selectedType)?.label || 'Rekomendasi';
      
      // Format notes dengan semua informasi
      let notesData: any = {
        jenis: recommendationLabel,
        informasi_pribadi: {
          nama: formData.name,
          tempat_lahir: formData.birthPlace,
          tanggal_lahir: formData.birthDate,
          nik: formData.nik,
          telp: formData.phone,
          email: formData.email,
          alamat: formData.address,
          kecamatan: formData.kecamatan,
          desa: formData.desa,
          npwp: formData.npwp,
        }
      };
      
      if (selectedType === 'praktek_dokter_hewan') {
        notesData.informasi_pendidikan = {
          institusi: formData.institutionName,
          tahun_lulus: formData.graduationYear,
          nomor_ijazah: formData.diplomaNumber,
        };
        
        notesData.informasi_kegiatan_usaha = {
          kbli: '75000', // KBLI tetap 75000 untuk aktivitas kesehatan hewan
          deskripsi: 'Aktivitas kesehatan hewan, termasuk perawatan dan pemeriksaan kesehatan hewan ternak dan hewan piaraan yang dilakukan oleh dokter hewan, kegiatan asisten dokter hewan, klinik patologi, diagnosis hewan, ambulans hewan, vaksinasi hewan, dan laboratorium penelitian kesehatan hewan.',
          pbumku: 'Rekomendasi Praktek Dokter Hewan',
        };
        
        notesData.informasi_praktik = {
          alamat_praktik: formData.practiceAddress,
          jenis_praktik: formData.practiceType,
          jam_operasional: formData.workingHours,
          nama_instansi: formData.institutionName_practice || '-',
          jabatan: formData.position || '-',
        };
        
        notesData.dokumen = uploadedDocs;
        notesData.is_perpanjangan = formData.isRenewal;
      } else if (selectedType === 'nomor_kontrol_veteriner') {
        notesData.data_pelaku_usaha = {
          nama_perusahaan: formData.namaPerusahaan,
          nib: formData.nib,
          alamat_usaha: formData.alamatUsaha,
          kecamatan_usaha: formData.kecamatanUsaha,
          desa_usaha: formData.desaUsaha,
          kontak_person: formData.kontakPerson,
          jabatan_kontak_person: formData.jabatanKontakPerson,
        };
        
        notesData.data_penanggung_jawab = {
          nama: formData.namaPenanggungJawab,
          jabatan: formData.jabatanPenanggungJawab,
          nik: formData.nikPenanggungJawab,
          telepon: formData.phonePenanggungJawab,
          email: formData.emailPenanggungJawab,
        };
        
        notesData.informasi_kegiatan_usaha = {
          kbli: formData.kbli,
          deskripsi: formData.deskripsiKegiatanUsaha,
        };
        
        notesData.dokumen = uploadedDocs;
      }
      
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          tracking_code: trackingCodeValue,
          service_type: selectedType,
          description: selectedType === 'nomor_kontrol_veteriner' 
            ? `${recommendationLabel} - ${formData.namaPerusahaan}`
            : formData.description || `${recommendationLabel} - ${formData.name}`,
          status: 'pending',
          notes: JSON.stringify(notesData),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Permohonan rekomendasi berhasil dikirim!');
      
      // Set tracking code and show modal
      setTrackingCode(trackingCodeValue);
      setShowTrackingModal(true);
      
      // Reset form
      setSelectedType('');
      setFormData({
        name: '',
        birthPlace: '',
        birthDate: '',
        nik: '',
        phone: '',
        email: '',
        address: '',
        kecamatan: '',
        desa: '',
        npwp: '',
        institutionName: '',
        graduationYear: '',
        diplomaNumber: '',
        kbli_praktek: '',
        deskripsiKegiatanUsaha_praktek: '',
        pbumku_praktek: 'rekomendasi_praktek_dokter_hewan',
        practiceAddress: '',
        practiceType: '',
        workingHours: '',
        institutionName_practice: '',
        position: '',
        suratPermohonan: null,
        nib_file_praktek: null,
        ktp: null,
        npwp_file: null,
        pasFoto: null,
        ijazah: null,
        sertifikatKompetensi: null,
        suratRekomendasiOrganisasi: null,
        suratIzinInstansi: null,
        suratIzinLama: null,
        description: '',
        isRenewal: false,
        namaPerusahaan: '',
        nib: '',
        alamatUsaha: '',
        kecamatanUsaha: '',
        desaUsaha: '',
        kontakPerson: '',
        jabatanKontakPerson: '',
        namaPenanggungJawab: '',
        jabatanPenanggungJawab: '',
        nikPenanggungJawab: '',
        phonePenanggungJawab: '',
        emailPenanggungJawab: '',
        kbli: '',
        deskripsiKegiatanUsaha: '',
        suratPermohonanNKV: null,
        aktaPendirian: null,
        nib_file: null,
        izinUsaha: null,
        ktpPenanggungJawab: null,
        suratKuasa: null,
        dokumenTeknis: null,
      });
      setUploadedDocs({});

    } catch (error: any) {
      console.error('Error creating recommendation request:', error);
      toast.error('Gagal membuat permohonan rekomendasi');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDesaOptions = formData.kecamatan ? (desaByKecamatan[formData.kecamatan] || []) : [];

  return (
    <>
      <Head>
        <title>Layanan Rekomendasi - SLIDER</title>
        <meta name="description" content="Rekomendasi Praktek Dokter Hewan dan Rekomendasi Nomor Kontrol Veteriner" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="bg-gray-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  SLIDER
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="hover:text-blue-300 transition">Beranda</Link>
                <Link href="/konsultasi" className="hover:text-blue-300 transition">Konsultasi</Link>
                <Link href="/layanan" className="hover:text-blue-300 transition">Layanan Klinik</Link>
                <Link href="/edukasi" className="hover:text-blue-300 transition">Edukasi</Link>
                <Link href="/layanan-rekomendasi" className="hover:text-blue-300 transition font-semibold">Layanan Rekomendasi</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Layanan Rekomendasi
              </h1>
              <p className="text-gray-600 text-lg">
                Ajukan permohonan rekomendasi untuk praktek dokter hewan atau nomor kontrol veteriner
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Recommendation Type Dropdown */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Rekomendasi *
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-lg"
                >
                  <option value="">-- Pilih Jenis Rekomendasi --</option>
                  {recommendationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                {selectedType && (
                  <p className="mt-2 text-sm text-gray-500">
                    {recommendationTypes.find(t => t.value === selectedType)?.description}
                  </p>
                )}
              </div>

              {/* Form */}
              {selectedType && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {selectedType === 'praktek_dokter_hewan' ? (
                    <>
                      {/* Perpanjangan Checkbox */}
                      <div className="border-t pt-6">
                        <div className="flex items-center gap-3 mb-6">
                          <input
                            type="checkbox"
                            id="isRenewal"
                            checked={formData.isRenewal}
                            onChange={(e) => setFormData({ ...formData, isRenewal: e.target.checked })}
                            className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <label htmlFor="isRenewal" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Permohonan Perpanjangan (Centang jika ini adalah perpanjangan izin yang sudah ada)
                          </label>
                        </div>
                      </div>

                      {/* Informasi Pribadi */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">1. Informasi Pribadi</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Lengkap *
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Masukkan nama lengkap"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tempat Lahir *
                            </label>
                            <input
                              type="text"
                              value={formData.birthPlace}
                              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                              placeholder="Kota tempat lahir"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tanggal Lahir *
                            </label>
                            <input
                              type="date"
                              value={formData.birthDate}
                              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              NIK (Nomor Induk Kependudukan) *
                            </label>
                            <input
                              type="text"
                              value={formData.nik}
                              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                              placeholder="16 digit NIK"
                              required
                              maxLength={16}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              No. Telepon *
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="08xxxxxxxxxx"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="email@example.com"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Alamat Lengkap *
                            </label>
                            <textarea
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              placeholder="Alamat lengkap sesuai KTP"
                              required
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kecamatan *
                            </label>
                            <select
                              value={formData.kecamatan}
                              onChange={(e) => handleKecamatanChange(e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            >
                              <option value="">-- Pilih Kecamatan --</option>
                              {kecamatanList.map((kec) => (
                                <option key={kec} value={kec}>
                                  {kec}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Desa/Kelurahan *
                            </label>
                            <select
                              value={formData.desa}
                              onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                              required
                              disabled={!formData.kecamatan}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:text-gray-400"
                            >
                              <option value="">
                                {formData.kecamatan ? '-- Pilih Desa/Kelurahan --' : 'Pilih kecamatan terlebih dahulu'}
                              </option>
                              {selectedDesaOptions.map((desa) => (
                                <option key={desa} value={desa}>
                                  {desa}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              NPWP (Nomor Pokok Wajib Pajak) *
                            </label>
                            <input
                              type="text"
                              value={formData.npwp}
                              onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                              placeholder="15 digit NPWP"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Informasi Pendidikan */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">2. Informasi Pendidikan</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Institusi Pendidikan *
                            </label>
                            <input
                              type="text"
                              value={formData.institutionName}
                              onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                              placeholder="Nama universitas/sekolah tinggi"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tahun Lulus *
                            </label>
                            <input
                              type="number"
                              value={formData.graduationYear}
                              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                              placeholder="YYYY"
                              required
                              min="1950"
                              max={new Date().getFullYear()}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nomor Ijazah Dokter Hewan *
                            </label>
                            <input
                              type="text"
                              value={formData.diplomaNumber}
                              onChange={(e) => setFormData({ ...formData, diplomaNumber: e.target.value })}
                              placeholder="Nomor ijazah lengkap"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Informasi Kegiatan Usaha (PBUMKU) */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">3. Informasi Kegiatan Usaha</h3>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jenis PBUMKU
                          </label>
                          <input
                            type="text"
                            value="Rekomendasi Praktek Dokter Hewan"
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            PBUMKU: Perizinan Berusaha untuk Menunjang Kegiatan Usaha sesuai ketentuan OSS
                          </p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Catatan PBUMKU:</strong> Rekomendasi ini merupakan bagian dari Perizinan Berusaha untuk Menunjang Kegiatan Usaha (PBUMKU) sesuai ketentuan OSS. Proses penerbitan rekomendasi akan mengikuti prosedur yang ditetapkan oleh Dinas Perikanan dan Peternakan Kabupaten Bogor.
                          </p>
                        </div>
                      </div>

                      {/* Informasi Praktik */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">4. Informasi Praktik</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Alamat Tempat Praktik *
                            </label>
                            <textarea
                              value={formData.practiceAddress}
                              onChange={(e) => setFormData({ ...formData, practiceAddress: e.target.value })}
                              placeholder="Alamat lengkap tempat praktik dokter hewan"
                              required
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Jenis Praktik *
                            </label>
                            <select
                              value={formData.practiceType}
                              onChange={(e) => setFormData({ ...formData, practiceType: e.target.value })}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            >
                              <option value="">-- Pilih Jenis Praktik --</option>
                              <option value="mandiri">Praktik Mandiri</option>
                              <option value="instansi">Praktik di Instansi</option>
                            </select>
                          </div>
                          {formData.practiceType === 'instansi' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Nama Instansi Tempat Bekerja *
                                </label>
                                <input
                                  type="text"
                                  value={formData.institutionName_practice}
                                  onChange={(e) => setFormData({ ...formData, institutionName_practice: e.target.value })}
                                  placeholder="Nama instansi"
                                  required
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Jabatan di Instansi *
                                </label>
                                <input
                                  type="text"
                                  value={formData.position}
                                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                  placeholder="Jabatan saat ini"
                                  required
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                />
                              </div>
                            </>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Jam Operasional Praktik *
                            </label>
                            <input
                              type="text"
                              value={formData.workingHours}
                              onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                              placeholder="Contoh: Senin-Jumat 08:00-17:00"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dokumen Persyaratan */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">4. Dokumen Persyaratan (Permentan 3/2019)</h3>
                        <p className="text-sm text-gray-600 mb-6">Unggah dokumen dalam format PDF atau JPG/PNG (maks. 10MB per file)</p>
                        
                        {/* Template Surat Permohonan */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-1">Template Surat Permohonan</h4>
                              <p className="text-sm text-gray-600">Unduh template surat permohonan yang sudah diisi dengan data Anda</p>
                            </div>
                            <button
                              type="button"
                              onClick={generateSuratPermohonanPDF}
                              disabled={!formData.name || !formData.birthPlace || !formData.birthDate || !formData.nik}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Unduh Template PDF
                            </button>
                          </div>
                          {(!formData.name || !formData.birthPlace || !formData.birthDate || !formData.nik) && (
                            <p className="text-xs text-orange-600 mt-2">Isi minimal Nama, Tempat Lahir, Tanggal Lahir, dan NIK untuk mengunduh template</p>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            { key: 'suratPermohonan', label: 'Surat Permohonan *', required: true },
                            { key: 'nib_file_praktek', label: 'Fotokopi Nomor Induk Berusaha (NIB) *', required: true },
                            { key: 'ktp', label: 'Fotokopi KTP *', required: true },
                            { key: 'npwp_file', label: 'Fotokopi NPWP *', required: true },
                            { key: 'pasFoto', label: 'Pas Foto Berwarna 4x6 *', required: true },
                            { key: 'ijazah', label: 'Fotokopi Ijazah Dokter Hewan *', required: true },
                            { key: 'sertifikatKompetensi', label: 'Fotokopi Sertifikat Kompetensi Dokter Hewan *', required: true },
                            { key: 'suratRekomendasiOrganisasi', label: 'Fotokopi Surat Rekomendasi dari Organisasi Profesi Kedokteran Hewan Cabang Setempat *', required: true },
                            { key: 'suratIzinInstansi', label: 'Surat Izin dari Pimpinan Instansi (jika Praktik di Instansi)', required: formData.practiceType === 'instansi' },
                            { key: 'suratIzinLama', label: 'Surat Izin Praktik Dokter Hewan yang Lama (untuk Perpanjangan)', required: formData.isRenewal },
                          ].map((doc) => {
                            if (doc.required === false) return null;
                            const docKey = doc.key as keyof typeof formData;
                            return (
                              <div key={docKey} className="border border-gray-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {doc.label}
                                </label>
                                <div className="flex items-center gap-4">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange(docKey, e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                  />
                                  {uploadingDocs[docKey] && (
                                    <span className="text-sm text-gray-500">Mengunggah...</span>
                                  )}
                                  {uploadedDocs[docKey] && (
                                    <span className="text-sm text-green-600 flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Terunggah
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Form untuk Nomor Kontrol Veteriner (sesuai OSS) */
                    <>
                      {/* 1. Data Pelaku Usaha */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">1. Data Pelaku Usaha</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Perusahaan <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.namaPerusahaan}
                              onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })}
                              placeholder="Nama perusahaan sesuai akta pendirian"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nomor Induk Berusaha (NIB) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.nib}
                              onChange={(e) => setFormData({ ...formData, nib: e.target.value })}
                              placeholder="Nomor Induk Berusaha dari OSS"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Alamat Usaha <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.alamatUsaha}
                              onChange={(e) => setFormData({ ...formData, alamatUsaha: e.target.value })}
                              placeholder="Alamat lengkap lokasi usaha"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kecamatan Usaha <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.kecamatanUsaha}
                              onChange={(e) => handleKecamatanUsahaChange(e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            >
                              <option value="">-- Pilih Kecamatan --</option>
                              {kecamatanList.map((kec) => (
                                <option key={kec} value={kec}>
                                  {kec}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Desa/Kelurahan Usaha <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.desaUsaha}
                              onChange={(e) => setFormData({ ...formData, desaUsaha: e.target.value })}
                              required
                              disabled={!formData.kecamatanUsaha}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:text-gray-400"
                            >
                              <option value="">
                                {formData.kecamatanUsaha ? '-- Pilih Desa/Kelurahan --' : 'Pilih kecamatan terlebih dahulu'}
                              </option>
                              {formData.kecamatanUsaha && desaByKecamatan[formData.kecamatanUsaha]?.map((desa) => (
                                <option key={desa} value={desa}>
                                  {desa}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kontak Person <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.kontakPerson}
                              onChange={(e) => setFormData({ ...formData, kontakPerson: e.target.value })}
                              placeholder="Nama kontak person"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Jabatan Kontak Person <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.jabatanKontakPerson}
                              onChange={(e) => setFormData({ ...formData, jabatanKontakPerson: e.target.value })}
                              placeholder="Jabatan kontak person"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. Data Penanggung Jawab */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">2. Data Penanggung Jawab</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Penanggung Jawab <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.namaPenanggungJawab}
                              onChange={(e) => setFormData({ ...formData, namaPenanggungJawab: e.target.value })}
                              placeholder="Nama lengkap penanggung jawab"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Jabatan Penanggung Jawab <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.jabatanPenanggungJawab}
                              onChange={(e) => setFormData({ ...formData, jabatanPenanggungJawab: e.target.value })}
                              placeholder="Jabatan di perusahaan"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              NIK Penanggung Jawab <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.nikPenanggungJawab}
                              onChange={(e) => setFormData({ ...formData, nikPenanggungJawab: e.target.value })}
                              placeholder="Nomor Induk Kependudukan"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              No. Telepon Penanggung Jawab <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={formData.phonePenanggungJawab}
                              onChange={(e) => setFormData({ ...formData, phonePenanggungJawab: e.target.value })}
                              placeholder="08xxxxxxxxxx"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Penanggung Jawab
                            </label>
                            <input
                              type="email"
                              value={formData.emailPenanggungJawab}
                              onChange={(e) => setFormData({ ...formData, emailPenanggungJawab: e.target.value })}
                              placeholder="email@example.com"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Informasi Kegiatan Usaha */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">3. Informasi Kegiatan Usaha</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kode KBLI <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.kbli}
                              onChange={(e) => {
                                const selectedKbli = kbliOptions.find(k => k.code === e.target.value);
                                setFormData({ 
                                  ...formData, 
                                  kbli: e.target.value,
                                  deskripsiKegiatanUsaha: selectedKbli ? selectedKbli.description : ''
                                });
                              }}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            >
                              <option value="">-- Pilih Kode KBLI --</option>
                              {kbliOptions.map((kbli) => (
                                <option key={kbli.code} value={kbli.code}>
                                  {kbli.label}
                                </option>
                              ))}
                            </select>
                            {formData.kbli && (
                              <p className="mt-2 text-xs text-blue-600">
                                {kbliOptions.find(k => k.code === formData.kbli)?.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deskripsi Kegiatan Usaha <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={formData.deskripsiKegiatanUsaha}
                            readOnly
                            rows={5}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed resize-none"
                            placeholder="Pilih Kode KBLI terlebih dahulu untuk menampilkan deskripsi"
                          />
                          {!formData.kbli && (
                            <p className="mt-2 text-xs text-gray-500">
                              Deskripsi akan terisi otomatis setelah memilih Kode KBLI
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 4. Dokumen Pendukung */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">4. Dokumen Pendukung</h3>
                        
                        {/* Template Surat Permohonan */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-1">Template Surat Permohonan</h4>
                              <p className="text-sm text-gray-600">Unduh template surat permohonan yang sudah diisi dengan data Anda</p>
                            </div>
                            <button
                              type="button"
                              onClick={generateSuratPermohonanNKVPDF}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Unduh Template PDF
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Surat Permohonan <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData({ ...formData, suratPermohonanNKV: file });
                                if (file) handleFileUpload('suratPermohonanNKV', file);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                            {uploadingDocs.suratPermohonanNKV && (
                              <p className="mt-2 text-sm text-blue-600">Mengunggah dokumen...</p>
                            )}
                            {uploadedDocs.suratPermohonanNKV && (
                              <p className="mt-2 text-sm text-green-600">✓ Dokumen berhasil diunggah</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Akta Pendirian / Akta Perubahan <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData({ ...formData, aktaPendirian: file });
                                if (file) handleFileUpload('aktaPendirian', file);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                            {uploadingDocs.aktaPendirian && (
                              <p className="mt-2 text-sm text-blue-600">Mengunggah dokumen...</p>
                            )}
                            {uploadedDocs.aktaPendirian && (
                              <p className="mt-2 text-sm text-green-600">✓ Dokumen berhasil diunggah</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fotokopi NIB <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData({ ...formData, nib_file: file });
                                if (file) handleFileUpload('nib_file', file);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                            {uploadingDocs.nib_file && (
                              <p className="mt-2 text-sm text-blue-600">Mengunggah dokumen...</p>
                            )}
                            {uploadedDocs.nib_file && (
                              <p className="mt-2 text-sm text-green-600">✓ Dokumen berhasil diunggah</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Izin Usaha (jika ada)
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData({ ...formData, izinUsaha: file });
                                if (file) handleFileUpload('izinUsaha', file);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                            {uploadingDocs.izinUsaha && (
                              <p className="mt-2 text-sm text-blue-600">Mengunggah dokumen...</p>
                            )}
                            {uploadedDocs.izinUsaha && (
                              <p className="mt-2 text-sm text-green-600">✓ Dokumen berhasil diunggah</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              KTP Penanggung Jawab <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData({ ...formData, ktpPenanggungJawab: file });
                                if (file) handleFileUpload('ktpPenanggungJawab', file);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                            {uploadingDocs.ktpPenanggungJawab && (
                              <p className="mt-2 text-sm text-blue-600">Mengunggah dokumen...</p>
                            )}
                            {uploadedDocs.ktpPenanggungJawab && (
                              <p className="mt-2 text-sm text-green-600">✓ Dokumen berhasil diunggah</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Surat Kuasa (jika diperlukan)
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData({ ...formData, suratKuasa: file });
                                if (file) handleFileUpload('suratKuasa', file);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                            {uploadingDocs.suratKuasa && (
                              <p className="mt-2 text-sm text-blue-600">Mengunggah dokumen...</p>
                            )}
                            {uploadedDocs.suratKuasa && (
                              <p className="mt-2 text-sm text-green-600">✓ Dokumen berhasil diunggah</p>
                            )}
                          </div>

                          {/* Template Dokumen Teknis */}
                          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-1">Template Dokumen Teknis</h4>
                                <p className="text-sm text-gray-600">Unduh template dokumen teknis yang berisi diagram alur, prosedur operasional standar, dan dokumentasi teknis</p>
                              </div>
                              <button
                                type="button"
                                onClick={generateDokumenTeknisPDF}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Unduh Template PDF
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dokumen Teknis (diagram alur, prosedur operasional, dll)
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData({ ...formData, dokumenTeknis: file });
                                if (file) handleFileUpload('dokumenTeknis', file);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                            />
                            {uploadingDocs.dokumenTeknis && (
                              <p className="mt-2 text-sm text-blue-600">Mengunggah dokumen...</p>
                            )}
                            {uploadedDocs.dokumenTeknis && (
                              <p className="mt-2 text-sm text-green-600">✓ Dokumen berhasil diunggah</p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                              Template dokumen teknis di atas dapat digunakan sebagai acuan. Anda dapat menambahkan diagram alur, foto, dan detail tambahan sesuai kebutuhan.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {submitting ? 'Mengirim Permohonan...' : 'Kirim Permohonan Rekomendasi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Tracking Code Modal */}
        {showTrackingModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTrackingModal(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Permohonan Berhasil Dikirim!
                </h3>
                <p className="text-gray-600 mb-6">
                  Simpan kode tracking ini untuk melacak status permohonan Anda
                </p>
                
                {/* Tracking Code Display */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 mb-6">
                  <p className="text-sm text-white/80 mb-2 font-medium">Kode Tracking</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-bold text-white tracking-wider">
                      {trackingCode}
                    </code>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(trackingCode);
                          toast.success('Kode tracking berhasil disalin!');
                        } catch (err) {
                          toast.error('Gagal menyalin kode');
                        }
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                      title="Salin kode"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Cara Melacak Permohonan:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Gunakan kode tracking di atas</li>
                        <li>Cek status permohonan di halaman "Lacak Permohonan"</li>
                        <li>Anda akan mendapat notifikasi saat status berubah</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-20 py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4">SLIDER</h4>
                <p className="text-gray-400 text-sm">
                  Sistem Layanan Integrasi Data Edukasi Realtime
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Layanan</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/konsultasi" className="hover:text-white transition">Konsultasi Online</Link></li>
                  <li><Link href="/layanan" className="hover:text-white transition">Layanan Klinik</Link></li>
                  <li><Link href="/edukasi" className="hover:text-white transition">Edukasi</Link></li>
                  <li><Link href="/layanan-rekomendasi" className="hover:text-white transition">Layanan Rekomendasi</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Informasi</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/tentang" className="hover:text-white transition">Tentang Kami</Link></li>
                  <li><Link href="/kontak" className="hover:text-white transition">Kontak</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                  <li><Link href="/bantuan" className="hover:text-white transition">Bantuan</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Kontak</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>📞 (021) 8765311</li>
                  <li>✉️ diskanak@bogorkab.go.id</li>
                  <li>📍 Jl. Bersih, Kel Tengah, Kec Cibinong, Kab. Bogor, Prov. Jawa Barat</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>© 2024 Ruli Kurniawan, S.Pt. - Dinas Perikanan dan Peternakan Kabupaten Bogor</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

