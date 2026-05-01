const prisma = require('../utils/prisma');

exports.getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const certs = await prisma.certificate.findMany({
      where: { studentId },
      include: { course: true }
    });
    
    // Use persisted finalScore if available, otherwise calculate it dynamically
    const enrichedCerts = await Promise.all(certs.map(async cert => {
        if (cert.finalScore !== null) {
          return { ...cert, averageGrade: Math.round(cert.finalScore) };
        }

        // Fallback for older certificates without finalScore
        const submissions = await prisma.submission.findMany({
            where: {
                studentId,
                assignment: { 
                  lesson: { 
                    section: { 
                      courseId: cert.courseId 
                    } 
                  } 
                },
                status: 'GRADED'
            },
            select: { grade: true }
        });
        const sum = submissions.reduce((acc, s) => acc + (s.grade || 0), 0);
        const avg = submissions.length > 0 ? Math.round(sum / submissions.length) : 0;
        return { ...cert, averageGrade: avg };
    }));

    res.json(enrichedCerts);
  } catch (err) {
    console.error('Error fetching certificates:', err);
    res.status(500).json({ message: 'Error fetching certificates' });
  }
};
