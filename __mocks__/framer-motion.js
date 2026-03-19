/**
 * Manual mock for framer-motion.
 * Strips animation props so React does not warn about unknown DOM attributes.
 */
const React = require("react");

// Props that framer-motion adds but React DOM does not understand
const MOTION_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "variants",
  "transition",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "whileInView",
  "viewport",
  "layout",
  "layoutId",
  "drag",
  "dragConstraints",
  "dragElastic",
  "dragMomentum",
  "onDragStart",
  "onDragEnd",
  "onDrag",
  "onHoverStart",
  "onHoverEnd",
  "onTap",
  "onTapStart",
  "onTapCancel",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onViewportEnter",
  "onViewportLeave",
  "custom",
  "inherit",
  "transformTemplate",
  "layoutScroll",
  "layoutRoot",
  "style",
  "willChange",
]);

function stripMotionProps(props) {
  const clean = {};
  for (const [key, value] of Object.entries(props)) {
    if (!MOTION_PROPS.has(key)) {
      clean[key] = value;
    }
  }
  return clean;
}

function createMotionComponent(tag) {
  const Component = React.forwardRef(({ children, ...props }, ref) => {
    const cleanProps = stripMotionProps(props);
    return React.createElement(tag, { ...cleanProps, ref }, children);
  });
  Component.displayName = `motion.${tag}`;
  return Component;
}

const TAGS = [
  "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "section", "article", "header", "footer", "nav", "main", "aside",
  "ul", "ol", "li", "a", "button", "form", "input", "label",
  "svg", "path", "circle", "rect", "g",
  "img", "figure", "figcaption",
];

const motion = {};
for (const tag of TAGS) {
  motion[tag] = createMotionComponent(tag);
}

function AnimatePresence({ children }) {
  return children;
}

function useAnimation() {
  return {
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  };
}

function useInView() {
  return true;
}

function useMotionValue(initial) {
  return { get: () => initial, set: jest.fn() };
}

function useSpring(value) {
  return value;
}

function useTransform(value, fn) {
  return value;
}

module.exports = {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
};
