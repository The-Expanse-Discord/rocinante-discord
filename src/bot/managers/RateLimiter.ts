
function defaultTimer() {
    return Date.now();
}

/**
 * Keeps track of a map of keys (presumably user IDs) to remaining tokens. 
 * Tokens are earned back every interval milliseconds at a rate of 
 * tokensPerInterval every interval.
 * 
 * When an id tries to 'spend' a token we create that ID in our data lookup. 
 * Once the id has earned back to the maximum number of tokens it is removed
 * again. The data lookup should only contain IDs that have spent tokens 
 * recently.
 * 
 * The maximum amount of tokens an ID can have is maxTokens
 */
export default class RateLimiter {
    /**
     * The last time we updated everyone's tokens
     */
    private interval: number;
    private maxTokens: number;
    private tokensPerInterval: number;
    private lastDrip: number = 0;
    private data: { [key:string]:number; }  = {};

    /**
     * Internal function to allow testing calls at different times without overriding Date.now
     */
    private timer: () => number;

    private dripIfNecessary() {
        let difference = this.timer() - this.lastDrip
        
        // We set our new drip time and additional tokens 
        // based on an integral number of intervals having occurred
        let intervalsPassed = Math.floor(difference / this.interval);
        let newLastDrip = this.lastDrip + this.interval * intervalsPassed;
        let addedTokens = intervalsPassed * this.tokensPerInterval;
        if (difference > this.interval) {
            for (let key in this.data) {
                let newTokens = this.data[key] + addedTokens;
                if (newTokens > this.maxTokens) {
                    // We're back at max tokens now, we can remove the currently throttled user.
                    delete this.data[key];
                } else {
                    this.data[key] = newTokens;
                }
            }
        }

        this.lastDrip = newLastDrip
    }

    public tryRemoveTokens(userId: string, amount: number) {
        this.dripIfNecessary();
        if (!(userId in this.data)) {
            this.data[userId] = this.maxTokens;
        }
        if (this.data[userId] < amount) {
            return false;
        }
        this.data[userId] -= amount;
        return true;
    }

    public tryRemoveToken(userId: string): boolean {
        return this.tryRemoveTokens(userId, 1);
    }
    
    constructor(interval: number, tokensPerInterval: number, maxTokens: number, timer=defaultTimer) {
        this.interval = interval;
        this.maxTokens = maxTokens;
        this.tokensPerInterval = tokensPerInterval;
        this.timer = timer;
        this.lastDrip = this.timer();
    }
}