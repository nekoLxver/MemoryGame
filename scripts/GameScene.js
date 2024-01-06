class GameScene extends Phaser.Scene {

    constructor() {
        super("Game");
    }

    preload() {
        this.load.image("animeBGC", "images/bgc.jpg");
        this.load.image("card", "images/card.jpg");
        this.load.image("card1", "images/card1.jpg");
        this.load.image("card2", "images/card2.jpg");
        this.load.image("card3", "images/card3.jpg");
        this.load.image("card4", "images/card4.jpg");
        this.load.image("card5", "images/card5.jpg");
        this.load.audio("theme", "sounds/theme.mp3");
        this.load.audio("complete", "sounds/complete.mp3");
        this.load.audio("success", "sounds/success.mp3");
        this.load.audio("card", "sounds/card.mp3");
        this.load.audio("timeout", "sounds/timeout.mp3");
    }

    createText() {
        this.timeoutText = this.add.text(10, 330, "", {
            font: "36px animeace2_reg",
            fill: "#ffffff",
        });
    }

    onTimerTick() {
        this.timeoutText.setText("Time: " + this.timeout);
        if (this.timeout <= 0) {
            this.timer.paused = true;
            this.sounds.timeout.play({volume: 0.2,});
            this.restart();
        } else {
            this.timeout -= 1;
        }
    }

    createTimer() {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.onTimerTick,
            callbackScope: this,
            loop: true
        })
    }

    createSounds() {
        this.sounds = {
            card: this.sound.add("card"),
            theme: this.sound.add("theme"),
            complete: this.sound.add("complete"),
            success: this.sound.add("success"),
            timeout: this.sound.add("timeout"),
        };
        this.sounds.theme.play({volume: 0.1,});
    }

    create() {
        this.timeout = config.timeout;
        this.createSounds();
        this.createTimer()
        this.createBackground();
        this.createText();
        this.createCards();
        this.start();
    }

    restart() {
        let count = 0;
        let onCardMoveComplete = () => {
            ++count;
            if (count >= this.cards.length) {
                this.start();
            }
        }
        this.cards.forEach(card => {
            card.move({
                x: this.sys.game.config.width + card.width,
                y: this.sys.game.config.height + card.height,
                delay: card.position.delay,
                callback: onCardMoveComplete,
            })
        })
    }

    start() {
        this.initCardsPositions();
        this.timeout = config.timeout;
        this.openedCard = null;
        this.oppenedCardsCount = 0;
        this.timer.paused = false;
        this.initCards();
        this.showCards();
    }

    showCards() {
        this.cards.forEach(card => {
            card.depth = card.position.delay;
            card.move({
                x: card.position.x,
                y: card.position.y,
                delay: card.position.delay,
            })
        })
    }

    initCards() {
        let positions = Phaser.Utils.Array.Shuffle(this.positions);
        this.cards.forEach(card => {
            card.init(positions.pop());
        })
    }

    createBackground() {
        this.add.sprite(0, 0, "animeBGC").setOrigin(0, 0);
    }

    createCards() {
        this.cards = [];

        for (let value of config.cards) {
            for (let i = 0; i < 2; i++) {
                this.cards.push(new Card(this, value));
            }
        }

        this.input.on("gameobjectdown", this.onCardClicked, this);
    }

    onCardClicked(pointer, card) {
        if (card.opened) return false;
        this.sounds.card.play({volume: 0.2,});
        if (this.openedCard) {
            if (this.openedCard.value === card.value) {
                this.openedCard = null;
                this.sounds.success.play({volume: 0.2,});
                ++this.oppenedCardsCount;
            } else {
                this.openedCard.close();
                this.openedCard = card;
            }
        } else {
            this.openedCard = card;
        }

        card.open(() => {
            if (this.oppenedCardsCount == this.cards.length / 2) {
                this.sounds.complete.play({volume: 0.2,});
                this.restart();
            }  
        });
    }

    initCardsPositions() {
        let positions = [];
        let cardTexture = this.textures.get("card").getSourceImage();
        let cardWidth = cardTexture.width + 10;
        let cardHeight = cardTexture.height + 10;
        let offsetX = (this.sys.game.config.width - cardWidth * config.cols) / 2 + cardWidth / 2;
        let offsetY = (this.sys.game.config.height - cardHeight * config.rows) / 2 + cardHeight / 2;
        let id = 0;
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                positions.push({
                    delay: ++id * 100,
                    x: offsetX + col * cardWidth,
                    y: offsetY + row * cardHeight,
                })
            }
        }
    
        this.positions = positions;
    }

}

