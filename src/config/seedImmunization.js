// File: scripts/seedImmunization.js
// Run: node scripts/seedImmunization.js

const prisma = require('../config/prisma');

const immunizationData = [
  {
    ageRange: '0-1 Bulan',
    ageInMonths: 0,
    vaccines: [
      {
        name: 'HB-0 (Hepatitis B)',
        dose: '0',
        description: 'Vaksin awal untuk Hepatitis B',
        recommendedAge: '0 hari'
      }
    ]
  },
  {
    ageRange: '1-2 Bulan',
    ageInMonths: 1,
    vaccines: [
      {
        name: 'Polio 1',
        dose: '1',
        description: 'Vaksin polio dosis pertama',
        recommendedAge: '4 minggu'
      },
      {
        name: 'DPT-HB-Hib 1',
        dose: '1',
        description: 'Kombinasi vaksin Difteri, Pertusis, Tetanus, Hepatitis B, Hib',
        recommendedAge: '4 minggu'
      }
    ]
  },
  {
    ageRange: '2-3 Bulan',
    ageInMonths: 2,
    vaccines: [
      {
        name: 'Polio 2',
        dose: '2',
        description: 'Vaksin polio dosis kedua',
        recommendedAge: '8 minggu'
      },
      {
        name: 'DPT-HB-Hib 2',
        dose: '2',
        description: 'Kombinasi vaksin dosis kedua',
        recommendedAge: '8 minggu'
      }
    ]
  },
  {
    ageRange: '3-4 Bulan',
    ageInMonths: 3,
    vaccines: [
      {
        name: 'Polio 3',
        dose: '3',
        description: 'Vaksin polio dosis ketiga',
        recommendedAge: '12 minggu'
      },
      {
        name: 'DPT-HB-Hib 3',
        dose: '3',
        description: 'Kombinasi vaksin dosis ketiga',
        recommendedAge: '12 minggu'
      }
    ]
  },
  {
    ageRange: '6 Bulan',
    ageInMonths: 6,
    vaccines: [
      {
        name: 'Polio 4 (Booster)',
        dose: '4',
        description: 'Booster polio di usia 6 bulan',
        recommendedAge: '6 bulan'
      },
      {
        name: 'HB Booster',
        dose: 'Booster',
        description: 'Booster Hepatitis B',
        recommendedAge: '6 bulan'
      }
    ]
  },
  {
    ageRange: '12 Bulan',
    ageInMonths: 12,
    vaccines: [
      {
        name: 'Campak/MR 1',
        dose: '1',
        description: 'Vaksin Campak atau Measles-Rubella dosis pertama',
        recommendedAge: '12 bulan'
      },
      {
        name: 'DPT Booster 1',
        dose: 'Booster 1',
        description: 'Booster pertama DPT',
        recommendedAge: '12 bulan'
      }
    ]
  },
  {
    ageRange: '18 Bulan',
    ageInMonths: 18,
    vaccines: [
      {
        name: 'Polio Booster',
        dose: 'Booster',
        description: 'Booster polio di usia 18 bulan',
        recommendedAge: '18 bulan'
      },
      {
        name: 'DPT Booster 2',
        dose: 'Booster 2',
        description: 'Booster kedua DPT',
        recommendedAge: '18 bulan'
      }
    ]
  },
  {
    ageRange: '24 Bulan',
    ageInMonths: 24,
    vaccines: [
      {
        name: 'Tifoid (Typhim Vi)',
        dose: '1',
        description: 'Vaksin Tifoid (opsional, tergantung kebijakan)',
        recommendedAge: '24 bulan'
      }
    ]
  }
];

async function seedImmunization() {
  try {
    console.log('🌱 Starting immunization templates seeding...');

    // Delete existing data
    await prisma.immunizationVaccine.deleteMany({});
    await prisma.immunizationTemplate.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create templates with vaccines
    for (const template of immunizationData) {
      const created = await prisma.immunizationTemplate.create({
        data: {
          ageRange: template.ageRange,
          ageInMonths: template.ageInMonths,
          vaccines: {
            createMany: {
              data: template.vaccines
            }
          }
        },
        include: {
          vaccines: true
        }
      });

      console.log(`✅ Created: ${created.ageRange} with ${created.vaccines.length} vaccines`);
    }

    console.log('✨ Seeding completed successfully!');
    console.log(`📊 Total templates created: ${immunizationData.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding immunization data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedImmunization();