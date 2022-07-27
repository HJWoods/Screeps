import {BasicAction, CreepBehaviour} from "./CreepBehaviour";
import {FiniteStateMachine, FiniteStateMachineMap, FSMState} from "./FiniteStateMachine";
import {isCapacityAvailable} from "./Helpers";
import {GameState} from "./GameState";
import {Maybe} from "./Maybe";

const transitions : Map<FSMState, (x : Creep)  => FSMState> = new Map<FSMState, (x : Creep) => FSMState>([
  ["Idle", (creep : Creep) => {
    return "Idle";
  }],
  ["Harvesting", (creep : Creep) => {
    if(!isCapacityAvailable(creep.store, RESOURCE_ENERGY)) {
      return "StoreEnergy";
    }
    return "Harvesting";
  }],
  ["StoreEnergy", (creep : Creep) => {
    if(isCapacityAvailable(creep.store, RESOURCE_ENERGY)) {
      return "Harvesting";
    }
    return "StoreEnergy";
  }],
]);
const actions : Map<FSMState, (x : Creep) => BasicAction> = new Map<FSMState, (x : Creep) => BasicAction>([
  ["Harvesting", (creep : Creep) => {
    let nearestContainer = GameState.getNearestContainerWithContents(creep, RESOURCE_ENERGY);
    if(!nearestContainer.isNothing()) {
      let source = nearestContainer.get() as StructureContainer;
      let creepCapacity = Maybe.fromValue(creep.store.getFreeCapacity(RESOURCE_ENERGY));
      if(creepCapacity.isNothing()) {
        return ["IDLE"];
      }
      return ["WITHDRAW", source, RESOURCE_ENERGY, creepCapacity.get()];
    }
    return ["IDLE"];
  }],
  ["StoreEnergy", (creep : Creep) => {
    let nearestSpawn = GameState.getClosestByRangeByType("Spawns", creep);
    if(!nearestSpawn.isNothing()) {
      let spawn = nearestSpawn.getOrError("") as Structure<STRUCTURE_SPAWN>;
      return ["TRANSFER", RESOURCE_ENERGY, spawn];
    }
    return ["IDLE"];
  }]
]);
const FSM = new FiniteStateMachine("Harvesting", transitions, actions, ["IDLE"]);
const FSMMap = new FiniteStateMachineMap<string, Creep, BasicAction>(FSM);
export const BasicSpawner = new CreepBehaviour(FSMMap);
