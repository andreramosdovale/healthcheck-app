type Listener = () => void;
const listeners = new Set<Listener>();

export const authEvents = {
  onSessionExpired(cb: Listener): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  emitSessionExpired() {
    listeners.forEach((cb) => cb());
  },
};
