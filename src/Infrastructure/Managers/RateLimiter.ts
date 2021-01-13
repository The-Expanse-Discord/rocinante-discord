
/**
 * @category Managers
 */

function defaultTimer(): number {
	return Date.now();
}

/**
 * Keeps track of a map of keys (make the key unique to whatever level you
 * want, user, user+command, user+command+server, etc) for remaining tokens.
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
	private readonly interval: number;
	private readonly maxTokens: number;
	private readonly tokensPerInterval: number;
	private lastDrip: number = 0;
	private data: { [key: string]: number } = {};

	/**
	 * Internal function to allow testing calls at different times without overriding Date.now
	 */
	private readonly timer: () => number;

	private dripIfNecessary(): void {
		const difference: number = this.timer() - this.lastDrip;

		/*
		 * We set our new drip time and additional tokens
		 * Based on an integral number of intervals having occurred
		 */
		const intervalsPassed: number = Math.floor(difference / this.interval);
		const newLastDrip: number = this.lastDrip + this.interval * intervalsPassed;
		const addedTokens: number = intervalsPassed * this.tokensPerInterval;
		if (difference > this.interval)
			for (const key in this.data)
				if (Object.prototype.hasOwnProperty.call(this.data, key)) {
					const newTokens: number = this.data[key] + addedTokens;
					if (newTokens > this.maxTokens)
					// We're back at max tokens now, we can remove the currently throttled user.
						delete this.data[key];
					else
						this.data[key] = newTokens;
				}

		this.lastDrip = newLastDrip;
	}


	/**
	 * tryRemoveTokens
	 * Make sure to pass in unique strings for keys.  If you want per
	 * command cooldowns, then make sure to include command name in the
	 * unique id you pass.  If you want it to be per server as well,
	 * also include that.
	 * @param uniqueID unique name to store tickets under
	 * @param amout amount of tickets to remove for the given uniqueId
	 */
	public tryRemoveTokens(uniqueId: string, amount: number): boolean {
		this.dripIfNecessary();
		if (!(uniqueId in this.data))
			this.data[uniqueId] = this.maxTokens;

		if (this.data[uniqueId] < amount)
			return false;

		this.data[uniqueId] -= amount;
		return true;
	}

	/**
	 * tryRemoveTokens
	 * Make sure to pass in unique strings for keys.  If you want per
	 * command cooldowns, then make sure to include command name in the
	 * unique id you pass.  If you want it to be per server as well,
	 * also include that.
	 * @param uniqueId unique name to store tickets under
	 */
	public tryRemoveToken(uniqueId: string): boolean {
		return this.tryRemoveTokens(uniqueId, 1);
	}

	/**
	 * numberOfIntervalsUntilAmountCanBeRemoved
	 * Calculates the number of intervals until you can deduct the amount of
	 * tickets you send in.  It does this by figuring out the difference
	 * between the number of tokens it takes and the amount you want to remove
	 * and then divides that by the tokensPerInterval.
	 * @param uniqueId unique name to store tickets under
	 * @param amount amount of tickets to remove for the given uniqueId
	 */
	public numberOfIntervalsUntilAmountCanBeRemoved(uniqueId: string, amount: number): number {
		if (!(uniqueId in this.data) || this.data[uniqueId] > amount)
			return 0;
		const tokensRequired: number = amount - this.data[uniqueId];
		return tokensRequired / this.tokensPerInterval;
	}

	/**
	 * constructor
	 * @param interval how often to generate new tickets
	 * @param tokensPerInterval how  many tickets to generate each interval
	 * @param maxTokens maximum number of tickets an id can hold
	 * @param timer timer, not required, has a default timer
	 */
	public constructor(interval: number, tokensPerInterval: number,	maxTokens: number,
		timer: () => number = defaultTimer) {
		this.interval = interval;
		this.maxTokens = maxTokens;
		this.tokensPerInterval = tokensPerInterval;
		this.timer = timer;
		this.lastDrip = this.timer();
	}
}
