import { IVerificationRepository } from '@/domain/repositories/IVerificationRepository';

export interface SubmitVerificationDTO {
  userId: string;
  studentCardFront: string;
  studentCardBack: string;
  emailOtp?: string;
}

export class SubmitVerificationUseCase {
  constructor(private verificationRepository: IVerificationRepository) {}

  async execute(data: SubmitVerificationDTO) {
    if (!data.userId || !data.studentCardFront || !data.studentCardBack) {
      throw new Error('Thiếu thông tin xác thực cần thiết (User ID, ảnh thẻ mặt trước/sau)!');
    }
    
    // Check if there is already a pending request for this user
    // (Optional optimization: implementation depend on IVerificationRepository capabilities)
    
    return await this.verificationRepository.save(data);
  }
}
