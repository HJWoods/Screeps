import {
  CreepPrototype,
  GuardianCreepPrototype,
  HarvesterPrototype,
  SpawnerPrototype,
  ZergPrototype
} from "./CreepPrototype";
import {GuardianCreep} from "./GuardianCreep";

export const squadPrototypes = new Map<string, CreepPrototype>([
  ["harvester", HarvesterPrototype]
]);

export class SquadPrototype {
  constructor(public creepPrototypes : {prototype : CreepPrototype, quantity : number}[]) {

  }
}



export const BasicHarvesterSquadPrototype = new SquadPrototype(
  [{prototype: HarvesterPrototype, quantity: 3}]);


export const BasicSpawnerSquadPrototype = new SquadPrototype(
  [{prototype: SpawnerPrototype, quantity: 1}, {prototype: GuardianCreepPrototype, quantity: 2}]);

export const ZergSquadPrototype = new SquadPrototype([{prototype: ZergPrototype, quantity: 10}]);
