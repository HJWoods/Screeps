import {FiniteStateMachine, FiniteStateMachineMap, FSMState} from "./FiniteStateMachine";
import {BasicAction, CreepBehaviour} from "./CreepBehaviour";
import {GameState} from "./GameState";
import {Squad} from "./SquadManager";
import {HarvesterPrototype} from "./CreepPrototype";
import {Maybe} from "./Maybe";
import {findHostileInRange} from "./Helpers";

function getHarvester(creep : Creep) : Maybe<Creep> {
  let squad = Squad.getCreepSquad(creep);
  let harvesters = squad.getCreepsByPrototype(HarvesterPrototype);
  return Maybe.fromValue(harvesters[0]).do(h => {
    return h.getCreep();
  });
}




const transitions : Map<FSMState, (x : Creep)  => FSMState> = new Map<FSMState, (x : Creep) => FSMState>([
  ["JustSpawned", (creep : Creep) => {
    return "OrbitCreep";
  }],
  ["OrbitCreep", (creep : Creep) => {
    let hostileInRange = findHostileInRange(creep, 10);
    if(!hostileInRange.isNothing()) {
      return "Attacking";
    }
    return "OrbitCreep";
  }],
  ["Attacking", (creep : Creep) => {
     let hostileInRange = findHostileInRange(creep, 10);
     if(hostileInRange.isNothing()) {
         return "OrbitCreep";
     }
    return "Attacking";
  }],
]);
const actions : Map<FSMState, (x : Creep) => BasicAction> = new Map<FSMState, (x : Creep) => BasicAction>([
  ["JustSpawned", (creep : Creep) => {
    return ["IDLE"];
  }],
  ["OrbitCreep", (creep : Creep) => {
    let creepToOrbit = getHarvester(creep);
    if(creepToOrbit.isNothing()) {
        return ["IDLE"];
    }
    return ["MOVETO", creepToOrbit.get()];
  }],
  ["Attacking", (creep : Creep) => {
    let hostileInRange = findHostileInRange(creep, 10);
    if(hostileInRange.isNothing()) {
      return ["IDLE"];
    }
    return ["ATTACK", hostileInRange.get()];
  }]
]);
const FSM = new FiniteStateMachine("OrbitCreep", transitions, actions, ["IDLE"]);
const FSMMap = new FiniteStateMachineMap<string, Creep, BasicAction>(FSM);
export const GuardianCreep = new CreepBehaviour(FSMMap);
