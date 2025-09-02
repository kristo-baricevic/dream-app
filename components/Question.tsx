"use client";

import { askCustomQuestion, askQuestion } from "@/utils/api/clientApi";
import { SetStateAction, useState } from "react";
import PersonalitySelection from "./PersonalityDropdown";
import { getPersonality } from "@/utils/parameters/personalities";
import Image from "next/image";
import { JournalEntry } from "@/types";


type QuestionProps = {
    entries: JournalEntry[];
};

const Question: React.FC<QuestionProps> = ({entries}) => {
    const [value, setValue] = useState("Ask the dream doctor a question!");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState("");
    const [isQuestion, setIsQuestion] = useState(false);

    const onChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setValue(e.target.value);
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        const answer = await askQuestion(value, entries);
        setResponse(answer);
        setValue("");
        setLoading(false);
    };
    
    

    const handleAskQuestion = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        setIsQuestion(!isQuestion);
        setLoading(false);
    };
    const handleSubmitQuestion = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        const answer = await askCustomQuestion(value, entries);
        setResponse(answer);
        setValue("");
        setLoading(false);
    };


    return (
        <div className="flex flex-col py-4 justify-center align-middle">
            <div className="flex justify-center mb-4">
                <PersonalitySelection onSelect={getPersonality} />
            </div>
            <div className="flex flex-wrap justify-center align-middle">
                <div className="flex flex-wrap px-2 py-2">
                    <form onSubmit={handleSubmit}>
                        <div className="flex px-2">
                        <button 
                            disabled={loading}
                            type="submit" 
                            className="bg-pink-400 px-4 py-2 rounded-2xl text-lg ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-pink-500 hover:text-white"
                            >
                            Get your analysis!
                        </button>
                        </div>
                    </form>
                </div>
                <div className="flex flex-col px-2 py-2">
                    <form onSubmit={handleAskQuestion}>
                        <div className="flex px-2">
                            <button 
                                disabled={loading}
                                type="submit" 
                                className="bg-purple-400 px-4 py-2 rounded-2xl text-lg ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-purple-500 hover:text-white"
                                >
                                Ask a question!
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="flex py-2 align-middle justify-center">
                {isQuestion && (
                    <div className="flex flex-wrap justify-start">
                        <form onSubmit={handleSubmitQuestion}>
                            <div className="flex py-2 align-middle justify-center">
                                <input
                                    disabled={loading}
                                    onChange={onChange}
                                    value={value}
                                    type="text" 
                                    placeholder="ask a question" 
                                    className="border border-black/20 px-4 py-2 text-lg rounded-lg shadow-lg"
                                /> 
                            </div>
                            <div className="flex py-2 align-middle justify-center">
                                <button 
                                    disabled={loading}
                                    type="submit" 
                                    className="bg-purple-300 px-4 py-2 rounded-2xl text-lg ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-purple-500 hover:text-white"
                                    >
                                    Submit!
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            <div className="py-2">
                {loading && (
                    <div className="spinner-overlay">
                        <Image
                            src="/spinner.gif" 
                            alt="Loading..." 
                            height="100"
                            width="100"
                            unoptimized={true}
                        />
                        <p> ...The doctor is thinking. This may take a moment!</p>
                    </div>
                )}
                <div className="px-2 py-6 font-serif">
                    {response && (
                        <div className="bg-slate-100 p-4 rounded-2xl border-solid border-2 border-blue-300 shadow-lg">
                            <p>{response}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Question;
