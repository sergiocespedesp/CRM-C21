export interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export class CacheService {
    private static PREFIX = 'cache_';
    private static MAX_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Store data in cache with TTL
     * @param key Cache key
     * @param data Data to cache
     * @param ttl Time to live in milliseconds (default: 1 hour)
     */
    static set<T>(key: string, data: T, ttl: number = 3600000): void {
        try {
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                ttl
            };

            const serialized = JSON.stringify(item);

            // Check size
            if (serialized.length > this.MAX_SIZE) {
                console.warn(`Cache item ${key} exceeds max size, not caching`);
                return;
            }

            localStorage.setItem(`${this.PREFIX}${key}`, serialized);
        } catch (error) {
            console.error('Error setting cache:', error);
            // If quota exceeded, clear old cache items
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                this.clearExpired();
            }
        }
    }

    /**
     * Get data from cache
     * @param key Cache key
     * @returns Cached data or null if expired/not found
     */
    static get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(`${this.PREFIX}${key}`);
            if (!item) return null;

            const cached: CacheItem<T> = JSON.parse(item);
            const now = Date.now();

            // Check if expired
            if (now - cached.timestamp > cached.ttl) {
                this.remove(key);
                return null;
            }

            return cached.data;
        } catch (error) {
            console.error('Error getting cache:', error);
            return null;
        }
    }

    /**
     * Remove specific cache item
     * @param key Cache key
     */
    static remove(key: string): void {
        localStorage.removeItem(`${this.PREFIX}${key}`);
    }

    /**
     * Clear all cache items
     */
    static clear(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Clear only expired cache items
     */
    static clearExpired(): void {
        const keys = Object.keys(localStorage);
        const now = Date.now();

        keys.forEach(key => {
            if (key.startsWith(this.PREFIX)) {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const cached: CacheItem<any> = JSON.parse(item);
                        if (now - cached.timestamp > cached.ttl) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    // Invalid cache item, remove it
                    localStorage.removeItem(key);
                }
            }
        });
    }

    /**
     * Get cache statistics
     */
    static getStats(): {
        totalItems: number;
        totalSize: number;
        expiredItems: number;
    } {
        const keys = Object.keys(localStorage);
        let totalItems = 0;
        let totalSize = 0;
        let expiredItems = 0;
        const now = Date.now();

        keys.forEach(key => {
            if (key.startsWith(this.PREFIX)) {
                totalItems++;
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                    try {
                        const cached: CacheItem<any> = JSON.parse(item);
                        if (now - cached.timestamp > cached.ttl) {
                            expiredItems++;
                        }
                    } catch (error) {
                        expiredItems++;
                    }
                }
            }
        });

        return { totalItems, totalSize, expiredItems };
    }

    /**
     * Check if cache has valid data for key
     * @param key Cache key
     * @returns true if valid cache exists
     */
    static has(key: string): boolean {
        return this.get(key) !== null;
    }
}
