//require('./bootstrap');
import Phaser from 'phaser';
//import RexPlugins from 'phaser3-rex-plugins';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import Dice from './dice.js';

const SPRITE_REST_FRAME_NO = 3;

const PLAYER_ID = 0;

//initial values
const INIT_NO_RECRUITMENTS = 0;
const INIT_NO_COINS = 5;
const INIT_NO_KITS = 5;

const PLAYER_Z = -5;//6;

const GAME_TIME_LIMIT = 1800; //1800 seconds

const DELAY_BEFORE_DIALOG_LOADS = 300; //ms

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
    'Satellite study centre',
];

const TILEPROMPTS = [
    'Click OK to let the next person have their turn. ',
    'Would you like to attempt to recruit by paying one coin? Roll an EVEN number to successfully recruit. An ODD number means no consent.',
    'Data collection can be challenging! Click OK to see your challenge.',
    'You have three turns to get your samples to a study centre before they become unusable. ',
    'Collect FIVE COINS and FIVE SAMPLE KITS. ',
    'Collect THREE COINS and TWO SAMPLE KITS. ',
]

const CHALLENGE_TITLES = [
    'Ebola outbreak',
    'Unreliable research assistant',
    'Broken fridge',
    'Broken lift',
    'Lengthy interview',
    'Tea and cake',
    'Naughty monkey',
    'Ethics amendment'
]

const CHALLENGE_PROMPTS = [
    'You and your data are quarantined in this spot. MISS A TURN until a team member comes to your spot and can collect the measurements from you, by handing the data over the fence.',
    'A research assistant helping with the study was fabricating data instead of going into the field and conducting interviews. LOSE TWO PARTICIPANTS.',
    'Study coordination centre staff did not inform the study team the fridge had broken for 24 hours, so the stored samples all expired. LOSE TWO PARTICIPANTS',
    'Lift in the high rise tower was broken. SPEND 1 COIN for the extra time it takes to haul all the equipment up to floor 10.',
    'An interview takes twice as long, as the participant had a lot of slightly traumatic stories to share. They clearly appreciated the social contact though! SPEND AN EXTRA KIT, BUT GAIN AN EXTRA TURN. They were a lovely participant and it reminded you about why you enjoy your job. ​',
    'Participant gives you a cup of tea and homemade cake. Gain an extra turn. You feel refreshed!',
    'A monkey runs off with all your batteries. LOSE ALL YOUR KIT',
    'Ethics amendment is being processed. ALL PLAYERS MISS A TURN. '
]

const CHALLENGE_ACTIONS = [
    {
        'money':0,
        'kit':0,
        'recruitment':0,
        'turn':-1  //need to make player aware that losing a turn
    },
    {
        'money':0,
        'kit':0,
        'recruitment':-2,
        'turn':0
    },
    {
        'money':0,
        'kit':0,
        'recruitment':-2,
        'turn':0
    },
    {
        'money':-1,
        'kit':0,
        'recruitment':0,
        'turn':0
    },
    {
        'money':0,
        'kit':-1,
        'recruitment':0,
        'turn':1
    },
    {
        'money':0,
        'kit':0,
        'recruitment':0,
        'turn':1
    },
    {
        'money':0,
        'kit':-9999,  //lose all this player's kit
        'recruitment':0,
        'turn':0
    },
    {
        'money':0,
        'kit': 0,
        'recruitment':0,
        'turn':-1 
    }
]

