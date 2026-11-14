export const STORY_DISTANCE=2400;
export const MODES=['infinite','story'];
export function validMode(mode){return MODES.includes(mode)?mode:'infinite';}
export function storyComplete(mode,distance){return mode==='story'&&distance>=STORY_DISTANCE;}
