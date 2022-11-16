const REEL_WIDTH = 140
const SYMBOL_SIZE = 135

class Game extends PIXI.Application {

    resize = () => {
        this.renderer.resize(window.innerWidth, window.innerHeight + 4)
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
        const { resources } = e

        this.add(resources.cherry)
        this.add(resources.grape)
        this.add(resources.lemon)
        this.add(resources.orange)
        this.add(resources.plum)
        this.add(resources.watermellon)

        const map = ['cherry', 'lemon', 'orange', 'plum', 'grape', 'watermellon']
        const originalMapNames = map.reduce((acc, t, index) => {
            return {
                ...acc,
                [t]: index
            }
        }, {})

        for (let i=0; i < 4; i++) {
            const rc = new PIXI.Container()
            rc.x = i % 4 * REEL_WIDTH
            this.reelContainer.addChild(rc)

            const reel = {
                container: rc,
                symbols: [],
                map: [],
                position: 0,
                prevTarget: -1,
                prevTargetIndex: -1,
                previousPosition: 0,
                blur: new PIXI.filters.BlurFilter(),
            }

            reel.blur.blurX = 0
            reel.blur.blurY = 0
            rc.filters = [reel.blur]

            const shuffledItems = this.shuffle(this.loadedAssets)
            reel.map = shuffledItems.map(t => originalMapNames[t.name])

            for(let j=0; j < shuffledItems.length; j++) {
                const symbol = new PIXI.spine.Spine(shuffledItems[j].spineData)

                symbol.y = j * SYMBOL_SIZE
                symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height)
                symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2)
                symbol.state.addListener({
                    complete: () => this.toggleSpinState(false)
                })
                reel.symbols.push(symbol)
                rc.addChild(symbol)

                if (i > 3) rc.y = -540
            }
            this.reels.push(reel)
        }

        this.stage.addChild(this.reelContainer)
        this.reelContainer.x = (this.screen.width - this.reelContainer.width) / 2  + SYMBOL_SIZE / 2
        this.reelContainer.y =  3 * SYMBOL_SIZE / 2

        this.stage.addChild(this.winningAmount)
           
    }

    constructor(data) {
        const canvas = document.getElementById('my-canvas')

        super({
            view: canvas,
            width: window.innerWidth,
            height: window.innerHeight + 4,
            resolution: window.devicePixelRatio,
            autoDensity: true,
        })

        window.addEventListener('resize', this.resize)

        this.data = data

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

        this.playText = new PIXI.Text('Spin the wheels!')
        this.playerBalanceText = new PIXI.Text(`Balance: ${this.playerBalance}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center',
        });

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 40,
            fill: 'transparent',
            align: 'center',
        });

        this.winningAmount = new PIXI.Text('+8', style)
        this.winningAmount.visible = true

        this.timeline = new TimelineMax()
        this.timeline
        .from(style, .1, {
            scale: 0,
        })
        .to(style, .1, {
            fill: 'white',
        })
        .to(this.winningAmount, .4, {
            x: 95,
            y: 2,
            ease: 'sine',
        })
        .to(style, .08, {
            fill: 'transparent',
            fontSize: 55,
        })
        .pause()

        this.spinning = false
        this.tweening = []
        this.tweenManager = new TweenManager(this.reelContainer)
        this.playerBalance = 10
        this.playerStake = 2
    }

    async setup() {
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

        this.playText.style = style
        this.playText.x = (this.screen.width - this.playText.width) / 2;
        this.playText.y = this.screen.height - 135
        
        this.stage.addChild(this.playText)

        this.playText.interactive = true;
        this.playText.buttonMode = true;
        this.playText.addListener('pointerdown', this.spin);

        this.winningAmount.x = (this.screen.width - this.winningAmount.width) / 2;
        this.winningAmount.y = (this.screen.height - this.winningAmount.width) / 2

        this.reelContainer.mask = new PIXI.Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0,SYMBOL_SIZE * 2, this.screen.width, SYMBOL_SIZE * 3)
            .endFill()
        
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

    add(asset) {
        this.loadedAssets.push(asset)
    }

    updatePlayerStake(stake) {
        this.playerStake = parseInt(stake)
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

    toggleSpinState(state) {
        const stakeButton = document.getElementById('stake-button')
        stakeButton.disabled = state ?? !this.spinning

        const stakeAmount = document.getElementById('stake-amount')
        stakeAmount.disabled = state ?? !this.spinning

        this.spinning = state ?? !this.spinning
    }

    spin = () => {
        if (this.spinning) return

        this.toggleSpinState()

        this.playerBalance -= this.playerStake

        const { results } = this.data[Math.floor(Math.random() * this.data.length)].response

        for (let i=0; i < this.reels.length; i++) {
            const reel = this.reels[i]
            const extra = Math.floor(Math.random() * 3)
            const targetIndex = reel.map.indexOf(results.symbolIDs[i])
            const target = 6 * (i + 1) + reel.position + (reel.prevTargetIndex === -1 ? 0 : 6 - reel.prevTargetIndex) + 3 - targetIndex
            const time = 2500 + i * 600 + extra * 600

            reel.prevTargetIndex = target % 6
            reel.prevTarget = targetIndex % 6

            this.tweenManager.tweenTo(
                reel,
                'position',
                target,
                time,
                null,
                i === this.reels.length - 1 ? () => this.reelsComplete(results): null
            )
        }
    }

    reelsComplete = (results) => {
        if (results.win === 0) {
            this.toggleSpinState()
            return
        }

        this.playerBalance += results.win
        this.winningAmount.text = `+${results.win}`

        this.winningAmount.visible = true

        for (let i=0; i<this.reels.length; i++) {
            const reel = this.reels[i]

            reel.symbols[reel.prevTarget].state.timeScale = 1.5;
            reel.symbols[reel.prevTarget].state.setAnimation(0, 'win', false)
        }

        this.winningAmount.text = `+${results.win}`
        this.timeline.play().restart()
    }

    animate = (delta) => {
        this.tweenManager.update(delta)

        this.playerBalanceText.text = `Balance: ${this.playerBalance}`
        this.playText.interactive = !this.spinning && this.playerBalance - this.playerStake > 0;
        this.playText.buttonMode = !this.spinning  && this.playerBalance - this.playerStake > 0;
        
        for (let i=0; i < this.reels.length; i++) {
            const reel = this.reels[i]

            reel.blur.blurY = (reel.position - reel.previousPosition) * 8
            reel.previousPosition = reel.position

            for (let j=0; j < reel.symbols.length; j++) {
                const symbol = reel.symbols[j]

                symbol.y = ((reel.position + j) % reel.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE
            }
        }
    }
}