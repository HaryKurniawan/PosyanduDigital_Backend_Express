// backend/prisma/seed.js
const seedImmunization = require('../scripts/seedImmunization');

(async () => {
  try {
    console.log('🚀 Running Prisma seed...');
    await seedImmunization();
    console.log('🎉 Seed completed.');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
})();