const STUDY_CENTRE_ACTIONS = [
    {   //start study centre square
        'money':5,
        'kit':5,
        'recruitment':0,
        'turn':0  
    },
    {   //satellite study centre square
        'money':3,
        'kit':2,
        'recruitment':0,
        'turn':0
    }
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


//1 = NW
//2 = NE
//3 = SE
//4 = SW

const BUILDING_POSITIONS = [
    ['2','2','2','2','0','0','2','2','2','2'],
    ['1','0','0','1','0','0','1','0','0','3'],
    ['1','0','0','1','4','4','4','0','0','3'],
    ['4','2','3','0','0','0','0','2','4','3'],
    ['0','0','3','0','0','0','0','1','0','0'],
    ['0','0','3','0','0','0','0','1','0','0'],
    ['1','2','4','0','0','0','0','1','2','2'],
    ['1','0','0','2','2','2','2','0','0','3'],
    ['1','0','0','3','0','0','1','0','0','3'],
    ['1','4','4','3','0','0','1','4','4','4'],
  ];





/*
 *
 * Creating the scene
 *
 */

class Demo extends Phaser.Scene {
  constructor() {
      super({
          key: 'examples'
      })
  }

  preload() { 
    
    //images for board squares
    /*this.load.image('challenge', 
        'assets/images/exclaim.png'
    );*/
    /*this.load.image('hourglass', 
        'assets/images/hourglass.png'
    );*/
    /*this.load.image('house', 
        'assets/images/house.png'
    );*/
    /*this.load.image('coordcentre', 
        'assets/images/blackbuilding.png'
    );*/
    /*this.load.image('startcentre', 
        'assets/images/whitebuilding.png'
    );*/

    //new tiles
    this.load.image('grass', 
        'assets/images/landscapeTiles_067.png'
    );
    this.load.image('study-centre-block', 
        'assets/images/buildingTiles_008.png'
    );
    this.load.image('house', 
        'assets/images/tower_35.png'
    );
    this.load.image('hourglass', 
        'assets/images/landscapeTilesHourglass.png'
    );
    this.load.image('challenge', 
        'assets/images/landscapeTilesChallenge.png'
    );

    //image for player
    /*this.load.spritesheet('man_dark', 
        'assets/images/man_dark.png',
        { frameWidth: 32, frameHeight: 32 }
    );*/
    this.load.spritesheet('meeple-sheet', 
        'assets/images/meeple-sheet.png',
        { frameWidth: 72, frameHeight: 72 }
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
    this.load.image('people-white', 
        'assets/images/people-white.png'
    );
    this.load.image('stopwatch-white', 
        'assets/images/stopwatch-white.png'
    );
    this.load.image('hourglass-white', 
        'assets/images/hourglass-white.png'
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
   
    //player = new Player(board, 'man_dark');
    player = new Player(board, 'meeple-sheet', PLAYER_Z);
    player.setScale(0.8);
    player.setOrigin(0.5, 0.9);

    dice = new Dice(this, 970, 60, 'dice-faces', 5, onDiceRolled);

    coinImage = this.add.image(850, 540, 'coin-white').setOrigin(0.5, 0.5);
    kitImage = this.add.image(910, 540, 'syringe-white').setOrigin(0.5, 0.5);
    recruitmentImage = this.add.image(970, 540, 'person-white').setOrigin(0.5, 0.5);
    hourglassImage = this.add.image(1030, 540, 'hourglass-white').setOrigin(0.5, 0.5);
    hourglassImage.visible = false;

    //recruitmentsImage = this.add.image(60, 60, 'people-white').setOrigin(0.5, 0.5);
    stopwatchImage = this.add.image(60, 60, 'stopwatch-white').setOrigin(0.5, 0.5);
    
    coinText = this.add.text(850, 600, player.noOfCoins, { fontSize: '32px'}).setOrigin(0.5, 0.5);
    kitText = this.add.text(910, 600, player.noOfKits, { fontSize: '32px'}).setOrigin(0.5, 0.5);
    recruitmentText = this.add.text(970, 600, player.noOfRecruitments, { fontSize: '32px'}).setOrigin(0.5, 0.5);
    hourglassText = this.add.text(1030, 600, player.noOfTurnsToGetToStudyCentre, { fontSize: '32px'}).setOrigin(0.5, 0.5);
    hourglassText.visible = false;

    //recruitmentsText = this.add.text(60, 110, totalNoOfRecruitments, { fontSize: '32px'}).setOrigin(0.5, 0.5);
    stopwatchText = this.add.text(60, 110, formatTime(timeLeft), { fontSize: '32px'}).setOrigin(0.5, 0.5);
    

    globalScene = this;

    // Each 1000 ms call onEvent
    var timerEvent = this.time.addEvent({ delay: 1000, callback: onGameTimer, callbackScope: this, loop: true });
    
  }
}

/*
 *
 * Creating the board 
 *
 */

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
      var challenge, house, hourglass, startcentrebottom, startcentrefirst, startcentresecond, coordcentre, grass;
      var tileDepth = -10;
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
                  .setDepth(tileDepth-1)
                  .setData('tileType', tileType);
                  //.setData('xOffSet', xOffSet)
                  //.setData('yOffSet', yOffSet);
                  //.setData('cost', cost);

                  /*1 = homes
                  2 = data collection challenge
                  3 = hourglass space
                  4 = study coordination centre ... possibly several squares rather than going 'back'? Main centre is start to may need 6
                  5 = satellite study coordination centre*/

                  
                  
              
            //add tile decorators at tileZ = 1
            var tileZ = 1;

            grass = new Phaser.GameObjects.Image(this.scene, 80, 80, 'grass');
            grass.setScale(0.75);
            this.scene.add.existing(grass);
            this.addChess(grass, tileX, tileY, tileZ);
            grass.setDepth(-10);

            tileZ = 2;  //next items - tile modifiers - go on top
            var buildingZ = 3;  //buildings start even higher
            var depth = tileDepth;
            //NOTE: playerZ = 6

            //default for position 1 //NW
            var xOffSet = 0.5;
            var yOffSet = 0.5;
            var yOffSetStack = 0.4; //extent to which one stack offsets
                        
            //person
            switch(BUILDING_POSITIONS[tileY][tileX]) {
                case '1': //NW
                    xOffSet = 1.2;
                    yOffSet = 1.4;
                    buildingZ = 3;  //order of painting
                    depth = tileDepth; //to allow 
                    break;
                case '2': //NE
                    xOffSet = -0.2;
                    yOffSet = 1.4;
                    buildingZ = 3;
                    depth = tileDepth;
                    break;
                case '3': //SE
                    xOffSet = -0.15;
                    yOffSet = 0.6;
                    buildingZ = 7;
                    depth = -4;
                    break;
                case '4': //SW
                    xOffSet = 1.15;
                    yOffSet = 0.6;
                    buildingZ = 7;
                    depth = -4;
                    break;
            }
                  
            switch(tileType) {
                case 1:
                    house = new Phaser.GameObjects.Image(this.scene, 80, 80, 'house');
                    house.setScale(0.5);
                    house.setOrigin(xOffSet, yOffSet);
                    this.scene.add.existing(house);
                    this.addChess(house, tileX, tileY, buildingZ);
                    house.setDepth(depth);
                    break; 
                case 2:
                    challenge = new Phaser.GameObjects.Image(this.scene, 80, 80, 'challenge');
                    challenge.setScale(0.75);
                    this.scene.add.existing(challenge);
                    this.addChess(challenge, tileX, tileY, tileZ);
                    challenge.setDepth(tileDepth);
                    break; 
                case 3:
                    hourglass = new Phaser.GameObjects.Image(this.scene, 80, 80, 'hourglass');
                    hourglass.setScale(0.75);
                    //hourglass.setOrigin(xOffSet, yOffSet);
                    this.scene.add.existing(hourglass);
                    this.addChess(hourglass, tileX, tileY, tileZ);
                    hourglass.setDepth(tileDepth);
                    break;
                case 4:
                    startcentrebottom = new Phaser.GameObjects.Image(this.scene, 80, 80, 'study-centre-block');
                    startcentrefirst = new Phaser.GameObjects.Image(this.scene, 80, 80, 'study-centre-block');
                    startcentresecond = new Phaser.GameObjects.Image(this.scene, 80, 80, 'study-centre-block');
                    startcentrebottom.setScale(0.5);
                    startcentrebottom.setOrigin(xOffSet, yOffSet);
                    this.scene.add.existing(startcentrebottom);
                    this.addChess(startcentrebottom, tileX, tileY, buildingZ);
                    startcentrebottom.setDepth(depth);
                    startcentrefirst.setScale(0.5);
                    startcentrefirst.setOrigin(xOffSet, yOffSet + yOffSetStack);
                    this.scene.add.existing(startcentrefirst);
                    this.addChess(startcentrefirst, tileX, tileY, buildingZ + 1);
                    startcentrefirst.setDepth(depth + 1);
                    startcentresecond.setScale(0.5);
                    startcentresecond.setOrigin(xOffSet, yOffSet + yOffSetStack * 2);
                    this.scene.add.existing(startcentresecond);
                    this.addChess(startcentresecond, tileX, tileY, buildingZ + 2);
                    startcentresecond.setDepth(depth + 2);
                    break; 
                case 5:
                    startcentrebottom = new Phaser.GameObjects.Image(this.scene, 80, 80, 'study-centre-block');
                    startcentrefirst = new Phaser.GameObjects.Image(this.scene, 80, 80, 'study-centre-block');
                    startcentrebottom.setScale(0.5);
                    startcentrebottom.setOrigin(xOffSet, yOffSet);
                    this.scene.add.existing(startcentrebottom);
                    this.addChess(startcentrebottom, tileX, tileY, buildingZ);
                    startcentrebottom.setDepth(depth);
                    startcentrefirst.setScale(0.5);
                    startcentrefirst.setOrigin(xOffSet, yOffSet + yOffSetStack);
                    this.scene.add.existing(startcentrefirst);
                    this.addChess(startcentrefirst, tileX, tileY, buildingZ + 1);
                    startcentrefirst.setDepth(depth + 1);
                    break; 
                /*default:
                    grass = new Phaser.GameObjects.Image(this.scene, 80, 80, 'grass');
                    grass.setScale(0.5);
                    this.scene.add.existing(grass);
                    this.addChess(grass, tileX, tileY, tileZ);
                    break;*/

            }
              
          }
      }
      return this;
  }
}

