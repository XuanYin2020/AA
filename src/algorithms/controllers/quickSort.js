import { QSExp } from '../explanations';
// import 1D tracer to generate array in a separate component of the middle panel
import ArrayTracer from '../../components/DataStructures/Array/Array1DTracer';

export default {
  explanation: QSExp,

  initVisualisers() {
    return {
      array: {
        instance: new ArrayTracer('array', null, 'Array view', { arrayItemMagnitudes: true }), // Label the input array as array view
        order: 0,
      },
    };
  },

  /**
   *
   * @param {object} chunker
   * @param {array} nodes array of numbers needs to be sorted
   */
  run(chunker, { nodes }) {
    const highlight = (vis, index, primaryColor = true) => {
      if (primaryColor) {
        vis.array.select(index);
      } else {
        vis.array.patch(index);
      }
    };

    const unhighlight = (vis, index, primaryColor = true) => {
      if (primaryColor) {
        vis.array.deselect(index);
      } else {
        vis.array.depatch(index);
      }
    };

    const swapAction = (b, n1, n2) => {
      chunker.add(b, (vis, _n1, _n2) => {
        vis.array.swapElements(_n1, _n2);
      }, [n1, n2]);
    };

    function partition(values, left, right) {
      const a = values;
      let i = left - 1;
      let j = right;
      let tmp;

      const pivot = a[right];
      chunker.add(5, (vis, p) => {
        highlight(vis, p);
        vis.array.assignVariable('pivot', p);
      }, [right]);
      chunker.add(11, (vis, i1) => {
        if (i1 >= 0) {
          highlight(vis, i1, false);
          vis.array.assignVariable('i', i1);
        }
      }, [i]);
      chunker.add(12, (vis, j1) => {
        if (j1 >= 0) {
          highlight(vis, j1, false);
          vis.array.assignVariable('j', j1);
        }
      }, [j]);

      while (i < j) {
        chunker.add(6);
        do {
          i += 1;
          chunker.add(7, (vis, i1) => {
            if (i1 > 0) {
              unhighlight(vis, i1 - 1, false);
            }
            highlight(vis, i1, false);
            vis.array.assignVariable('i', i1);
          }, [i]);
        } while (a[i] < pivot);

        do {
          j -= 1;
          chunker.add(8, (vis, j1) => {
            unhighlight(vis, j1 + 1, false);
            if (j1 >= 0) {
              highlight(vis, j1, false);
              vis.array.assignVariable('j', j1);
            }
          }, [j]);
        } while (i <= j && pivot < a[j]);

        chunker.add(9);
        if (i < j) {
          tmp = a[j];
          a[j] = a[i];
          a[i] = tmp;
          swapAction(10, i, j);
        }
      }
      a[right] = a[i];
      a[i] = pivot;
      swapAction(13, i, right);
      chunker.add(13, (vis, i1, j1, r) => {
        unhighlight(vis, i1);
        if (j1 >= 0) unhighlight(vis, j1, false);
        unhighlight(vis, r, false);
        vis.array.sorted(i1);
      }, [i, j, right]);
      return [i, a]; // Return [pivot location, array values]
    }

    function QuickSort(array, left, right, c, depth) {
      let a = array;
      let p;
      chunker.add(2, (vis) => {
        let newA = vis.array.customVal;
        if(depth > vis.array.customVal.length - 1) {
          let emptyInitialStackArray = new Array(nodes.length).fill(0);

          newA = newA.concat([emptyInitialStackArray]);
        }
        vis.array.setCustomData(newA);

        let newB = vis.array.customVal;


        let c = setState(newB, depth, 1, left, right);
        for(let i=0;i<c.length;i++) {
          for(let j=0;j<c[i].length;j++) {
            if(c[i][j]==0) continue;
            if(i !== depth && c[i][j] != 0 && (j <left || j > right)) {c[i][j] = -1}
            if(i !== depth && (j >=left && j <= right)) {c[i][j] = 0}
          }
        }

        
        vis.array.setCustomData(c);
        vis.array.setDepth(depth);

        // let newB = setState(newA, depth, 1, left, right-1);

        // this is ALWAYS the active, red section of the stack
      });
      if (left < right) {
        [p, a] = partition(a, left, right);

        chunker.add(3, (vis, pivot, arrayLen) => {
          vis.array.customVal[depth][p] = 0;
          // fade out the part of the array that is not being sorted (i.e. right side)
          for (let i = pivot; i < arrayLen; i++) {
            vis.array.fadeOut(i);
          }
        }, [p, right + 1]);
        QuickSort(a, left, p - 1, `${left}/${p - 1}`, depth+1);

        chunker.add(4, (vis, pivot, arrayLen) => {
          vis.array.setDepth(depth);
          // fade out the part of the array that is not being sorted (i.e. left side)
          for (let i = 0; i <= pivot; i++) {
            vis.array.fadeOut(i);
          }
          // fade in part of the array that is now being sorted (i.e. right side)
          for (let i = pivot + 1; i < arrayLen; i++) {
            vis.array.fadeIn(i);
          }

          let newB = vis.array.customVal;


          let c = setState(newB, depth, 1, left, right);
          for(let i=0;i<c.length;i++) {
            for(let j=0;j<c[i].length;j++) {
              if(j <= pivot) {c[i][j] = 0}
              if(i !== depth && c[i][j] != 0 && (j <left || j > right)) {c[i][j] = -1}
              if(i !== depth && (j >=left && j <= right)) {c[i][j] = 0}
            }
          }


        }, [p, right + 1]);
        QuickSort(a, p + 1, right, `${right}/${p + 1}`, depth+1);
      }
      // array of size 1, already sorted
      else if (left < array.length) {
        chunker.add(2, (vis, l) => {
          vis.array.sorted(l);
        }, [left]);
      }
      return a; // Facilitates testing
    }

    chunker.add(
      1,
      (vis, array) => {
        vis.array.set(array, 'quicksort');
        let emptyInitialStackArray = new Array(nodes.length).fill(0);
        vis.array.setCustomData([emptyInitialStackArray]);

      },
      [nodes],
    );

    const result = QuickSort(nodes, 0, nodes.length - 1, `0/${nodes.length - 1}`, 0);
    // Fade out final node
    chunker.add(19, (vis, idx) => {
      vis.array.fadeOut(idx);
      // fade back in all nodes for final sorted state
      for (let i = 0; i < nodes.length; i += 1) {
        vis.array.fadeIn(i);
      }
      vis.array.clearVariables();
      vis.array.setCustomData([]);
    }, [nodes.length - 1]);
    return result;
  },
};

function setState(arr, depth, stateVal, left, right) {
  for(let i=left;i<=right;i++) {
    arr[depth][i] = stateVal;
  }
  return arr;
}