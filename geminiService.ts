
import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from "./types";

const getSystemInstruction = (transactions: Transaction[]) => {
  const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const transactionSummary = transactions.slice(0, 30).map(t => ({
    type: t.type,
    amount: t.amount,
    category: t.category,
    date: new Date(t.date).toLocaleDateString(),
    note: t.note
  }));

  return `You are Fin.SD's Financial Advisor. 
  CONTEXT: Income ₹${income}, Expense ₹${expense}, Balance ₹${balance}.
  DATA: ${JSON.stringify(transactionSummary)}
  
  MANDATORY RULES:
  1. MAXIMUM SHORT REPLIES (30-50 words max).
  2. NO FLUFF. No long intros like "I'd be happy to help".
  3. DIRECT ANSWERS ONLY.
  4. Use bullet points only if absolutely necessary for data.
  5. All values in Indian Rupees (₹).`;
};

export const getFinancialAdviceStream = async (transactions: Transaction[], userPrompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = getSystemInstruction(transactions);

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 0.5, // Lower temperature for more factual, shorter output
        thinkingConfig: { thinkingBudget: 2048 },
      }
    });

    return await chat.sendMessageStream({ message: userPrompt });
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
};
