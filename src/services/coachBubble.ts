import type { AdaptiveThemeId } from "../experiment/adaptiveConfig";

type CoachEvent =
  | "welcome"
  | "steady_progress"
  | "checkpoint_reached"
  | "stall_detected"
  | "probe_off_task";

type CoachBubbleRequest = {
  event: CoachEvent;
  themeId: AdaptiveThemeId;
  readingLabel?: string;
};

const FALLBACK_MESSAGES: Record<CoachEvent, string[]> = {
  welcome: [
    "Pick a vibe and let's make this reading flow feel a little lighter.",
    "You're set up for this one. Choose your theme and we'll move together.",
  ],
  steady_progress: [
    "Nice rhythm. Keep that pace and let the next checkpoint come to you.",
    "Steady progress. You're building momentum one section at a time.",
  ],
  checkpoint_reached: [
    "Checkpoint reached. Take that win and roll into the next section.",
    "Strong work. You cleared that segment and kept the momentum going.",
  ],
  stall_detected: [
    "Take your time. This section may be dense, so moving line by line is enough.",
    "No rush. This part asks for a slower pace, and that's completely fine.",
  ],
  probe_off_task: [
    "Thanks for checking in. Give yourself a moment, then come back to the next sentence.",
    "That happens. Ease back into the passage and take the next few lines slowly.",
  ],
};

function pickFallbackMessage(event: CoachEvent, themeId: AdaptiveThemeId): string {
  const options = FALLBACK_MESSAGES[event];
  const seed = `${event}:${themeId}`;
  const index = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % options.length;
  return options[index];
}

export async function getCoachBubbleMessage({
  event,
  themeId,
  readingLabel,
}: CoachBubbleRequest): Promise<string> {
  const endpoint = import.meta.env.VITE_AI_BUBBLE_ENDPOINT;

  if (!endpoint) {
    return pickFallbackMessage(event, themeId);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        themeId,
        readingLabel,
      }),
    });

    if (!response.ok) {
      throw new Error(`Coach bubble request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { message?: string };
    return payload.message?.trim() || pickFallbackMessage(event, themeId);
  } catch (error) {
    console.error("Coach bubble fallback activated", error);
    return pickFallbackMessage(event, themeId);
  }
}
