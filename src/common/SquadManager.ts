
import {SpawnedCreep} from "./SpawnedCreep";
import {SquadPrototype} from "./SquadPrototype";
import {Maybe} from "./Maybe";
import {CreepPrototype} from "./CreepPrototype";

export class Squad {
  public prototype: SquadPrototype;
  public creeps: SpawnedCreep[] = [];
  public squadId: string;
  public static squads: Map<string, Squad> = new Map<string, Squad>;

  constructor(prototype: SquadPrototype, spawnPriority: number, squadId: string) {
    this.prototype = prototype;
    Squad.squads.set(squadId, this);
    this.squadId = squadId;
  }


  public getCreepsByPrototype(prototype: CreepPrototype): SpawnedCreep[] {
    return this.creeps.filter(sCreep => sCreep._prototype === prototype && !sCreep.isDead());
  }

  public getNumberOfCreepsByPrototype(prototype: CreepPrototype): number {
    return this.getCreepsByPrototype(prototype).length;
  }

  public getAllUnspawnedPrototypes(): CreepPrototype[] {
    let allPrototypes = this.prototype.creepPrototypes;
    let result: CreepPrototype[] = [];
    allPrototypes.forEach(obj => {
      let prototype = obj.prototype;
      let quantity = obj.quantity;
      let numberOfCreeps = this.getNumberOfCreepsByPrototype(prototype);
      for (let i = 0; i < quantity - numberOfCreeps; i++) {
        result.push(prototype);
      }
    });
    return result;
  }


  public run(): void {
    //this.cleanupDeadCreeps();
    this.creeps.forEach(sCreep => {
      if (sCreep.doesExist()) {
        sCreep.run();
      }
    });
  }

  public static run(): void {
    Squad.squads.forEach(squad => squad.run());
  }

  public static getSquadById(squadId: string): Squad {
    return Maybe.fromValue(Squad.squads.get(squadId)).getOrError("Squad not found: " + squadId);
  }

  public static getCreepSquad(creep: Creep): Squad {
    let squadId = creep.name.split("_")[0];
    return Squad.getSquadById(squadId);
  }
}

