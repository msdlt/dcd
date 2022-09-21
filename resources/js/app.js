//require('./bootstrap');
import Phaser from 'phaser';
//import RexPlugins from 'phaser3-rex-plugins';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import Dice from './dice.js';

/*
space=nothing
0 = normal square - although may want e.g a border to indicate different countries
1 = homes
2 = data collection challenge
3 = hourglass space
4 = study coordination centre ... possibly several squares rather than going 'back'? Main centre is start to may need 6
5 = satellite study coordination centre
*/

const TILEFILL = [
    0xffffff, //0x333333, 
    0xffffff, //0x4caf50, 
    0xffffff, //0xffA500,
    0xffffff, //0x770000,
    0x000000, //0x000000, 
    0xffffff
 ];

const TILESTROKE = [
    0x000000, //0x333333, 
    0x000000, //0x4caf50, 
    0x000000, //0xffA500,
    0x000000, //0x770000,
    0xffffff, //0x000000, 
    0x000000
];

const TILEDESCRIPTIONS = [
    'On the road',
    'House',
    'Data collection challenge',
    'Samples expiring',
    'Start',
    'Study coordination centre',
];

const TILEPROMPTS = [
    'Click OK to let the next person have their turn',
    'You have arrived at a house. Would you like to sample?',
    'Data collection can be challenging! Click OK to see your challenge.',
    'You have three turns to get your samples to a study centre beforre they go off',
    'Your home centre - collect five coins and five sample kits',
    'Collect three coins and three sample kits',
]

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

const SPRITE_REST_FRAME_NO = 3;

//initial values
const INIT_NO_RECRUITMENTS = 0;
const INIT_NO_COINS = 5;
const INIT_NO_KITS = 5;

const Between = Phaser.Math.Between;
class Demo extends Phaser.Scene {
  constructor() {
      super({
          key: 'examples'
      })
  }

  preload() { 
    
    //images for board squares
    this.load.image('challenge', 
        'assets/images/exclaim.png'
    );
    this.load.image('hourglass', 
        'assets/images/hourglass.png'
    );
    this.load.image('house', 
        'assets/images/house.png'
    );
    this.load.image('coordcentre', 
        'assets/images/blackbuilding.png'
    );
    this.load.image('startcentre', 
        'assets/images/whitebuilding.png'
    );

    //image for player
    this.load.spritesheet('man_dark', 
        'assets/images/man_dark.png',
        { frameWidth: 32, frameHeight: 32 }
    );

    //images for scoring
    this.load.image('coin-white', 
        'assets/images/coin-white.png'
    );
    this.load.image('syringe-white', 
        'assets/images/syringe-white.png'
    );
    this.load.image('person-white', 
        'assets/images/person-white.png'
    );

    //images for dice
    this.load.spritesheet('dice-faces', 
        'assets/images/die-white.png',
        { frameWidth: 45, frameHeight: 45 }
    );
    
    
    }

