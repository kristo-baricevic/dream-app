'use client';

import { AnalysisData, JournalEntry } from "@/types";
import { lightenColor } from "@/utils/colorUtilities";
// import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type EntryCardProps = {
    entry: JournalEntry;
    href: string;
    onDelete: (id: string) => void;
    analysis: AnalysisData;
};


const EntryCard = ({entry, href, onDelete}: EntryCardProps ) => {
    const handleDelete = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        console.log('Delete button clicked for entry ID:', entry.id);
        onDelete(entry.id);
    };

    console.log("entry data ", entry)

    const date = new Date(entry.created_at).toDateString();
    const [dreamAnalysis, setAnalysis] = useState<Partial<AnalysisData> | undefined>(
        entry.analysis
      );
      
    // const has"AnalysisData = dreamAnalysis && dreamAnalysis.summary && dreamAnalysis.color && dreamAnalysis.subject;
    console.log("dreamAnalysis?.color", dreamAnalysis?.color);
    const cloudStyle = { background: lightenColor(dreamAnalysis?.color, 13)};
    
    return (
        <div className="cloud border border-style border-black" 
            style={cloudStyle}
        >
            <div className="ml-10 flex flex-col">
                <div className="px-4 font-serif">{date}</div>
                <div className="px-4 content-truncate font-bold">
                    {dreamAnalysis?.subject}
                </div>
                <div className="px-4 content-truncate font-serif">{dreamAnalysis?.summary}</div>
                    <button 
                        onClick={handleDelete}
                        type="submit" 
                        className="px-4"
                    >
                        <div>
                            <Image
                                src="/trash.svg"
                                width="24" 
                                height="24" 
                                alt="Delete Icon"
                            />
                        </div>
                    </button>
            </div>             
        </div>
    )
}

export default EntryCard;

     