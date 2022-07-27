import {CreepPrototype} from "./CreepPrototype";
import {Maybe} from "./Maybe";
import {SpawnedCreep} from "./SpawnedCreep";
import {Squad} from "./SquadManager";
import {GameState} from "./GameState";






export class SpawnManager {


  private static alreadySpawnedThisTick : Id<StructureSpawn>[] = [];

  private static isSpawning(spawn : StructureSpawn) : boolean {
    if(this.alreadySpawnedThisTick.includes(spawn.id)) { // needed to guarantee that two commands aren't issued in one tick
      return true;
    }
    return GameState.getClosestByRangeByType("Creeps", spawn).do((closest) => {
      let distanceFromCreep = GameState.getDist(spawn, closest);
      return distanceFromCreep == 0;
    }).getOrDefault(false);
  }

  private static getInactiveSpawns(roomName : string) : StructureSpawn[] {
    let spawns = GameState.getFriendlySpawns(roomName);
    return spawns.filter(s => !SpawnManager.isSpawning(s));
  }

  public static run(roomName : string) : void {
    this.alreadySpawnedThisTick = [];
    let creepsToSpawn : [squad : Squad, prototype : CreepPrototype][] = [];
    Squad.squads.forEach(squad => {
      let unspawned = squad.getAllUnspawnedPrototypes();
      creepsToSpawn = creepsToSpawn.concat(unspawned.map(prototype => [squad, prototype]));
    });
    creepsToSpawn.forEach(obj => {
      let squad = obj[0];
      let prototype = obj[1];
      let spawn = Maybe.getInArray(SpawnManager.getInactiveSpawns(roomName), 0);
      spawn.do(s => {
        let creep = this.spawnCreep(s, prototype, squad.squadId);
        creep.do(c => squad.creeps.push(c));
      });
    });
  }

  /**
   * Spawns a creep with the given prototype, squadId and creepIndex.
   * @param spawn The spawn to spawn the creep in.
   * @param prototype The prototype of the creep to spawn.
   * @param squadId The squadId of the squad the creep is part of.
   * @private
   */
  private static spawnCreep(spawn : StructureSpawn, prototype : CreepPrototype,
                            squadId : string) : Maybe<SpawnedCreep> {
    if(this.isSpawning(spawn)) {
      throw new Error("Spawn is already spawning!");
    }
    this.alreadySpawnedThisTick.push(spawn.id);
    let spawnResult = spawn.spawnCreep(prototype.body, squadId + "_" + prototype.name + "_" + Game.time);
    if(spawnResult == OK) {
      return Maybe.fromValue(new SpawnedCreep(Game.creeps[squadId + "_" + prototype.name + "_" + Game.time], prototype));
    }
    console.log(`Spawning failed with result ${spawnResult}`);
    return Maybe.nothing();
  }

}
