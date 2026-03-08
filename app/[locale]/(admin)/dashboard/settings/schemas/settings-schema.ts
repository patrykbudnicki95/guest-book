import { z } from "zod";

export const eventSettingsFormSchema = z.object({
  names: z.string().min(1, "Nazwa jest wymagana"),
  date: z.string().min(1, "Data jest wymagana"),
  location: z.string().optional(),
  theme_color: z.string().optional(),
});

export type EventSettingsFormValues = z.infer<typeof eventSettingsFormSchema>;
