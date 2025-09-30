import Redis from 'ioredis';
export declare class RedisClient {
    private static instance;
    static getInstance(redisUrl?: string): Redis;
    static disconnect(): Promise<void>;
}
//# sourceMappingURL=redis.d.ts.map