'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { nurseApi } from '@/lib/api/nurse';

/**
 * Mengambil nama lengkap ibu hamil dari API yang sama dengan fitur Daftar Pasien
 * (nurseApi.getIbuHamilDetail -> /api/v1/ibu-hamil/{id}/detail).
 * Dipakai untuk menampilkan nama kontak di chat ketika backend chat tidak mengirim ibu_hamil_name.
 */
export function useIbuHamilNames(ibuHamilIds: number[]): Record<number, string> {
  const token = useAuthStore((s) => s.token);
  const [names, setNames] = useState<Record<number, string>>({});
  const requestedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!token || ibuHamilIds.length === 0) return;

    const idsToFetch = ibuHamilIds.filter((id) => !requestedRef.current.has(id));
    if (idsToFetch.length === 0) return;

    idsToFetch.forEach((id) => requestedRef.current.add(id));
    let cancelled = false;

    Promise.all(
      idsToFetch.map((id) =>
        nurseApi
          .getIbuHamilDetail(token, id)
          .then((data) => ({ id, name: (data as { nama_lengkap?: string }).nama_lengkap ?? '' }))
          .catch(() => ({ id, name: '' }))
      )
    ).then((results) => {
      if (cancelled) return;
      setNames((prev) => {
        const next = { ...prev };
        for (const { id, name } of results) {
          if (name) next[id] = name;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [token, ibuHamilIds.join(',')]);

  return names;
}
