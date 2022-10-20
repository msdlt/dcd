export default class Dice extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame, callback) {
    
    super(scene, x, y, texture, frame);//, 'faces', 5);

    this.callback = callback;
    this.rolling = false;

    this.rollCounter = 0; //for fudging rolls only!)

    this.setOrigin(0.5, 0.5); //means tween origin is in cente of die

    this.flashTween = this.flashTween = this.scene.tweens.add({
      targets: this,
      scale: 1.1,
      ease: 'Linear',
      duration: 200,
      repeat: -1,
      yoyo: true,
    });

    this.setInteractive();

    scene.add.existing(this);

    scene.anims.create({
      key: 'roll',
      frames: this.anims.generateFrameNumbers(texture, { frames: [ 0, 1, 2, 1, 5, 3, 4, 0, 1, 5, 2] }),
      frameRate: 10,
      repeat: 0
    });

    this.on('animationcomplete', ()=>{
      //generate a random number
      var rolled;
      /*if (this.rollCounter == 0) {
        rolled = 4; //this.randomIntFromInterval(1,6); 
        this.rollCounter = 1;
    } else if (this.rollCounter == 1) {
      rolled = 5; //this.randomIntFromInterval(1,6); 
      this.rollCounter = 2;
    } else if (this.rollCounter == 2) {
      rolled = 6; //this.randomIntFromInterval(1,6); 
      this.rollCounter = 3;
    } else {*/
      rolled = this.randomIntFromInterval(1,6); 
    //}
      //console.log(rolled);
      this.setFrame(rolled-1);
      this.callback(rolled);
      this.rolling = false;
    })
    
    this.on('pointerdown', function (pointer) {
      if(!this.rolling) {
        this.roll();    
      }
    });
  }

  roll() {
    this.rolling = true;  
    if(this.flashTween) { this.flashTween.pause()};    
    this.anims.play('roll');
  }

  flash() {
    this.flashTween.resume(); 
  }

  randomIntFromInterval(min, max) { // min and max included - https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}