import { createActions } from 'redux-actions';
import * as ActionTypes from '../constants/ActionTypes';

export const { buildTower } = createActions({
  [ActionTypes.BUILD_TOWER]: (type, position) => ({type, position}),
})
