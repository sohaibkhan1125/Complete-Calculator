'use server';

/**
 * @fileOverview Implements a natural language calculator flow that interprets user input and performs calculations.
 *
 * - naturalLanguageCalculator - A function that takes a natural language description of a calculation and returns the result.
 * - NaturalLanguageCalculatorInput - The input type for the naturalLanguageCalculator function.
 * - NaturalLanguageCalculatorOutput - The return type for the naturalLanguageCalculator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageCalculatorInputSchema = z.object({
  calculationDescription: z
    .string()
    .describe('A natural language description of the calculation to perform.'),
});
export type NaturalLanguageCalculatorInput = z.infer<
  typeof NaturalLanguageCalculatorInputSchema
>;

const NaturalLanguageCalculatorOutputSchema = z.object({
  result: z.number().describe('The result of the calculation.'),
});
export type NaturalLanguageCalculatorOutput = z.infer<
  typeof NaturalLanguageCalculatorOutputSchema
>;

export async function naturalLanguageCalculator(
  input: NaturalLanguageCalculatorInput
): Promise<NaturalLanguageCalculatorOutput> {
  return naturalLanguageCalculatorFlow(input);
}

const scientificCalculator = ai.defineTool(
  {
    name: 'scientificCalculator',
    description: 'Performs complex calculations and returns the result.',
    inputSchema: z.object({
      expression: z
        .string()
        .describe('A mathematical expression to evaluate.'),
    }),
    outputSchema: z.number(),
  },
  async input => {
    // TODO: Implement scientific calculator tool logic here.
    // This is a placeholder; replace with actual calculation logic.
    try {
      // eslint-disable-next-line no-eval
      return eval(input.expression) as number;
    } catch (e) {
      console.error('Error evaluating expression', e);
      return NaN;
    }
  }
);

const prompt = ai.definePrompt({
  name: 'naturalLanguageCalculatorPrompt',
  tools: [scientificCalculator],
  input: {schema: NaturalLanguageCalculatorInputSchema},
  output: {schema: NaturalLanguageCalculatorOutputSchema},
  prompt: `You are a calculator that can perform calculations described in natural language.

  If the user provides a calculation, use the scientificCalculator tool to perform the calculation and return the result.
  The user's calculation description is: {{{calculationDescription}}}`,
});

const naturalLanguageCalculatorFlow = ai.defineFlow(
  {
    name: 'naturalLanguageCalculatorFlow',
    inputSchema: NaturalLanguageCalculatorInputSchema,
    outputSchema: NaturalLanguageCalculatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