var getQuadGrid = function (scene) {
    var grid = scene.rexBoard.add.quadGrid({
        x: 550,  //x and y of overall board
        y: 110,
        cellWidth: 100,
        cellHeight: 50,
        type: 'isometric'
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

/*
 *
 * Creating the player
 *
 */

class Player extends Phaser.GameObjects.Sprite {
    constructor(board, texture, playerZ) {
        var scene = board.scene;

        //super(scene, 0,0, texture, SPRITE_REST_FRAME_NO); //add this sprite to the scene
        super(scene, 0, 0, texture, PLAYER_ID); //add this sprite to the scene

        //player-level scores
        this.noOfRecruitments = INIT_NO_RECRUITMENTS //2; //INIT_NO_RECRUITMENTS;
        this.noOfCoins = INIT_NO_COINS;
        this.noOfKits = INIT_NO_KITS;
        this.onTileType = 4; //study coordination centre - start

        //player-level variables
        this.noOfTurns = 0; //for missed/extra tuens - idea is that this will be checked and incremented/decremented each turn.
        this.noOfTurnsToGetToStudyCentre = 0; //idea is that this will be set to e.g. 3 chcek noOfTurnsUsed against it
        this.noOfTurnsUsed = 0; //idea is that this will be compared with noOfTurnsToGetToStudyCentre
        this.samplesCollectedSinceLastStudyCentre = 2; //idea is that this will be compared with noOfTurnsToGetToStudyCentre

        scene.add.existing(this);

        /*scene.anims.create({
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
        });*/

        board.addChess(this,0,0,playerZ,true);
        this.setDepth(playerZ);

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
            //this.anims.play('wait');
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
        
        /*switch (this.moveTo.destinationDirection) {
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
        }*/
    }
}

/*
 *
 * Functions for game play
 * 
 */


var onFinishedMoving = function () {
    
    //first deal with any possible sample loss for not making it to study centre in time
    checkAndProcessTimedChallenge(); //this will call processTileLandedOn in turn 

}

var processTileLandedOn = function () {

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
            dialogPrompt = dialogPrompt + 'You have collected ' + player.samplesCollectedSinceLastStudyCentre + ' samples so far since you you last visited a study centre.'   
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
            player.samplesCollectedSinceLastStudyCentre = 0;
            break;
        case 5: 
            dialogButtons = [
                {
                    'text':'OK',
                    'wrap': false
                }
            ]
            player.samplesCollectedSinceLastStudyCentre = 0;
            break;
        default:

    

    }

    //console.log(dialogButtons);

    setTimeout(() => {

        globalScene.rexUI.modalPromise(
            // Game object
            CreateDialog(dialogTitle, dialogPrompt, dialogButtons).setPosition(500, 300),
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
                        var updateDetails = {
                            'money':-1,
                            'kit':0,
                            'recruitment':0,
                            'turn':0 
                        }
                        //updateInventory(scene, 'coin', true, 1);
                        updateInventory(updateDetails);
                        recruitAttempt();
                    } else {
                        nextGo();
                    }
                    break;
                case 2:
                    //data collection challenge 
                    if(result.index == 0) {
                        //OK clicked
                        drawChallengeCard();
                    }
                    break;
                case 3: 
                    //timed challenge
                    if(result.index == 0) {
                        //OK clicked
                        //this.noOfTurnsToGetToStudyCentre = 0; //idea is that this will be set to e.g. 3 chcek noOfTurnsUsed against it
                        hourglassText.text = player.noOfTurnsUsed;
                        hourglassImage.visible = true;
                        hourglassText.visible = true;
                        highlightTextObject(hourglassText);
                        player.noOfTurnsToGetToStudyCentre = 3;
                        nextGo();
                    }
                    break; 
                case 4: 
                    //main study centre
                    updateInventory(STUDY_CENTRE_ACTIONS[0]);
                    break;
                case 5: 
                    //satellite study centre
                    updateInventory(STUDY_CENTRE_ACTIONS[1]);
                    break;
                default:
            }
        })
        
    }, DELAY_BEFORE_DIALOG_LOADS)
    
    

    return;

}

