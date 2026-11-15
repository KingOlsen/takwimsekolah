import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import type {
  AnalysisResult,
  AppStoreData,
  Committee,
  Division,
  SchoolProfile,
  SessionPayload,
  Teacher,
  UserAccount,
  WeightSettings,
} from '../types/tugasadil';
import { createDemoStore, LOGO_SEKOLAH_SVG } from '../lib/demoData';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  sanitizeForFirestore,
  signInWithGoogle,
  signOutCloud,
} from '../lib/firebase';
import { kira } from '../lib/kira';

export type CloudSyncStatus = 'offline' | 'connecting' | 'syncing' | 'synced' | 'error';

export type AppRoute =
  | { page: 'utama' }
  | { page: 'pemuka' }
  | { page: 'guru' }
  | { page: 'bahagian'; bahagianId: string }
  | { page: 'analisis' }
  | { page: 'rumusan' }
  | { page: 'laporan' }
  | { page: 'buku' }
  | { page: 'surat' }
  | { page: 'tetapan'; tab?: string };

export interface ToastItem {
  id: string;
  text: string;
  tone?: 'ok' | 'err';
}

interface StoreContextValue {
  store: AppStoreData;
  session: SessionPayload;
  analysis: AnalysisResult;
  currentUser: UserAccount;
  isAdmin: boolean;
  canManage: boolean;
  fullAccess: boolean;
  toggleFullAccess: () => void;
  unlockEverything: () => void;
  canEditDivision: (bahagianId: string) => boolean;
  route: AppRoute;
  navigate: (next: AppRoute) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  hideNames: boolean;
  toggleHideNames: () => void;
  focusedTeacherId: string | null;
  openTeacherModal: (guruId: string | null) => void;
  focusedCommitteeId: string | null;
  setFocusedCommitteeId: (jkId: string | null) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickInsertOpen: boolean;
  setQuickInsertOpen: (open: boolean) => void;
  toasts: ToastItem[];
  notify: (text: string, tone?: 'ok' | 'err') => void;
  // Mutations
  updateSchool: (patch: Partial<SchoolProfile>) => void;
  switchUser: (userId: string) => void;
  saveUser: (user: Omit<UserAccount, 'id'> & { id?: string }) => void;
  deleteUser: (userId: string) => void;
  switchSession: (sessionId: string) => void;
  createSession: (label: string, copyFromId?: string) => void;
  toggleLockSession: (sessionId: string, locked: boolean) => void;
  deleteSession: (sessionId: string) => void;
  saveTeacher: (teacher: Omit<Teacher, 'id' | 'urutan'> & { id?: string }) => void;
  addTeachersBulk: (teachers: Omit<Teacher, 'id' | 'urutan'>[]) => void;
  deleteTeachers: (ids: string[]) => void;
  moveTeacher: (id: string, dir: -1 | 1) => void;
  saveDivision: (div: Omit<Division, 'id' | 'urutan'> & { id?: string }) => void;
  moveDivision: (id: string, dir: -1 | 1) => void;
  toggleDivisionReady: (bahagianId: string, ready: boolean) => void;
  saveCommittee: (jk: Omit<Committee, 'id' | 'urutan'> & { id?: string }) => string;
  addCommitteesBulk: (jks: Omit<Committee, 'id' | 'urutan'>[]) => void;
  updateCommittee: (jkId: string, updater: (prev: Committee) => Committee) => void;
  deleteCommittee: (jkId: string) => void;
  moveCommittee: (jkId: string, dir: -1 | 1) => void;
  updateSettings: (patch: Partial<WeightSettings>) => void;
  resetDemoData: () => void;
  startBlankSchool: (schoolName: string, sessionLabel: string) => void;
  importFullJson: (data: AppStoreData) => void;
  // Multi-device Cloud Sync
  cloudUser: FirebaseUser | null;
  authReady: boolean;
  syncStatus: CloudSyncStatus;
  lastSyncedAt: string | null;
  loginCloud: () => Promise<void>;
  logoutCloud: () => Promise<void>;
  forcePushToCloud: () => Promise<void>;
}

