import { Suspense } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { PrismaItemRepository } from '@/infrastructure/persistence/PrismaItemRepository';
import { GetItemsUseCase } from '@/use-cases/items/GetItemsUseCase';
import ProductDashboardWrapper from '@/components/products/ProductDashboardWrapper';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { env } from '@/infrastructure/config/env';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight, ShieldCheck, Zap, TrendingUp, MessageSquare } from 'lucide-react';

interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
}

const itemRepository = new PrismaItemRepository();
const getItemsUseCase = new GetItemsUseCase(itemRepository);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 8;
  const search = params.search || undefined;
  const category = params.category || undefined;

  // Get current user from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const currentUser = token ? verifyToken(token, env.JWT_SECRET) : null;
  const currentUserId = currentUser?.id || 'guest';

  const { items, total } = await getItemsUseCase.execute(page, limit, { search, category });
  const totalPages = Math.ceil(total / limit);

  // Fetch categories dynamically from database
  const dbCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  const categoriesList = dbCategories.map(c => c.name);

  // Fetch statistics dynamically from database
  const totalActivePosts = await prisma.product.count({
    where: { status: 'AVAILABLE' },
  });

  const myProductsCount = currentUser ? await prisma.product.count({
    where: {
      status: 'AVAILABLE',
      sellerId: currentUserId,
    },
  }) : 0;

  // Generate page numbers list for premium pagination
  const getPageNumbers = (current: number, total: number) => {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers(page, totalPages);

  const buildPageUrl = (targetPage: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set('page', String(targetPage));
    if (limit !== 8) queryParams.set('limit', String(limit));
    if (search) queryParams.set('search', search);
    if (category && category !== 'Tất cả danh mục') queryParams.set('category', category);
    return `/?${queryParams.toString()}`;
  };

  return (
    <DashboardLayout activeItemId="catalog" pageTitle="Chợ Đồ Cũ Sinh Viên">
      {/* Hero Section - Bento Grid Style */}
      <section className="pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 auto-rows-[190px]">
          {/* Main Large Card */}
          <div className="md:col-span-2 md:row-span-2 rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 flex flex-col justify-between text-white overflow-hidden relative group shadow-lg shadow-blue-500/10 border border-blue-500/20">
            {/* Background glowing sphere */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            <div className="absolute top-0 right-0 p-8 opacity-15 group-hover:rotate-12 group-hover:scale-105 transition-all duration-500 pointer-events-none">
              <Sparkles className="w-48 h-48" />
            </div>
            
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-3.5xl font-black mb-3 tracking-tight leading-tight">Chợ đồ cũ<br />sinh viên</h1>
              <p className="text-blue-100 max-w-sm text-[14px] leading-relaxed font-medium">Nơi kết nối và thanh lý đồ dùng học tập giá tốt nhất cho cộng đồng sinh viên.</p>
              
              <Link 
                href="/?category=Tất cả danh mục" 
                className="mt-5 flex items-center gap-2 bg-white text-blue-700 px-4.5 py-2.5 rounded-xl w-fit text-xs font-bold shadow-md hover:shadow-lg hover:bg-zinc-50 active:scale-98 transition-all cursor-pointer group/btn"
              >
                <span>Khám phá ngay</span>
                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>

          {/* Medium Tech Card */}
          <div className="md:col-span-2 rounded-[28px] bg-zinc-950 border border-zinc-800 dark:border-zinc-800/80 p-6 flex flex-col justify-between group overflow-hidden relative shadow-sm">
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/15 transition-all duration-500" />

            <div className="relative z-10">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mb-1.5 tracking-tight">Nền tảng chia sẻ đồ dùng</h2>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-md">Trao đổi giáo trình, quần áo, xe cộ, đồ công nghệ tin cậy trong nội bộ các trường đại học.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 relative z-10">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] px-3.5 py-1.5 rounded-full font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Student Verified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] px-3.5 py-1.5 rounded-full font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>An Toàn & Tiện Lợi</span>
              </div>
            </div>
          </div>

          {/* Stat Card 1 - Active Posts */}
          <div className="rounded-[28px] bg-gradient-to-br from-pink-500/8 to-rose-500/3 border border-pink-500/15 dark:border-pink-500/10 dark:bg-pink-950/10 p-6 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:border-pink-500/30 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-pink-500/15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            
            <div className="w-8.5 h-8.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>

            <div>
              <span className="text-3.5xl font-semibold text-pink-600 dark:text-pink-400 tracking-tight leading-none block">{totalActivePosts}+</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-pink-500/80 dark:text-pink-400/80 mt-1 block">HÔM NAY</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block mt-0.5">Tin đăng hoạt động</span>
            </div>
          </div>

          {/* Stat Card 2 - Support */}
          <div className="rounded-[28px] bg-gradient-to-br from-indigo-500/8 to-violet-500/3 border border-indigo-500/15 dark:border-indigo-500/10 dark:bg-indigo-950/10 p-6 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:border-indigo-500/30 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            
            <div className="flex justify-between items-center">
              <div className="w-8.5 h-8.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>

            <div>
              <span className="text-3.5xl font-semibold text-indigo-600 dark:text-indigo-400 tracking-tight leading-none block">24/7</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500/80 dark:text-indigo-400/80 mt-1 block">HỖ TRỢ</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block mt-0.5">Tương tác trực tiếp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Product Dashboard */}
      <main className="pb-20">
        <Suspense fallback={<GridSkeleton />}>
          <ProductDashboardWrapper
            initialItems={items}
            total={total}
            myTotal={myProductsCount}
            page={page}
            limit={limit}
            search={search}
            category={category}
            categories={categoriesList}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-1 md:gap-2">
              {/* Prev Button */}
              <Link
                href={buildPageUrl(Math.max(1, page - 1))}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-900 transition-all text-zinc-500 dark:text-zinc-400 ${page === 1 ? 'pointer-events-none opacity-40' : ''}`}
                aria-label="Trang trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              {/* Page Numbers */}
              {pageNumbers.map((p, idx) => {
                if (p === '...') {
                  return (
                    <span
                      key={`ell-${idx}`}
                      className="w-10 h-10 flex items-center justify-center text-zinc-400 font-bold"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = p as number;
                const isActive = pageNum === page;

                return (
                  <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105'
                        : 'border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {/* Next Button */}
              <Link
                href={buildPageUrl(Math.min(totalPages, page + 1))}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-900 transition-all text-zinc-500 dark:text-zinc-400 ${page === totalPages ? 'pointer-events-none opacity-40' : ''}`}
                aria-label="Trang sau"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </Suspense>
      </main>
    </DashboardLayout>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-80 rounded-2xl"></div>
      ))}
    </div>
  );
}
