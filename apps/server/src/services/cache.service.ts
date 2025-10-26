import { getRedisClient } from "../config/redis.config.js";
import type Redis from "ioredis";

export class CacheService {
  private redis: Redis | null;

  constructor() {
    this.redis = getRedisClient();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Erro ao ler do cache:", error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return;

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error("Erro ao escrever no cache:", error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async increment(key: string, by: number = 1): Promise<number | null> {
    if (!this.redis) return null;
    return await this.redis.incrby(key, by);
  }

  async decrement(key: string, by: number = 1): Promise<number | null> {
    if (!this.redis) return null;
    return await this.redis.decrby(key, by);
  }

  // Cache específico para sessões
  async cacheSession(
    sessionId: string,
    data: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttlSeconds);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Cache específico para turmas disponíveis
  async cacheTurmas(turmas: any[], ttlSeconds: number = 300): Promise<void> {
    await this.set("turmas:active", turmas, ttlSeconds);
  }

  async getCachedTurmas(): Promise<any[] | null> {
    return await this.get<any[]>("turmas:active");
  }

  // Cache de status de sincronização
  async cacheSyncStatus(batchId: string, status: any): Promise<void> {
    await this.set(`sync:${batchId}`, status, 3600); // 1 hora de TTL
  }

  async getSyncStatus(batchId: string): Promise<any | null> {
    return await this.get(`sync:${batchId}`);
  }

  // Invalidação em massa
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis) return;

    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export const cacheService = new CacheService();
