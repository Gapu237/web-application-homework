
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioQueue,
  type AudioQueueSnapshot,
} from "./audio/audioQueue";
import "./App.css";

const initialSnapshot: AudioQueueSnapshot = {
  tasks: [],
  running: false,
  activePreparations: 0,
};

function App() {
  const [snapshot, setSnapshot] =
    useState<AudioQueueSnapshot>(initialSnapshot);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("Add audio files to begin.");

  const queueRef = useRef<AudioQueue | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const pumpingRef = useRef(false);
  const playingRef = useRef(false);
  const mountedRef = useRef(false);

  const setCurrent = (id: string | null) => {
    currentIdRef.current = id;
    setCurrentId(id);
  };

  const pumpPlayback = useCallback(() => {
    const queue = queueRef.current;

    if (
      !queue ||
      !queue.getSnapshot().running ||
      sourceRef.current ||
      pumpingRef.current
    ) {
      return;
    }

    pumpingRef.current = true;

    try {
      const task = queue.getNextReadyTask();

      if (!task?.buffer) return;

      const context = contextRef.current;
      const analyser = analyserRef.current;

      if (!context || !analyser) return;

      const source = context.createBufferSource();
      source.buffer = task.buffer;
      source.connect(analyser);

      sourceRef.current = source;
      setCurrent(task.id);
      playingRef.current = true;
      setPlaying(true);
      setMessage(`Playing: ${task.name}`);

      source.onended = () => {
        if (sourceRef.current !== source) return;

        sourceRef.current = null;
        source.disconnect();

        queue.completeTask(task.id);

        playingRef.current = false;
        setPlaying(false);
        setCurrent(null);

        if (mountedRef.current) {
          pumpPlayback();
        }
      };

      source.start();
    } catch (error) {
      console.error("Playback error:", error);
      setMessage("Playback failed. Check the audio file.");
    } finally {
      pumpingRef.current = false;
    }
  }, []);

  const ensureEngine = useCallback(async () => {
    if (!contextRef.current) {
      const context = new AudioContext();
      const analyser = context.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      analyser.connect(context.destination);

      contextRef.current = context;
      analyserRef.current = analyser;

      const queue = new AudioQueue(context, 3);
      queueRef.current = queue;

      queue.subscribe((nextSnapshot) => {
        if (!mountedRef.current) return;

        setSnapshot(nextSnapshot);

        if (
          nextSnapshot.tasks.some((task) => task.status === "ready")
        ) {
          queueMicrotask(() => pumpPlayback());
        }
      });
    }

    if (contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }

    return queueRef.current;
  }, [pumpPlayback]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      sourceRef.current = null;

      queueRef.current?.dispose();

      const context = contextRef.current;
      contextRef.current = null;
      analyserRef.current = null;

      if (context && context.state !== "closed") {
        void context.close();
      }
    };
  }, []);

  useEffect(() => {
    let active = true;

    const draw = () => {
      if (!active) return;

      const canvas = canvasRef.current;
      const analyser = analyserRef.current;

      if (canvas) {
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          const dpr = window.devicePixelRatio || 1;

          if (
            canvas.width !== Math.round(width * dpr) ||
            canvas.height !== Math.round(height * dpr)
          ) {
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
          }

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);

          const bins = new Uint8Array(
            analyser?.frequencyBinCount ?? 128
          );

          if (analyser && playingRef.current) {
            analyser.getByteFrequencyData(bins);
          }

          const count = 56;
          const gap = 4;
          const barWidth = Math.max(1, (width - gap * count) / count);

          for (let i = 0; i < count; i++) {
            const value = analyser && playingRef.current
              ? bins[Math.floor((i / count) * bins.length)] / 255
              : 0.025;

            const barHeight = Math.max(3, value * height * 0.9);
            const x = i * (barWidth + gap);
            const y = (height - barHeight) / 2;

            const gradient = ctx.createLinearGradient(
              0, y, 0, y + barHeight
            );
            gradient.addColorStop(0, "#67e8f9");
            gradient.addColorStop(1, "#818cf8");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 3);
            ctx.fill();
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      active = false;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    try {
      const queue = await ensureEngine();
      if (!queue) return;

      let added = 0;

      for (const file of Array.from(files)) {
        try {
          queue.enqueue(file);
          added++;
        } catch (error) {
          console.error(error);
        }
      }

      setMessage(
        added > 0
          ? `Added ${added} track(s). Preparing audio...`
          : "No supported audio files were selected."
      );
    } catch (error) {
      console.error(error);
      setMessage("Unable to initialize the audio engine.");
    }
  };

  const play = async () => {
    try {
      const queue = await ensureEngine();

      if (!queue) return;

      queue.start();
      setMessage("Playback queue started.");
      pumpPlayback();
    } catch (error) {
      console.error(error);
      setMessage("Unable to start audio playback.");
    }
  };

  const pause = async () => {
    const context = contextRef.current;

    queueRef.current?.stop();

    if (context && context.state === "running") {
      await context.suspend();
    }

    playingRef.current = false;
    setPlaying(false);
    setMessage("Playback paused.");
  };

  const resume = async () => {
    try {
      const context = contextRef.current;
      const queue = queueRef.current;

      if (!context || !queue) {
        await play();
        return;
      }

      await context.resume();
      queue.start();

      if (sourceRef.current) {
        playingRef.current = true;
        setPlaying(true);
        setMessage("Playback resumed.");
      } else {
        pumpPlayback();
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to resume playback.");
    }
  };

  const skip = () => {
    const queue = queueRef.current;
    const id = currentIdRef.current;
    const source = sourceRef.current;

    if (!queue || !id || !source) {
      pumpPlayback();
      return;
    }

    // Detach the handler before stopping to avoid completing twice.
    source.onended = null;
    sourceRef.current = null;
    source.stop();
    source.disconnect();

    queue.completeTask(id);

    setCurrent(null);
    playingRef.current = false;
    setPlaying(false);

    queue.start();
    pumpPlayback();
  };

  const cancel = (id: string) => {
    if (currentIdRef.current === id) {
      const source = sourceRef.current;

      if (source) {
        source.onended = null;
        sourceRef.current = null;
        source.stop();
        source.disconnect();
      }

      setCurrent(null);
      playingRef.current = false;
      setPlaying(false);
    }

    queueRef.current?.cancelTask(id);
    pumpPlayback();
  };

  const clearQueue = () => {
    const oldQueue = queueRef.current;
    const oldContext = contextRef.current;

    if (sourceRef.current) {
      sourceRef.current.onended = null;
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    oldQueue?.dispose();

    setCurrent(null);
    playingRef.current = false;
    setPlaying(false);
    setSnapshot(initialSnapshot);

    queueRef.current = null;
    contextRef.current = null;
    analyserRef.current = null;

    if (oldContext && oldContext.state !== "closed") {
      void oldContext.close();
    }

    setMessage("Queue cleared.");
  };

  const currentTask = snapshot.tasks.find(
    (task) => task.id === currentId
  );

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">AQ</div>
        <div>
          <p className="eyebrow">WEB AUDIO LAB</p>
          <h1>Audio Queue Engine</h1>
        </div>
        <span className="status">
          <span className="status-dot" />
          {playing ? "PLAYING" : snapshot.running ? "READY" : "IDLE"}
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">HOMEWORK 2 · CONCURRENCY</p>
        <h2>Your sound, in perfect sequence.</h2>
        <p className="subtitle">
          Concurrent audio preparation. Strict FIFO playback.
          Real-time frequency analysis.
        </p>

        <div className="visualizer">
          <div className="visualizer-title">
            <span>LIVE FREQUENCY ANALYSIS</span>
            <span>{playing ? "● LIVE" : "○ STANDBY"}</span>
          </div>
          <canvas
            ref={canvasRef}
            className="frequency-canvas"
            aria-label="Live audio frequency visualizer"
          />
          <div className="visualizer-footer">
            <span>LOW FREQUENCY</span>
            <span>HIGH FREQUENCY</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NOW PLAYING</p>
            <h2>{currentTask?.name ?? "Nothing playing yet"}</h2>
          </div>
          <span className="counter">{snapshot.tasks.length} TRACKS</span>
        </div>

        <div className="controls">
          {!playing ? (
            <button className="primary" onClick={() => void resume()}>
              ▶ Play / Resume
            </button>
          ) : (
            <button className="primary" onClick={() => void pause()}>
              Ⅱ Pause
            </button>
          )}

          <button
            className="secondary"
            onClick={skip}
            disabled={!currentId}
          >
            Next track →
          </button>

          <button
            className="secondary"
            onClick={clearQueue}
            disabled={snapshot.tasks.length === 0}
          >
            Clear queue
          </button>
        </div>

        <p className="message" aria-live="polite">{message}</p>

        <p className="metrics">
          Active preparations: {snapshot.activePreparations} / 3
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIFO · FIRST IN, FIRST OUT</p>
            <h2>Playback queue</h2>
          </div>
        </div>

        <label className="upload">
          <span className="upload-symbol">＋</span>
          <strong>Add audio files</strong>
          <span>Choose multiple MP3, WAV, OGG, M4A or other audio files</span>
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm"
            multiple
            onChange={(event) => {
              void addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {snapshot.tasks.length === 0 ? (
          <div className="empty">
            Your queue is empty. Add audio files to get started.
          </div>
        ) : (
          <ol className="track-list">
            {snapshot.tasks.map((task, index) => (
              <li
                key={task.id}
                className={`track ${
                  task.id === currentId ? "active" : ""
                }`}
              >
                <span className="number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="track-details">
                  <strong title={task.name}>{task.name}</strong>
                  <span>{task.status}</span>
                  {task.error && (
                    <span className="error">{task.error}</span>
                  )}
                </div>

                {task.status !== "completed" &&
                  task.status !== "cancelled" &&
                  task.status !== "failed" && (
                    <button
                      className="remove"
                      onClick={() => cancel(task.id)}
                      aria-label={`Cancel ${task.name}`}
                    >
                      Cancel
                    </button>
                  )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer>
        <span>WEB APPLICATION DEVELOPMENT</span>
        <span>FIFO · CONCURRENCY · WEB AUDIO API</span>
      </footer>
    </main>
  );
}

export default App;
