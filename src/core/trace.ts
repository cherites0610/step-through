/**
 * 步驟軌跡（Step Trace）：演算法以純函式實作，
 * 輸入 + 操作 → 一串不可變的步驟快照。上一步／跳轉只是改 index。
 */
export type Step<S> = {
  /** 該步結束時的完整資料狀態（不可變） */
  state: S;
  /** 當前聚焦的節點／格子 id */
  highlight: string[];
  /** 對應偽代碼行（0 起算） */
  line: number;
  /** 白話說明（i18n key + 參數） */
  explain: { key: string; params?: Record<string, string | number> };
  stats?: Record<string, number>;
};

export type Trace<S> = Step<S>[];

export type PlayerSnapshot = {
  index: number;
  length: number;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** 與框架無關的播放控制：只維護 index 與播放狀態。 */
export class PlayerController {
  #index = 0;
  #length: number;
  #playing = false;

  constructor(length: number) {
    this.#length = Math.max(0, length);
  }

  get snapshot(): PlayerSnapshot {
    const last = Math.max(0, this.#length - 1);
    return {
      index: this.#index,
      length: this.#length,
      playing: this.#playing,
      atStart: this.#index === 0,
      atEnd: this.#index >= last,
    };
  }

  goTo(i: number) {
    this.#index = clamp(Math.trunc(i), 0, Math.max(0, this.#length - 1));
    if (this.snapshot.atEnd) this.#playing = false;
  }
  next() {
    this.goTo(this.#index + 1);
  }
  prev() {
    this.goTo(this.#index - 1);
  }
  reset() {
    this.#playing = false;
    this.#index = 0;
  }

  play() {
    if (this.snapshot.atEnd) this.#index = 0;
    this.#playing = this.#length > 1;
  }
  pause() {
    this.#playing = false;
  }
  toggle() {
    if (this.#playing) this.pause();
    else this.play();
  }

  /** 換一條新軌跡（例如使用者改了輸入）。 */
  load(length: number) {
    this.#length = Math.max(0, length);
    this.#playing = false;
    this.#index = 0;
  }
}
