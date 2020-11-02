import RateLimiter from './RateLimiter';

test('Basic Rate Limiting', () => {
	let currentTime: number = 0;
	function timeMock(): number {
		return currentTime;
	}
	const limiter: RateLimiter = new RateLimiter(1000, 1, 2, timeMock);
	expect(limiter.tryRemoveToken('bob')).toBe(true);
	expect(limiter.tryRemoveToken('bob')).toBe(true);
	expect(limiter.tryRemoveToken('bob')).toBe(false);
	currentTime += 1500;
	expect(limiter.tryRemoveToken('bob')).toBe(true);
	expect(limiter.tryRemoveToken('bob')).toBe(false);
	currentTime += 1500;
	expect(limiter.tryRemoveToken('bob')).toBe(true);
	expect(limiter.tryRemoveToken('bob')).toBe(true);
	expect(limiter.tryRemoveToken('bob')).toBe(false);
});

test('Per User rate Limiting', () => {
	let currentTime: number = 0;
	function timeMock(): number {
		return currentTime;
	}
	const limiter: RateLimiter = new RateLimiter(1000, 1, 2, timeMock);
	expect(limiter.tryRemoveTokens('bob', 2)).toBe(true);
	expect(limiter.tryRemoveToken('bob')).toBe(false);
	expect(limiter.tryRemoveTokens('alice', 1)).toBe(true);
	currentTime += 1500;
	expect(limiter.tryRemoveTokens('alice', 2)).toBe(true);
	expect(limiter.tryRemoveTokens('alice', 1)).toBe(false);
});

test('Bursting', () => {
	let currentTime: number = 0;
	function timeMock(): number {
		return currentTime;
	}
	const limiter: RateLimiter = new RateLimiter(1000, 1, 10000, timeMock);
	expect(limiter.tryRemoveTokens('bob', 10000)).toBe(true);
	currentTime += 10000;
	// We can burst and still earn back slowly
	expect(limiter.tryRemoveTokens('bob', 13)).toBe(false);
	expect(limiter.tryRemoveTokens('bob', 10)).toBe(true);
});
