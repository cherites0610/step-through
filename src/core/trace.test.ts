import { describe, expect, it } from 'vitest';
import { PlayerController } from './trace';

describe('PlayerController', () => {
  it('在邊界內移動並夾住 index', () => {
    const p = new PlayerController(3);
    p.prev();
    expect(p.snapshot.index).toBe(0);
    p.next();
    p.next();
    p.next();
    expect(p.snapshot.index).toBe(2);
    expect(p.snapshot.atEnd).toBe(true);
  });

  it('跳轉到任一步', () => {
    const p = new PlayerController(10);
    p.goTo(7);
    expect(p.snapshot.index).toBe(7);
    p.goTo(99);
    expect(p.snapshot.index).toBe(9);
  });

  it('播放到結尾自動暫停，再播放會從頭開始', () => {
    const p = new PlayerController(2);
    p.play();
    expect(p.snapshot.playing).toBe(true);
    p.next();
    expect(p.snapshot.playing).toBe(false);
    p.play();
    expect(p.snapshot.index).toBe(0);
    expect(p.snapshot.playing).toBe(true);
  });

  it('load 會重設狀態', () => {
    const p = new PlayerController(5);
    p.goTo(3);
    p.load(8);
    expect(p.snapshot).toMatchObject({ index: 0, length: 8, playing: false });
  });
});
