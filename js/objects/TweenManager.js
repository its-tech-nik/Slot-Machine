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