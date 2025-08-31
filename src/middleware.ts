import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/',
  '/meeting(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow join-call routes to be publicly accessible
  if (req.nextUrl.pathname.startsWith('/join-call')) {
    return;
  }

  // Allow sign-in route to be publicly accessible
  if (req.nextUrl.pathname.startsWith('/sign-in')) {
    return;
  }

  // Protect other routes and redirect to sign-in if not authenticated
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-in', req.url).toString()
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};