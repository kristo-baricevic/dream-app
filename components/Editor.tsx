'use client';

import { updatedEntry, generateDream } from "@/utils/api/clientApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { deleteEntry } from "@/utils/api/clientApi";
import PersonalitySelection from "./PersonalityDropdown";
import { getPersonality } from "@/utils/parameters/personalities";
import { EmotionType } from "@/utils/parameters/emotions";

type MoodObject = {
    [key: number]: string;
};

type DreamTopics = {
    [key: number]: string;
};

const moodObject: MoodObject = {
    1: "Confused",
    2: "Enchanted",
    3: "Joyful",
    4: "Surreal",
    5: "Adventurous",
    6: "Disoriented",
    7: "Whimsical",
    8: "Tortured",
    9: "Determined",
    10: "Relaxed",
    11: "Energetic",
    12: "Peaceful",
    13: "Hopeful",
    14: "Anxious",
    15: "Excited",
    16: "Content",
    17: "Frustrated",
    18: "Curious",
    19: "Amused",
    20: "Lonely",
    21: "Loved",
    22: "Sad",
    23: "Angry",
    24: "Inspired",
    25: "Proud",
    26: "Surprised",
    27: "Confident",
    28: "Grateful",
    29: "Optimistic",
    30: "Apathetic",
    31: "Nostalgic",
    32: "Intrigued",
    33: "Insecure",
    34: "Courageous",
    35: "Overwhelmed",
    36: "Playful",
    37: "Regretful",
    38: "Calm",
    39: "Melancholic",
    40: "Cautious",
    41: "Reckless",
    42: "Humble",
    43: "Bored",
    44: "Indifferent",
    45: "Worried",
    46: "Guilty",
    47: "Smitten",
    48: "Tense",
    49: "Patient",
    50: "Distracted",
    51: "Mischievous",
    52: "Skeptical",
    53: "Ecstatic",
    54: "Vulnerable",
    55: "Apprehensive",
    56: "Silly",
    57: "Hopeless",
    58: "Fascinated",
    59: "Eager",
    60: "Bashful",
    61: "Revolting",
    62: "Awkward",
    63: "Innocent",
    64: "Gloomy",
    65: "Giddy",
    66: "Drowsy",
    67: "Thrilled",
    68: "Doubtful",
    69: "Mysterious",
    70: "Discontent",
    71: "Enraged",
    72: "Serene",
    73: "Horrified",
    74: "Disgusted",
    75: "Curmudgeonly",
    76: "Lethargic",
    77: "Cranky",
    78: "Envious",
    79: "Jittery",
    80: "Nonchalant",
    81: "Satisfied",
    82: "Cautious",
    83: "Paralyzed",
    84: "Screaming",
    85: "Praying",
    86: "Dancing",
    87: "Pensive",
    88: "Restless",
    89: "Perplexed",
    90: "Grumpy",
    91: "Shy",
    92: "Elated",
    93: "Fearful",
    94: "Vexed",
    95: "Charming",
    96: "Frozen",
    97: "Amazed",
    98: "Inspired",
    99: "Nervous",
    100: "Compassionate"
};

