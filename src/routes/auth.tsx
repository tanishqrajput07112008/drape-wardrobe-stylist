import { createFileRoute } from '@tanstack/react-router';
import { AuthScreen } from '@/components/drape/AuthScreen';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/auth')({ head:()=>pageHead('Sign in','Sign in to your private Drape wardrobe.'), component:AuthScreen });