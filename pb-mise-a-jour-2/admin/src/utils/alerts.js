// Alertes de nouvelle commande : son + vibration + notification du navigateur (si autorisée).

let ctx;
export function playBeep() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    [[880, 0], [1175, 0.18]].forEach(([freq, delay]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.start(t); o.stop(t + 0.3);
    });
  } catch { /* son bloqué par le navigateur : sans importance */ }
}

export function vibrate() { try { navigator.vibrate?.([200, 100, 200]); } catch { /* ignore */ } }

export const notifSupported = () => typeof Notification !== "undefined";
export const notifPermission = () => (notifSupported() ? Notification.permission : "unsupported");
export async function askNotifPermission() { return notifSupported() ? Notification.requestPermission() : "unsupported"; }

export function showNotification(title, body, icon) {
  try { if (notifSupported() && Notification.permission === "granted") new Notification(title, { body, icon, tag: "pb-new-order" }); }
  catch { /* ignore */ }
}
