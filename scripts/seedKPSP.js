const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedKPSP() {
  console.log('Seeding KPSP data...');

  // BERSIHKAN DATA KPSP DULU
  console.log('Clearing existing KPSP data...');
  await prisma.kPSPQuestion?.deleteMany?.(); // kalau model ini ada
  await prisma.kPSPAgeCategory.deleteMany();

  // KPSP 0-6 Bulan
  const category0_6 = await prisma.kPSPAgeCategory.create({
    data: {
      code: 'KPSP_0_6',
      name: 'KPSP 0-6 Bulan',
      minAgeMonths: 0,
      maxAgeMonths: 5,
      description: 'Kuesioner Pra Skrining Perkembangan untuk anak usia 0-6 bulan',
      isActive: true,
      questions: {
        create: [
          {
            questionNumber: 1,
            questionText: 'Apakah bayi bereaksi terhadap suara keras?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Perhatikan apakah bayi kaget atau berhenti bergerak'
          },
          {
            questionNumber: 2,
            questionText: 'Apakah bayi dapat menatap wajah Anda?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Dekatkan wajah Anda sekitar 30 cm'
          },
          {
            questionNumber: 3,
            questionText: 'Apakah bayi dapat mengikuti benda bergerak dengan matanya?',
            developmentArea: 'Motorik Halus',
            instruction: 'Gerakkan benda dari kiri ke kanan'
          },
          {
            questionNumber: 4,
            questionText: 'Apakah bayi dapat mengangkat kepala saat ditengkurapkan?',
            developmentArea: 'Motorik Kasar',
            instruction: 'Letakkan bayi tengkurap di alas yang datar'
          },
          {
            questionNumber: 5,
            questionText: 'Apakah bayi mengeluarkan suara seperti "ooo" atau "aaa"?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Dengarkan suara ocehan bayi'
          },
          {
            questionNumber: 6,
            questionText: 'Apakah bayi tersenyum ketika diajak berinteraksi?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Ajak bayi berbicara atau tersenyum'
          },
          {
            questionNumber: 7,
            questionText: 'Apakah bayi dapat menggenggam jari atau benda yang disentuhkan?',
            developmentArea: 'Motorik Halus',
            instruction: 'Sentuhkan jari atau mainan kecil ke telapak tangan bayi'
          },
          {
            questionNumber: 8,
            questionText: 'Apakah bayi dapat menggerakkan kedua tangan dan kaki secara aktif?',
            developmentArea: 'Motorik Kasar',
            instruction: 'Amati gerakan spontan bayi'
          },
          {
            questionNumber: 9,
            questionText: 'Apakah bayi menunjukkan respon saat dipanggil?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Panggil nama bayi dari arah yang berbeda'
          },
          {
            questionNumber: 10,
            questionText: 'Apakah bayi mulai mencoba meraih benda di depannya?',
            developmentArea: 'Motorik Halus',
            instruction: 'Letakkan benda warna-warni di depannya'
          }
        ]
      }
    }
  });

  // KPSP 6-12 Bulan
  const category6_12 = await prisma.kPSPAgeCategory.create({
    data: {
      code: 'KPSP_6_12',
      name: 'KPSP 6-12 Bulan',
      minAgeMonths: 6,
      maxAgeMonths: 11,
      description: 'Kuesioner Pra Skrining Perkembangan untuk anak usia 6-12 bulan',
      isActive: true,
      questions: {
        create: [
          {
            questionNumber: 1,
            questionText: 'Pada waktu bayi telentang, apakah masih ada lengan dan tungkai bergerak dengan mudah?',
            developmentArea: 'Motorik Kasar',
            instruction: 'Perhatikan gerakan spontan bayi'
          },
          {
            questionNumber: 2,
            questionText: 'Apakah bayi sudah bisa memegang benda kecil dengan ibu jari dan jari telunjuk?',
            developmentArea: 'Motorik Halus',
            instruction: 'Gunakan benda kecil seperti kismis'
          },
          {
            questionNumber: 3,
            questionText: 'Apakah bayi sudah bisa menoleh ke arah suara?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Panggil nama bayi dari samping'
          },
          {
            questionNumber: 4,
            questionText: 'Apakah bayi sudah bisa duduk tanpa disangga?',
            developmentArea: 'Motorik Kasar',
            instruction: 'Duduk sendiri minimal 30 detik'
          },
          {
            questionNumber: 5,
            questionText: 'Apakah bayi sudah bisa berdiri dengan bantuan?',
            developmentArea: 'Motorik Kasar',
            instruction: 'Pegang kedua tangan bayi'
          },
          {
            questionNumber: 6,
            questionText: 'Apakah bayi sudah bisa mengucapkan suku kata seperti "ba-ba" atau "ma-ma"?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Dengarkan ocehan bayi'
          },
          {
            questionNumber: 7,
            questionText: 'Apakah bayi sudah bisa melambaikan tangan sebagai isyarat selamat tinggal?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Ajari dengan memberikan contoh'
          },
          {
            questionNumber: 8,
            questionText: 'Apakah bayi sudah bisa mencari benda yang jatuh?',
            developmentArea: 'Motorik Halus',
            instruction: 'Jatuhkan mainan di depan bayi'
          },
          {
            questionNumber: 9,
            questionText: 'Apakah bayi sudah bisa menunjuk benda dengan jari telunjuk?',
            developmentArea: 'Motorik Halus',
            instruction: 'Lihat apakah bayi menunjuk sesuatu'
          },
          {
            questionNumber: 10,
            questionText: 'Apakah bayi sudah bisa bermain tepuk tangan?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Ajak bayi bertepuk tangan'
          }
        ]
      }
    }
  });

  // KPSP 12-18 Bulan
  const category12_18 = await prisma.kPSPAgeCategory.create({
    data: {
      code: 'KPSP_12_18',
      name: 'KPSP 12-18 Bulan',
      minAgeMonths: 12,
      maxAgeMonths: 17,
      description: 'Kuesioner Pra Skrining Perkembangan untuk anak usia 12-18 bulan',
      isActive: true,
      questions: {
        create: [
          {
            questionNumber: 1,
            questionText: 'Apakah bayi sudah bisa berdiri sendiri tanpa bantuan?',
            developmentArea: 'Motorik Kasar',
            instruction: 'Minimal berdiri 2 detik'
          },
          {
            questionNumber: 2,
            questionText: 'Apakah bayi sudah bisa berjalan beberapa langkah?',
            developmentArea: 'Motorik Kasar',
            instruction: 'Minimal 5 langkah tanpa pegangan'
          },
          {
            questionNumber: 3,
            questionText: 'Apakah bayi sudah bisa menyebutkan 3 kata yang bermakna?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Selain papa dan mama'
          },
          {
            questionNumber: 4,
            questionText: 'Apakah bayi sudah bisa memahami 10 perintah sederhana?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Seperti "ambil bola", "berikan pada mama"'
          },
          {
            questionNumber: 5,
            questionText: 'Apakah bayi sudah bisa menyusun 2 balok?',
            developmentArea: 'Motorik Halus',
            instruction: 'Tumpuk balok tanpa jatuh'
          },
          {
            questionNumber: 6,
            questionText: 'Apakah bayi sudah bisa meminum dari cangkir sendiri?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Pegang dan minum tanpa tumpah'
          },
          {
            questionNumber: 7,
            questionText: 'Apakah bayi sudah bisa menunjuk gambar di buku?',
            developmentArea: 'Motorik Halus',
            instruction: 'Tunjuk dengan jari telunjuk'
          },
          {
            questionNumber: 8,
            questionText: 'Apakah bayi sudah bisa menggambar goresan?',
            developmentArea: 'Motorik Halus',
            instruction: 'Beri crayon dan kertas'
          },
          {
            questionNumber: 9,
            questionText: 'Apakah bayi sudah bisa bermain dengan mainan bergerak?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Seperti mendorong mobil-mobilan'
          },
          {
            questionNumber: 10,
            questionText: 'Apakah bayi sudah bisa menunjuk beberapa bagian tubuhnya?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Minimal 3 bagian tubuh'
          }
        ]
      }
    }
  });

  // KPSP 18-24 Bulan
  const category18_24 = await prisma.kPSPAgeCategory.create({
    data: {
      code: 'KPSP_18_24',
      name: 'KPSP 18-24 Bulan',
      minAgeMonths: 18,
      maxAgeMonths: 24,
      description: 'Kuesioner Pra Skrining Perkembangan untuk anak usia 18-24 bulan',
      isActive: true,
      questions: {
        create: [
          {
            questionNumber: 1,
            questionText: 'Apakah anak sudah bisa berjalan menaiki tangga?',
            developmentArea: 'Motorik Kasar',
            instruction: 'Dengan atau tanpa pegangan'
          },
          {
            questionNumber: 2,
            questionText: 'Apakah anak sudah bisa mengatakan minimal 50 kata?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Hitung semua kata yang diucapkan'
          },
          {
            questionNumber: 3,
            questionText: 'Apakah anak sudah bisa membuat kalimat 2 kata?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Seperti "mau makan", "mama pergi"'
          },
          {
            questionNumber: 4,
            questionText: 'Apakah anak sudah bisa bermain dengan mainan sambil membayangkan permainan?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Seperti pura-pura makan, pura-pura telepon'
          },
          {
            questionNumber: 5,
            questionText: 'Apakah anak sudah bisa menyusun 6 balok?',
            developmentArea: 'Motorik Halus',
            instruction: 'Menara balok minimal 6 tingkat'
          },
          {
            questionNumber: 6,
            questionText: 'Apakah anak sudah bisa makan sendiri dengan sendok?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Makan tanpa banyak tumpah'
          },
          {
            questionNumber: 7,
            questionText: 'Apakah anak sudah bisa melepas pakaiannya sendiri?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Minimal celana atau kaos'
          },
          {
            questionNumber: 8,
            questionText: 'Apakah anak sudah bisa menunjuk gambar benda ketika disebutkan?',
            developmentArea: 'Bicara dan Bahasa',
            instruction: 'Minimal 5 gambar berbeda'
          },
          {
            questionNumber: 9,
            questionText: 'Apakah anak sudah bisa berinteraksi dengan anak lain?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Bermain bersama atau berdampingan'
          },
          {
            questionNumber: 10,
            questionText: 'Apakah anak sudah bisa menunjukkan perhatian pada gambar/cerita?',
            developmentArea: 'Sosialisasi dan Kemandirian',
            instruction: 'Duduk mendengarkan cerita'
          }
        ]
      }
    }
  });

  console.log('KPSP data seeded successfully!');
  console.log(`Created ${[category0_6, category6_12, category12_18, category18_24].length} categories`);
}

seedKPSP()
  .catch((e) => {
    console.error('Error seeding KPSP data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
