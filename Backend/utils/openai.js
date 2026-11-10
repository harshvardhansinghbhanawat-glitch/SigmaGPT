import "dotenv/config";

/**
 * Check if a valid OpenAI API key has been supplied.
 * Returns false if missing, blank, or placeholder.
 */
export const isApiKeyConfigured = () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key || typeof key !== "string") return false;
    const trimmed = key.trim();
    if (trimmed.length === 0) return false;
    if (trimmed === "your_openai_api_key" || trimmed === "your_openai_api_key_here") return false;
    if (trimmed.startsWith("sk-placeholder") || trimmed === "sk-...") return false;
    return true;
};

/**
 * Get response from OpenAI or return a clear configuration guidance message.
 * Never hardcodes keys and never crashes if the key is missing.
 */
const getOpenAIAPIResponse = async (message, model = "gpt-4o-mini") => {
    if (!isApiKeyConfigured()) {
        return (
            "⚠️ **OpenAI API Key Not Configured**\n\n" +
            "SigmaGPT requires an OpenAI API key to generate live AI responses. " +
            "To connect your OpenAI account:\n\n" +
            "1. Open `Backend/.env` (or copy from `Backend/.env.example`)\n" +
            "2. Set your API key:\n" +
            "```env\nOPENAI_API_KEY=sk-your-actual-key-here\n```\n" +
            "3. Restart the backend server.\n\n" +
            "*Note: Non-AI features (user registration, login, chat thread history, plan upgrades, and profile settings) are fully active and saved in your database.*"
        );
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY.trim()}`
        },
        body: JSON.stringify({
            model: model || "gpt-4o-mini",
            messages: [{
                role: "user",
                content: message
            }]
        })
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", options);
        const data = await response.json();

        if (!response.ok) {
            const apiError = data?.error?.message || `OpenAI request failed with status ${response.status}`;
            console.warn(`[SigmaGPT Backend] OpenAI API error: ${apiError}`);
            return (
                `⚠️ **OpenAI Service Notice**\n\n` +
                `The OpenAI API returned an error: *${apiError}*\n\n` +
                `Please verify your API key and billing limits in \`Backend/.env\`.`
            );
        }

        if (!data?.choices?.[0]?.message?.content) {
            throw new Error("No response content received from OpenAI");
        }

        return data.choices[0].message.content;
    } catch (err) {
        console.error("[SigmaGPT Backend] OpenAI execution error:", err.message);
        return (
            `⚠️ **AI Service Communication Error**\n\n` +
            `Could not communicate with OpenAI: *${err.message}*\n\n` +
            `Check your internet connection and OpenAI API configuration.`
        );
    }
};

export default getOpenAIAPIResponse;
