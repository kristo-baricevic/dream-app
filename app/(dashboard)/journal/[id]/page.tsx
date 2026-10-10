import Editor from '@/components/Editor';
import { getEntry } from '@/services/getEntry';
import { PrivateServerContent } from '@/components/AuthProvider';

const EntryPage = async ({ params }: any) => {
  const entry = await getEntry((await params).id);

  return (
    <div className="h-full w-full">
      <PrivateServerContent ownerId={entry.user}><Editor entry={entry} /></PrivateServerContent>
    </div>
  );
};

export default EntryPage;
