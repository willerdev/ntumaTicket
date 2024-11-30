import { supabase } from "@/integrations/supabase/client";
import { sampleEvents } from "@/data/sampleEvents";

export async function seedEvents() {
  try {
    const { data: existingEvents } = await supabase
      .from("events")
      .select("id")
      .limit(1);

    if (!existingEvents?.length) {
      const { data, error } = await supabase
        .from("events")
        .insert(sampleEvents)
        .select();

      if (error) throw error;
      console.log("Events seeded successfully:", data);
    }
  } catch (error) {
    console.error("Error seeding events:", error);
  }
}