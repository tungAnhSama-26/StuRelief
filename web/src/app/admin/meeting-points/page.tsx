'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  Map,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { APP_ROUTES, UserRole } from '@shared';

type MeetingPoint = {
  id: string;
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  isSafeZone: boolean;
  campusId: string;
  campusName: string;
  campusAddress?: string | null;
  universityName: string;
};

type CampusOption = {
  id: string;
  name: string;
  address?: string | null;
  universityId: string;
  universityName: string;
};

const INITIAL_FORM = {
  name: '',
  campusId: '',
  description: '',
  photoUrl: '',
  isSafeZone: true,
};

export default function AdminMeetingPointsPage() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuthGuard(UserRole.ADMIN);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [points, setPoints] = useState<MeetingPoint[]>([]);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 3000);
  };

  const fetchMeetingPoints = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/meeting-points');
      if (!res.ok) {
        throw new Error('Fetch failed');
      }

      const data = await res.json();
      const nextPoints = Array.isArray(data.data) ? data.data : [];
      const nextCampuses = Array.isArray(data.campuses) ? data.campuses : [];

      setPoints(nextPoints);
      setCampuses(nextCampuses);
      setForm((prev) => ({
        ...prev,
        campusId: prev.campusId || nextCampuses[0]?.id || '',
      }));
    } catch (error) {
      console.error('Lỗi khi tải điểm hẹn an toàn:', error);
      showFeedback('Không tải được danh sách điểm hẹn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMeetingPoints();
    }
  }, [currentUser]);

  const filteredPoints = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return points;

    return points.filter((point) => {
      const haystack = `${point.name} ${point.campusName} ${point.universityName} ${point.description ?? ''}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [points, search]);

  const safeCount = points.filter((point) => point.isSafeZone).length;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.campusId) {
      showFeedback('Tên điểm hẹn và campus là bắt buộc.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/meeting-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          campusId: form.campusId,
          description: form.description,
          photoUrl: form.photoUrl,
          isSafeZone: form.isSafeZone,
        }),
      });

      if (!res.ok) {
        throw new Error('Create failed');
      }

      setForm({
        ...INITIAL_FORM,
        campusId: campuses[0]?.id || '',
      });
      await fetchMeetingPoints();
      showFeedback('Đã tạo điểm hẹn an toàn mới.');
    } catch (error) {
      console.error('Lỗi khi tạo điểm hẹn:', error);
      showFeedback('Không tạo được điểm hẹn.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
        <Map className="mb-4 h-12 w-12 animate-pulse text-blue-600" />
        <span className="text-sm font-medium text-zinc-500">Đang tải điểm hẹn an toàn...</span>
      </div>
    );
  }

  return (
    <DashboardLayout activeItemId="meeting-points" pageTitle="Điểm hẹn an toàn">
      <div className="space-y-6">
        {feedback && (
          <div
            className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-xl ${
              feedback.type === 'success'
                ? 'border-emerald-400 bg-emerald-500 text-white'
                : 'border-rose-400 bg-rose-500 text-white'
            }`}
          >
            <span className="text-sm font-semibold">{feedback.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(APP_ROUTES.ADMIN.DASHBOARD)}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại dashboard</span>
          </button>

          <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            <span>{points.length} điểm hẹn</span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-950 dark:text-white">Tạo điểm hẹn mới</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tên điểm hẹn</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Sảnh thư viện tầng 1"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Campus</label>
                <select
                  value={form.campusId}
                  onChange={(e) => setForm((prev) => ({ ...prev, campusId: e.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-400"
                >
                  <option value="">Chọn campus</option>
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.universityName} - {campus.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả ngắn về vị trí, cách tìm, bảo vệ hoặc camera."
                  rows={4}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ảnh minh họa</label>
                <input
                  value={form.photoUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="Dán URL ảnh nếu có"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                <input
                  type="checkbox"
                  checked={form.isSafeZone}
                  onChange={(e) => setForm((prev) => ({ ...prev, isSafeZone: e.target.checked }))}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Đánh dấu là điểm an toàn</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Ưu tiên các khu có camera, bảo vệ hoặc đông người qua lại.</div>
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {submitting ? 'Đang tạo...' : 'Tạo điểm hẹn'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-500">Tổng điểm</div>
                  <div className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">{points.length}</div>
                </div>
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-500">An toàn</div>
                  <div className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">{safeCount}</div>
                </div>
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-500">Campus</div>
                  <div className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">{new Set(points.map((point) => point.campusId)).size}</div>
                </div>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm điểm hẹn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredPoints.map((point) => (
                <article
                  key={point.id}
                  className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-50/70 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-950/30"
                >
                  <div className="relative h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700">
                    {point.photoUrl ? (
                      <img src={point.photoUrl} alt={point.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <MapPin className="h-12 w-12 text-white/90" />
                      </div>
                    )}
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-zinc-900">
                      {point.isSafeZone ? 'An toàn' : 'Công khai'}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <div className="text-[11px] font-semibold text-zinc-400">{point.universityName}</div>
                      <h3 className="mt-1 text-base font-bold text-zinc-950 dark:text-white">{point.name}</h3>
                      <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{point.campusName}</div>
                    </div>

                    <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {point.description || 'Chưa có mô tả cho điểm hẹn này.'}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        {point.isSafeZone ? 'Ưu tiên an toàn' : 'Điểm công khai'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-blue-500" />
                        {point.photoUrl ? 'Có ảnh' : 'Chưa có ảnh'}
                      </span>
                    </div>

                    {point.campusAddress ? (
                      <div className="rounded-2xl bg-white px-4 py-3 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                        {point.campusAddress}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}

              {filteredPoints.length === 0 && (
                <div className="col-span-full rounded-3xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  Chưa có điểm hẹn nào phù hợp.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
