// import { OpenAI } from 'langchain/llms/openai';
// import { loadQARefineChain } from 'langchain/chains';
// import { MemoryVectorStore } from 'langchain/vectorstores/memory';
// import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
// import { Document } from 'langchain/document';
// import { PromptTemplate } from 'langchain/prompts';
// import { StructuredOutputParser } from 'langchain/output_parsers';
// import { z } from 'zod';
// import { getEmotionColor, emotions, EmotionType } from '../parameters/emotions';
// import { getPersonality } from '../parameters/personalities';

// //1//////////////////////////////////
// //This is the function use to generate the cumulative analysis on /journal/page.tsx 
// //It is triggered with the "Get your analysis!" button
// export const qa = async (question: string, entries: { id: string, createdAt: Date, content: string }[]) => {
//   try {
//     const docs = entries.map(
//       (entry) =>
//         new Document({
//           pageContent: entry.content,
//           metadata: { source: entry.id, date: entry.createdAt },
//         })
//     );

//     const model = new OpenAI({ temperature: 0.8, modelName: 'gpt-3.5-turbo' });
//     const chain = loadQARefineChain(model);
//     const embeddings = new OpenAIEmbeddings();
//     const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
//     const relevantDocs = await store.similaritySearch(question);
//     const res = await chain.call({
//       input_documents: relevantDocs,
//       question,
//     });

//     return res.output_text;
//   } catch (error) {
//     console.error('Error in QA process:', error);
//     throw new Error('Failed to process QA request');
//   }
// };

// //2////////////////////////////////
// //This is the function used to generate a sample dream in /Components/Editor.tsx

// export const aiGenerate = async (question: string) => {
//   const model = new OpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' });
//   const res = await model.call(question);  
//   return res;
// };

// //3////////////////////////////////
// // This is the parser and functions for prompting the OpenAI Api for a multi-part analysis
// // This function populates the data in the dream entries and creates the analysis results
// // on the Editor component
// //
// // Define the schema for the structured output
// const parser = StructuredOutputParser.fromZodSchema(
//   z.object({
//     mood: z.enum(Object.keys(emotions) as [EmotionType, ...EmotionType[]]).describe('the mood of the person who wrote the journal entry.'),
//     summary: z.string().describe('quick summary of the entire entry.'),
//     negative: z.boolean().describe('is the journal entry negative? (i.e. does it contain negative emotions?).'),
//     subject: z.string().describe('a whimsical title for the dream.'),
//     color: z.enum(Object.values(emotions) as [string, ...string[]]).describe('a hexidecimal color code that represents the mood of the entry.'),
//     interpretation: z.string().describe('your final analysis of the dream in about 5 or 6 sentences. Make this a dramatic interpretation. When you are done, suggest a song to listen to and a snack to eat.'),
//     sentimentScore: z.number().describe('sentiment of the text and rated on a scale from -10 to 10, where -10 is extremely negative, 0 is neutral, and 10 is extremely positive.'),
//   })
// );

// const getPrompt = async (entries: string, personality: string) => {
//   const format_instructions = parser.getFormatInstructions();
//   const prompt = new PromptTemplate({
//     template: `
//       {personality}
//       Analyze the following journal entries holistically. Follow the instructions and format your response to match the format instructions.
//       {format_instructions}

//       Journal Entries:
//       {entries}
//     `,
//     inputVariables: ['entries', 'personality'],
//     partialVariables: { format_instructions },
//   });

//   return prompt.format({ entries, personality });
// };

// export const analyze = async (content: string, personalityType: string) => {
//   // const combinedEntries = entries.map(entry => entry.content).join('\n\n');
//   const personality = getPersonality(personalityType);
//   const input = await getPrompt(content, personality);
//   const model = new OpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' });
//   const result = await model.call(input);

//   try {
//     const parsedResult = parser.parse(result);
//     (await parsedResult).color = getEmotionColor((await parsedResult).mood as EmotionType);
//     return parsedResult;
//   } catch (e) {
//     console.error('Failed to parse analysis result', e);
//     throw new Error('Failed to analyze dream journal entries');
//   }
// };
