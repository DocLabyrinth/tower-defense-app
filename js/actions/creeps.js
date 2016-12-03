import { createActions } from 'redux-actions';
import * as ActionTypes from '../constants/ActionTypes';

export const { creepSpawn, creepStateChange } = createActions({
  [ActionTypes.CREEP_SPAWN]: (position, type) => ({position, type}),
  [ActionTypes.CREEP_MOVE]: (id, newPosition) => ({id, newPosition}),
  [ActionTypes.CREEP_STATE_CHANGE]: (id, newState) => ({id, newState}),
})
