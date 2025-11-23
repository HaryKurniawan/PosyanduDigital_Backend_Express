// File: scripts/seedImmunization.js

const prisma = require('../src/config/prisma');


const immunizationData = [
  {
    ageRange: '0-1 Bulan',
    ageInMonths: 0,
    vaccines: [
      { name: 'HB-0 (Hepatitis B)', dose: '0', description: 'Vaksin awal untuk Hepatitis B', recommendedAge: '0 hari' }
    ]
  },
  {
    ageRange: '1-2 Bulan',
    ageInMonths: 1,
    vaccines: [
      { name: 'Polio 1', dose: '1', description: 'Vaksin polio dosis pertama', recommendedAge: '4 minggu' },
      { name: 'DPT-HB-Hib 1', dose: '1', description: 'Kombinasi vaksin pertama', recommendedAge: '4 minggu' }
    ]
  },
  {
    ageRange: '2-3 Bulan',
    ageInMonths: 2,
    vaccines: [
      { name: 'Polio 2', dose: '2', description: 'Vaksin polio dosis kedua', recommendedAge: '8 minggu' },
      { name: 'DPT-HB-Hib 2', dose: '2', description: 'Kombinasi vaksin kedua', recommendedAge: '8 minggu' }
    ]
  },
  {
    ageRange: '3-4 Bulan',
    ageInMonths: 3,
    vaccines: [
      { name: 'Polio 3', dose: '3', description: 'Vaksin polio dosis ketiga', recommendedAge: '12 minggu' },
      { name: 'DPT-HB-Hib 3', dose: '3', description: 'Kombinasi vaksin ketiga', recommendedAge: '12 minggu' }
    ]
  },
  {
    ageRange: '6 Bulan',
    ageInMonths: 6,
    vaccines: [
      { name: 'Polio 4 (Booster)', dose: '4', description: 'Booster polio', recommendedAge: '6 bulan' },
      { name: 'HB Booster', dose: 'Booster', description: 'Booster Hepatitis B', recommendedAge: '6 bulan' }
    ]
  },
  {
    ageRange: '12 Bulan',
    ageInMonths: 12,
    vaccines: [
      { name: 'Campak/MR 1', dose: '1', description: 'Campak/MR dosis 1', recommendedAge: '12 bulan' },
      { name: 'DPT Booster 1', dose: 'Booster 1', description: 'Booster DPT pertama', recommendedAge: '12 bulan' }
    ]
  },
  {
    ageRange: '18 Bulan',
    ageInMonths: 18,
    vaccines: [
      { name: 'Polio Booster', dose: 'Booster', description: 'Booster polio kedua', recommendedAge: '18 bulan' },
      { name: 'DPT Booster 2', dose: 'Booster 2', description: 'Booster DPT kedua', recommendedAge: '18 bulan' }
    ]
  },
  {
    ageRange: '24 Bulan',
    ageInMonths: 24,
    vaccines: [
      { name: 'Tifoid (Typhim Vi)', dose: '1', description: 'Vaksin Tifoid', recommendedAge: '24 bulan' }
    ]
  }
];

async function seedImmunization() {
  try {
    console.log('\n🌱 Starting immunization seeding...\n');

    // HAPUS FK CHILD DULU
    await prisma.childImmunization.deleteMany();
    console.log('🧹 Deleted ChildImmunization');

    await prisma.immunizationVaccine.deleteMany();
    console.log('🧹 Deleted ImmunizationVaccine');

    await prisma.immunizationTemplate.deleteMany();
    console.log('🧹 Deleted ImmunizationTemplate');

    console.log('➡ Creating templates...');

    for (const template of immunizationData) {
      const created = await prisma.immunizationTemplate.create({
        data: {
          ageRange: template.ageRange,
          ageInMonths: template.ageInMonths,
          vaccines: {
            create: template.vaccines
          }
        },
        include: { vaccines: true }
      });

      console.log(`✔ ${created.ageRange} → ${created.vaccines.length} vaccines`);
    }

    console.log('\n✨ Seeding immunization DONE!\n');

  } catch (err) {
    console.error('❌ Seeding ERROR:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedImmunization();
}

module.exports = seedImmunization;
