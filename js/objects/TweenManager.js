class TweenManager {
    constructor(reelContainer) {
        this.reelContainer = reelContainer
        this.tweening = []
    }

    backout = (amount) => {
        return (t) => (--t * t * ((amount + 1) * t + amount) + 1)
    }

    lerp(a1, a2, t) {
        return a1 * (1 - t) + a2 * t
    }

    update = (delta) => {
        const now = Date.now()
        const remove = []

        for (let i=0; i < this.tweening.length; i++) {
            const tweening = this.tweening[i]
            const phase = Math.min(1, (now - tweening.start) / tweening.time)

            tweening.object[tweening.property] = this.lerp(tweening.propertyBeginValue, tweening.target, tweening.easing(phase))

            if (tweening.change) tweening.change(tweening)

            if (phase === 1) {
                tweening.object[tweening.property] = tweening.target
                if (tweening.complete) tweening.complete(tweening)
                remove.push(tweening)
            }
        }

        for (let i=0; i < remove.length; i++) {
            this.tweening.splice(this.tweening.indexOf(remove[i]), 1)
        }

    }

    tweenTo(object, property, target, time, onChange, onComplete) {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing: this.backout(0.5),
            time,
            change: onChange,
            complete: onComplete,
            start: Date.now(),
        }

        this.tweening.push(tween)

        return tween
    }
}

// MOST PROMISING
// const factor = 4
// const repeat = 0

// TweenMax.to([this.reels[0].container, this.reels[1].container, this.reels[2].container, this.reels[3].container], 1 * factor, {
//     y: 670,
//     stagger: 0.2 * factor,
//     // ease: "expo.out",
//     ease: "none",
//     onComplete: () => {
//         // this.reelsComplete(results)
//         this.reels[0].container.y = -540
//         this.reels[1].container.y = -540
//         this.reels[2].container.y = -540
//         this.reels[3].container.y = -540
//     },
// })

// TweenMax.to([this.reels[4].container, this.reels[5].container, this.reels[6].container, this.reels[7].container], 1.87 * factor, {
//     y: 670,
//     delay: 0.4 * factor,
//     repeat,
//     stagger: 0.2 * factor,
//     ease: "none",
//     onComplete: () => {
//         // this.reelsComplete(results)

//         TweenMax.to([this.reels[0].container, this.reels[1].container, this.reels[2].container, this.reels[3].container], 0.9 * factor, {
//             y: 2,
//             stagger: 0.2 * factor,
//             // ease: "expo.out",
//             ease: "none",
//             onComplete: () => {
//                 this.reelsComplete(results)
//                 // alert()

//                 for (let i=4; i<this.reels.length; i++)
//                     this.reels[i].container.y = -540
//             },
//         })

//     },
// })

// TweenMax.to([this.reels[8].container, this.reels[9].container, this.reels[10].container, this.reels[11].container], 1.87 * factor, {
//     y: 670,
//     delay: 1.63 * factor,
//     repeat,
//     stagger: 0.2 * factor,
//     ease: "none",
// })
