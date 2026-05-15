import { supabase } from "../supabaseClient";

export type AdaptiveInteractionAction = "accepted" | "dismissed" | "auto_dismissed" | "ignored" | "not_applicable";

export type AdaptiveInteractionLogPayload = {
  participant_code?: string;
  group_number?: number;
  experience: "A" | "B";
  phase: "experiencea" | "experienceb";
  interaction_type: "initial_plan" | "after_reading";
  source_step_id?: string | null;
  target_step_id?: string | null;
  request_payload: unknown;
  response_payload: unknown;
  response_source?: string | null;
  recommendation?: string | null;
  message?: string | null;
  participant_action: AdaptiveInteractionAction;
  participant_action_at?: string | null;
};

export function logAdaptiveInteraction(payload: AdaptiveInteractionLogPayload) {
  void (async () => {
    try {
      const { error } = await supabase
        .from("adaptiveprogressbarinteraction")
        .insert([payload]);

      if (error) console.warn("Adaptive progress interaction log failed", error);
    } catch (error) {
      console.warn("Adaptive progress interaction log failed", error);
    }
  })();
}
