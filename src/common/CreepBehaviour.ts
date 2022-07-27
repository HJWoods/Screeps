import {GameObject, getDirectionFacingTo, getOppositeDirection} from "./Helpers";
import {FiniteStateMachineMap} from "./FiniteStateMachine";
import {GameState} from "./GameState";


type Attackable = Structure | Creep;
type MoveAction = ["MOVE", DirectionConstant];
type MoveToAction = ["MOVETO", GameObject];
type MoveToSafely = ["MOVETOSAFELY", GameObject]; // moveto but with the "danger" pathfinder.
type AttackAction = ["ATTACK", Attackable];
type AttackSafely = ["ATTACKSAFELY", Attackable]; // attack a target while using the "danger" pathfinder to avoid threats.
type RangedAttackAction = ["RANGED_ATTACK", Creep];
type MassRangeAttackAction = ["MASS_RANGED_ATTACK"];
type HealAction = ["HEAL", Creep];
type BuildAction = ["BUILD", ConstructionSite];
type HarvestAction = ["HARVEST", Source];
type TransferAction = ["TRANSFER", ResourceConstant, Creep | Structure];
type WithdrawAction = ["WITHDRAW", Structure, ResourceConstant, number];
type Idle = ["IDLE"];
type Evade = ["EVADE"];
//TODO: implement all the other actions

export type BasicAction = MoveAction | MoveToAction | AttackAction
  | RangedAttackAction | MassRangeAttackAction
  | HealAction | BuildAction | HarvestAction | TransferAction | WithdrawAction | Idle | Evade | MoveToSafely | AttackSafely;


type CreepFSMMap = FiniteStateMachineMap<string, Creep, BasicAction>


export const EVADE_DISTANCE = 20;

function moveInRangeAndDo(creep : Creep, target : GameObject, f: () => void, range : number){
  if(GameState.getDist(creep, target) > range){
    creep.moveTo(target);
  }else{
    f();
  }
}



function moveAlongPath(creep : Creep, path : PathStep[]) {
  if(path.length < 1){
    throw Error("Path is empty");
  }
  let nextStep = path[0];
  let direction = getDirectionFacingTo(creep, nextStep);
  creep.move(direction);
}

function evade(creep : Creep){
  let nearbyHostile = GameState.getClosestByRangeByType("EnemyCreeps", creep);
  nearbyHostile.do((hostile) => {
    let dist = GameState.getDist(creep, hostile);
    if (dist > EVADE_DISTANCE){
      return;
    }
    let direction = getDirectionFacingTo(creep, hostile.pos);
    let oppositeDirection = getOppositeDirection(direction);
    creep.move(oppositeDirection)
  });
}


export class CreepBehaviour {
  private _fsmMap : CreepFSMMap;
  constructor(fsmMap :  CreepFSMMap) {
    this._fsmMap = fsmMap;
  }
  protected getNextAction(key : string, creep: Creep) : BasicAction {
    return this._fsmMap.getAction(key, creep);
  }
  public doAction(creep: Creep, action: BasicAction) {
    let actionType = action[0];
    switch (actionType) {
      case "MOVE":
        creep.move(<DirectionConstant>action[1]);
        break;
      case "MOVETO":
        creep.moveTo(<GameObject>action[1]);
        break;
      case "ATTACK":
        let target = <Attackable>action[1];
        moveInRangeAndDo(creep, target, () => {
          creep.attack(target);
        }, 1);
        break;
      case "RANGED_ATTACK":
        creep.rangedAttack(<Creep>action[1]);
        break;
      case "MASS_RANGED_ATTACK":
        creep.rangedMassAttack();
        break;
      case "HEAL":
        creep.heal(<Creep>action[1]);
        break;
      case "BUILD":
        creep.build(<ConstructionSite>action[1]);
        break;
      case "TRANSFER":
        let resourceType = <ResourceConstant>action[1];
        let container = <Creep | Structure>action[2];
        moveInRangeAndDo(creep, container, () => {
          creep.transfer(container, resourceType);
        }, 1);
        break;
      case "HARVEST":
        let source = <Source>action[1];
        moveInRangeAndDo(creep, source, () => {
          creep.harvest(source);
        }, 1);
        break;
      case "WITHDRAW":
        let structure = <StructureContainer>action[1];
        let resourceConst = <ResourceConstant>action[2];
        let amount = <number>action[3];
        let amountInContainer = structure.store[resourceConst];
        if(amountInContainer === 0){
          console.log(`${creep.id} tried to withdraw ${amount} ${resourceConst} from ${structure.id} but it was empty`);
        }
        let amountToTake = Math.min(amount, amountInContainer);
        moveInRangeAndDo(creep, structure, () => {
          creep.withdraw(structure, resourceConst, amountToTake);
        }, 1);
        break;
      case "EVADE":
        evade(creep);
        break;
      case "IDLE":
        break; // do nothing
      default:
        throw Error("Unknown action type: " + actionType +
          ". Check that it is implemented in CreepBehaviour.doAction()");

    }
  }
  public run(creep: Creep) {
    let key = creep.id;
    let action = this.getNextAction(key, creep);
    console.log(`Running creep ${creep.id} with action ${action}`);
    this.doAction(creep, action);
  }
}
export const creepBehaviours = new Map<string, any>([
  ["harvester", CreepBehaviour],
]);

