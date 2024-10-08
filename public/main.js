class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('menuBg', 'assets/start.jpg');
    this.load.image('startButton', 'assets/btn.png');
  }

  create() {
    const background = this.add.image(400, 300, 'menuBg');
    background.setDisplaySize(800, 600);

    const startButton = this.add.image(400, 530, 'startButton')
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('GameScene'));
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('gameBg', 'assets/poids.png');
    this.load.spritesheet('idleSprite', 'assets/Idle.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('attackSprite', 'assets/Attack_1.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('gauge', 'assets/jauge.png', { frameWidth: 53, frameHeight: 233 });
    this.load.image('sphere', 'assets/balle.png');
  }

  create() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const background = this.add.image(400, 300, 'gameBg');
    background.setDisplaySize(800, 600);

    this.character = this.add.sprite(150, 450, 'idleSprite').setDisplaySize(150, 150);
    this.gaugeSprite = this.add.sprite(50, 150, 'gauge').setFrame(0);

    this.isPressing = false;
    this.currentGaugeIndex = 0;

    this.input.keyboard.on('keydown-SPACE', () => this.startGauge());
    this.input.keyboard.on('keyup-SPACE', () => this.stopGauge());

    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNames('attackSprite', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNames('idleSprite', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.character.anims.play('idle');
  }

  startGauge() {
    if (!this.isPressing) {
      this.isPressing = true;
      this.currentGaugeIndex = 0;
      this.updateGauge();
    }
  }

  stopGauge() {
    this.isPressing = false;
    const scoreMultiplier = this.currentGaugeIndex;

    this.character.anims.play('attack');

    this.time.delayedCall(500, () => {
      this.character.anims.play('idle');
    });

    this.resetGauge();
    this.launchSphere(scoreMultiplier);
  }

  launchSphere(scoreMultiplier) {
    const distance = scoreMultiplier * 100;
    const startX = this.character.x;
    const startY = this.character.y;
    const endX = startX + distance + 30;
    const endY = startY + 50;
    const peakY = startY - 150;
    const duration = 1000;
  
    const sphere = this.add.sprite(startX, startY, 'sphere').setDisplaySize(25, 25);
  
    const h = (startX + endX) / 2;
    const k = peakY;
    const a = -4 * (k - startY) / Math.pow(distance + 30, 2);
  
    this.tweens.addCounter({
      from: 0,
      to: distance + 30,
      duration: duration,
      onUpdate: (tween) => {
        const progress = tween.getValue();
        const newX = startX + progress;
        const newY = a * Math.pow(newX - h, 2) + k + (endY - startY) * (progress / (distance + 30));
        sphere.setPosition(newX, newY);
      },
      onComplete: () => {
        sphere.setPosition(endX, endY);
  
        this.time.delayedCall(1000, () => {
          this.scene.start('ScoreScene', { score: scoreMultiplier });
        });
      }
    });
  }

  updateGauge() {
    if (this.isPressing) {
      this.gaugeSprite.setFrame(this.currentGaugeIndex);
      this.currentGaugeIndex = (this.currentGaugeIndex + 1) % 6;

      this.time.delayedCall(100, () => {
        if (this.isPressing) {
          this.updateGauge();
        }
      });
    }
  }

  resetGauge() {
    this.gaugeSprite.setFrame(0);
    this.currentGaugeIndex = 0;
  }

  update() {}
}

class ScoreScene extends Phaser.Scene {
  constructor() {
    super('ScoreScene');
  }

  preload() {
    this.load.image('scoreBg', 'assets/end.jpg');
    this.load.image('retryButton', 'assets/btn.png');
  }

  create(data) {
    const background = this.add.image(400, 300, 'scoreBg');
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    const score = (data.score || 0) * 20 - 10;

    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2 + 50; 

    this.add.text(centerX, centerY, ` ${score}`, { fontSize: '64px', fill: '#000' }).setOrigin(0.5);

    const retryButton = this.add.image(750, 550, 'retryButton')
      .setOrigin(1, 1)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('GameScene'));
  }
}


const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [MenuScene, GameScene, ScoreScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);
