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

type AfterReadingRequest = {
  event: "after_reading";
  language?: string;
  currentCheckpointCount: number;
  scrollDirectionChanges: number;
  probeResponse?: string;
  probeResponseTimeMs?: number | null;
  longestNoScrollMs?: number | null;
};

type AdaptiveRequest = InitialPlanRequest | AfterReadingRequest;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.4-mini";

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
      "Create an adaptive checkpoint plan for a reading according to the following data. Use natural topic boundaries that make sense for the reader. Suggest more checkpoints if ASRS is high and if readings are longer and more complex, do the opposite if ASRS is low and readings are less complex.",
    language: input.language ?? "en",
    asrsPartAScore: input.asrsPartAScore ?? null,
    asrsClassification: input.asrsClassification ?? null,
    rules: [
      "Recommend between 1 and 4 checkpoints.",
      "Use 4 only for very dense or high-support cases.",
      "Use 1 only for very easy or very short readings.",
      "Return paragraph boundaries as 1-based paragraph indexes.",
      "The number of checkpoint boundary objects for each reading must be checkpointCount - 1.",
      "The chunks of text should be of similar lengths but making sure that the checkpoints fall on natural topic or subtopic boundaries when possible. Avoid splitting paragraphs.",
      "Write every participant-facing string, including reason and checkpoint labels, in the requested language.",
    ],
    readings,
  };
}

function buildSuggestionPrompt(input: AfterReadingRequest) {
  return {
    task:
      "Suggest whether to adjust checkpoint frequency for the next reading in a reading-comprehension experiment. The participant must always decide whether to apply the change.",
    event: input.event,
    language: input.language ?? "en",
    currentCheckpointCount: input.currentCheckpointCount,
    scrollDirectionChanges: input.scrollDirectionChanges,
    probeResponse: input.probeResponse ?? null,
    probeResponseTimeMs: input.probeResponseTimeMs ?? null,
    longestNoScrollMs: input.longestNoScrollMs ?? null,
    rules: [
      "Suggestions target next_reading.",
      "Base the recommendation only on the previous reading's probe result, raw probe response time, and scrolling behaviour.",
      "Do not use total reading completion time. Slow reading can reflect careful, detailed reading.",
      "Scrolling behaviour is represented by scrollDirectionChanges: higher values mean more back-and-forth movement; low values mean steadier downward progress.",
      "longestNoScrollMs is the longest pause without scrolling during the reading. Treat only unusually long pauses as possible distraction; normal pauses may reflect careful reading.",
      "Use probeResponseTimeMs as a raw signal. Decide from the context whether it seems meaningfully long; do not apply a fixed cutoff blindly.",
      "Suggest add_checkpoint if scrolling was erratic, the probe was off-task, probe response time was meaningfully long, or longestNoScrollMs suggests a substantial pause.",
      "Suggest reduce_checkpoints only if scrolling was steady, the probe was task-focused, probe response time was not meaningfully long, longestNoScrollMs was not concerning, and currentCheckpointCount is above 1.",
      "Suggest keep_same if the plan appears appropriate.",
      "Use a concise, friendly, formative-feedback tone. The message should support the participant and should not make them feel judged.",
      "Do not mention behavioural metrics directly. Do not say things like 'you scrolled a lot', 'you paused for a long time', 'your probe response was slow', or name any metric.",
      "If recommending more checkpoints, frame it around the text or reading support, for example that the previous text may have been complex and smaller sections could help.",
      "If recommending fewer checkpoints or keeping the same plan, give positive feedback that the current setup seems to be working well.",
      "Frame recommendations as a choice or question; the participant must always decide.",
      "Write the participant-facing message in the requested language.",
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
      enum: ["next_reading"],
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
