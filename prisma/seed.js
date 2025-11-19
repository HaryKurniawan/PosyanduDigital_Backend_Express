const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Posyandu',
      email: 'admin@posyandu.com',
      password: adminPassword,
      role: 'ADMIN',
      hasCompletedProfile: true
    }
  });
  console.log('✅ Admin:', admin.email);

  // User dengan anak
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Ibu Siti',
      email: 'user@test.com',
      password: userPassword,
      role: 'USER',
      hasCompletedProfile: true,
      motherData: {
        create: {
          fullName: 'Siti Nurhaliza',
          phoneNumber: '081234567890',
          nik: '3273011234567890',
          birthPlace: 'Bandung',
          birthDate: new Date('1990-01-15'),
          education: 'S1',
          occupation: 'Ibu Rumah Tangga',
          bloodType: 'A',
          jkn: 'BPJS Kesehatan',
          facilityTK1: 'Puskesmas Sukajadi'
        }
      },
      spouseData: {
        create: {
          fullName: 'Budi Santoso',
          nik: '3273019876543210',
          occupation: 'Pegawai Swasta',
          phoneNumber: '081298765432'
        }
      },
      childrenData: {
        create: {
          fullName: 'Ahmad Fauzi',
          nik: '3273010101200001',
          birthCertificate: '3273-LT-01012020-0001',
          childOrder: 1,
          bloodType: 'A',
          birthPlace: 'Bandung',
          birthDate: new Date('2020-01-01')
        }
      }
    }
  });
  console.log('✅ User:', user.email);

  // Jadwal
  const schedule = await prisma.posyanduSchedule.create({
    data: {
      scheduleDate: new Date('2024-11-25'),
      location: 'Posyandu Mawar',
      description: 'Mulai pukul 08.00 WIB'
    }
  });
  console.log('✅ Jadwal:', schedule.location);

  console.log('\n🎉 Seeding completed!');
  console.log('Admin: admin@posyandu.com / admin123');
  console.log('User: user@test.com / user123');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });