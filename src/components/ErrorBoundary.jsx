// Last line of defence: if a screen throws while rendering (e.g. a corrupt save
// the sanitiser didn't anticipate), show a friendly page instead of a blank
// white one. Reload fixes most one-off glitches. Resetting saves is offered
// separately, behind a confirm, because it deletes every profile on this
// device — it must never happen silently or by a single tap.
import { Component } from 'react';

// Only this app's keys: bb.* (profile slots, active slot, sessions) and the
// pre-profiles legacy save. Other sites/apps on the same origin are untouched.
function clearAppStorage() {
  try {
    const doomed = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('bb.') || key.startsWith('brainblast.'))) doomed.push(key);
    }
    doomed.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* storage unavailable: nothing to clear */
  }
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, confirmReset: false };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Kept for a parent/developer looking at the console; nothing is sent anywhere.
    console.error('Brain Blast crashed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const { confirmReset } = this.state;
    return (
      <div className="card rise center" role="alert">
        <div style={{ fontSize: '2.6rem' }} aria-hidden="true">
          🙈
        </div>
        <h1 className="mt">Something went wrong</h1>
        <p className="small muted mt">
          Sorry — Brain Blast got muddled. Reloading usually sorts it out, and your progress is
          still saved.
        </p>
        <button className="btn btn-primary mt-lg" onClick={() => window.location.reload()}>
          Reload
        </button>
        <div className="divider" />
        {confirmReset ? (
          <div className="panel">
            <p className="small strong mb">Delete every profile on this device?</p>
            <p className="tiny muted mb">
              Coins, progress and gardens for all profiles will be gone for good. Only do this if
              reloading keeps failing.
            </p>
            <div className="btn-row">
              <button
                className="btn btn-primary"
                onClick={() => this.setState({ confirmReset: false })}
              >
                Keep it
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  clearAppStorage();
                  window.location.reload();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={() => this.setState({ confirmReset: true })}>
            Reset this device’s saves…
          </button>
        )}
      </div>
    );
  }
}
