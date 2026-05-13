type InitialPlanRequest = {
  event: "initial_plan";
  language?: string;
  asrsPartAScore?: number;
  asrsClassification?: string;
  readings: Array<{
    stepId: string;
    label: string;
    text: string;
    questionCount: number;
  }>;
};

type DuringReadingRequest = {
  event: "during_reading";
  language?: string;
  currentCheckpointCount: number;
  readingProgressPercent: number;
  scrollDirectionChanges: number;
  secondsWithoutProgress?: number;
  probeResponse?: string;
};

type AfterReadingRequest = {
  event: "after_reading";
  language?: string;
  currentCheckpointCount: number;
  readingDurationMs: number | null;
  expectedDurationMs: number;
  scrollDirectionChanges: number;
  probeResponse?: string;
};

type AdaptiveRequest = InitialPlanRequest | DuringReadingRequest | AfterReadingRequest;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function clampCheckpointCount(value: unknown) {
  const count = Math.round(Number(value));
  if (!Number.isFinite(count)) return 3;
  return Math.max(1, Math.min(5, count));
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function buildInitialPrompt(input: InitialPlanRequest) {
  const readings = input.readings.map((reading) => ({
    stepId: reading.stepId,
    label: reading.label,
    wordCount: countWords(reading.text),
    questionCount: reading.questionCount,
    paragraphs: reading.text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  }));

  return {
    task:
      "Create an adaptive checkpoint plan for a reading-comprehension experiment. Use natural topic boundaries. Do not make clinical claims. ASRS is only a self-report research measure.",
    language: input.language ?? "en",
    asrsPartAScore: input.asrsPartAScore ?? null,
    asrsClassification: input.asrsClassification ?? null,
    rules: [
      "Recommend 1 to 5 checkpoints.",
      "Most 500-700 word academic readings should use 3 or 4 checkpoints.",
      "Use 5 only for very dense or high-support cases.",
      "Use 1 only for very easy or very short readings.",
      "Return paragraph boundaries as 1-based paragraph indexes.",
      "The number of checkpoint boundary objects for each reading must be checkpointCount - 1.",
      "Keep labels short and participant-friendly.",
    ],
    readings,
  };
}

function buildSuggestionPrompt(input: DuringReadingRequest | AfterReadingRequest) {
  return {
    task:
      "Suggest whether to adjust checkpoint frequency for a reading-comprehension experiment. The participant must always decide whether to apply the change.",
    event: input.event,
    language: input.language ?? "en",
    currentCheckpointCount: input.currentCheckpointCount,
    scrollDirectionChanges: input.scrollDirectionChanges,
    probeResponse: input.probeResponse ?? null,
    readingProgressPercent: "readingProgressPercent" in input ? input.readingProgressPercent : null,
    secondsWithoutProgress: "secondsWithoutProgress" in input ? input.secondsWithoutProgress ?? null : null,
    readingDurationMs: "readingDurationMs" in input ? input.readingDurationMs : null,
    expectedDurationMs: "expectedDurationMs" in input ? input.expectedDurationMs : null,
    rules: [
      "during_reading suggestions target current_reading.",
      "after_reading suggestions target next_reading.",
      "Suggest add_checkpoint if reading is slow, erratic, or probe is off-task.",
      "Suggest reduce_checkpoints only if reading is smooth and fast, and currentCheckpointCount is above 1.",
      "Suggest keep_same if the plan appears appropriate.",
      "Use a concise, friendly message framed as a question when recommending a change.",
    ],
  };
}

const initialPlanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    recommendedCheckpoints: { type: "integer", minimum: 1, maximum: 5 },
    reason: { type: "string" },
    options: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "integer", minimum: 1, maximum: 5 },
    },
    readings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          stepId: { type: "string" },
          checkpointCount: { type: "integer", minimum: 1, maximum: 5 },
          checkpoints: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                afterParagraph: { type: "integer", minimum: 1 },
                label: { type: "string" },
              },
              required: ["afterParagraph", "label"],
            },
          },
        },
        required: ["stepId", "checkpointCount", "checkpoints"],
      },
    },
  },
  required: ["recommendedCheckpoints", "reason", "options", "readings"],
};

const suggestionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    recommendation: {
      type: "string",
      enum: ["add_checkpoint", "reduce_checkpoints", "keep_same"],
    },
    target: {
      type: "string",
      enum: ["current_reading", "next_reading"],
    },
    message: { type: "string" },
  },
  required: ["recommendation", "target", "message"],
};

async function callOpenAI(prompt: unknown, schema: Record<string, unknown>, schemaName: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return { error: "OPENAI_API_KEY is not set" };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "You are an adaptive reading support planner for a controlled research experiment. Return only data matching the provided schema. Do not include participant identifiers. Do not diagnose or label the participant.",
        },
        {
          role: "user",
          content: JSON.stringify(prompt),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          schema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    return { error: await response.text() };
  }

  const data = await response.json();
  const text = data.output_text ?? data.output?.[0]?.content?.[0]?.text;
  if (!text) {
    return { error: "OpenAI response did not contain output text" };
  }

  return { data: JSON.parse(text) };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: AdaptiveRequest;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  try {
    if (body.event === "initial_plan") {
      const prompt = buildInitialPrompt(body);
      const result = await callOpenAI(prompt, initialPlanSchema, "adaptive_initial_checkpoint_plan");
      if ("error" in result) return jsonResponse({ error: result.error }, 502);

      const response = result.data as {
        recommendedCheckpoints: number;
        readings: Array<{ checkpointCount: number }>;
      };
      response.recommendedCheckpoints = clampCheckpointCount(response.recommendedCheckpoints);
      response.readings = response.readings.map((reading) => ({
        ...reading,
        checkpointCount: clampCheckpointCount(reading.checkpointCount),
      }));
      return jsonResponse(response);
    }

    const prompt = buildSuggestionPrompt(body);
    const result = await callOpenAI(prompt, suggestionSchema, "adaptive_checkpoint_suggestion");
    if ("error" in result) return jsonResponse({ error: result.error }, 502);

    return jsonResponse(result.data);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
