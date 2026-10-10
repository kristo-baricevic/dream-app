import { NextRequest } from 'next/server';
import { proxy } from '@/services/serverProxy';
export const dynamic = 'force-dynamic';
async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path, 'chat');
}
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
