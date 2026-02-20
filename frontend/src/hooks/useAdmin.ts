/**
 * useAdmin – returns true when the app is running in admin mode.
 *
 * Admin mode is enabled by setting the build-time env variable:
 *   VITE_ADMIN_MODE=true
 *
 * In production (Heroku) leave the variable unset → public / portfolio mode.
 * In local Docker development set VITE_ADMIN_MODE=true → full access.
 */
const isAdmin = import.meta.env.VITE_ADMIN_MODE === 'true'

export function useAdmin(): boolean {
  return isAdmin
}

export default useAdmin
