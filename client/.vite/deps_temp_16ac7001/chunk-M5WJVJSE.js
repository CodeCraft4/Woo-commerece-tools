import {
  useForkRef
} from "./chunk-YTI4PRXL.js";
import {
  useEnhancedEffect_default
} from "./chunk-4VSWXUFW.js";
import {
  require_react
} from "./chunk-6VIQC2ON.js";
import {
  __toESM
} from "./chunk-HXA6O6EE.js";

// node_modules/@mui/material/esm/utils/useForkRef.js
var useForkRef_default = useForkRef;

// node_modules/@mui/utils/esm/useEventCallback/useEventCallback.js
var React = __toESM(require_react(), 1);
function useEventCallback(fn) {
  const ref = React.useRef(fn);
  useEnhancedEffect_default(() => {
    ref.current = fn;
  });
  return React.useRef((...args) => (
    // @ts-expect-error hide `this`
    (0, ref.current)(...args)
  )).current;
}
var useEventCallback_default = useEventCallback;

export {
  useEventCallback_default,
  useForkRef_default
};
//# sourceMappingURL=chunk-M5WJVJSE.js.map