var onDiceRolled = function (numberRolled) {
    if(awaitingRecruitmentOutcome == true) {
        //dealing with recruitment logic
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
            globalScene.rexUI.modalPromise(
                // Game object
                CreateDialog(dialogTitle, dialogPrompt, dialogButtons).setPosition(500, 300),
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

                    var updateDetails = {
                        'money':0,
                        'kit':-1,
                        'recruitment':1,
                        'turn':0 
                    }

                    //updateInventory(scene, 'kit', true, 1);
                    //updateInventory(scene, 'recruitment', false, 1); 
                    updateInventory(updateDetails);   
                    awaitingRecruitmentOutcome = false; 
                    recruitmentAttemptNo = 0;
                    nextGo(); 
                } else {
                    if(player.noOfCoins > 0 && player.noOfKits > 1 && result.text == 'Yes') {
                        var updateDetails = {
                            'money':-1,
                            'kit':0,
                            'recruitment':0,
                            'turn':0 
                        }
                        //updateInventory(scene, 'coin', true, 1);
                        updateInventory(updateDetails);   
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
        if(player.noOfTurns > 0) {
            player.noOfTurns = player.noOfTurns - 1; //decrement by one  
        } 
        //default is to move player
        var moved = player.moveForward(numberRolled, onFinishedMoving);
    }
}

var nextGo = function () {
    if(player.noOfTurns > 0) {
        //this player has another go - doesn'tv really make sense until multi-player
        player.noOfTurns = player.noOfTurns - 1;
        nextGo();
    } else if (player.noOfTurns < 0) {
        //I'm missing a go
        missTurn();
    }
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

var drawChallengeCard = function () {
    //generate random number
    var cardDrawn = randomIntFromInterval(0,CHALLENGE_TITLES.length-1);

    var dialogTitle = CHALLENGE_TITLES[cardDrawn];
    var dialogPrompt = CHALLENGE_PROMPTS[cardDrawn];
    var dialogButtons = [
        {
            'text':'OK',
            'wrap': false
        }    
    ]
    
    setTimeout(() => {
        globalScene.rexUI.modalPromise(
            // Game object
            CreateDialog(dialogTitle, dialogPrompt, dialogButtons).setPosition(500, 300),
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
            var updateDetails = CHALLENGE_ACTIONS[cardDrawn]
            updateInventory(updateDetails);   
            nextGo(); 
        })            
    }, DELAY_BEFORE_DIALOG_LOADS)
}

var missTurn = function () {
    var dialogTitle = 'Miss a turn';
    var dialogPrompt = 'Click OK to move on to the next player';
    var dialogButtons = [
        {
            'text':'OK',
            'wrap': false
        }    
    ]

    //var scene = globalScene;
    //console.log(scene);

    setTimeout(() => {
        globalScene.rexUI.modalPromise(
            // Game object
            CreateDialog(dialogTitle, dialogPrompt, dialogButtons).setPosition(500, 300),
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
            player.noOfTurns = player.noOfTurns + 1; //heading towards zero
            nextGo(); 
        })            
    }, DELAY_BEFORE_DIALOG_LOADS)
}

var checkAndProcessTimedChallenge = function () {
    if(player.noOfTurnsToGetToStudyCentre > 0) {
        player.noOfTurnsUsed = player.noOfTurnsUsed + 1;
        hourglassText.text = player.noOfTurnsUsed;
        highlightTextObject(hourglassText);
        if((player.onTileType == 4 || player.onTileType == 5)) {
            //you made it!
            //dialog to say so
            var dialogTitle = 'You made it to the study centre!';
            var dialogPrompt = 'Your samples are safely in the fridge.';
            var dialogButtons = [
                {
                    'text':'OK',
                    'wrap': false
                }    
            ]
            
            setTimeout(() => {
                globalScene.rexUI.modalPromise(
                    // Game object
                    CreateDialog(dialogTitle, dialogPrompt, dialogButtons).setPosition(500, 300),
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
                    //then reset
                    player.noOfTurnsUsed = 0;
                    player.noOfTurnsToGetToStudyCentre = 0;
                    hourglassText.visible = false;
                    hourglassImage.visible = false;
                    processTileLandedOn();
                })            
            }, DELAY_BEFORE_DIALOG_LOADS)
        } else if(!(player.onTileType == 4 || player.onTileType == 5)) {
            if (player.noOfTurnsUsed == player.noOfTurnsToGetToStudyCentre) {
                //lose samples
                //dialog to say so
                var dialogTitle = 'You didn\'t make it to the study centre';
                var dialogPrompt = 'All the samples you have been carrying with you have expired';
                var dialogButtons = [
                    {
                        'text':'OK',
                        'wrap': false
                    }    
                ]
                
                setTimeout(() => {
                    globalScene.rexUI.modalPromise(
                        // Game object
                        CreateDialog(dialogTitle, dialogPrompt, dialogButtons).setPosition(500, 300),
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
                        //then reset
                        var updateDetails = {
                            'money':0,
                            'kit':0,
                            'recruitment':-player.samplesCollectedSinceLastStudyCentre,
                            'turn':0 
                        }
                        updateInventory(updateDetails);  
                        player.noOfTurnsUsed = 0;
                        player.noOfTurnsToGetToStudyCentre = 0;
                        hourglassText.visible = false;
                        hourglassImage.visible = false;
                        processTileLandedOn();
                    })            
                }, DELAY_BEFORE_DIALOG_LOADS)
            } else {
                //increment player.noOfTurnsUsed
                //player.noOfTurnsUsed = player.noOfTurnsUsed + 1;
                //hourglassText.text = player.noOfTurnsUsed;
                //highlightTextObject(scene,hourglassText);
                processTileLandedOn();
            }
        }

    } else {
        processTileLandedOn(); 
    }
    
}
   


