const prisma = require('../../config/prisma');

// Get child immunization progress/roadmap
const getChildImmunizationRoadmap = async (req, res) => {
  try {
    const { childId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const child = await prisma.childData.findUnique({
      where: { id: childId },
      include: {
        user: { select: { id: true } }
      }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    if (child.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get all templates
    const templates = await prisma.immunizationTemplate.findMany({
      include: {
        vaccines: true
      },
      orderBy: {
        ageInMonths: 'asc'
      }
    });

    // Get child's immunizations
    const childImmunizations = await prisma.childImmunization.findMany({
      where: { childId },
      include: { vaccine: true }
    });

    // Build roadmap with status
    const roadmap = templates.map(template => ({
      ageRange: template.ageRange,
      ageInMonths: template.ageInMonths,
      vaccines: template.vaccines.map(vaccine => {
        const completed = childImmunizations.find(
          imm => imm.vaccineId === vaccine.id && imm.status === 'COMPLETED'
        );

        return {
          id: vaccine.id,
          name: vaccine.name,
          dose: vaccine.dose,
          description: vaccine.description,
          recommendedAge: vaccine.recommendedAge,
          status: completed ? 'completed' : 'pending',
          vaccinationDate: completed?.vaccinationDate || null,
          notes: completed?.notes || null
        };
      })
    }));

    // Calculate progress
    const totalVaccines = roadmap.reduce((sum, template) => sum + template.vaccines.length, 0);
    const completedVaccines = roadmap.reduce(
      (sum, template) => sum + template.vaccines.filter(v => v.status === 'completed').length,
      0
    );

    res.json({
      child: {
        id: child.id,
        fullName: child.fullName,
        nik: child.nik,
        birthDate: child.birthDate
      },
      roadmap,
      progress: {
        total: totalVaccines,
        completed: completedVaccines,
        percentage: totalVaccines > 0 ? Math.round((completedVaccines / totalVaccines) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getChildImmunizationRoadmap;
