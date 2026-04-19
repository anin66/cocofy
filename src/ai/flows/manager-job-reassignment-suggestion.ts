'use server';
/**
 * @fileOverview An AI assistant for managers to suggest alternative workers for a rejected job.
 *
 * - managerJobReassignmentSuggestion - A function that handles the worker reassignment suggestion process.
 * - ManagerJobReassignmentSuggestionInput - The input type for the managerJobReassignmentSuggestion function.
 * - ManagerJobReassignmentSuggestionOutput - The return type for the managerJobReassignmentSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorkerSchema = z.object({
  workerId: z.string().describe('The unique identifier of the worker.'),
  name: z.string().describe('The name of the worker.'),
  skills: z.array(z.string()).describe('A list of skills the worker possesses.'),
  availability: z
    .string()
    .describe('The current availability status of the worker for the job date.'),
});

const ManagerJobReassignmentSuggestionInputSchema = z.object({
  jobDetails: z.object({
    jobId: z.string().describe('The unique identifier for the job.'),
    customerName: z.string().describe('The name of the customer for whom the job is scheduled.'),
    location: z.string().describe('The location where the job needs to be performed.'),
    scheduledDate: z
      .string()
      .describe('The scheduled date for the job (e.g., YYYY-MM-DD).'),
    requirements: z
      .string()
      .describe('Specific requirements or skills needed for the job.'),
    initialWorkerId: z
      .string()
      .describe('The ID of the worker who initially rejected the job.'),
  }),
  availableWorkers:
    z.array(WorkerSchema).describe('A list of other workers who might be available.'),
});

export type ManagerJobReassignmentSuggestionInput = z.infer<
  typeof ManagerJobReassignmentSuggestionInputSchema
>;

const SuggestedWorkerSchema = z.object({
  workerId: z.string().describe('The ID of the suggested worker.'),
  name: z.string().describe('The name of the suggested worker.'),
  reason: z
    .string()
    .describe('A brief explanation of why this worker is suitable for the job.'),
});

const ManagerJobReassignmentSuggestionOutputSchema = z.object({
  suggestions: z
    .array(SuggestedWorkerSchema)
    .describe('A list of suggested workers for the job reassignment.'),
  noSuitableWorkersFound: z
    .boolean()
    .describe('True if no suitable workers could be found, otherwise false.'),
});

export type ManagerJobReassignmentSuggestionOutput = z.infer<
  typeof ManagerJobReassignmentSuggestionOutputSchema
>;

export async function managerJobReassignmentSuggestion(
  input: ManagerJobReassignmentSuggestionInput
): Promise<ManagerJobReassignmentSuggestionOutput> {
  return managerJobReassignmentSuggestionFlow(input);
}

const reassignmentPrompt = ai.definePrompt({
  name: 'managerJobReassignmentSuggestionPrompt',
  input: {schema: ManagerJobReassignmentSuggestionInputSchema},
  output: {schema: ManagerJobReassignmentSuggestionOutputSchema},
  prompt: `You are a helpful AI assistant for a coconut harvesting company. Your task is to suggest alternative workers for a rejected job based on the job's requirements and the availability and skills of other workers. Do not suggest the worker who initially rejected the job.

Job Details:
- Job ID: {{{jobDetails.jobId}}}
- Customer: {{{jobDetails.customerName}}}
- Location: {{{jobDetails.location}}}
- Scheduled Date: {{{jobDetails.scheduledDate}}}
- Requirements: {{{jobDetails.requirements}}}
- Rejected by Worker ID: {{{jobDetails.initialWorkerId}}}

Available Workers (excluding the rejected worker):
{{#if availableWorkers}}
{{#each availableWorkers}}
{{#unless (eq workerId ../jobDetails.initialWorkerId)}}
- Worker ID: {{{workerId}}}
  Name: {{{name}}}
  Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Availability: {{{availability}}}
{{/unless}}
{{/each}}
{{else}}
No other workers are available.
{{/if}}

Please analyze the job requirements and the available workers' profiles. Suggest the top 3 most suitable workers from the 'Available Workers' list. For each suggestion, provide a brief reason why they are a good fit, considering their skills and availability. If no suitable workers are found, set 'noSuitableWorkersFound' to true and return an empty 'suggestions' array.`,
});

const managerJobReassignmentSuggestionFlow = ai.defineFlow(
  {
    name: 'managerJobReassignmentSuggestionFlow',
    inputSchema: ManagerJobReassignmentSuggestionInputSchema,
    outputSchema: ManagerJobReassignmentSuggestionOutputSchema,
  },
  async input => {
    const {output} = await reassignmentPrompt(input);
    return output!;
  }
);