/*
*   Expecting updateDetails object of format: {
*       'money':0,
*       'kit':0,
*       'recruitment':0,
*       'turn':-1  //need to make player aware that losing a turn
*   }
*   
*/
var updateInventory = function (updateDetails) {
    if(updateDetails.money!=0) {
        player.noOfCoins = player.noOfCoins + updateDetails.money;  //if -ve then will be subtracted
        if(player.noOfCoins < 0) player.noOfCoins = 0;
        highlightTextObject(coinText);
        coinText.text = player.noOfCoins;
        if (player.noOfCoins > 2) {
            coinText.clearTint();
            coinImage.clearTint();
        } else {
            coinText.setTint(INVENTORY_COLOURS[player.noOfCoins]);
            coinImage.setTint(INVENTORY_COLOURS[player.noOfCoins]);
        }
    }
    if(updateDetails.kit!=0) {
        player.noOfKits = player.noOfKits + updateDetails.kit ;
        if(player.noOfKits < 0) player.noOfKits = 0;
        highlightTextObject(kitText);
        kitText.text = player.noOfKits;
        if (player.noOfKits > 2) {
            kitText.clearTint();
            kitImage.clearTint();
        } else {
            kitText.setTint(INVENTORY_COLOURS[player.noOfKits]);
            kitImage.setTint(INVENTORY_COLOURS[player.noOfKits]);
        }
    }
    if(updateDetails.recruitment!=0) {
        player.noOfRecruitments = player.noOfRecruitments + updateDetails.recruitment;
        player.samplesCollectedSinceLastStudyCentre = player.samplesCollectedSinceLastStudyCentre + updateDetails.recruitment; //used to calculate how many sampkles to lose in timed challenge
        if(player.noOfRecruitments < 0) player.noOfRecruitments = 0;
        //i
        highlightTextObject(recruitmentText);
        recruitmentText.text = player.noOfRecruitments;
    }
    if(updateDetails.turn!=0) {
        player.noOfTurns = player.noOfTurns + updateDetails.turn;
    }
    return; 
}

