import {FiniteStateMachine, FiniteStateMachineMap, FSMState} from "./FiniteStateMachine";
import {BasicAction, CreepBehaviour, EVADE_DISTANCE} from "./CreepBehaviour";
import {GameState} from "./GameState";
import {Squad} from "./SquadManager";
import {HarvesterPrototype} from "./CreepPrototype";
import {Maybe} from "./Maybe";

function getHarvester(creep : Creep) : Maybe<Creep> {
  let squad = Squad.getCreepSquad(creep);
  let harvesters = squad.getCreepsByPrototype(HarvesterPrototype);
  return Maybe.fromValue(harvesters[0]).do(h => {
    return h.getCreep();
  });
}




function findHostileInRange(creep : Creep, range : number) : Maybe<Creep> {
  let hostilesInRange = GameState.findTypeInRange("EnemyCreeps", creep,  range);
  if(hostilesInRange.length < 1) {
    return Maybe.nothing();
  }
  return Maybe.fromValue(<Creep>hostilesInRange[0]);
}



const transitions : Map<FSMState, (x : Creep)  => FSMState> = new Map<FSMState, (x : Creep) => FSMState>([
  ["AttackSpawn", (creep : Creep) => {
    return "AttackSpawn";
  }],
]);
const actions : Map<FSMState, (x : Creep) => BasicAction> = new Map<FSMState, (x : Creep) => BasicAction>([
  ["AttackSpawn", (creep : Creep) => {
    let hostileInRange = findHostileInRange(creep, EVADE_DISTANCE);
    if(!hostileInRange.isNothing()) {
      return ["ATTACK", hostileInRange.get()];
    }
    let enemySpawn = GameState.getClosestByRangeByType("EnemySpawns", creep);
    if(enemySpawn.isNothing()) {
      return ["IDLE"];
    }
    return ["ATTACKSAFELY", <StructureSpawn>enemySpawn.get()];
  }],
]);
const FSM = new FiniteStateMachine("AttackSpawn", transitions, actions, ["IDLE"]);
const FSMMap = new FiniteStateMachineMap<string, Creep, BasicAction>(FSM);
export const Zerg = new CreepBehaviour(FSMMap);
