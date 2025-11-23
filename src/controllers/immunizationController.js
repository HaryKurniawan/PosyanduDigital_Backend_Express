const prisma = require('../config/prisma');

// ============ IMMUNIZATION SCHEDULE MANAGEMENT ============

// Create immunization schedule template (admin only)
const createImmunizationTemplate = async (req, res) => {
  try {
    const {
      ageRange,
      ageInMonths,
      vaccineList
    } = req.body;

    const template = await prisma.immunizationTemplate.create({
      data: {
        ageRange,
        ageInMonths,
        vaccines: {
          createMany: {
            data: vaccineList.map(vaccine => ({
              name: vaccine.nama,
              dose: vaccine.dosis,
              description: vaccine.keterangan,
              recommendedAge: vaccine.umur
            }))
          }
        }
      },
      include: {
        vaccines: true
      }
    });

    res.json({ 
      message: 'Immunization template created successfully', 
      data: template 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all immunization templates
const getAllImmunizationTemplates = async (req, res) => {
  try {
    const templates = await prisma.immunizationTemplate.findMany({
      include: {
        vaccines: {
          orderBy: {
            dose: 'asc'
          }
        }
      },
      orderBy: {
        ageInMonths: 'asc'
      }
    });

    res.json(templates);
  } catch (error) {
    console.error('❌ Error fetching immunization templates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update immunization template (NEW)
const updateImmunizationTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { ageRange, ageInMonths, vaccineList } = req.body;

    // Verify template exists
    const template = await prisma.immunizationTemplate.findUnique({
      where: { id },
      include: { vaccines: true }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template tidak ditemukan' });
    }

    // Delete existing vaccines
    await prisma.immunizationVaccine.deleteMany({
      where: { templateId: id }
    });

    // Update template and create new vaccines
    const updated = await prisma.immunizationTemplate.update({
      where: { id },
      data: {
        ageRange,
        ageInMonths,
        vaccines: {
          createMany: {
            data: vaccineList.map(vaccine => ({
              name: vaccine.nama,
              dose: vaccine.dosis,
              description: vaccine.keterangan,
              recommendedAge: vaccine.umur
            }))
          }
        }
      },
      include: {
        vaccines: true
      }
    });

    res.json({
      message: 'Template imunisasi berhasil diubah',
      data: updated
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete immunization template (NEW)
const deleteImmunizationTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify template exists
    const template = await prisma.immunizationTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template tidak ditemukan' });
    }

    // Delete associated vaccines first
    await prisma.immunizationVaccine.deleteMany({
      where: { templateId: id }
    });

    // Delete template
    await prisma.immunizationTemplate.delete({
      where: { id }
    });

    res.json({ message: 'Template imunisasi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get child immunization records
const getChildImmunizations = async (req, res) => {
  try {
    const { childId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const child = await prisma.childData.findUnique({
      where: { id: childId },
      include: {
        user: {
          select: { id: true }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Allow if user is the parent or admin
    if (child.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const immunizations = await prisma.childImmunization.findMany({
      where: { childId },
      include: {
        vaccine: true,
        schedule: {
          select: {
            id: true,
            scheduleDate: true,
            location: true
          }
        }
      },
      orderBy: {
        vaccinationDate: 'desc'
      }
    });

    res.json(immunizations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add/Record immunization for child
const recordChildImmunization = async (req, res) => {
  try {
    const {
      childId,
      vaccineId,
      vaccinationDate,
      scheduleId,
      notes,
      administeredBy
    } = req.body;

    // Verify child exists
    const child = await prisma.childData.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Verify vaccine exists
    const vaccine = await prisma.immunizationVaccine.findUnique({
      where: { id: vaccineId }
    });

    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }

    // Check if immunization already exists
    const existing = await prisma.childImmunization.findFirst({
      where: {
        childId,
        vaccineId,
        vaccinationDate: new Date(vaccinationDate)
      }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'This immunization record already exists for this date' 
      });
    }

    const immunization = await prisma.childImmunization.create({
      data: {
        childId,
        vaccineId,
        vaccinationDate: new Date(vaccinationDate),
        scheduleId: scheduleId || null,
        status: 'COMPLETED',
        notes,
        administeredBy
      },
      include: {
        vaccine: true,
        child: {
          select: {
            fullName: true,
            nik: true,
            birthDate: true
          }
        }
      }
    });

    res.json({ 
      message: 'Immunization recorded successfully', 
      data: immunization 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update immunization record
const updateChildImmunization = async (req, res) => {
  try {
    const { immunizationId } = req.params;
    const {
      vaccinationDate,
      notes,
      administeredBy,
      status
    } = req.body;

    const immunization = await prisma.childImmunization.findUnique({
      where: { id: immunizationId },
      include: {
        child: true
      }
    });

    if (!immunization) {
      return res.status(404).json({ message: 'Immunization record not found' });
    }

    const updated = await prisma.childImmunization.update({
      where: { id: immunizationId },
      data: {
        vaccinationDate: vaccinationDate ? new Date(vaccinationDate) : undefined,
        notes: notes !== undefined ? notes : undefined,
        administeredBy: administeredBy !== undefined ? administeredBy : undefined,
        status: status || undefined
      },
      include: {
        vaccine: true,
        child: {
          select: {
            fullName: true,
            nik: true
          }
        }
      }
    });

    res.json({ 
      message: 'Immunization updated successfully', 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete immunization record
const deleteChildImmunization = async (req, res) => {
  try {
    const { immunizationId } = req.params;

    const immunization = await prisma.childImmunization.findUnique({
      where: { id: immunizationId }
    });

    if (!immunization) {
      return res.status(404).json({ message: 'Immunization record not found' });
    }

    await prisma.childImmunization.delete({
      where: { id: immunizationId }
    });

    res.json({ message: 'Immunization record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

// Get all children immunization status (admin)
const getAllChildrenImmunizationStatus = async (req, res) => {
  try {
    const children = await prisma.childData.findMany({
      include: {
        immunizations: {
          where: { status: 'COMPLETED' },
          include: { vaccine: true }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    const childrenStatus = children.map(child => {
      const completedCount = child.immunizations.length;
      
      return {
        id: child.id,
        fullName: child.fullName,
        nik: child.nik,
        birthDate: child.birthDate,
        parentName: child.user.name,
        completedImmunizations: completedCount,
        lastVaccination: child.immunizations.length > 0 
          ? new Date(Math.max(...child.immunizations.map(i => new Date(i.vaccinationDate))))
          : null
      };
    });

    res.json(childrenStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createImmunizationTemplate,
  getAllImmunizationTemplates,
  updateImmunizationTemplate,
  deleteImmunizationTemplate,
  getChildImmunizations,
  recordChildImmunization,
  updateChildImmunization,
  deleteChildImmunization,
  getChildImmunizationRoadmap,
  getAllChildrenImmunizationStatus
};