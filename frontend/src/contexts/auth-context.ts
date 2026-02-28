import { createContext } from 'react';
import type { AuthContextValue } from '../types';

/**
 * Contexto de autenticación.
 * Se separa del proveedor para que Fast Refresh de Vite funcione correctamente:
 * los archivos que sólo exportan contextos (no componentes) no necesitan exportar
 * componentes React, evitando así la advertencia de HMR.
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
