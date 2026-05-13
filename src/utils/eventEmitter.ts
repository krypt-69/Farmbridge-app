type Listener = () => void;
const listeners: Listener[] = [];

export const onForceLogout = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

export const emitForceLogout = () => {
  listeners.forEach((l) => l());
};