//require('./bootstrap');
import Phaser from 'phaser';
//import RexPlugins from 'phaser3-rex-plugins';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js';

/*
space=nothing
0 = normal square - although may want e.g a border to indicate different countries
1 = homes
2 = data collection challenge
3 = hourglass space
4 = study coordination centre ... possibly several squares rather than going 'back'? Main centre is start to may need 6
5 = satellite study coordination centre
*/

const COLORMAP = [
    0x333333, 
    0x4caf50, 
    0xffA500,
    0x770000,
    0x000000, 
    0xffffff
 ];

const TILESMAP = [
  '4011  1105',
  '1  3  2  1',
  '0  1100  2',
  '220    130',
  '  1    1  ',
  '  0    1  ',
  '110    002',
  '3  2101  3',
  '0  0  1  1',
  '5211  0215' 
];

const spriteRestFrameNo = 3;

const Between = Phaser.Math.Between;
class Demo extends Phaser.Scene {
  constructor() {
      super({
          key: 'examples'
      })
  }

  preload() { 
    
    this.load.image('challenge', 
        'assets/images/exclaim.png'
    );
    this.load.image('hourglass', 
        'assets/images/hourglass.png'
    );
    this.load.image('house', 
        'assets/images/house.png'
    );
    this.load.spritesheet('man_dark', 
        'assets/images/man_dark.png',
        { frameWidth: 32, frameHeight: 32 }
    );
    
    }

  create() {
    
    var board = new Board(this, TILESMAP);
      /*var chessA = new ChessA(board, {
          x: 0,
          y: 0
      });*/

    var player = new Player(board, 'man_dark');

    var movingPointsTxt = this.add.text(10, 10, '');
    this.input.on('pointerdown', function (pointer) {
        var movingPoints = Between(1, 6);
        movingPointsTxt.setText(movingPoints)
        player.moveForward(movingPoints);
    });

    this.add.text(10, 700, 'Click to move forward.')
  }
}


class Board extends RexPlugins.Board.Board {
  constructor(scene, tilesMap) {
      var tiles = createTileMap(TILESMAP);
      // create boardcost
      var config = {
          // grid: getHexagonGrid(scene),
          grid: getQuadGrid(scene),
          width: tiles[0].length,
          height: tiles.length,
          // wrap: true
      }
      super(scene, config);
      this.createPath(tiles);
  }

  createPath(tiles) {
      // tiles : 2d array
      var line, symbol, cost;
      var challenge, house, hourglass;
      for (var tileY = 0, ycnt = tiles.length; tileY < ycnt; tileY++) {
          line = tiles[tileY];
          for (var tileX = 0, xcnt = line.length; tileX < xcnt; tileX++) {
              symbol = line[tileX];
              if (symbol === ' ') {
                  continue;
              }

              //cost = parseFloat(symbol);
              const tileType = parseFloat(symbol);
              //this.scene.rexBoard.add.shape(this, tileX, tileY, 0, COLORMAP[cost])
              this.scene.rexBoard.add.shape(this, tileX, tileY, 0, COLORMAP[tileType]) //cost for all tiles = 1
                  .setStrokeStyle(1, 0xffffff, 1)
                  .setData('cost', cost);
                  //.setData('cost', cost);

                  /*1 = homes
                  2 = data collection challenge
                  3 = hourglass space
                  4 = study coordination centre ... possibly several squares rather than going 'back'? Main centre is start to may need 6
                  5 = satellite study coordination centre*/
              
              
            switch(tileType) {
                case 1:
                    house = new Phaser.GameObjects.Image(this.scene, 80, 80, 'house');
                    this.scene.add.existing(house);
                    this.addChess(house, tileX, tileY);
                    break; 
                case 2:
                    challenge = new Phaser.GameObjects.Image(this.scene, 80, 80, 'challenge');
                    this.scene.add.existing(challenge);
                    this.addChess(challenge, tileX, tileY);
                    break; 
                case 3:
                    hourglass = new Phaser.GameObjects.Image(this.scene, 80, 80, 'hourglass');
                    this.scene.add.existing(hourglass);
                    this.addChess(hourglass, tileX, tileY);
                    break;
                case 4:
                    break; 
                case 5:
                    break; 
            }
              
          }
      }
      return this;
  }
}

class Player extends Phaser.GameObjects.Sprite {
    constructor(board, texture) {
        var scene = board.scene;
        super(scene, 0,0, texture, spriteRestFrameNo); //add this sprite to the scene
        scene.add.existing(this);

        scene.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(texture, {start: 0, end: 1}),
            frameRate: 10,
            repeat: -1
        });
    
        scene.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(texture, {start: 2, end: 3}),
            frameRate: 10,
            repeat: -1
        });
    
        scene.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(texture, {start: 4, end: 5}),
            frameRate: 10,
            repeat: -1
        });
    
        scene.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(texture, {start: 6, end: 7}),
            frameRate: 10,
            repeat: -1
        });
    
        scene.anims.create({
            key: 'wait',
            frames: [{key: texture, frame: spriteRestFrameNo}],
            frameRate: 20,
        });

        board.addChess(this,0,0,2,true);

        // add behaviors        
        this.monopoly = scene.rexBoard.add.monopoly(this, {
            face: 0,
            pathTileZ: 0,
            costCallback: function (curTileXY, preTileXY, monopoly) {
                //cost fror all tiles = 1
                return 1;
                //var board = monopoly.board;
                //return board.tileXYZToChess(curTileXY.x, curTileXY.y, 0).getData('cost');
            },
        });
        
        this.moveTo = scene.rexBoard.add.moveTo(this);

        // private members
        //this.movingPathTiles = [];
        
    }
      
    moveForward(movingPoints) {
        if (this.moveTo.isRunning) {
            return this;
        }
  
        var path = this.monopoly.getPath(movingPoints);
        //this.showMovingPath(path);
        this.moveAlongPath(path);
        return this;
    }
    moveAlongPath(path) {
        //path is array of tiles - first one is removed every time this is called.
        if (path.length === 0) {
            this.anims.play('wait');
            return;
        }
  
        this.moveTo.once('complete', function () {
            this.moveAlongPath(path);
        }, this);
        var tileData = path.shift();
        this.moveTo.moveTo(tileData);
        this.monopoly.setFace(this.moveTo.destinationDirection);
        
        switch (this.moveTo.destinationDirection) {
            case 0: 
                this.anims.play('right');
                break;
            case 1: 
                this.anims.play('down');
                break;
            case 2: 
                this.anims.play('left');
                break;
            case 3: 
                this.anims.play('up');
                break;
            default:
        }
                
        return this;
    }
}

var getQuadGrid = function (scene) {
  var grid = scene.rexBoard.add.quadGrid({
      x: 100,
      y: 100,
      cellWidth: 60,
      cellHeight: 60,
      type: 0
  });
  return grid;
}

var createTileMap = function (tilesMap, out) {
  if (out === undefined) {
      out = [];
  }
  for (var i = 0, cnt = tilesMap.length; i < cnt; i++) {
      out.push(tilesMap[i].split(''));
  }
  return out;
}

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1000,
  height: 750,
  scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: Demo,
  plugins: {
      scene: [{
          key: 'rexBoard',
          plugin: BoardPlugin,
          mapping: 'rexBoard'
      }]
  }
  
};

var game = new Phaser.Game(config);