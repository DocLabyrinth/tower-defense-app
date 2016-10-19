import DiagonalMovement from '../vendor/pathfinding/DiagonalMovement'
import forever from 'async/forever';
import doUntil from 'async/doUntil'

export default function findPathAsync(destX, destY, oldGrid) {
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
};
