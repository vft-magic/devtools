export const symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/;
export const rawTypeRE = /^\[object (\w+)\]$/;
export const specialTypeRE = /^\[native (\w+) (.*?)(<>(([\s\S])*))?\]$/;
export const fnTypeRE = /^(?:function|class) (\w+)/;
export const MAX_STRING_SIZE = 10000;
export const MAX_ARRAY_SIZE = 5000;
export const UNDEFINED = '__vue_devtool_undefined__';
export const INFINITY = '__vue_devtool_infinity__';
export const NEGATIVE_INFINITY = '__vue_devtool_negative_infinity__';
export const NAN = '__vue_devtool_nan__';
export const ESC = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;',
};
