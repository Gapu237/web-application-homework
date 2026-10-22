
export type AudioTaskStatus =
  | "queued"
  | "downloading"
  | "decoding"
  | "ready"
  | "playing"
  | "completed"
  | "cancelled"
  | "failed";

export interface AudioTask {
  id: string;
  name: string;
  url: string;
  status: AudioTaskStatus;
  error?: string;
}

export interface InternalAudioTask extends AudioTask {
  buffer: AudioBuffer | null;
  controller: AbortController | null;
  ownsUrl: boolean;
}

export interface AudioQueueSnapshot {
  tasks: AudioTask[];
  running: boolean;
  activePreparations: number;
}

type Listener = (snapshot: AudioQueueSnapshot) => void;

const terminalStatuses: AudioTaskStatus[] = [
  "completed",
  "cancelled",
  "failed",
];

export class AudioQueue {
  private tasks: InternalAudioTask[] = [];
  private listeners = new Set<Listener>();
  private activePreparations = 0;
  private running = false;
  private disposed = false;

  private readonly audioContext: AudioContext;
  private readonly maxConcurrent: number;

  constructor(
    audioContext: AudioContext,
    maxConcurrent = 3
  ) {
    this.audioContext = audioContext;
    this.maxConcurrent = Math.max(1, Math.floor(maxConcurrent));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): AudioQueueSnapshot {
    return {
      tasks: this.tasks.map(
        ({ id, name, url, status, error }) => ({
          id,
          name,
          url,
          status,
          error,
        })
      ),
      running: this.running,
      activePreparations: this.activePreparations,
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();

    this.listeners.forEach((listener) => {
      listener(snapshot);
    });
  }

  enqueue(file: File): string {
    if (this.disposed) {
      throw new Error("Queue has been disposed.");
    }

    if (
      !file.type.startsWith("audio/") &&
      !/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name)
    ) {
      throw new Error("Unsupported audio file.");
    }

    const task: InternalAudioTask = {
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      status: "queued",
      buffer: null,
      controller: null,
      ownsUrl: true,
    };

    this.tasks.push(task);
    this.notify();
    this.pump();

    return task.id;
  }

  enqueueUrl(name: string, url: string): string {
    if (this.disposed) {
      throw new Error("Queue has been disposed.");
    }

    const task: InternalAudioTask = {
      id: crypto.randomUUID(),
      name,
      url,
      status: "queued",
      buffer: null,
      controller: null,
      ownsUrl: false,
    };

    this.tasks.push(task);
    this.notify();
    this.pump();

    return task.id;
  }

  private pump(): void {
    if (this.disposed) return;

    while (this.activePreparations < this.maxConcurrent) {
      const task = this.tasks.find(
        (item) => item.status === "queued"
      );

      if (!task) break;

      void this.prepare(task);
    }
  }

  private async prepare(task: InternalAudioTask): Promise<void> {
    const controller = new AbortController();

    task.controller = controller;
    task.status = "downloading";
    this.activePreparations++;
    this.notify();

    try {
      const response = await fetch(task.url, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Audio download failed: HTTP ${response.status}`
        );
      }

      const data = await response.arrayBuffer();

      if (controller.signal.aborted || this.disposed) return;

      task.status = "decoding";
      this.notify();

      const buffer = await this.audioContext.decodeAudioData(data);

      if (controller.signal.aborted || this.disposed) return;

      task.buffer = buffer;
      task.status = "ready";
      delete task.error;
    } catch (error) {
      if (controller.signal.aborted || this.disposed) {
        if (!this.disposed) {
          task.status = "cancelled";
        }
      } else {
        task.status = "failed";
        task.error =
          error instanceof Error ? error.message : String(error);
      }
    } finally {
      task.controller = null;
      this.activePreparations--;

      if (task.status === "cancelled") {
        this.releaseUrl(task);
      }

      this.notify();
      this.pump();
    }
  }

  start(): void {
    if (this.disposed) return;

    this.running = true;
    this.notify();
    this.pump();
  }

  stop(): void {
    this.running = false;
    this.notify();
  }

  getNextReadyTask(): InternalAudioTask | undefined {
    if (!this.running || this.disposed) return undefined;

    // Keep playback order: do not skip an earlier pending task.
    const firstPending = this.tasks.find(
      (task) => !terminalStatuses.includes(task.status)
    );

    if (!firstPending || firstPending.status !== "ready") {
      return undefined;
    }

    firstPending.status = "playing";
    this.notify();

    return firstPending;
  }

  completeTask(id: string): void {
    const task = this.tasks.find((item) => item.id === id);

    if (!task || task.status !== "playing") return;

    task.status = "completed";
    task.buffer = null;
    this.releaseUrl(task);
    this.notify();
  }

  cancelTask(id: string): void {
    const task = this.tasks.find((item) => item.id === id);

    if (!task || terminalStatuses.includes(task.status)) return;

    task.controller?.abort();

    if (
      task.status !== "downloading" &&
      task.status !== "decoding"
    ) {
      task.status = "cancelled";
      task.buffer = null;
      this.releaseUrl(task);
    }

    this.notify();
    this.pump();
  }

  private releaseUrl(task: InternalAudioTask): void {
    if (task.ownsUrl) {
      URL.revokeObjectURL(task.url);
      task.ownsUrl = false;
    }
  }

  dispose(): void {
    if (this.disposed) return;

    this.disposed = true;
    this.running = false;

    this.tasks.forEach((task) => {
      task.controller?.abort();
      this.releaseUrl(task);
      task.buffer = null;

      if (!terminalStatuses.includes(task.status)) {
        task.status = "cancelled";
      }
    });

    this.listeners.clear();
  }
}
