// javascript-astar 0.4.1
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

// Adapted by SembeiNorimaki

class AStar {
  constructor() {
    // this.boardSize = createVector(grid[0].length, grid.length);
    // this.grid = grid;

    this.boardSize = game.currentScene.base.tileBoard.boardDim;
    this.nodes = {};

    this.idToColor = {
      0: (255,255,255),
      1: (100,100,100)
    };
  }
  
  getHeap() {
    return new BinaryHeap(function(node) {
      return node.f;
    });
  }

  pathTo(node) {
    let curr = node;
    let path = [];
    while (curr.parent) {
      path.unshift(curr.pos);
      curr = curr.parent;
    }
    return path;
  }


  search(startPos, endPos) {
    try {
      this.nodes[`${startPos.x},${startPos.y}`] = new Node(createVector(startPos.x, startPos.y), game.currentScene.base.tileBoard.board[startPos.y][startPos.x].isWall());  
      this.nodes[`${endPos.x},${endPos.y}`] = new Node(createVector(endPos.x, endPos.y), game.currentScene.base.tileBoard.board[endPos.y][endPos.x].isWall());  
    } catch {
      console.log("Error")
    }

    let heuristic = this.diagonal;

    let openHeap = this.getHeap();
    openHeap.push(this.nodes[`${startPos.x},${startPos.y}`]);

    while(openHeap.size() > 0) {
      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      let currentNode = openHeap.pop();
      
      // End case -- result has been found, return the traced path.
      if (currentNode.pos.equals(endPos)) {
        return this.pathTo(currentNode);
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node.
      let neighbors = this.neighbors(currentNode);

      for (let neighbor of neighbors) {
        if (neighbor.closed || neighbor.isWall) {
          // Not a valid node to process, skip to next neighbor.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        let gScore = currentNode.g + neighbor.getCost();
        let beenVisited = neighbor.visited;
        
        if (!beenVisited || gScore < neighbor.g) {
          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = heuristic(neighbor.pos, endPos);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }
  }

  manhattan(pos0, pos1) {
    return abs(pos0.x - pos1.x) + abs(pos0.y - pos1.y);
  }

  diagonal(pos0, pos1) {
    let D = 1;
    let D2 = Math.sqrt(2);
    let d1 = Math.abs(pos1.x - pos0.x);
    let d2 = Math.abs(pos1.y - pos0.y);
    return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
  }

  neighbors(node) {
    let ret = [];
    
    if (node.pos.x > 0) {  // West
      if (`${node.pos.x-1},${node.pos.y}` in this.nodes === false) {
        this.nodes[`${node.pos.x-1},${node.pos.y}`] = new Node(createVector(node.pos.x-1, node.pos.y), game.currentScene.base.tileBoard.board[node.pos.y][node.pos.x-1].isWall());  
      } 
      ret.push(this.nodes[`${node.pos.x-1},${node.pos.y}`]);
    }
    if (node.pos.y > 0) {  // North
      if (`${node.pos.x},${node.pos.y-1}` in this.nodes === false) {
        this.nodes[`${node.pos.x},${node.pos.y-1}`] = new Node(createVector(node.pos.x, node.pos.y-1), game.currentScene.base.tileBoard.board[node.pos.y-1][node.pos.x].isWall());  
      } 
      ret.push(this.nodes[`${node.pos.x},${node.pos.y-1}`]);
    }
    if (node.pos.x < this.boardSize.x-1) {  // East
      if (`${node.pos.x+1},${node.pos.y}` in this.nodes === false) {
        this.nodes[`${node.pos.x+1},${node.pos.y}`] = new Node(createVector(node.pos.x+1, node.pos.y), game.currentScene.base.tileBoard.board[node.pos.y][node.pos.x+1].isWall());  
      } 
      ret.push(this.nodes[`${node.pos.x+1},${node.pos.y}`]);
    }
    if (node.pos.y < this.boardSize.y-1) {  // South
      if (`${node.pos.x},${node.pos.y+1}` in this.nodes === false) {
        this.nodes[`${node.pos.x},${node.pos.y+1}`] = new Node(createVector(node.pos.x, node.pos.y+1), game.currentScene.base.tileBoard.board[node.pos.y+1][node.pos.x].isWall());  
      } 
      ret.push(this.nodes[`${node.pos.x},${node.pos.y+1}`]);
    }

    if (node.pos.y < this.boardSize.y-1 && node.pos.x > 0) {  // South West
      if (`${node.pos.x-1},${node.pos.y+1}` in this.nodes === false) {
        this.nodes[`${node.pos.x-1},${node.pos.y+1}`] = new Node(createVector(node.pos.x-1, node.pos.y+1), game.currentScene.base.tileBoard.board[node.pos.y+1][node.pos.x-1].isWall());        
      }
    }
    
    if (node.pos.y < this.boardSize.y-1 && node.pos.x < this.boardSize.x-1) {  // South East
      if (`${node.pos.x+1},${node.pos.y+1}` in this.nodes === false) {
        this.nodes[`${node.pos.x+1},${node.pos.y+1}`] = new Node(createVector(node.pos.x+1, node.pos.y+1), game.currentScene.base.tileBoard.board[node.pos.y+1][node.pos.x+1].isWall());        
      }
    }
    
    if (node.pos.y > 0 && node.pos.x > 0) {  // North West
      if (`${node.pos.x-1},${node.pos.y-1}` in this.nodes === false) {
        this.nodes[`${node.pos.x-1},${node.pos.y-1}`] = new Node(createVector(node.pos.x-1, node.pos.y-1), game.currentScene.base.tileBoard.board[node.pos.y-1][node.pos.x-1].isWall());        
      }
    }
    
    if (node.pos.y > 0 && node.pos.x < this.boardSize.x-1) {  // North East
      if (`${node.pos.x+1},${node.pos.y-1}` in this.nodes === false) {
        this.nodes[`${node.pos.x+1},${node.pos.y-1}`] = new Node(createVector(node.pos.x+1, node.pos.y-1), game.currentScene.base.tileBoard.board[node.pos.y-1][node.pos.x+1].isWall());        
      }
    }

    return ret;
  }

 
}

class Node {
  constructor(pos, val) {
    this.pos = pos;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.cost = 1;
    this.visited = false;
    this.closed = false;
    this.isWall = val == 1;
    this.parent = null;
  }

  cleanNode() {
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.visited = false;
    this.closed = false;
    this.parent = null;
  }

  getCost() {
    return this.cost;
  }
}
