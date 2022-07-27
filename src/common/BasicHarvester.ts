import {BasicAction, CreepBehaviour} from "./CreepBehaviour";
import {FiniteStateMachine, FiniteStateMachineMap, FSMState} from "./FiniteStateMachine";
import {isCapacityAvailable} from "./Helpers";
import {GameState} from "./GameState";
import {Maybe} from "./Maybe";

const transitions : Map<FSMState, (x : Creep)  => FSMState> = new Map<FSMState, (x : Creep) => FSMState>([
    ["JustSpawned", (creep : Creep) => {
        return "Harvesting";
    }],
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
    ["JustSpawned", (creep : Creep) => {
        return ["IDLE"];
    }],
    ["Idle", (creep : Creep) => {
        return ["IDLE"];
    }],
    ["Harvesting", (creep : Creep) => {
        let nearestSource = GameState.getClosestByRangeByType("EnergySources", creep);
        console.log(`nearestSource ${nearestSource.isNothing()}`);
        if(!nearestSource.isNothing()) {
          let source = nearestSource.get() as Source;
          return ["HARVEST", source];
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
const FSM = new FiniteStateMachine("JustSpawned", transitions, actions, ["IDLE"]);
const FSMMap = new FiniteStateMachineMap<string, Creep, BasicAction>(FSM);
export const BasicHarvester = new CreepBehaviour(FSMMap);