const STORAGE_KEY = 'tugasadil_store_v1';
const THEME_KEY = 'tugasadil_theme_v1';

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadInitialStore(): AppStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppStoreData;
      if (parsed && parsed.sesi && parsed.sesiAktifId && parsed.sesi[parsed.sesiAktifId]) {
        if (parsed.sekolah?.logo?.includes('1f5245')) {
          parsed.sekolah.logo = LOGO_SEKOLAH_SVG;
        }
        Object.values(parsed.sesi).forEach((s) => {
          if (s.tetapan?.buku?.kulit?.warna === '#1f5245') {
            s.tetapan.buku.kulit.warna = '#7a1c2e';
            s.tetapan.buku.kulit.aksen = '#ea6a1f';
          }
        });
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return createDemoStore();
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<AppStoreData>(loadInitialStore);
  const [route, setRoute] = useState<AppRoute>({ page: 'utama' });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });
  const [hideNames, setHideNames] = useState(false);
  const [fullAccess, setFullAccess] = useState(true);
  const [focusedTeacherId, setFocusedTeacherId] = useState<string | null>(null);
  const [focusedCommitteeId, setFocusedCommitteeId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickInsertOpen, setQuickInsertOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Cloud Sync state
  const [cloudUser, setCloudUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const isApplyingRemoteRef = useRef(false);
  const initialCloudCheckDoneRef = useRef(false);
  const storeRef = useRef<AppStoreData>(store);
  storeRef.current = store;
  const lastSavedJsonRef = useRef<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore quota errors
    }
  }, [store]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (route.page !== 'utama') {
          e.preventDefault();
          setSearchOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [route.page]);

  const notify = useCallback((text: string, tone: 'ok' | 'err' = 'ok') => {
    const id = uid('t');
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const pushStoreToFirestore = useCallback(
    async (uidStr: string, data: AppStoreData) => {
      const safeUid = uidStr.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
      if (!safeUid) return;
      const path = `workspaces/${safeUid}`;
      const sanitized = sanitizeForFirestore(data);
      const payload = {
        ownerId: safeUid,
        schoolName: (sanitized.sekolah?.nama || 'Sekolah').slice(0, 200),
        sesiAktifId: (sanitized.sesiAktifId || 't2027').slice(0, 64),
        penggunaAktifId: (sanitized.penggunaAktifId || 'u1').slice(0, 64),
        sekolah: sanitized.sekolah || {},
        pengguna: (sanitized.pengguna || []).slice(0, 50),
        sesi: sanitized.sesi || {},
        updatedAt: serverTimestamp(),
      };
      setSyncStatus('syncing');
      try {
        await setDoc(doc(db, 'workspaces', safeUid), payload);
        lastSavedJsonRef.current = JSON.stringify(sanitized);
        setSyncStatus('synced');
        setLastSyncedAt(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (error) {
        setSyncStatus('error');
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    []
  );

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCloudUser(user);
      setAuthReady(true);
      if (!user) {
        setSyncStatus('offline');
        initialCloudCheckDoneRef.current = false;
      }
    });
    return () => unsub();
  }, []);

  // Attach real-time Firestore listener when authenticated
  useEffect(() => {
    if (!authReady || !cloudUser) return;
    const safeUid = cloudUser.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
    const path = `workspaces/${safeUid}`;
    setSyncStatus('connecting');

    const unsub = onSnapshot(
      doc(db, 'workspaces', safeUid),
      (snapshot) => {
        if (!snapshot.exists()) {
          // First time connecting this account: upload local store to cloud
          initialCloudCheckDoneRef.current = true;
          void pushStoreToFirestore(safeUid, storeRef.current);
          return;
        }
        const raw = snapshot.data();
        if (raw && raw.sekolah && raw.sesi && raw.sesiAktifId) {
          const incomingStore: AppStoreData = {
            sekolah: raw.sekolah as SchoolProfile,
            pengguna: (raw.pengguna || []) as UserAccount[],
            penggunaAktifId: String(raw.penggunaAktifId || 'u1'),
            sesiAktifId: String(raw.sesiAktifId),
            sesi: raw.sesi as Record<string, SessionPayload>,
          };
          const incomingJson = JSON.stringify(sanitizeForFirestore(incomingStore));
          lastSavedJsonRef.current = incomingJson;
          initialCloudCheckDoneRef.current = true;

          if (incomingJson !== JSON.stringify(sanitizeForFirestore(storeRef.current))) {
            isApplyingRemoteRef.current = true;
            setStore(incomingStore);
          }

          if (raw.updatedAt instanceof Timestamp) {
            setLastSyncedAt(
              raw.updatedAt.toDate().toLocaleTimeString('ms-MY', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            );
          } else {
            setLastSyncedAt(
              new Date().toLocaleTimeString('ms-MY', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            );
          }
          setSyncStatus('synced');
        }
      },
      (error) => {
        setSyncStatus('error');
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsub();
  }, [authReady, cloudUser, pushStoreToFirestore]);

  // Automatically sync local changes to Firestore across all devices
  useEffect(() => {
    if (!authReady || !cloudUser || !initialCloudCheckDoneRef.current) return;
    if (isApplyingRemoteRef.current) {
      isApplyingRemoteRef.current = false;
      return;
    }
    const currentJson = JSON.stringify(sanitizeForFirestore(store));
    if (currentJson === lastSavedJsonRef.current) return;

    const timer = setTimeout(() => {
      void pushStoreToFirestore(cloudUser.uid, store);
    }, 450);

    return () => clearTimeout(timer);
  }, [store, authReady, cloudUser, pushStoreToFirestore]);

  const loginCloud = useCallback(async () => {
    try {
      await signInWithGoogle();
      notify('Berjaya log masuk. Segerak awan semua peranti diaktifkan.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Log masuk dibatalkan.';
      if (!msg.includes('popup-closed-by-user')) {
        notify('Gagal menyambung ke akaun Google.', 'err');
      }
    }
  }, [notify]);

  const logoutCloud = useCallback(async () => {
    try {
      await signOutCloud();
      notify('Segerak awan dihentikan.');
    } catch {
      notify('Gagal log keluar.', 'err');
    }
  }, [notify]);

  const forcePushToCloud = useCallback(async () => {
    if (!cloudUser) {
      await loginCloud();
      return;
    }
    await pushStoreToFirestore(cloudUser.uid, storeRef.current);
    notify('Data terkini berjaya disegerakkan ke semua peranti.');
  }, [cloudUser, loginCloud, pushStoreToFirestore, notify]);

  const navigate = useCallback((next: AppRoute) => {
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const session = useMemo(() => {
    return store.sesi[store.sesiAktifId] || Object.values(store.sesi)[0];
  }, [store]);

  const currentUser = useMemo(() => {
    return store.pengguna.find((u) => u.id === store.penggunaAktifId) || store.pengguna[0];
  }, [store]);

  const isAdmin = fullAccess || currentUser?.peranan === 'admin';
  const isLocked = !fullAccess && !!session?.tahun.kunci;
  const canManage = fullAccess || (isAdmin && !isLocked);

  const canEditDivision = useCallback(
    (bahagianId: string) => {
      if (fullAccess) return true;
      if (isLocked) return false;
      if (currentUser?.peranan === 'admin') return true;
      if (currentUser?.peranan === 'pentadbir') {
        return currentUser.bahagian.includes(bahagianId);
      }
      return false;
    },
    [fullAccess, currentUser, isLocked]
  );

  const analysis = useMemo(() => {
    return kira({
      tetapan: session.tetapan,
      guru: session.guru,
      bahagian: session.bahagian,
      jk: session.jk,
    });
  }, [session]);

  const mutateSession = useCallback(
    (updater: (prev: SessionPayload) => SessionPayload) => {
      setStore((prev) => {
        const s = prev.sesi[prev.sesiAktifId];
        if (!s) return prev;
        return {
          ...prev,
          sesi: {
            ...prev.sesi,
            [prev.sesiAktifId]: updater(s),
          },
        };
      });
    },
    []
  );

  const updateSchool = useCallback((patch: Partial<SchoolProfile>) => {
    setStore((prev) => {
      const oldName = prev.sekolah.nama;
      const nextSekolah = { ...prev.sekolah, ...patch };
      const newName = nextSekolah.nama;

      if (!patch.nama || newName === oldName) {
        return { ...prev, sekolah: nextSekolah };
      }

      const replaceSchoolStr = (str: string | undefined) => {
        if (!str) return str || '';
        return str
          .replaceAll(oldName, newName)
          .replaceAll(oldName.toUpperCase(), newName.toUpperCase())
          .replace(/SMK SERI CONTOH/gi, (m) => (m === m.toUpperCase() ? newName.toUpperCase() : newName));
      };

      const nextSesi: Record<string, SessionPayload> = {};
      for (const [k, s] of Object.entries(prev.sesi)) {
        const nextBuku = s.tetapan.buku
          ? {
              ...s.tetapan.buku,
              ...(s.tetapan.buku.halamanTambahan
                ? {
                    halamanTambahan: s.tetapan.buku.halamanTambahan.map((hp) => ({
                      ...hp,
                      isi: replaceSchoolStr(hp.isi),
                    })),
                  }
                : {}),
            }
          : s.tetapan.buku;

        const nextSurat = s.tetapan.surat
          ? {
              ...s.tetapan.surat,
              ...(s.tetapan.surat.kepala
                ? {
                    kepala: {
                      ...s.tetapan.surat.kepala,
                      namaSekolah:
                        !s.tetapan.surat.kepala.namaSekolah ||
                        s.tetapan.surat.kepala.namaSekolah.toUpperCase() === oldName.toUpperCase() ||
                        /SMK SERI CONTOH/i.test(s.tetapan.surat.kepala.namaSekolah)
                          ? newName.toUpperCase()
                          : s.tetapan.surat.kepala.namaSekolah,
                    },
                  }
                : {}),
              ...(s.tetapan.surat.tandatangan
                ? {
                    tandatangan: {
                      ...s.tetapan.surat.tandatangan,
                      sekolah:
                        !s.tetapan.surat.tandatangan.sekolah ||
                        s.tetapan.surat.tandatangan.sekolah === oldName ||
                        /SMK SERI CONTOH/i.test(s.tetapan.surat.tandatangan.sekolah)
                          ? newName
                          : s.tetapan.surat.tandatangan.sekolah,
                    },
                  }
                : {}),
            }
          : s.tetapan.surat;

        nextSesi[k] = {
          ...s,
          tetapan: {
            ...s.tetapan,
            buku: nextBuku,
            surat: nextSurat,
          },
        };
      }

      return {
        ...prev,
        sekolah: nextSekolah,
        sesi: nextSesi,
      };
    });
  }, []);

  const switchUser = useCallback(
    (userId: string) => {
      setStore((prev) => ({ ...prev, penggunaAktifId: userId }));
      const found = store.pengguna.find((u) => u.id === userId);
      if (found) notify(`Ditukar kepada ${found.nama}.`);
    },
    [store.pengguna, notify]
  );

  const saveUser = useCallback((user: Omit<UserAccount, 'id'> & { id?: string }) => {
    setStore((prev) => {
      if (user.id) {
        return {
          ...prev,
          pengguna: prev.pengguna.map((u) => (u.id === user.id ? ({ ...u, ...user } as UserAccount) : u)),
        };
      }
      const created: UserAccount = { ...user, id: uid('u') };
      return { ...prev, pengguna: [...prev.pengguna, created] };
    });
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setStore((prev) => ({
      ...prev,
      pengguna: prev.pengguna.filter((u) => u.id !== userId),
    }));
  }, []);

  const switchSession = useCallback(
    (sessionId: string) => {
      setStore((prev) => {
        if (!prev.sesi[sessionId]) return prev;
        return { ...prev, sesiAktifId: sessionId };
      });
      notify('Sesi berjaya ditukar.');
    },
    [notify]
  );

  const createSession = useCallback(
    (label: string, copyFromId?: string) => {
      const id = uid('t');
      setStore((prev) => {
        const source = copyFromId ? prev.sesi[copyFromId] : prev.sesi[prev.sesiAktifId];
        const base = source ? JSON.parse(JSON.stringify(source)) as SessionPayload : null;
        const fresh: SessionPayload =
          copyFromId && base
            ? {
                ...base,
                tahun: { id, label, aktif: true, kunci: false },
                tetapan: { ...base.tetapan, status: {} },
              }
            : {
                tahun: { id, label, aktif: true, kunci: false },
                tetapan: createDemoStore().sesi.t2027.tetapan,
                bahagian: createDemoStore().sesi.t2027.bahagian.slice(0, 4),
                guru: [],
                jk: [],
              };
        return {
          ...prev,
          sesiAktifId: id,
          sesi: { ...prev.sesi, [id]: fresh },
        };
      });
      notify(`Sesi ${label} dicipta dan dibuka.`);
    },
    [notify]
  );

  const toggleLockSession = useCallback(
    (sessionId: string, locked: boolean) => {
      setStore((prev) => {
        const s = prev.sesi[sessionId];
        if (!s) return prev;
        return {
          ...prev,
          sesi: {
            ...prev.sesi,
            [sessionId]: { ...s, tahun: { ...s.tahun, kunci: locked } },
          },
        };
      });
      notify(locked ? 'Sesi dikunci.' : 'Sesi dibuka semula.');
    },
    [notify]
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      setStore((prev) => {
        const keys = Object.keys(prev.sesi).filter((k) => k !== sessionId);
        if (!keys.length) return prev;
        const nextSesi = { ...prev.sesi };
        delete nextSesi[sessionId];
        return {
          ...prev,
          sesiAktifId: prev.sesiAktifId === sessionId ? keys[0] : prev.sesiAktifId,
          sesi: nextSesi,
        };
      });
      notify('Sesi dipadam.');
    },
    [notify]
  );

  const saveTeacher = useCallback(
    (teacher: Omit<Teacher, 'id' | 'urutan'> & { id?: string }) => {
      mutateSession((s) => {
        if (teacher.id) {
          return {
            ...s,
            guru: s.guru.map((g) => (g.id === teacher.id ? ({ ...g, ...teacher } as Teacher) : g)),
          };
        }
        const maxUrutan = s.guru.reduce((m, g) => Math.max(m, g.urutan || 0), 0);
        const created: Teacher = { ...teacher, id: uid('g'), urutan: maxUrutan + 1 };
        return { ...s, guru: [...s.guru, created] };
      });
    },
    [mutateSession]
  );

  const addTeachersBulk = useCallback(
    (teachers: Omit<Teacher, 'id' | 'urutan'>[]) => {
      mutateSession((s) => {
        let maxUrutan = s.guru.reduce((m, g) => Math.max(m, g.urutan || 0), 0);
        const added: Teacher[] = teachers.map((t) => ({
          ...t,
          id: uid('g'),
          urutan: ++maxUrutan,
        }));
        return { ...s, guru: [...s.guru, ...added] };
      });
    },
    [mutateSession]
  );

  const deleteTeachers = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      mutateSession((s) => ({
        ...s,
        guru: s.guru.filter((g) => !set.has(g.id)),
        jk: s.jk.map((j) => ({
          ...j,
          ahli: j.ahli.map((a) => (a.guruId && set.has(a.guruId) ? { ...a, guruId: null } : a)),
        })),
      }));
    },
    [mutateSession]
  );

  const moveTeacher = useCallback(
    (id: string, dir: -1 | 1) => {
      mutateSession((s) => {
        const sorted = [...s.guru].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
        const idx = sorted.findIndex((g) => g.id === id);
        const target = idx + dir;
        if (idx < 0 || target < 0 || target >= sorted.length) return s;
        const [item] = sorted.splice(idx, 1);
        sorted.splice(target, 0, item);
        return {
          ...s,
          guru: sorted.map((g, i) => ({ ...g, urutan: i + 1 })),
        };
      });
    },
    [mutateSession]
  );

  const saveDivision = useCallback(
    (div: Omit<Division, 'id' | 'urutan'> & { id?: string }) => {
      mutateSession((s) => {
        if (div.id) {
          return {
            ...s,
            bahagian: s.bahagian.map((b) => (b.id === div.id ? ({ ...b, ...div } as Division) : b)),
          };
        }
        const maxUrutan = s.bahagian.reduce((m, b) => Math.max(m, b.urutan || 0), 0);
        const created: Division = { ...div, id: uid('b'), urutan: maxUrutan + 1 };
        return { ...s, bahagian: [...s.bahagian, created] };
      });
    },
    [mutateSession]
  );

  const moveDivision = useCallback(
    (id: string, dir: -1 | 1) => {
      mutateSession((s) => {
        const sorted = [...s.bahagian].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
        const idx = sorted.findIndex((b) => b.id === id);
        const target = idx + dir;
        if (idx < 0 || target < 0 || target >= sorted.length) return s;
        const [item] = sorted.splice(idx, 1);
        sorted.splice(target, 0, item);
        return {
          ...s,
          bahagian: sorted.map((b, i) => ({ ...b, urutan: i + 1 })),
        };
      });
    },
    [mutateSession]
  );

  const toggleDivisionReady = useCallback(
    (bahagianId: string, ready: boolean) => {
      mutateSession((s) => ({
        ...s,
        tetapan: {
          ...s.tetapan,
          status: {
            ...s.tetapan.status,
            [bahagianId]: {
              siap: ready,
              oleh: currentUser?.nama || 'Pentadbir',
              pada: Math.floor(Date.now() / 1000),
            },
          },
        },
      }));
      notify(ready ? 'Bahagian ditandakan siap.' : 'Bahagian dibuka semula sebagai draf.');
    },
    [mutateSession, currentUser?.nama, notify]
  );

  const saveCommittee = useCallback(
    (jk: Omit<Committee, 'id' | 'urutan'> & { id?: string }) => {
      const newId = jk.id || uid('j');
      mutateSession((s) => {
        if (jk.id) {
          return {
            ...s,
            jk: s.jk.map((item) => (item.id === jk.id ? ({ ...item, ...jk } as Committee) : item)),
          };
        }
        const maxUrutan = s.jk
          .filter((x) => x.bahagianId === jk.bahagianId)
          .reduce((m, x) => Math.max(m, x.urutan || 0), 0);
        const created: Committee = { ...jk, id: newId, urutan: maxUrutan + 1 };
        return { ...s, jk: [...s.jk, created] };
      });
      return newId;
    },
    [mutateSession]
  );

  const addCommitteesBulk = useCallback(
    (jks: Omit<Committee, 'id' | 'urutan'>[]) => {
      mutateSession((s) => {
        const counts: Record<string, number> = {};
        s.jk.forEach((x) => {
          counts[x.bahagianId] = Math.max(counts[x.bahagianId] || 0, x.urutan || 0);
        });
        const added: Committee[] = jks.map((j) => {
          counts[j.bahagianId] = (counts[j.bahagianId] || 0) + 1;
          return { ...j, id: uid('j'), urutan: counts[j.bahagianId] };
        });
        return { ...s, jk: [...s.jk, ...added] };
      });
    },
    [mutateSession]
  );

  const updateCommittee = useCallback(
    (jkId: string, updater: (prev: Committee) => Committee) => {
      mutateSession((s) => ({
        ...s,
        jk: s.jk.map((j) => (j.id === jkId ? updater(j) : j)),
      }));
    },
    [mutateSession]
  );

  const deleteCommittee = useCallback(
    (jkId: string) => {
      mutateSession((s) => ({
        ...s,
        jk: s.jk.filter((j) => j.id !== jkId),
      }));
    },
    [mutateSession]
  );

  const moveCommittee = useCallback(
    (jkId: string, dir: -1 | 1) => {
      mutateSession((s) => {
        const targetJk = s.jk.find((x) => x.id === jkId);
        if (!targetJk) return s;
        const groupList = s.jk
          .filter((x) => x.bahagianId === targetJk.bahagianId && (x.kumpulan || '') === (targetJk.kumpulan || ''))
          .sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
        const idx = groupList.findIndex((x) => x.id === jkId);
        const swapIdx = idx + dir;
        if (idx < 0 || swapIdx < 0 || swapIdx >= groupList.length) return s;
        const a = groupList[idx];
        const b = groupList[swapIdx];
        return {
          ...s,
          jk: s.jk.map((x) => {
            if (x.id === a.id) return { ...x, urutan: b.urutan };
            if (x.id === b.id) return { ...x, urutan: a.urutan };
            return x;
          }),
        };
      });
    },
    [mutateSession]
  );

  const updateSettings = useCallback(
    (patch: Partial<WeightSettings>) => {
      mutateSession((s) => ({
        ...s,
        tetapan: { ...s.tetapan, ...patch },
      }));
    },
    [mutateSession]
  );

  const resetDemoData = useCallback(() => {
    const fresh = createDemoStore();
    setStore(fresh);
    notify(`Data demo ${fresh.sekolah.nama} dipulihkan.`);
  }, [notify]);

  const startBlankSchool = useCallback(
    (schoolName: string, sessionLabel: string) => {
      const demo = createDemoStore();
      const sId = uid('s');
      const cleanName = schoolName.trim() || 'Sekolah Baharu';
      const cleanLabel = sessionLabel.trim() || '2027';
      const freshStore: AppStoreData = {
        ...demo,
        sekolah: {
          ...demo.sekolah,
          nama: cleanName,
          kod: '',
          alamat: '',
          bandar: '',
          poskod: '',
          telefon: '',
          emel: '',
          moto: 'Berilmu Beramal Berbakti',
        },
        penggunaAktifId: demo.pengguna[0].id,
        sesiAktifId: sId,
        sesi: {
          [sId]: {
            tahun: { id: sId, label: cleanLabel, aktif: true, kunci: false },
            tetapan: {
              ...demo.sesi.t2027.tetapan,
              status: {},
            },
            bahagian: demo.sesi.t2027.bahagian.slice(0, 4),
            guru: [],
            jk: [],
          },
        },
      };
      setStore(freshStore);
      setFullAccess(true);
      notify(`Rekod baharu untuk ${cleanName} (Sesi ${cleanLabel}) dibuka.`);
    },
    [notify]
  );

  const toggleFullAccess = useCallback(() => {
    setFullAccess((prev) => {
      const next = !prev;
      notify(next ? 'Semua ciri & suntingan dibuka.' : 'Mod kawalan peranan diaktifkan.');
      return next;
    });
  }, [notify]);

  const unlockEverything = useCallback(() => {
    setFullAccess(true);
    setStore((prev) => {
      const s = prev.sesi[prev.sesiAktifId];
      const adminUser = prev.pengguna.find((u) => u.peranan === 'admin') || prev.pengguna[0];
      return {
        ...prev,
        penggunaAktifId: adminUser ? adminUser.id : prev.penggunaAktifId,
        sesi: s
          ? {
              ...prev.sesi,
              [prev.sesiAktifId]: { ...s, tahun: { ...s.tahun, kunci: false } },
            }
          : prev.sesi,
      };
    });
    notify('Semua ciri, suntingan, dan cetakan telah dibuka sepenuhnya.');
  }, [notify]);

  const importFullJson = useCallback(
    (data: AppStoreData) => {
      setStore(data);
      notify('Data sekolah berjaya diimport.');
    },
    [notify]
  );

  const value: StoreContextValue = {
    store,
    session,
    analysis,
    currentUser,
    isAdmin,
    canManage,
    fullAccess,
    toggleFullAccess,
    unlockEverything,
    canEditDivision,
    route,
    navigate,
    darkMode,
    toggleDarkMode: () => setDarkMode((d) => !d),
    hideNames,
    toggleHideNames: () => setHideNames((h) => !h),
    focusedTeacherId,
    openTeacherModal: setFocusedTeacherId,
    focusedCommitteeId,
    setFocusedCommitteeId,
    searchOpen,
    setSearchOpen,
    quickInsertOpen,
    setQuickInsertOpen,
    toasts,
    notify,
    updateSchool,
    switchUser,
    saveUser,
    deleteUser,
    switchSession,
    createSession,
    toggleLockSession,
    deleteSession,
    saveTeacher,
    addTeachersBulk,
    deleteTeachers,
    moveTeacher,
    saveDivision,
    moveDivision,
    toggleDivisionReady,
    saveCommittee,
    addCommitteesBulk,
    updateCommittee,
    deleteCommittee,
    moveCommittee,
    updateSettings,
    resetDemoData,
    startBlankSchool,
    importFullJson,
    cloudUser,
    authReady,
    syncStatus,
    lastSyncedAt,
    loginCloud,
    logoutCloud,
    forcePushToCloud,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