  create() {
    
    var instructions = 'Click to move forward';
    
    
    var board = new Board(this, TILESMAP);

    var dialog = this.rexUI.add.dialog(config);
   
    player = new Player(board, 'man_dark');

    var dice = new Dice(this, 720, 60, 'dice-faces', 5, onDiceRolled).setOrigin(0, 0);;

    var coinImage = this.add.image(720, 600, 'coin-white').setOrigin(0, 0);
    var kitImage = this.add.image(780, 600, 'syringe-white').setOrigin(0, 0);
    var recruitmentImage = this.add.image(840, 600, 'person-white').setOrigin(0, 0);

    var coinText = this.add.text(730, 660, player.noOfCoins, { fontSize: '32px'});
    var kitText = this.add.text(790, 660, player.noOfKits, { fontSize: '32px'});
    var recruitmentText = this.add.text(850, 660, player.noOfRecruitments, { fontSize: '32px'});

    //scoring and instructions
    var instuctionsText = this.add.text(10, 700, instructions);
    var movingPointsText = this.add.text(10, 10, '');
    
    /*this.input.on('pointerdown', function (pointer) {
        dice.roll();
        //var movingPoints = Between(1, 6);
        //movingPointsText.setText(movingPoints)
        
    });*/

    


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
      var challenge, house, hourglass, startcentre, coordcentre;
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
              this.scene.rexBoard.add.shape(this, tileX, tileY, 0, TILEFILL[tileType]) //cost for all tiles = 1
                  //.setStrokeStyle(1, 0xffffff, 1)
                  .setStrokeStyle(1, TILESTROKE[tileType], 1)
                  .setData('tileType', tileType);
                  //.setData('cost', cost);

                  /*1 = homes
                  2 = data collection challenge
                  3 = hourglass space
                  4 = study coordination centre ... possibly several squares rather than going 'back'? Main centre is start to may need 6
                  5 = satellite study coordination centre*/
              
            //add tile decorators at tileZ = 1
            var tileZ = 1;
                  
            switch(tileType) {
                case 1:
                    house = new Phaser.GameObjects.Image(this.scene, 80, 80, 'house');
                    this.scene.add.existing(house);
                    this.addChess(house, tileX, tileY, tileZ);
                    break; 
                case 2:
                    challenge = new Phaser.GameObjects.Image(this.scene, 80, 80, 'challenge');
                    this.scene.add.existing(challenge);
                    this.addChess(challenge, tileX, tileY, tileZ);
                    break; 
                case 3:
                    hourglass = new Phaser.GameObjects.Image(this.scene, 80, 80, 'hourglass');
                    this.scene.add.existing(hourglass);
                    this.addChess(hourglass, tileX, tileY, tileZ);
                    break;
                case 4:
                    startcentre = new Phaser.GameObjects.Image(this.scene, 80, 80, 'startcentre');
                    this.scene.add.existing(startcentre);
                    this.addChess(startcentre, tileX, tileY, tileZ);
                    break; get
                case 5:
                    coordcentre = new Phaser.GameObjects.Image(this.scene, 80, 80, 'coordcentre');
                    this.scene.add.existing(coordcentre);
                    this.addChess(coordcentre, tileX, tileY, tileZ);
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

        super(scene, 0,0, texture, SPRITE_REST_FRAME_NO); //add this sprite to the scene

        //player-level scores
        this.noOfRecruitments = INIT_NO_RECRUITMENTS;
        this.noOfCoins = INIT_NO_COINS;
        this.noOfKits = INIT_NO_KITS;
        this.onTileType = 4; //study coordination centre - start

        //player-level variables
        this.turnsToMiss = 0; //iea is that this will be checked and decremented each turn.
        this.turnsToGetToStudyCentre = 0; //idea is that this will be set to e.g. 3 then, each turn, checked and decremented each turn if, when set to 1, player does not reach study centre, one card is lost and this is set to 0 (ignored in future turns)

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
            frames: [{key: texture, frame: SPRITE_REST_FRAME_NO}],
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
      
    //callBackOnFinished passed to moveAlongPath
    moveForward(movingPoints, callbackOnFinished) {
        var path = this.monopoly.getPath(movingPoints);
        this.moveAlongPath(path,callbackOnFinished);
        return this;
    }

    moveAlongPath(path, callbackOnFinished) {
        //path is array of tiles - first one is removed every time this is called.
        if (path.length === 0) {
            this.anims.play('wait');
            callbackOnFinished(this.scene);
            return;
        }
  
        this.moveTo.once('complete', function () {
            this.moveAlongPath(path, callbackOnFinished);
        }, this);
        var tileData = path.shift();
        this.moveTo.moveTo(tileData);
        
        player.onTileType = this.monopoly.board.tileXYZToChess(tileData.x, tileData.y, 0).getData('tileType');
        console.log(player.onTileType)
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
    }
}

/*
* title
* prompt
* dialogType - 0 = roll dice, 1 = draw card, etc.
*/

var CreateDialog = function (scene, title, prompt, dialogType) {
    var dialog = scene.rexUI.add.dialog({
        x: 500,
        y: 400,
        width: 600,
        background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

        title: CreateLabel(scene, title, false),
        /*,scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
            text: scene.add.text(0, 0, title, {
                fontSize: '24px'
            }),
            space: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            }
        }),*/

        description: CreateLabel(scene, prompt, true),

        /*content: scene.add.text(0, 0, prompt, {
            fontSize: '24px'
        }),*/

        actions: [
            CreateLabel(scene, 'Yes', true),
            CreateLabel(scene, 'No', true)
        ],

        expand: {
            title: false,
            // content: false,
            description: true,
            // choices: false,
            // actions: true,
        },

        space: {
            title: 25,
            content: 25,
            action: 15,

            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
        },

        align: {
            actions: 'right', // 'center'|'left'|'right'
        },

        expand: {
            content: false,  // Content is a pure text object
        }
    })
        .layout();

    dialog
        .on('button.click', function (button, groupName, index, pointer, event) {
            dialog.emit('modal.requestClose', { index: index, text: button.text });
        })
        .on('button.over', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('button.out', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle();
        });

    return dialog;
}

var CreateLabel = function (scene, text, wrap) {
    var background = scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3);
    var textObj = scene.add.text(0, 0, text, {
        fontSize: '24px'
    });
    if (wrap) {
        textObj = scene.rexUI.wrapExpandText(textObj);
    }
    return scene.rexUI.add.label({
        width: 40, // Minimum width of round-rectangle
        height: 40, // Minimum height of round-rectangle

        background: background,

        text: textObj,
        expandTextWidth: wrap,

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    });
}


var onFinishedMoving = function (scene) {
    
    console.log('This is me: ' + player.onTileType);

    var dialogTitle = TILEDESCRIPTIONS[player.onTileType];
    var dialogPrompt = TILEPROMPTS[player.onTileType];

    scene.rexUI.modalPromise(
        // Game object
        CreateDialog(scene, dialogTitle, dialogPrompt).setPosition(400, 300),
        // Config
        {
            manaulClose: true,
            duration: {
                in: 500,
                out: 500
            }
        }
    )
    .then(function (result) {
        print.text += `Click button ${result.index}: ${result.text}\n`;
    })

    return;

}

var onDiceRolled = function (scene, numberRolled) {
    var moved = player.moveForward(numberRolled, onFinishedMoving);
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
      }, {
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI'
    }]
  }
};

//top-level variables
var gamevars = {
    noOfRecruitments:0
};
var player;

var game = new Phaser.Game(config);