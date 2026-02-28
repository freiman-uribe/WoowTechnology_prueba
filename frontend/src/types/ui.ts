// ─── Tipos de UI / estado asíncrono ──────────────────────────────────────────

/** Estado genérico de operaciones asíncronas */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/** Alias para acciones en el panel de admin */
export type ActionStatus = AsyncStatus;

/** Alias para guardar en formularios de perfil */
export type SaveStatus = AsyncStatus;

/** Tabs disponibles en la página de administración */
export type AdminTab = 'usuarios' | 'roles';
