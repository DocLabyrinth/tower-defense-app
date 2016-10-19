import * as ActionTypes from '../constants/ActionTypes';
import * as TowerTypes from '../constants/ActionTypes';
import * as ErrorTypes from '../errors/towers';
import { handleActions } from 'redux-actions';


var towerObjKey = (gridX, gridY) => (`${gridX}x${gridY}`);
var towerObj = (type = TowerTypes.DEFAULT_TOWER_TYPE) => {
  return {
    health: 100,
    built: 100,
    upgraded: 0,
    type
  }
}

export default handleActions({
  [ActionTypes.BUILD_TOWER]: (state, action) => {
    const {payload: {position, type: towerType}} = action

    console.log('state', state, 'action', action)

    let towerKey = towerObjKey(position.x, position.y)

    if(state[towerKey]) {
      throw new ErrorTypes.TowerBuildError(
        `A tower already exists at ${position.x}, ${position.y}`
      )
    }

    return {
      ...state,
      [towerKey]: towerObj(towerType)
    }
  }
}, {})
