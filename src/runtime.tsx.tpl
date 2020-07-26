export function onRouteChange({ matchedRoutes }) {
  const event = new CustomEvent('{{{ eventName }}}', { detail: matchedRoutes.pop().route });
  document.dispatchEvent(event);
}
