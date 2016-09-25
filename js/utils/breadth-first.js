import DiagonalMovement from '../vendor/pathfinding/DiagonalMovement'
import forever from 'async/forever';
import Promise from 'bluebird'
import doUntil from 'async/doUntil'

export function findPathAsync(destX, destY, oldGrid) {
  return new Promise(function(resolve, reject) {
    var openList = [],
        grid = oldGrid.clone();
        var destNode = grid.getNodeAt(destX, destY);

    // push the start pos into the queue
    openList.push(destNode);
    destNode.opened = true;

    doUntil(
      function(callback) {
        var node = openList.shift()

        grid.getNeighbors(node, DiagonalMovement.Never).forEach(function(neighbor) {
          if(neighbor.closed || neighbor.opened) {
            return;
          }

          neighbor.opened = true
          neighbor.parent = node
          openList.push(neighbor)
        });

        callback()
      },
      function() { return openList.length < 1 },
      function(err) {
        if(err) {
          reject(err)
        }
        else {
          resolve(grid)
        }
      }
    )
  })

    // while (openList.length) {
    //     // take the front node from the queue
    //     node = openList.shift();
    //     node.closed = true;
    //
    //     neighbors = grid.getNeighbors(node, diagonalMovement);
    //     for (i = 0, l = neighbors.length; i < l; ++i) {
    //         neighbor = neighbors[i];
    //
    //         // skip this neighbor if it has been inspected before
    //         if (neighbor.closed || neighbor.opened) {
    //             continue;
    //         }
    //
    //         openList.push(neighbor);
    //         neighbor.opened = true;
    //         neighbor.parent = node;
    //     }
    // }
    //
    // // fail to find the path
    // return [];
};
