import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { profileQuery } from '@/lib/data';
import { pageHead } from '@/lib/page-head';
import { PageHeader } from '@/components/drape/AppShell';
import { ProfileEditor } from '@/components/drape/ProfileEditor';
export const Route=createFileRoute('/_authenticated/onboarding')({head:()=>pageHead('Your style','Set up your personal style preferences.'),loader:({context})=>context.queryClient.ensureQueryData(profileQuery),component:Onboarding});
function Onboarding(){useSuspenseQuery(profileQuery);return <><PageHeader eyebrow="A little about you" title="Style starts with you."/><p className="mb-8 max-w-xl text-muted-foreground">Choose what feels right. Every preference is optional, and you can change it anytime.</p><ProfileEditor onboarding/></>;}