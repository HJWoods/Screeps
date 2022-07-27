import {CreepBehaviour} from "./CreepBehaviour";
import {BasicHarvester} from "./BasicHarvester";
import {GuardianCreep} from "./GuardianCreep";
import {BasicSpawner} from "./Spawner";
import {Zerg} from "./Zerg";

type BodyPart = WORK | MOVE | CARRY | ATTACK | HEAL | TOUGH;
type CreepBody = BodyPart[];


export class CreepPrototype {
  constructor(public name : string, public body: CreepBody, public behaviour: CreepBehaviour) {

  }
}


export const HarvesterPrototype = new CreepPrototype("Harvester", [WORK, CARRY, MOVE], BasicHarvester)
export const GuardianCreepPrototype = new CreepPrototype("GuardianCreep", [MOVE,
  ATTACK, ATTACK, ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE], GuardianCreep)
export const SpawnerPrototype = new CreepPrototype("Spawner", [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], BasicSpawner);
export const ZergPrototype = new CreepPrototype("Zerg", [ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], Zerg);
