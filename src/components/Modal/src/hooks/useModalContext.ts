import { InjectionKey } from 'vue';
import { createContext, useContext } from '@/hooks/core/useContext';

// 导出接口ModalContextProps
export interface ModalContextProps {
  // 定义一个函数redoModalHeight，无参数，无返回值
  redoModalHeight: () => void;
}

// 定义一个InjectionKey类型的变量key，值为一个Symbol类型的变量
const key: InjectionKey<ModalContextProps> = Symbol();

// 定义一个函数createModalContext，接收一个ModalContextProps类型的参数context，返回一个ModalContextProps类型的上下文
export function createModalContext(context: ModalContextProps) {
  // 调用createContext函数，创建一个ModalContextProps类型的上下文，传入参数context和key
  return createContext<ModalContextProps>(context, key);
}

// 定义一个函数useModalContext，无参数，无返回值
export function useModalContext() {
  // 调用useContext函数，使用key变量，返回一个ModalContextProps类型的上下文
  return useContext<ModalContextProps>(key);
}