var highlightTextObject = function (textObject) {
    var flashText = globalScene.tweens.add({
        targets: textObject,
        scale: 1.5,
        ease: 'Linear',
        duration: 300,
        repeat: 0,
        yoyo: true,
      });
    return; 
}

/*
 *
 * Functions to create dialogs and labels
 *
 */

/*
* title
* prompt
* dialogButtons = []
*/

var CreateDialog = function (title, prompt, dialogButtons) {

    var dialog = globalScene.rexUI.add.dialog({
        x: 500,
        y: 400,
        width: 600,
        background: globalScene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

        title: CreateLabel(title, false, 0x003c8f),
        
        description: CreateLabel(prompt, true, 0x1565c0),

        
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
        var newLabel = CreateLabel(dialogButton.text, dialogButton.wrap)
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

    dialog.setDepth(99);

    return dialog;
}

var CreateLabel = function (text, wrap, colour) {
    var background;
    if (colour){
        background = globalScene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, colour);
    } else {
        background = globalScene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3);
    }
    //var background = scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3);
    var textObj = globalScene.add.text(0, 0, text, {
        fontSize: '24px'
    });
    if (wrap) {
        textObj = globalScene.rexUI.wrapExpandText(textObj);
    }
    return globalScene.rexUI.add.label({
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

var onGameTimer = function () {
    timeLeft = timeLeft - 1;
    stopwatchText.setText(formatTime(timeLeft));
}

var formatTime =function(seconds) {
    if(seconds > 60) {
        // Minutes
        var minutes = Math.floor(seconds/60);
        return minutes;
    }
    else if (seconds >= 0) {
        seconds = seconds.toString().padStart(2,'0');
        return seconds + 's';
    }    
}





/*
 *
 * top-level variables and game creation
 * 
 */

var player;
var dice;
var coinText;
var kitText;
var recruitmentText;
var recruitmentsText;
var stopwatchText;
var hourglassText;
var coinImage;
var kitImage;
var recruitmentImage;
var recruitmentsImage;
var stopwatchImage;
var hourglassImage;

var awaitingRecruitmentOutcome = false;
var recruitmentAttemptNo = 0 ;
var totalNoOfRecruitments = 0;

var timeLeft = GAME_TIME_LIMIT;

var globalScene; //use to make scene availabe throughout code without having to pass between functions

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1100,
  height: 660,
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

var game = new Phaser.Game(config);


/*
 *
 * Utility functions ALSO in dice.js dso need to extract
 * 
 */

function randomIntFromInterval(min, max) { // min and max included - https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
    return Math.floor(Math.random() * (max - min + 1) + min);
}