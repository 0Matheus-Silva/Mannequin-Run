export const ENCOUNTER_START=2400, SUPPLY_START=2470, ENCOUNTER_END=3000, REQUIRED_HITS=30;
export const SUPPLY_AMOUNT=3;
export class RescueState {
  constructor(){this.reset();}
  reset(distance=0){this.hits=0;this.claimed=false;this.completed=distance>=2900;}
  update(dt,distance){if(this.completed||distance<ENCOUNTER_START||distance>=ENCOUNTER_END)return false;if(distance>=SUPPLY_START&&!this.claimed){this.claimed=true;return true;}return false;}
  collect(distance,amount=1){if(this.completed||distance<SUPPLY_START||distance>=ENCOUNTER_END||!this.claimed)return 0;const added=Math.min(amount,REQUIRED_HITS-this.hits);this.hits+=added;if(this.hits>=REQUIRED_HITS)this.completed=true;return added;}
}
