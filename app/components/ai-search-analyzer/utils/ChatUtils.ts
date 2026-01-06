export const cleanJsonString = (str: string): string => {
    let cleaned = str.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(json)?\s*/, '').replace(/\s*```$/, '');
    }
    return cleaned;
};

export const extractReply = (content: string): string => {
    let textToRender = content;
    let potentialJson = cleanJsonString(content);

    // If it looks like a JSON object and contains "reply", try to parse it
    if (potentialJson.startsWith('{') && potentialJson.includes('"reply"')) {
        try {
            const parsed = JSON.parse(potentialJson);
            if (parsed.reply) {
                textToRender = parsed.reply;
            }
        } catch (e) {
            // Ignore parsing errors, return original content
        }
    }
    return textToRender;
};

export const parseApiResponse = (response: string): { content: string; query?: string } => {
    let content = response;
    let query = "";

    try {
        const parsed = JSON.parse(response);
        if (parsed.reply) {
            content = parsed.reply;

            if (parsed.query && parsed.query.trim() && parsed.query !== "null") {
                try {
                    const queryParsed = JSON.parse(parsed.query);
                    query = JSON.stringify(queryParsed, null, 2);
                } catch (e) {
                    query = parsed.query;
                }
            }
        }
    } catch (e) {
        // Not JSON, use as-is
    }

    return { content, query };
};
