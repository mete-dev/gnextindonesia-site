const fs = require("fs");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const code = fs.readFileSync("src/pages/studio/AnalyticsManager.tsx", "utf-8");
let ast;
try {
  ast = parse(code, { plugins: ["typescript", "jsx"], sourceType: "module" });
} catch (e) {
  ast = parse(code, { plugins: ["typescript", "jsx", "errorRecovery"], sourceType: "module" });
  console.log("Syntax error at:", e.loc);
}

// Find unclosed elements by looking at the last JSX element that is missing a closing tag or causes an error.
let depth = 0;
traverse(ast, {
  JSXOpeningElement(path) {
    if (!path.node.selfClosing) {
      console.log(" ".repeat(depth) + "<" + path.node.name.name + "> at line " + path.node.loc.start.line);
      depth++;
    }
  },
  JSXClosingElement(path) {
    depth--;
    console.log(" ".repeat(depth) + "</" + path.node.name.name + "> at line " + path.node.loc.start.line);
  }
});
