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

const INVENTORY_COLOURS = [
    0xf80000, //0 left 
    0xf87c7c, //1 left
    0xf8baba, //2 left
];

const TILEDESCRIPTIONS = [
    'On the road',
    'You have arrived at a house',
    'Data collection challenge',
    'Samples expiring',
    'Main study centre',
    'Satellite stduy centre',
];

const TILEPROMPTS = [
    'Click OK to let the next person have their turn',
    'Would you like to attempt to recruit by paying one coin? Roll an EVEN number to successfully recruit. An ODD number means no consent.',
    'Data collection can be challenging! Click OK to see your challenge.',
    'You have three turns to get your samples to a study centre before they become unusable',
    'Collect five coins and five sample kits',
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

const DELAY_BEFORE_DIALOG_LOADS = 300; //ms

//const Between = Phaser.Math.Between;

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

    dice = new Dice(this, 750, 90, 'dice-faces', 5, onDiceRolled);

    coinImage = this.add.image(750, 600, 'coin-white').setOrigin(0.5, 0.5);
    kitImage = this.add.image(810, 600, 'syringe-white').setOrigin(0.5, 0.5);
    recruitmentImage = this.add.image(870, 600, 'person-white').setOrigin(0.5, 0.5);

    coinText = this.add.text(750, 660, player.noOfCoins, { fontSize: '32px'}).setOrigin(0.5, 0.5);
    kitText = this.add.text(810, 660, player.noOfKits, { fontSize: '32px'}).setOrigin(0.5, 0.5);
    recruitmentText = this.add.text(870, 660, player.noOfRecruitments, { fontSize: '32px'}).setOrigin(0.5, 0.5);

    
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
        //console.log(player.onTileType)
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
* dialogButtons = []
*/

var CreateDialog = function (scene, title, prompt, dialogButtons) {

    var dialog = scene.rexUI.add.dialog({
        x: 500,
        y: 400,
        width: 600,
        background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

        title: CreateLabel(scene, title, false, 0x003c8f),
        
        description: CreateLabel(scene, prompt, true, 0x1565c0),

        
        actions: [],//will be added later

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
    });
    
    //dialog.addAction(CreateLabel(scene, 'OK', false)); 
    
    dialogButtons.forEach((dialogButton) => {
        var newLabel = CreateLabel(scene, dialogButton.text, dialogButton.wrap)
        dialog.addAction(newLabel); 
    })

    dialog.layout();  //have to call this after addAction to get it to place buttons on dialog

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

var CreateLabel = function (scene, text, wrap, colour) {
    var background;
    if (colour){
        background = scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, colour);
    } else {
        background = scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3);
    }
    //var background = scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3);
    var textObj = scene.add.text(0, 0, text, {
        fontSize: '24px'
    });
    if (wrap) {
        textObj = scene.rexUI.wrapExpandText(textObj);
    }
    return scene.rexUI.add.label({
        //width: 60, // Minimum width of round-rectangle
        //height: 40, // Minimum height of round-rectangle

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
    
    //console.log('This is me: ' + player.onTileType);

    var dialogTitle = TILEDESCRIPTIONS[player.onTileType];
    var dialogPrompt = TILEPROMPTS[player.onTileType];
    var dialogButtons = [];

    switch (player.onTileType) {
        case 0: 
            /*dialogButtons = [
                {
                    'text':'OK',
                    'wrap': false
                }
            ]*/
            nextGo();
            return;
            break;
        case 1: 
            //first check sufficient coins and kits
            if(player.noOfCoins > 0 && player.noOfKits > 1) {
                dialogButtons = [
                    {
                        'text':'Yes',
                        'wrap': false
                    },{
                        'text':'No',
                        'wrap': false
                    }    
                ]
            } else {
                dialogPrompt = "You have insufficient coins or kits to sample";
                dialogButtons = [
                    {
                        'text':'OK',
                        'wrap': false
                    }    
                ]
            }
            break;
        case 2: 
            dialogButtons = [
                {
                    'text':'OK',
                    'wrap': false
                }
            ]
            break;
        case 3: 
            dialogButtons = [
                {
                    'text':'OK',
                    'wrap': false
                }
            ]
            break;
        case 4: 
            dialogButtons = [
                {
                    'text':'OK',
                    'wrap': false
                }
            ]
            break;
        case 5: 
            dialogButtons = [
                {
                    'text':'OK',
                    'wrap': false
                }
            ]
            break;
        default:
    }

    //console.log(dialogButtons);

    setTimeout(() => {

        scene.rexUI.modalPromise(
            // Game object
            CreateDialog(scene, dialogTitle, dialogPrompt, dialogButtons).setPosition(500, 300),
            // Config
            {
                manualClose: true,
                duration: {
                    in: 300,
                    out: 300
                }
            }
        )
        .then(function (result) {
            switch (player.onTileType) {
                case 0: 
                    nextGo();
                    break;
                case 1: 
                    //first check sufficient coins and kits
                    if(player.noOfCoins > 0 && player.noOfKits > 1 && result.index == 0) {
                        changeInventory(scene, 'coin', true, 1);
                        recruitAttempt();
                    } else {
                        nextGo();
                    }
                    break;
                case 2: 
                    dialogButtons = [
                        {
                            'text':'OK',
                            'wrap': false
                        }
                    ]
                    break;
                case 3: 
                    dialogButtons = [
                        {
                            'text':'OK',
                            'wrap': false
                        }
                    ]
                    break;
                case 4: 
                    dialogButtons = [
                        {
                            'text':'OK',
                            'wrap': false
                        }
                    ]
                    break;
                case 5: 
                    dialogButtons = [
                        {
                            'text':'OK',
                            'wrap': false
                        }
                    ]
                    break;
                default:
            }
        })
        
    }, DELAY_BEFORE_DIALOG_LOADS)
    
    

    return;

}

var onDiceRolled = function (scene, numberRolled) {
    if(awaitingRecruitmentOutcome == true) {
        var dialogTitle;
        var dialogPrompt;
        var dialogButtons;

        var itsEven = numberRolled % 2 == 0;

        if(numberRolled % 2 == 0) {
            //even
            itsEven = true;
            dialogTitle = 'Success!';
            dialogPrompt = 'You have recruited your participant - you use one kit to collect your sample';
            dialogButtons = [
                {
                    'text':'OK',
                    'wrap': false
                }    
            ]
        } else {
            itsEven = false;
            dialogTitle = 'Bad luck';
            if(recruitmentAttemptNo < 2) {
                if(player.noOfCoins > 0 && player.noOfKits > 1) {
                    dialogPrompt = 'Would you like to have one last attempt to recruit by paying another coin? Roll an EVEN number to successfully recruit. An ODD number means no consent.';
                    dialogButtons = [
                        {
                            'text':'Yes',
                            'wrap': false
                        },{
                            'text':'No',
                            'wrap': false
                        }    
                    ]
    
                } else {
                    dialogPrompt = "You have insufficient coins or kits to sample";
                    dialogButtons = [
                        {
                            'text':'OK',
                            'wrap': false
                        }    
                    ]
                }
            } else {
                dialogPrompt = "You will have to leave a colleague to try recruiting this household";
                    dialogButtons = [
                        {
                            'text':'OK',
                            'wrap': false
                        }    
                    ]
            }
            
        }
        
        
        setTimeout(() => {
            scene.rexUI.modalPromise(
                // Game object
                CreateDialog(scene, dialogTitle, dialogPrompt, dialogButtons).setPosition(500, 300),
                // Config
                {
                    manualClose: true,
                    duration: {
                        in: 300,
                        out: 300
                    }
                }
            )
            .then(function (result) {
                if(itsEven) {
                    changeInventory(scene, 'kit', true, 1);
                    changeInventory(scene, 'recruitment', false, 1);  
                    awaitingRecruitmentOutcome = false; 
                    recruitmentAttemptNo = 0;
                    nextGo(); 
                } else {
                    if(player.noOfCoins > 0 && player.noOfKits > 1 && result.text == 'Yes') {
                        changeInventory(scene, 'coin', true, 1);
                        awaitingRecruitmentOutcome = true;  
                        recruitAttempt();
                    } else {
                        awaitingRecruitmentOutcome = false;  
                        recruitmentAttemptNo = 0;
                        nextGo();
                    }
                }
                
            })            
        }, DELAY_BEFORE_DIALOG_LOADS)
    }
    else {
        //default is to move player
        var moved = player.moveForward(numberRolled, onFinishedMoving);
    }
}

var nextGo = function () {
    //in onePlayer, just flash dice to roll again
    dice.flash();
    console.log('next go');
}

var recruitAttempt = function () {
    dice.flash();
    awaitingRecruitmentOutcome = true; //so we can chcek this in onDiceRolled above
    recruitmentAttemptNo = recruitmentAttemptNo + 1
    console.log('recruit attempt');
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

var changeInventory = function (scene, item, subtract, amount) {
    switch (item) {
        case 'coin':
            if(subtract) {
                player.noOfCoins = player.noOfCoins - amount ;
            } else {
                player.noOfCoins = player.noOfCoins + amount ;
            }
            highlightTextObject(scene,coinText);
            coinText.text = player.noOfCoins;
            if (player.noOfCoins > 2) {
                coinText.clearTint();
                coinImage.clearTint();
            } else {
                coinText.setTint(INVENTORY_COLOURS[player.noOfCoins]);
                coinImage.setTint(INVENTORY_COLOURS[player.noOfCoins]);
            }
            break;
        case 'kit': 
            if(subtract) {
                player.noOfKits = player.noOfKits - amount ;
            } else {
                player.noOfKits = player.noOfKits + amount ;
            }
            highlightTextObject(scene,kitText);
            kitText.text = player.noOfKits;
            if (player.noOfKits > 2) {
                kitText.clearTint();
                kitImage.clearTint();
            } else {
                kitText.setTint(INVENTORY_COLOURS[player.noOfKits]);
                kitImage.setTint(INVENTORY_COLOURS[player.noOfKits]);
            }
            break;
        case 'recruitment': 
            if(subtract) {
                player.noOfRecruitments = player.noOfRecruitments - amount ;
            } else {
                player.noOfRecruitments = player.noOfRecruitments + amount ;
            }
            highlightTextObject(scene,recruitmentText);
            recruitmentText.text = player.noOfRecruitments;
            break;
    }
    return; 
}

var highlightTextObject = function (scene, textObject) {
    var flashText = scene.tweens.add({
        targets: textObject,
        scale: 1.5,
        ease: 'Linear',
        duration: 300,
        repeat: 0,
        yoyo: true,
      });
    return; 
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
var dice;
var coinText;
var kitText;
var recruitmentText;
var coinImage;
var kitImage;
var recruitmentImage;

var awaitingRecruitmentOutcome = false;
var recruitmentAttemptNo = 0 ;

var game = new Phaser.Game(config);