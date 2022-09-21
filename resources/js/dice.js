export default class Dice extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame, callback) {
    
    super(scene, x, y, texture, frame);//, 'faces', 5);

    this.callback = callback;
    this.rolling = false;

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
      var rolled = this.randomIntFromInterval(1,6); 
      //console.log(rolled);
      this.setFrame(rolled-1);
      this.callback(scene, rolled);
      this.rolling = false;
    })
    
    this.on('pointerdown', function (pointer) {
      if(!this.rolling) {
        this.rolling = true;
        this.anims.play('roll'); 
      }
    });
  }

  roll() {
    this.anims.play('roll');    
  }

  randomIntFromInterval(min, max) { // min and max included - https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}