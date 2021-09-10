/* eslint-disable class-methods-use-this */
import Array2DTracer from "./Array2DTracer";
import { Element } from "./Array2DTracer";
import Array1DRenderer from "./Array1DRenderer/index";
import { cloneDeepWith } from "lodash";

class Array1DTracer extends Array2DTracer {
  getRendererClass() {
    return Array1DRenderer;
  }

  init() {
    super.init();
    this.chartTracer = null;
  }

  set(array1d = [], algo) {
    const array2d = [array1d];
    super.set(array2d, algo);
    this.syncChartTracer();
  }

  patch(x, v) {
    super.patch(0, x, v);
  }

  depatch(x) {
    super.depatch(0, x);
  }

  // used to highlight sorted elements
  sorted(x) {
    super.sorted(0, x);
  }

  select(sx, ex = sx) {
    super.select(0, sx, 0, ex);
  }

  deselect(sx, ex = sx) {
    super.deselect(0, sx, 0, ex);
  }

  chart(key) {
    this.chartTracer = key ? this.getObject(key) : null;
    this.syncChartTracer();
  }

  syncChartTracer() {
    if (this.chartTracer) this.chartTracer.data = this.data;
  }

  swapElements(x, y) {
    const temp1 = { ...this.data[0][x], variables: this.data[0][y].variables };
    const temp2 = { ...this.data[0][y], variables: this.data[0][x].variables };
    this.data[0][x] = temp2;
    this.data[0][y] = temp1;
  }

  addVariable(v, sx) {
    this.data[0][sx].variables.push(v);
  }

  removeVariable(v) {
    for (let y = 0; y < this.data[0].length; y++) {
      const newVars = this.data[0][y].variables.filter((val) => val !== v);
      this.data[0][y].variables = newVars;
    }
  }

  clearVariables() {
    for (let y = 0; y < this.data[0].length; y++) {
      this.data[0][y].variables = [];
    }
  }

  assignVariable(v, idx) {
    // deep clone data so that changes to this.data are all made at the same time which will allow for tweening
    function customizer(val) {
      if (val instanceof Element) {
        let newEl = new Element(val.value, val.key);
        if (val.patched) newEl.patched = true;
        if (val.selected) newEl.selected = true;
        if (val.sorted) newEl.sorted = true;
        newEl.variables = val.variables;
        return newEl;
      }
    }
    const newData = cloneDeepWith(this.data, customizer);

    // remove all current occurences of the variable
    for (let y = 0; y < newData[0].length; y++) {
      const newVars = newData[0][y].variables.filter((val) => val !== v);
      newData[0][y].variables = newVars;
    }

    // add variable to item
    newData[0][idx].variables.push(v);

    // update this.data
    this.data = newData;
  }
}

export default Array1DTracer;
