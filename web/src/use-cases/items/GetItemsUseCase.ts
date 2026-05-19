import { IItemRepository } from '@/domain/repositories/IItemRepository';

export class GetItemsUseCase {
  constructor(private itemRepository: IItemRepository) {}

  async execute(page: number = 1, limit: number = 8, filters?: { search?: string; category?: string }) {
    return await this.itemRepository.findAll(page, limit, filters);
  }
}
