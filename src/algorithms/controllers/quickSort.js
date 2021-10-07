import { QSExp } from '../explanations';
// import 1D tracer to generate array in a separate component of the middle panel
import ArrayTracer from '../../components/DataStructures/Array/Array1DTracer';
import ArrayGraphTracer from '../../components/DataStructures/ArrayGraph/ArrayGraphTracer';

export default {
  explanation: QSExp,

  initVisualisers() {
    return {
      array: {
        instance: new ArrayTracer('array', null, 'Array view', { arrayItemMagnitudes: true }), // Label the input array as array view
        order: 0,
      },
      graph: {
        instance: new ArrayGraphTracer('graph', null, 'Graph'),
        order: 1,
      },
    };
  },

  /**
   *
   * @param {object} chunker
   * @param {array} nodes array of numbers needs to be sorted
   */
  run(chunker, { nodes }) {
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
        vis.array.assignVariable('p', p);
      }, [right]);

      chunker.add(11, (vis, i1) => {
        if (i1 >= 0) {
          vis.array.assignVariable('i', i1);
        } else {
          vis.array.removeVariable('i');
        }
      }, [left]);
      chunker.add(12, (vis, j1) => {
        if (j1 >= 0) {
          vis.array.assignVariable('j', j1);
        } else {
          vis.array.removeVariable('j');
        }
      }, [j]);

      chunker.add(6);
      while (i < j) {
        // chunker.add(7);
        do {
          i += 1;
          chunker.add(7, (vis, i1) => {
            if (i1 >= 0) {
              vis.array.assignVariable('i', i1);
            } else {
              vis.array.removeVariable('i');
            }
          }, [i]);
        } while (a[i] < pivot);
        // chunker.add(8);
        do {
          j -= 1;
          chunker.add(8, (vis, j1) => {
            if (j1 >= 0) {
              vis.array.assignVariable('j', j1);
            } else {
              vis.array.removeVariable('j');
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
      chunker.add(13, (vis, i) => {
        vis.array.sorted(i);
      }, [i]);
      return [i, a]; // Return [pivot location, array values]
    }

    function QuickSort(array, left, right, parentId) {
      let a = array;
      let p;
      chunker.add(2);
      if (left < right) {
        [p, a] = partition(a, left, right);
        const leftArray = a.slice(left, p);
        const rightArray = a.slice(p + 1, right + 1);

        chunker.add(3, (vis, pivot, arrayLen,_parentId,_left,_leftArray,_p,_a) => {
          if (_leftArray.length !== 0) {
            vis.graph.addNode(`${_left}/${_p - 1}`, _leftArray);
           vis.graph.addEdge(_parentId, `${_left}/${_p - 1}`);
          }
          vis.graph.addNode(`p${_parentId}`, _a[_p]);
         vis.graph.addEdge(_parentId, `p${_parentId}`);
          // fade out the part of the array that is not being sorted (i.e. right side)
          for (let i=pivot; i < arrayLen; i++){
            vis.array.fadeOut(i)
          } 
        }, [p,right+1,parentId,left,leftArray,p,a]);
        QuickSort(a, left, p - 1, `${left}/${p - 1}`);
        
        chunker.add(4, (vis, pivot, arrayLen,_a, _left, _p, _right, _parentId, _leftArray, _rightArray) => {
          //removing left node and edge
          vis.graph.removeEdge(_parentId, `${_left}/${_p - 1}`);
          vis.graph.removeNode(`${_left}/${_p - 1}`);
          
          if (_rightArray.length !== 0) {
            vis.graph.addNode(`${_right}/${_p + 1}`, _rightArray);
            vis.graph.addEdge(_parentId, `${_right}/${_p + 1}`);
          }
          // fade out the part of the array that is not being sorted (i.e. left side)
          for (let i=0; i <= pivot; i++){
            vis.array.fadeOut(i)
          } 
          // fade in part of the array that is now being sorted (i.e. right side)
          for (let i=pivot+1; i < arrayLen; i++){
            vis.array.fadeIn(i)
          } 
        }, [p, right+1, a, left, p, right, parentId, leftArray, rightArray]);
        QuickSort(a, p + 1, right, `${right}/${p + 1}`);

        chunker.add(49, (vis, _parentId, _right, _p) => {
           //removing right node, edge and pivot
           vis.graph.removeEdge(_parentId, `${_right}/${_p + 1}`);
           vis.graph.removeNode(`${_right}/${_p + 1}`);

           vis.graph.removeEdge(_parentId, `p${_parentId}`);
           vis.graph.removeNode(`p${_parentId}`);
           

        }, [parentId, right, p]);

      }
      // array of size 1, already sorted
      else if (left < array.length) {
        chunker.add(2, (vis, left) => {
          vis.array.sorted(left);
        }, [left]);
      }
     
      return a; // Facilitates testing
    }

    chunker.add(
      1,
      (vis, _nodes) => {
        vis.array.set(_nodes, 'quicksort');
        vis.graph.addNode(`0/${_nodes.length - 1}`, _nodes);
        vis.graph.layoutTree(`0/${_nodes.length - 1}`, false);
      },
      [nodes],
    );
    
    const result = QuickSort(nodes, 0, nodes.length - 1, `0/${nodes.length - 1}`);
    // Fade out final node 
    chunker.add(19, (vis, idx, _nodes) => {
      //vis.graph.removeNode(`0/${_nodes.length - 1}`);
      vis.graph.updateNode(`0/${_nodes.length - 1}`, _nodes);
      vis.array.fadeOut(idx);
      vis.array.clearVariables();;
    }, [nodes.length - 1, nodes]);
    return result;

  },
};
