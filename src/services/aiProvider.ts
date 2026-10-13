// AI Provider Abstraction Layer for CreatorFlow AI

export interface AIProviderStatus {
  activeProvider: "openai" | "anthropic" | "gemini" | "demo";
  isConfigured: boolean;
  hasOpenAI: boolean;
  hasAnthropic: boolean;
  hasGemini: boolean;
  modelName: string;
}

export function getAIProviderStatus(): AIProviderStatus {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  let activeProvider: "openai" | "anthropic" | "gemini" | "demo" = "demo";
  let modelName = "Deterministic Creator Engine (Demo Mode)";

  if (process.env.AI_PROVIDER === "openai" && hasOpenAI) {
    activeProvider = "openai";
    modelName = "OpenAI GPT-4o";
  } else if (process.env.AI_PROVIDER === "anthropic" && hasAnthropic) {
    activeProvider = "anthropic";
    modelName = "Claude 3.5 Sonnet";
  } else if (process.env.AI_PROVIDER === "gemini" && hasGemini) {
    activeProvider = "gemini";
    modelName = "Gemini 1.5 Pro";
  } else if (hasOpenAI) {
    activeProvider = "openai";
    modelName = "OpenAI GPT-4o";
  } else if (hasAnthropic) {
    activeProvider = "anthropic";
    modelName = "Claude 3.5 Sonnet";
  } else if (hasGemini) {
    activeProvider = "gemini";
    modelName = "Gemini 1.5 Pro";
  }

  return {
    activeProvider,
    isConfigured: activeProvider !== "demo",
    hasOpenAI,
    hasAnthropic,
    hasGemini,
    modelName,
  };
}

export async function callLLM(prompt: string, systemPrompt?: string): Promise<{ text: string; isDemo: boolean }> {
  const status = getAIProviderStatus();

  if (status.activeProvider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { text: data.choices[0]?.message?.content || "", isDemo: false };
      }
    } catch (err) {
      console.warn("Live OpenAI call failed, falling back to deterministic engine:", err);
    }
  }

  // Fallback to deterministic AI engine
  return {
    text: "",
    isDemo: true,
  };
}
