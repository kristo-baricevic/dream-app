import Editor from "@/components/Editor";
import { getEntry } from "@/services/getEntry";

const EntryPage = async ({ params }: any ) => { 
    const entry = await getEntry(params.id);

    return (
        <div className="h-full w-full">
            <Editor entry={entry} />
        </div>
    )
}

export default EntryPage;