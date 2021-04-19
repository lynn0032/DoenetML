import React from "react";
import DoenetRenderer from "./DoenetRenderer.js";
export default class List extends DoenetRenderer {
  render() {
    if (this.doenetSvData.hidden) {
      return null;
    }
    if (this.doenetSvData.item) {
      return /* @__PURE__ */ React.createElement("li", {
        id: this.componentName
      }, /* @__PURE__ */ React.createElement("a", {
        name: this.componentName
      }), this.children);
    } else if (this.doenetSvData.numbered) {
      return /* @__PURE__ */ React.createElement("ol", {
        id: this.componentName
      }, /* @__PURE__ */ React.createElement("a", {
        name: this.componentName
      }), this.children);
    } else {
      return /* @__PURE__ */ React.createElement("ul", {
        id: this.componentName
      }, /* @__PURE__ */ React.createElement("a", {
        name: this.componentName
      }), this.children);
    }
  }
}
