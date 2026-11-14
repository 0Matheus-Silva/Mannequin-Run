export const ASSISTANT_CONFIG=Object.freeze(await (await fetch(new URL('../../assets/assistant/live-config.json',import.meta.url))).json());
export const LIVE_ENDPOINT='wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
