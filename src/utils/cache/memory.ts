// 缓存对象, 用于存储缓存值，超时ID，过期时间，以及生命周期
export interface Cache<V = any> {
  // 缓存值
  value?: V;
  // 超时ID
  timeoutId?: ReturnType<typeof setTimeout>;
  // 计算后的过期时间
  time?: number;
  // 过期时间
  alive?: number;
}

const NOT_ALIVE = 0;

export class Memory<T = any, V = any> {
  // 声明一个名为cache的变量，类型为映射类型，键为T类型的属性，值为Cache类型的实例
  private cache: { [key in keyof T]?: Cache<V> } = {};
  // 声明一个名为alive的变量，类型为number
  private alive: number;

  constructor(alive = NOT_ALIVE) {
    // Unit second
    this.alive = alive * 1000;
  }

  // 获取缓存
  get getCache() {
    return this.cache;
  }

  // 设置缓存
  setCache(cache) {
    this.cache = cache;
  }

  // get<K extends keyof T>(key: K) {
  //   const item = this.getItem(key);
  //   const time = item?.time;
  //   if (!isNil(time) && time < new Date().getTime()) {
  //     this.remove(key);
  //   }
  //   return item?.value ?? undefined;
  // }

  // 获取缓存中的值，并且该值的键应该从K extends keyof T中继承
  get<K extends keyof T>(key: K) {
    // 返回缓存中的值
    return this.cache[key];
  }

  /**
   * 设置缓存
   * @param key key
   * @param value 值
   * @param expires 过期时间, 可以是 具体的前端时间戳, 也可以是相对时间(毫秒)
   */
  set<K extends keyof T>(key: K, value: V, expires?: number) {
    // 根据key 获取缓存对象
    let item = this.get(key);

    // 如果没有设置过期时间，则设置为 alive值
    if (!expires || (expires as number) <= 0) {
      expires = this.alive;
    }

    // 如果缓存中有key，则更新value
    if (item) {
      // 如果缓存中有timeoutId，则清除它
      if (item.timeoutId) {
        clearTimeout(item.timeoutId);
        item.timeoutId = undefined;
      }
      item.value = value;
    } else {
      // 否则，创建一个新的缓存项, 并进行存储
      item = { value, alive: expires };
      this.cache[key] = item;
    }

    // 如果没有设置过期时间，则直接返回value
    if (!expires) {
      return value;
    }
    // 否则，计算过期时间并设置timeoutId
    const now = new Date().getTime();
    /**
     * 设置过期时间
     */
    item.time = expires > now ? expires : now + expires;
    item.timeoutId = setTimeout(
      () => {
        // 移除缓存项
        this.remove(key);
      },
      expires > now ? expires - now : expires,
    );

    return value;
  }

  // 移除指定的key
  remove<K extends keyof T>(key: K) {
    // 获取指定key的值
    const item = this.get(key);
    // 删除cache中指定的key
    Reflect.deleteProperty(this.cache, key);
    // 如果获取到了值
    if (item) {
      // 清除指定key的timeoutId
      clearTimeout(item.timeoutId!);
      // 返回值
      return item.value;
    }
  }

  // 重置缓存
  resetCache(cache: { [K in keyof T]: Cache }) {
    // 遍历缓存中的每一个键
    Object.keys(cache).forEach((key) => {
      // 将键转换为T中的类型
      const k = key as any as keyof T;
      // 获取缓存中的值
      const item = cache[k];
      // 如果值存在且存在过期时间
      if (item && item.time) {
        // 获取当前时间
        const now = new Date().getTime();
        // 获取过期时间
        const expire = item.time;
        // 如果过期时间大于当前时间
        if (expire > now) {
          // 将键和值以及过期时间传入set方法
          this.set(k, item.value, expire);
        }
      }
    });
  }

  // 清除缓存
  clear() {
    // 遍历cache中的每一个键
    Object.keys(this.cache).forEach((key) => {
      // 获取cache中的值
      const item = this.cache[key];
      // 如果值中有timeoutId，清除timeoutId
      item.timeoutId && clearTimeout(item.timeoutId);
    });
    // 清空cache
    this.cache = {};
  }
}
