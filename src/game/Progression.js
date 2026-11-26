export const STORY_DISTANCE=3000;
export const MODES=['infinite','story'];
export function validMode(mode){return MODES.includes(mode)?mode:'infinite';}
export function storyComplete(mode,distance){return mode==='story'&&distance>=STORY_DISTANCE;}
