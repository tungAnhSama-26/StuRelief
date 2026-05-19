import { IVerificationRepository, VerificationDTO } from '@/domain/repositories/IVerificationRepository';
import { VerificationSpecification } from '@/domain/repositories/VerificationSpecification';
import prisma from '@/lib/prisma';
import { VerificationStatus } from '@prisma/client';

export class PrismaVerificationRepository implements IVerificationRepository {
  async findAll(specification?: VerificationSpecification): Promise<VerificationDTO[]> {
    const where = specification ? specification.toPrismaWhere() : {};
    
    const requests = await prisma.verificationRequest.findMany({
      where,
      include: {
        user: {
          include: {
            profile: {
              include: {
                university: true,
                campus: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests.map(req => ({
      id: req.id,
      fullName: req.user.profile?.fullName || 'Unknown',
      email: req.user.email,
      mssv: req.user.profile?.studentCode || 'N/A',
      campus: req.user.profile?.university.name || 'Unknown',
      cardImage: req.studentCardFront,
      status: req.status,
      date: req.createdAt.toISOString()
    }));
  }

  async findById(id: string): Promise<VerificationDTO | null> {
    const req = await prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: {
              include: {
                university: true,
                campus: true,
              }
            }
          }
        }
      }
    });

    if (!req) return null;

    return {
      id: req.id,
      fullName: req.user.profile?.fullName || 'Unknown',
      email: req.user.email,
      mssv: req.user.profile?.studentCode || 'N/A',
      campus: req.user.profile?.university.name || 'Unknown',
      cardImage: req.studentCardFront,
      status: req.status,
      date: req.createdAt.toISOString()
    };
  }

  async updateStatus(id: string, status: string, moderatorId: string, note?: string): Promise<void> {
    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: status as VerificationStatus,
        moderatorId,
        moderatorNote: note,
        reviewedAt: new Date(),
      }
    });

    if (status === 'APPROVED') {
      const req = await prisma.verificationRequest.findUnique({ where: { id } });
      if (req) {
        await prisma.user.update({
          where: { id: req.userId },
          data: { status: 'VERIFIED' }
        });
      }
    }
  }

  async save(data: { userId: string; studentCardFront: string; studentCardBack: string; emailOtp?: string }): Promise<void> {
    await prisma.verificationRequest.create({
      data: {
        userId: data.userId,
        studentCardFront: data.studentCardFront,
        studentCardBack: data.studentCardBack,
        emailOtp: data.emailOtp,
        status: 'PENDING',
      }
    });

    await prisma.user.update({
      where: { id: data.userId },
      data: { status: 'UNVERIFIED' } // Ensure it's not BANNED or something else
    });
  }
}
