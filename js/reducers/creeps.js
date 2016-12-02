import * as ActionTypes from '../constants/ActionTypes';
import * as GameObjectStates from '../constants/GameObjectStates';
import { handleActions } from 'redux-actions';

var creepObj = (id, type) => {
  return {
    id,
    type,
    health: 100,
    // state: GameObjectStates.CREEP_NEW
    state: GameObjectStates.CREEP_ALIVE
  }
}

export default handleActions({
    [ActionTypes.CREEP_SPAWN]: (state, { payload: { type, position } }) => {
      let nextCreepId = state.nextId + 1

      return  {
        ...state,
        nextId: nextCreepId,
        active: {
          ...state.active,
          [nextCreepId]: creepObj(nextCreepId, 'CREEP_DEFAULT')
        }
      }
    },
    [ActionTypes.CREEP_STATE_CHANGE]: (state, { payload: { id, newState } }) => {
      if(!state.active[id]) {
        throw new Error(`Attempted to set state ${newState} on creep with non-existent id ${id}`)
      }

      return  {
        ...state,
        active: {
          ...state.active,
          [id]: {
            ...state.active[id],
            state: newState
          }
        }
      }

    }
  },
  {
    nextId: 0,
    active: {}
  }
)
