

import {Maybe} from "./Maybe";
import {GameState} from "./GameState";



export type GameObject = Creep | Source | StructureContainer | Structure | PowerCreep | Ruin | Flag

export function isCapacityAvailable(store : StoreDefinition, resource : ResourceConstant) : boolean {
  return Maybe.fromValue(store.getFreeCapacity(resource)).do((value) => {
    return value >= 1;
  }).getOrDefault(false);
}
export function findHostileInRange(creep : Creep, range : number) : Maybe<Creep> {
  let hostilesInRange = GameState.findTypeInRange("EnemyCreeps", creep,  range);
  if(hostilesInRange.length < 1) {
    return Maybe.nothing();
  }
  return Maybe.fromValue(<Creep>hostilesInRange[0]);
}


export function getOppositeDirection(direction : DirectionConstant) : DirectionConstant {
  switch(direction) {
    case TOP:
      return BOTTOM;
    case TOP_LEFT:
      return BOTTOM_RIGHT;
    case TOP_RIGHT:
      return BOTTOM_LEFT;
    case BOTTOM:
      return TOP;
    case BOTTOM_LEFT:
      return TOP_RIGHT;
    case BOTTOM_RIGHT:
      return TOP_LEFT;
    default:
      return TOP;
  }
}

export function getDirectionFacingTo(from : GameObject, to : { x : number, y: number }) : DirectionConstant {

  let dx = to.x - from.pos.x;
  let dy = to.y - from.pos.y;

  if(dx === 0 && dy === 0) {
    throw new Error("Cannot get direction to same position");
  }

  if(dy < 0) {
    if(dx > 0) {
      return TOP_RIGHT;
    }else if (dx < 0) {
      return TOP_LEFT;
    }
    return TOP;
  }else{
    if(dx > 0) {
      return BOTTOM_RIGHT;
    }else if (dx < 0) {
      return BOTTOM_LEFT;
    }
    return BOTTOM;
  }
}