const dreamTopics: DreamTopics = {
    1: "Flying in the sky",
    2: "Falling from great heights",
    3: "Being chased by something",
    4: "Meeting a famous person",
    5: "Being in a haunted house",
    6: "Winning the lottery",
    7: "Losing your teeth",
    8: "Riding a unicorn",
    9: "Swimming with dolphins",
    10: "Exploring a mysterious forest",
    11: "Traveling to space",
    12: "Becoming invisible",
    13: "Time traveling to the past",
    14: "Getting lost in a maze",
    15: "Talking to animals",
    16: "Attending a magical school",
    17: "Living in a post-apocalyptic world",
    18: "Solving a murder mystery",
    19: "Discovering hidden treasure",
    20: "Becoming a superhero",
    21: "Being a detective",
    22: "Dancing in the rain",
    23: "Having superpowers",
    24: "Escaping from a locked room",
    25: "Meeting your future self",
    26: "Battling mythical creatures",
    27: "Losing all my investments",
    28: "Visiting an underwater city",
    29: "Participating in a talent show",
    30: "Witnessing a volcano eruption",
    31: "Surviving a zombie apocalypse",
    32: "Being a pirate on a ship",
    33: "Finding a secret passage",
    34: "Solving a riddle",
    35: "Exploring a haunted cemetery",
    36: "Having a conversation with a robot",
    37: "Competing in a sports tournament",
    38: "Being a king or queen",
    39: "Winning a gold medal",
    40: "Going on a magical quest",
    41: "Experiencing a tornado",
    42: "Becoming a rock star",
    43: "Living in a fairy tale castle",
    44: "Going on a road trip",
    45: "Riding a dragon",
    46: "Meeting aliens from another planet",
    47: "Solving a math puzzle",
    48: "Traveling through time and space",
    49: "Escaping from a dragon's lair",
    50: "Visiting a parallel universe",
    51: "Battling evil witches",
    52: "Becoming a famous artist",
    53: "Going on a treasure hunt",
    54: "Discovering a hidden island",
    55: "Solving a crime as a detective",
    56: "Competing in a cooking competition",
    57: "Being a master chef",
    58: "Surviving a desert island",
    59: "Meeting a mermaid",
    60: "Going on a jungle adventure",
    61: "Becoming a race car driver",
    62: "Traveling through a wormhole",
    63: "Battling a giant monster",
    64: "Discovering a lost civilization",
    65: "Solving a space mystery",
    66: "Being a secret agent",
    67: "Going on a wild safari",
    68: "Exploring an enchanted forest",
    69: "Meeting a talking animal",
    70: "Becoming a famous writer",
    71: "Winning a dance competition",
    72: "Participating in a magic show",
    73: "Going on a deep-sea expedition",
    74: "Solving a supernatural mystery",
    75: "Being a time traveler",
    76: "Competing in a cooking show",
    77: "Visiting a hidden temple",
    78: "Discovering a new planet",
    79: "Battling alien invaders",
    80: "Exploring an ancient tomb",
    81: "Meeting a wise old sage",
    82: "Traveling to a distant galaxy",
    83: "Being a famous actor",
    84: "Winning an adventure race",
    85: "Escaping from a prison",
    86: "Solving a historical puzzle",
    87: "Battling a sea serpent",
    88: "Discovering a lost city",
    89: "Becoming a master magician",
    90: "Going on a space odyssey",
    91: "Meeting a legendary hero",
    92: "Participating in a reality TV show",
    93: "Being a professional athlete",
    94: "Winning a survival competition",
    95: "Solving a time paradox",
    96: "Traveling through a black hole",
    97: "Battling a mythical beast",
    98: "Discovering an ancient artifact",
    99: "Becoming a legendary explorer",
    100: "Going on an epic journey",
};

