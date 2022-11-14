const REEL_WIDTH = 140
const SYMBOL_SIZE = 135

class Game extends PIXI.Application {

    resize = () => {
        this.renderer.resize(window.innerWidth, window.innerHeight)
        this.playText.x = (window.innerWidth - this.playText.width) / 2;
        this.reelContainer.x = (this.screen.width - this.reelContainer.width) / 2  + SYMBOL_SIZE / 2
        this.reelContainer.mask = new PIXI.Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0,SYMBOL_SIZE * 2, this.screen.width, SYMBOL_SIZE * 3)
            .endFill()
    }

    showProgress = (e) => {
        console.log(e.progress)
    }

    reportError = (e) => {
        console.error("ERROR: " + e.message)
    }

    doneLoading = (e) => {
        console.log("DONE LOADING!", e)
        const { resources } = e

        this.add(resources.cherry)
        this.add(resources.grape)
        this.add(resources.lemon)
        this.add(resources.orange)
        this.add(resources.plum)
        this.add(resources.watermellon)

        for (let i=0; i < 4; i++) {
            const rc = new PIXI.Container()
            rc.x = i * REEL_WIDTH
            this.reelContainer.addChild(rc)

            const reel = {
                container: rc,
                symbols: [],
                position: 0,
                previousPosition: 0,
                blur: new PIXI.filters.BlurFilter(),
            }

            reel.blur.blurX = 0
            reel.blur.blurY = 0
            rc.filters = [reel.blur]

            const shuffledItems = this.shuffle(this.loadedAssets)

            for(let j=0; j < shuffledItems.length; j++) {
                const symbol = new PIXI.spine.Spine(shuffledItems[j].spineData)

                symbol.y = j * SYMBOL_SIZE
                symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height)
                symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2)
                reel.symbols.push(symbol)
                rc.addChild(symbol)
            }


            this.reels.push(reel)
        }

        this.stage.addChild(this.reelContainer)
        this.reelContainer.x = (this.screen.width - this.reelContainer.width) / 2  + SYMBOL_SIZE / 2
        this.reelContainer.y =  3 * SYMBOL_SIZE / 2

        this.ticker.add(this.tweenManager.update)
    }

    constructor(data) {
        const canvas = document.getElementById('my-canvas')
    
        super({
            view: canvas,
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: window.devicePixelRatio,
            autoDensity: true,
        })

        this.data = data

        console.log(this.data)

        window.addEventListener('resize', this.resize)

        const loader = PIXI.Loader.shared
        loader.baseUrl = 'assets/symbols'
        loader.onProgress.add(this.showProgress)
        loader.onComplete.add(this.doneLoading)
        loader.add('cherry', 'symbol_00.json')
            .add('lemon', 'symbol_01.json')
            .add('orange', 'symbol_02.json')
            .add('plum', 'symbol_03.json')
            .add('grape', 'symbol_04.json')
            .add('watermellon', 'symbol_05.json')
        
        this.ticker.add(this.animate)
        this.loadedAssets = []
        this.reels = []
        this.reelContainer = new PIXI.Container()
        this.winningsContainer = new PIXI.Container()

        this.playerBalanceText = null
        this.playText = null
        this.spinning = false
        this.tweening = []
        this.tweenManager = new TweenManager(this.reelContainer)
        this.playerBalance = 10
        this.playerStake = 2
    }

    updatePlayerStake(stake) {
        this.playerStake = parseInt(stake)
    }

    add(asset) {
        this.loadedAssets.push(asset)
    }

    shuffle(originalAssets) {
        let tempArray = originalAssets
        let currentIndex = originalAssets.length,  randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [tempArray[currentIndex], tempArray[randomIndex]] = [tempArray[randomIndex], tempArray[currentIndex]]
        }

        return tempArray;
    }

    async setup() {

        // Add play text
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
        });

        this.playText = new PIXI.Text('Spin the wheels!', style);
        this.playText.x = (window.innerWidth - this.playText.width) / 2;
        this.playText.y = this.screen.height - 135
        
        this.stage.addChild(this.playText)

        this.playText.interactive = true;
        this.playText.buttonMode = true;
        this.playText.addListener('pointerdown', this.spin);

        this.reelContainer.mask = new PIXI.Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0,SYMBOL_SIZE * 2, this.screen.width, SYMBOL_SIZE * 3)
            .endFill()
        this.playerBalanceText = new PIXI.Text(`Balance: ${this.playerBalance}`, {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                align: 'center',
            });
        this.playerBalanceText.x = 15
        this.playerBalanceText.y = 15

        this.stage.addChild(this.playerBalanceText)
           
        return new Promise((resolve, reject) => {
            PIXI.Loader.shared.load(() => {
                resolve()
            })

            PIXI.Loader.shared.onError.add((e) => {
                this.reportError(e)
                reject()
            })
        })
    }

    spin = () => {
        if (this.spinning) return;
        this.spinning = true
        this.reelContainer.visible = true
        this.winningsContainer.removeChildren(0, this.winningsContainer.children.length)

        this.playerBalance -= this.playerStake

        const { results } = this.data[Math.floor(Math.random() * this.data.length)].response

        const stakeButton = document.getElementById('stake-button')
        stakeButton.disabled = true

        const stakeAmount = document.getElementById('stake-amount')
        stakeAmount.disabled = true

        for (let i=0; i < this.reels.length; i++) {
            const reel = this.reels[i]
            const extra = Math.floor(Math.random() * 3)
            const target = reel.position + 10 + i * 5 + extra
            const time = 2500 + i * 600 + extra * 600
            this.tweenManager.tweenTo(reel, 'position', target, time, null, i === this.reels.length - 1 ? () => this.reelsComplete(results): null)
        }
    }

    reelsComplete = (results) => {
        this.spinning = false
        this.reelContainer.visible = false

        const map = ['cherry', 'grape', 'lemon', 'orange', 'plum', 'watermellon']
        const loader = PIXI.Loader.shared

        for (let i=0; i < results.symbolIDs.length; i++) {
            const symbol = new PIXI.spine.Spine(loader.resources[map[results.symbolIDs[i]]].spineData)

            if (results.win > 0)
                symbol.state.setAnimation(0, 'win', true)
            
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height)
            symbol.x = i * SYMBOL_SIZE

            this.winningsContainer.addChild(symbol)
        }

        this.winningsContainer.x = (this.screen.width - this.winningsContainer.width + SYMBOL_SIZE) / 2
        this.winningsContainer.y = (this.screen.height - this.winningsContainer.height) / 1.7
        this.stage.addChild(this.winningsContainer)

        this.playerBalance += results.win

        const stakeButton = document.getElementById('stake-button')
        stakeButton.disabled = false

        const stakeAmount = document.getElementById('stake-amount')
        stakeAmount.disabled = false
    }

    animate = (delta) => {
        this.playerBalanceText.text = `Balance: ${this.playerBalance}`
        this.playText.interactive = !this.spinning && this.playerBalance - this.playerStake > 0;
        this.playText.buttonMode = !this.spinning  && this.playerBalance - this.playerStake > 0;
        
        for (let i=0; i < this.reels.length; i++) {
            const reel = this.reels[i]

            reel.blur.blurY = (reel.position - reel.previousPosition) * 8
            reel.previousPosition = reel.position

            for (let j=0; j < reel.symbols.length; j++) {
                const symbol = reel.symbols[j]
                const prevY = symbol.y

                symbol.y = ((reel.position + j) % reel.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE

                // if (symbol.y < SYMBOL_SIZE && prevY > SYMBOL_SIZE) {
                //     symbol.hackTectureBySlotName('head', this.loadedAssets[Math.floor(Math.random() * this.loadedAssets.length)].texture)
                // }
            }
        }
    }
}