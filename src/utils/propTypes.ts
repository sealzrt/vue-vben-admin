import { CSSProperties, VNodeChild } from 'vue';
import { createTypes, VueTypeValidableDef, VueTypesInterface } from 'vue-types';

export type VueNode = VNodeChild | JSX.Element;

// 定义PropTypes类型，它是一个VueTypesInterface的子集，并添加两个属性：style和VNodeChild
type PropTypes = VueTypesInterface & {
  // 定义style属性，它的类型是VueTypeValidableDef<CSSProperties>
  readonly style: VueTypeValidableDef<CSSProperties>;
  // 定义VNodeChild属性，它的类型是VueTypeValidableDef<VueNode>
  readonly VNodeChild: VueTypeValidableDef<VueNode>;
  // readonly trueBool: VueTypeValidableDef<boolean>;
};

// 创建一个新的PropTypes对象
const propTypes = createTypes({
  // 函数
  func: undefined,
  // 布尔值
  bool: undefined,
  // 字符串
  string: undefined,
  // 数字
  number: undefined,
  // 对象
  object: undefined,
  // 整数
  integer: undefined,
}) as PropTypes;

/*** 恢复使用 extend() 函数来扩展, 该方式 在代码中有只能提示   ***/
propTypes.extend([
  {
    name: 'style',
    getter: true,
    type: [String, Object],
    default: undefined,
  },
  {
    name: 'VNodeChild',
    getter: true,
    type: undefined,
  },
]);

/*** 取消使用以下方式, 在代码中没有提示 ***/

// 从 vue-types v5.0 开始，extend()方法已经废弃，当前已改为官方推荐的ES6+方法 https://dwightjack.github.io/vue-types/advanced/extending-vue-types.html#the-extend-method

// class propTypes extends newPropTypes {
//   // a native-like validator that supports the `.validable` method
//   // 静态属性style的获取
//   static override get style() {
//     // 返回一个有效的类型，名为'style'，类型为String或Object
//     return toValidableType('style', {
//       type: [String, Object],
//     });
//   }
//
//   // 静态属性VNodeChild的获取
//   static override get VNodeChild() {
//     // 返回一个有效的类型，名为'VNodeChild'，类型为undefined
//     return toValidableType('VNodeChild', {
//       type: undefined,
//     });
//   }
// }

export { propTypes };