const Editor = ({ entry }: any) => {
    const router = useRouter();

    const [value, setValue] = useState(entry?.content);
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState(entry?.analysis || {});
    const [personality, setPersonality] = useState("academic");
    const [mood, setMood] = useState<EmotionType>("Joy"); 


    const { mood: analysisMood, summary, color, interpretation, subject, negative } = analysis || {};;
    const analysisData = analysis && Object.keys(analysis).length > 0 ? [
        { name: 'Summary', value: summary },
        { name: 'Title', value: subject },
        { name: 'Mood', value: analysisMood },
        { name: 'Negative', value: negative ? 'True' : 'False' },
        { name: 'Analysis', value: interpretation },
    ] : [];
    
    
    const handleSave = async () => {
        try {
            setIsLoading(true);
            const data = await updatedEntry(entry.id, value, personality, mood);
            if (data && data.analysis) {
                setAnalysis(data.analysis);
            } else {
                console.warn("No analysis data returned");
            }
        } catch (error) {
            console.error("Failed to save entry:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {

        e.preventDefault();
        setIsLoading(true);
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        const randomNumber2 = Math.floor(Math.random() * 100) + 1;
        const randomNumber3 = Math.floor(Math.random() * 100) + 1;
        const randomNumber4 = Math.floor(Math.random() * 100) + 1;
        const selectedMood = moodObject[randomNumber];
        const selectedMood2 = moodObject[randomNumber2];
        const selectedTopic = dreamTopics[randomNumber3];
        const selectedTopic2 = dreamTopics[randomNumber4];

        const prompt = `Please make up a dream. Imagine you are a person who has been experiencing moods like ${selectedMood} and ${selectedMood2}. Based on the value of ${randomNumber}, decide whether it will be a good dream or bad dream. If ${randomNumber} is greater than or equal to 70, it will be a good dream. It ${randomNumber} is less than 70 it will be a bad dream. The dream should be about the topics ${selectedTopic} and ${selectedTopic2}. Use the moods ${selectedMood} and ${selectedMood2} to guide you in how you incorporate the topics. If the moods are opposite, write about the conflict. Try to let the mood really come through in the writing. You are a human that is having these moods bubble to the surface through their dream. Use modern references! When you respond with the dream, do not respond by acknowledging this prompt. Just begin writing the dream immediately. But do not write "dear journal" or any introduction at all. Just start writing. Be action-oriented in your writing. You are a just trying to get it all down. Write 4 or 5 paragraphs. Don't be overly decorative in your word choice.`;

        try {
            const res = await generateDream(prompt);
            console.log("inside the try catch", res);
            setValue(res);
        } catch (error) {
            console.error("Failed to generate dream:", error);
            setValue("There has been an error!");
        } finally {
            setIsLoading(false);
        }
      };

    const handleDelete = async () => {
        try {
            const res = await deleteEntry(entry.id);
            console.log("delete response", res);
            router.push('/');
        } catch (error) {
            console.error("Failed to delete entry:", error);
        }
    };

    return (
        <div className="px-4 py-4">
            <div className="flex flex-col">
                <div className="col-span-3 px-4">
                    <div className="py-4">
                        <form>
                            <div className="flex flex-row justify-center items-center">
                            <PersonalitySelection onSelect={getPersonality} />
                            <div className="py-2 px-2">
                                <button 
                                    onClick={handleSubmit}
                                    type="submit" 
                                    className="bg-pink-400 px-4 py-2 rounded-2xl text-md ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-pink-500 hover:text-white"
                                    >
                                        Generate 
                                        <br />a Dream!
                                </button>
                            </div>
                            <div className="py-2 px-2">
                                <button 
                                    disabled={isLoading}
                                    onClick={handleSave}
                                    type="button"  
                                    className="bg-green-400 px-4 py-2 rounded-2xl text-md ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-green-500 hover:text-white"
                                >
                                    Analyze
                                </button>
                            </div>
                            </div>
                        </form>      
                    </div>
                    {isLoading && (
                        <div className="spinner-overlay">
                            <Image
                                src="/spinner.gif"
                                alt="Loading..."
                                height="100"
                                width="100"
                            />
                        </div>
                    )}
                    <div className="flex flew-grow h-96">
                        <textarea 
                            className="w-full h-full min-h-full px-4 py-4 text-xl resize-none border-solid border-2 border-black/60 rounded-lg shadow-md" 
                            value={value} 
                            onChange={(e) => setValue(e.target.value)} 
                        />
                    </div>
                </div>
                
                <div className="mt-5 flex justify-center items-center">
                    <div className="flex">
                        <div className="flex">
                            {analysisData.length > 0 ? (
                                <ul className="flex flex-wrap items-center justify-center px-4 py-4 gap-4">
                                    <li>
                                        <div className="py-12 shadow-lg border-solid border-2 border-black/60 rounded-full" style={{backgroundColor: color || 'white'}}>
                                            <h2 className="px-3 text-sm text-center">Color Analysis</h2>
                                        </div>
                                    </li>
                                    {analysisData.map((item) => (
                                        <li 
                                            key={item.name}
                                            className="flex flex-col items-center justify-between shadow-lg bg-slate-100 px-4 py-2 rounded-lg border-solid border-2 border-black/60"
                                        >
                                            <span className="flex text-lg font-semibold px-2 py-2">{item.name}</span>
                                            <span className="py-2 font-serif max-h-72 overflow-scroll">{item.value || 'No analysis yet!'}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500">No analysis yet! Click **Analyze** above.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="flex justify-center mt-10"
                >
                <button 
                    onClick={handleDelete}
                    disabled={isLoading}
                    type="submit" 
                    className="bg-red-500 px-4 py-2 rounded-2xl text-lg ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-red-900 hover:text-white"
                >
                    DELETE!
                </button>
            </div>
        </div>
    )
}

export default Editor;