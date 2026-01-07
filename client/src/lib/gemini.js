import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

// FIX 1: Defined as 'safetySettings' (plural) to match the SDK requirement
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_PUBLIC_KEY);

const model = genAI.getGenerativeModel({
  // FIX 2: Using the model confirmed in your list (Index 1)
  model: "gemini-2.5-flash",
  // FIX 3: Passing the correct variable name
  safetySettings,
});

export default model;
