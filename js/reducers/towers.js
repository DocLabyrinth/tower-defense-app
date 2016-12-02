import * as ActionTypes from '../constants/ActionTypes';
import * as TowerTypes from '../constants/TowerTypes';
import * as GameObjectStates from '../constants/GameObjectStates';
import {TowerError} from '../errors/towers';
import { handleActions } from 'redux-actions';


export var towerObjKey = (gridX, gridY) => (`${gridX}x${gridY}`);
var towerObj = (towerOpts) => {
  return {
    type: TowerTypes.DEFAULT_TOWER_TYPE,
    // state: GameObjectStates.TOWER_NEW,
    state: GameObjectStates.TOWER_READY,
    health: 100,
    built: 100,
    upgraded: 0,
    ...towerOpts
  }
}

export default handleActions({
  [ActionTypes.TOWER_BUILD]: (state, action) => {
    const {payload: {position, type: towerType}} = action

    let towerKey = towerObjKey(position.x, position.y)

    if(state[towerKey]) {
      throw new TowerError(
        `A tower already exists at ${position.x}, ${position.y}`
      )
    }

    return {
      ...state,
      [towerKey]: towerObj({
        positionKey: towerKey,
        type: towerType,
        position
      })
    }
  },

  [ActionTypes.TOWER_STATE_CHANGE]: (state, action) => {
    const {payload: {position, towerState: newTowerState}} = action

    let towerKey = towerObjKey(position.x, position.y)

    if(!state[towerKey]) {
      throw new TowerError(
        `There is no tower at ${position.x}, ${position.y}`
      )
    }

    return {
      ...state,
      [towerKey]: {
        ...state[towerKey],
        state: newTowerState
      }
    }
  }
}, {})
