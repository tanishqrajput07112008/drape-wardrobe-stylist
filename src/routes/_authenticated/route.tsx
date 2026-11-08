import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { AppShell } from '@/components/drape/AppShell';
export const Route = createFileRoute('/_authenticated')({ ssr: false, beforeLoad: async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw redirect({ to: '/auth' });
}, component: ProtectedLayout });
function ProtectedLayout() { return <AppShell><Outlet /></AppShell>; }