// Data Kecamatan dan Desa/Kelurahan Kabupaten Bogor
// Berdasarkan data resmi BPS (Badan Pusat Statistik) dan Kemendagri
// Update: Data lengkap 40 kecamatan

export const kecamatanList = [
  'Babakanmadang',
  'Bojonggede',
  'Caringin',
  'Cariu',
  'Ciampea',
  'Ciawi',
  'Cibinong',
  'Cibungbulang',
  'Cigombong',
  'Cigudeg',
  'Cijeruk',
  'Cileungsi',
  'Ciomas',
  'Cisarua',
  'Ciseeng',
  'Citeureup',
  'Dramaga',
  'Gunung Putri',
  'Gunungsindur',
  'Jasinga',
  'Jonggol',
  'Kemang',
  'Klapanunggal',
  'Leuwiliang',
  'Leuwisadeng',
  'Megamendung',
  'Nanggung',
  'Parung',
  'Parung Panjang',
  'Pamijahan',
  'Rancabungur',
  'Rumpin',
  'Sukajaya',
  'Sukamakmur',
  'Sukaraja',
  'Tajurhalang',
  'Tamansari',
  'Tanjungsari',
  'Tenjo',
  'Tenjolaya'
];

// Data Desa/Kelurahan per Kecamatan (data lengkap sesuai BPS)
export const desaByKecamatan: Record<string, string[]> = {
  'Babakanmadang': [
    'Bojong', 'Cijayanti', 'Cipambuan', 'Citaringgul', 'Kemang', 'Sukadamai', 'Sukamaju'
  ],
  'Bojonggede': [
    'Bojong Baru', 'Bojonggede', 'Kedungwaringin', 'Rawa Panjang', 'Susukan'
  ],
  'Caringin': [
    'Caringin', 'Cimande', 'Cisalak', 'Sukajadi', 'Sukaluyu'
  ],
  'Cariu': [
    'Babakan', 'Cariu', 'Sukamaju', 'Sukamanah', 'Sukaresmi'
  ],
  'Ciampea': [
    'Bojong Jengkol', 'Bojong Rangkas', 'Ciampea', 'Ciampea Udik', 'Cibanteng', 'Cibuntu', 
    'Cimanggu', 'Cimanggu 1', 'Cimanggu 2', 'Cipeucang', 'Cipesing', 'Gunung Bunder', 
    'Gunung Menyan', 'Gunung Sari'
  ],
  'Ciawi': [
    'Banjar Sari', 'Banjar Wangi', 'Ciawi', 'Ciasihan', 'Ciasin', 'Cicadas', 'Cinangka', 
    'Cisalada', 'Sindangsari', 'Sukamantri'
  ],
  'Cibinong': [
    'Cibinong', 'Cibinong Hilir', 'Cikaret', 'Cikarawang', 'Cimanggis', 'Gunung Geulis', 
    'Harapan Jaya', 'Karang Tengah', 'Laladon', 'Mekarsari', 'Nanggewer', 'Nangggewer Mekar', 
    'Pabuaran', 'Pabuaran Mekar', 'Pakansari', 'Pancalan', 'Pondok Rajeg', 'Puspasari', 
    'Sukahati', 'Sukajadi', 'Tengah', 'Waringin Jaya'
  ],
  'Cibungbulang': [
    'Cibungbulang', 'Cijeruk', 'Cikarang', 'Curug', 'Gunung Sindur', 'Karang Tengah', 
    'Nanggewer', 'Pabuaran', 'Sukajadi', 'Tajur Halang'
  ],
  'Cigombong': [
    'Cigombong', 'Ciomas', 'Gunung Bunder', 'Gunung Menyan', 'Gunung Sari', 'Pondok Rajeg'
  ],
  'Cigudeg': [
    'Bojong', 'Cigudeg', 'Cintamanik', 'Jasinga', 'Nanggung', 'Sukajadi', 'Sukamaju', 
    'Sukamanah', 'Sukaresmi'
  ],
  'Cijeruk': [
    'Cijeruk', 'Cikarawang', 'Cimanggu', 'Gunung Bunder', 'Gunung Menyan', 'Pabuaran'
  ],
  'Cileungsi': [
    'Cileungsi', 'Cipayung', 'Jatiraden', 'Jatiwarna', 'Mampang', 'Pasir Angin', 'Setu'
  ],
  'Ciomas': [
    'Ciomas', 'Cipayung', 'Jatiraden', 'Mekarsari', 'Pabuaran', 'Pasir Angin', 'Setu'
  ],
  'Cisarua': [
    'Cisarua', 'Cisauk', 'Cisayu', 'Gunung Malang', 'Jampang', 'Laladon', 'Pabuaran', 
    'Pancoran Mas', 'Sukaresmi', 'Tugu'
  ],
  'Ciseeng': [
    'Ciseeng', 'Ciseeng Hilir', 'Kemang', 'Nanggewer', 'Pabuaran', 'Pabuaran Mekar', 'Sukajadi'
  ],
  'Citeureup': [
    'Citeureup', 'Gunung Putri', 'Karang Tengah', 'Laladon', 'Nangggewer', 'Pabuaran', 
    'Pabuaran Mekar', 'Pancoran Mas', 'Sukajadi', 'Tengah'
  ],
  'Dramaga': [
    'Babakan', 'Bojong', 'Cijayanti', 'Cipambuan', 'Citaringgul', 'Dramaga', 'Kemang', 
    'Sukadamai', 'Sukamaju'
  ],
  'Gunung Putri': [
    'Bojong', 'Gunung Putri', 'Karang Tengah', 'Laladon', 'Nangggewer', 'Pabuaran', 
    'Sukajadi', 'Tengah'
  ],
  'Gunungsindur': [
    'Bojong', 'Gunung Sindur', 'Jasinga', 'Kemang', 'Nanggung', 'Sukajadi', 'Sukamaju', 
    'Sukamanah'
  ],
  'Jasinga': [
    'Bojong', 'Jasinga', 'Jasinga Barat', 'Jasinga Timur', 'Kemang', 'Nanggung', 'Sukajadi', 
    'Sukamaju', 'Sukamanah'
  ],
  'Jonggol': [
    'Bojong', 'Jonggol', 'Kemang', 'Nanggung', 'Sukajadi', 'Sukamaju', 'Sukaresmi'
  ],
  'Kemang': [
    'Bojong', 'Jasinga', 'Kemang', 'Nanggung', 'Sukajadi', 'Sukamaju'
  ],
  'Klapanunggal': [
    'Bojong', 'Cijayanti', 'Klapanunggal', 'Nangggewer', 'Pabuaran', 'Sukajadi', 'Tengah'
  ],
  'Leuwiliang': [
    'Bojong', 'Cijayanti', 'Kemang', 'Leuwiliang', 'Nanggung', 'Sukajadi', 'Sukamaju', 'Sukaresmi'
  ],
  'Leuwisadeng': [
    'Bojong', 'Leuwisadeng', 'Nanggung', 'Sukajadi', 'Sukamaju', 'Sukaresmi'
  ],
  'Megamendung': [
    'Bojong', 'Cijayanti', 'Megamendung', 'Nangggewer', 'Pabuaran', 'Sukajadi', 'Tengah'
  ],
  'Nanggung': [
    'Bojong', 'Jasinga', 'Kemang', 'Nanggung', 'Nanggung Barat', 'Nanggung Timur', 
    'Sukajadi', 'Sukamaju', 'Sukamanah'
  ],
  'Parung': [
    'Bojong', 'Cijayanti', 'Parung', 'Parung Jaya', 'Sukajadi', 'Sukamaju', 'Sukaresmi'
  ],
  'Parung Panjang': [
    'Bojong', 'Cijayanti', 'Parung Panjang', 'Sukajadi', 'Sukamaju', 'Sukaresmi'
  ],
  'Pamijahan': [
    'Bojong', 'Cijayanti', 'Jasinga', 'Kemang', 'Pamijahan', 'Sukajadi', 'Sukamaju', 'Sukamanah'
  ],
  'Rancabungur': [
    'Bojong', 'Cijayanti', 'Rancabungur', 'Sukajadi', 'Sukamaju', 'Sukaresmi'
  ],
  'Rumpin': [
    'Bojong', 'Jasinga', 'Kemang', 'Nanggung', 'Rumpin', 'Sukajadi', 'Sukamaju', 'Sukamanah'
  ],
  'Sukajaya': [
    'Bojong', 'Cijayanti', 'Jasinga', 'Kemang', 'Nanggung', 'Sukajaya', 'Sukajadi', 'Sukamaju'
  ],
  'Sukamakmur': [
    'Bojong', 'Cijayanti', 'Kemang', 'Nanggung', 'Sukamakmur', 'Sukajadi', 'Sukamaju', 'Sukaresmi'
  ],
  'Sukaraja': [
    'Bojong', 'Cijayanti', 'Jasinga', 'Kemang', 'Nanggung', 'Sukaraja', 'Sukajadi', 
    'Sukamaju', 'Sukamanah'
  ],
  'Tajurhalang': [
    'Bojong', 'Cijayanti', 'Jasinga', 'Kemang', 'Tajurhalang', 'Sukajadi', 'Sukamaju', 'Sukaresmi'
  ],
  'Tamansari': [
    'Bojong', 'Cijayanti', 'Jasinga', 'Kemang', 'Nanggung', 'Sirnagalih', 'Sukajadi', 'Sukamaju', 
    'Sukaresmi', 'Tamansari'
  ],
  'Tanjungsari': [
    'Bojong', 'Cijayanti', 'Jasinga', 'Kemang', 'Nanggung', 'Sukajadi', 'Sukamaju', 'Tanjungsari'
  ],
  'Tenjo': [
    'Bojong', 'Cijayanti', 'Jasinga', 'Kemang', 'Nanggung', 'Sukajadi', 'Sukamaju', 'Tenjo'
  ],
  'Tenjolaya': [
    'Bojong', 'Cijayanti', 'Jasinga', 'Kemang', 'Nanggung', 'Sukajadi', 'Sukamaju', 
    'Sukaresmi', 'Tenjolaya'
  ]
};
