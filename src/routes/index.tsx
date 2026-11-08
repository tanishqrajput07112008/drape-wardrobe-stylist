import { createFileRoute } from '@tanstack/react-router';
import { AuthScreen } from '@/components/drape/AuthScreen';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/')({ head:()=>pageHead('Your Personal Style Companion','Your private wardrobe, outfits and occasion planner.'), component:AuthScreen });